'use strict';


// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################

/*!
 * VisualEditor DataModel MWMyTransclusionNode class.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki transclusion node.
 *
 * @class
 * @abstract
 * @extends ve.dm.LeafNode
 * @mixins ve.dm.GeneratedContentNode
 * @mixins ve.dm.FocusableNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWMyTransclusionNode = function VeDmMWMyTransclusionNode() {
	// Parent constructor
	ve.dm.MWMyTransclusionNode.super.apply( this, arguments );

	// Mixin constructors
	ve.dm.GeneratedContentNode.call( this );
	ve.dm.FocusableNode.call( this );

	// Properties
	this.partsList = null;

	// Events
	this.connect( this, { attributeChange: 'onAttributeChange' } );
};

/* Inheritance */

OO.inheritClass( ve.dm.MWMyTransclusionNode, ve.dm.LeafNode );

OO.mixinClass( ve.dm.MWMyTransclusionNode, ve.dm.GeneratedContentNode );

OO.mixinClass( ve.dm.MWMyTransclusionNode, ve.dm.FocusableNode );

/* Static members */

ve.dm.MWMyTransclusionNode.static.name = 'mwTransclusion';

ve.dm.MWMyTransclusionNode.static.matchTagNames = null;

ve.dm.MWMyTransclusionNode.static.matchRdfaTypes = [ 'mw:Transclusion' ];

// Transclusion nodes can contain other types, e.g. mw:PageProp/Category.
// Allow all other types (null) so they match to this node.
ve.dm.MWMyTransclusionNode.static.allowedRdfaTypes = null;

// HACK: This prevents any rules with higher specificity from matching,
// e.g. LanguageAnnotation which uses a match function
ve.dm.MWMyTransclusionNode.static.matchFunction = function () {
	return true;
};

ve.dm.MWMyTransclusionNode.static.enableAboutGrouping = true;

// We handle rendering ourselves, no need to render attributes from originalDomElements (T207325),
// except for data-parsoid/RESTBase ID (T207325)
ve.dm.MWMyTransclusionNode.static.preserveHtmlAttributes = function ( attribute ) {
	return [ 'data-parsoid', 'id' ].indexOf( attribute ) !== -1;
};

ve.dm.MWMyTransclusionNode.static.getHashObject = function ( dataElement ) {
	return {
		type: dataElement.type,
		mw: dataElement.attributes.mw
	};
};

ve.dm.MWMyTransclusionNode.static.isDiffComparable = function ( element, other ) {
	function getTemplateNames( parts ) {
		return parts.map( function ( part ) {
			return part.template ? part.template.target.wt : '';
		} ).join( '|' );
	}

	return ve.dm.MWMyTransclusionNode.super.static.isDiffComparable.call( this, element, other ) &&
		getTemplateNames( element.attributes.mw.parts ) === getTemplateNames( other.attributes.mw.parts );
};

/**
 * Node type to use when the transclusion is inline
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.dm.MWMyTransclusionNode.static.inlineType = 'mwTransclusionInline';

/**
 * Node type to use when the transclusion is a block
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.dm.MWMyTransclusionNode.static.blockType = 'mwTransclusionBlock';

/**
 * Node type to use when the transclusion is cellable
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.dm.MWMyTransclusionNode.static.cellType = 'mwTransclusionTableCell';

ve.dm.MWMyTransclusionNode.static.toDataElement = function ( domElements, converter ) {
	var dataElement,
		mwDataJSON = domElements[ 0 ].getAttribute( 'data-mw' ),
		mwData = mwDataJSON ? JSON.parse( mwDataJSON ) : {},
		isInline = this.isHybridInline( domElements, converter ),
		type = isInline ? this.inlineType : this.blockType;

	dataElement = {
		type: type,
		attributes: {
			mw: mwData,
			originalMw: mwDataJSON
		}
	};

	if ( domElements.length === 1 && [ 'td', 'th' ].indexOf( domElements[ 0 ].nodeName.toLowerCase() ) !== -1 ) {
		dataElement.type = this.cellType;
		ve.dm.TableCellableNode.static.setAttributes( dataElement.attributes, domElements );
	}

	if ( !domElements[ 0 ].getAttribute( 'data-ve-no-generated-contents' ) ) {
		this.storeGeneratedContents( dataElement, domElements, converter.getStore() );
	}

	return dataElement;
};

ve.dm.MWMyTransclusionNode.static.toDomElements = function ( dataElement, doc, converter ) {
	var els, i, len, span, value,
		modelNode, viewNode,
		store = converter.getStore(),
		originalMw = dataElement.attributes.originalMw,
		originalDomElements = store.value( dataElement.originalDomElementsHash );

	function wrapTextNode( node ) {
		var wrapper;
		if ( node.nodeType === Node.TEXT_NODE ) {
			wrapper = doc.createElement( 'span' );
			wrapper.appendChild( node );
			return wrapper;
		}
		return node;
	}

	// If the transclusion is unchanged just send back the
	// original DOM elements so selser can skip over it
	if (
		originalDomElements &&
		originalMw && ve.compare( dataElement.attributes.mw, JSON.parse( originalMw ) )
	) {
		// originalDomElements is also used for CE rendering so return a copy
		els = ve.copyDomElements( originalDomElements, doc );
	} else {
		if (
			converter.doesModeNeedRendering() &&
			// Use getHashObjectForRendering to get the rendering from the store
			( value = store.value( store.hashOfValue( null, OO.getHash( [ this.getHashObjectForRendering( dataElement ), undefined ] ) ) ) )
		) {
			// For the clipboard use the current DOM contents so the user has something
			// meaningful to paste into external applications
			els = ve.copyDomElements( value, doc );
			els[ 0 ] = wrapTextNode( els[ 0 ] );
		} else if ( originalDomElements ) {
			els = [ doc.createElement( originalDomElements[ 0 ].nodeName ) ];
		} else if ( dataElement.type === this.cellType ) {
			els = [ doc.createElement( dataElement.attributes.style === 'header' ? 'th' : 'td' ) ];
		} else {
			els = [ doc.createElement( 'span' ) ];
		}
		// All we need to send back to Parsoid is the original transclusion marker, with a
		// reconstructed data-mw property.
		els[ 0 ].setAttribute( 'typeof', 'mw:Transclusion' );
		els[ 0 ].setAttribute( 'data-mw', JSON.stringify( dataElement.attributes.mw ) );
	}
	if ( converter.isForClipboard() ) {
		// If the first element is a <link>, <meta> or <style> tag, e.g. a category or TemplateStyles,
		// ensure it is not destroyed by copy-paste by replacing it with a span
		if ( els[ 0 ].tagName === 'LINK' || els[ 0 ].tagName === 'META' || els[ 0 ].tagName === 'STYLE' ) {
			span = doc.createElement( 'span' );
			span.setAttribute( 'typeof', 'mw:Transclusion' );
			span.setAttribute( 'data-mw', els[ 0 ].getAttribute( 'data-mw' ) );
			els[ 0 ] = span;
		}

		// Empty spans can get thrown around by Chrome when pasting, so give them a space
		if ( els[ 0 ].innerHTML === '' ) {
			els[ 0 ].appendChild( doc.createTextNode( '\u00a0' ) );
		}

		// Mark the data-mw element as not having valid generated contents with it in case it is
		// inserted into another editor (e.g. via paste).
		els[ 0 ].setAttribute( 'data-ve-no-generated-contents', true );

		// ... and mark all but the first child as ignorable
		for ( i = 1, len = els.length; i < len; i++ ) {
			// Wrap plain text nodes so we can give them an attribute
			els[ i ] = wrapTextNode( els[ i ] );
			els[ i ].setAttribute( 'data-ve-ignore', 'true' );
		}
	} else if ( converter.isForPreview() ) {
		modelNode = ve.dm.nodeFactory.createFromElement( dataElement );
		modelNode.setDocument( converter.internalList.getDocument() );
		viewNode = ve.ce.nodeFactory.createFromModel( modelNode );
		if ( !viewNode.hasRendering() ) {
			viewNode.onSetup();
			viewNode.$element
				.append( viewNode.createInvisibleIcon() )
				.attr( 'title', dataElement.attributes.text );
			els = viewNode.$element.toArray();
			viewNode.destroy();
			return els;
		}
	}
	return els;
};

ve.dm.MWMyTransclusionNode.static.describeChanges = function ( attributeChanges ) {
	var change, params, param, paramChanges, listItem, from, to,
		descriptions = [ ve.msg( 'visualeditor-changedesc-mwtransclusion' ) ];

	// This method assumes that the behavior of isDiffComparable above remains
	// the same, so it doesn't have to consider whether the actual template
	// involved has changed.

	function getLabel( param ) {
		// If a parameter is an object with a wt key, we just want the value of that.
		if ( param && param.wt !== undefined ) {
			// Can be `''`, and we're okay with that
			return param.wt;
		}
		return param;
	}

	if ( attributeChanges.mw.from.parts.length === 1 && attributeChanges.mw.to.parts.length === 1 ) {
		// Single-template transclusion, before and after. Relatively easy to summarize.
		// TODO: expand this to well-represent transclusions that contain multiple templates.

		// The bits of a template we care about are deeply-nested inside an
		// attribute. We'll restructure this so that we can pretend template
		// params are the direct attributes of the template.
		params = {};
		for ( param in attributeChanges.mw.from.parts[ 0 ].template.params ) {
			params[ param ] = { from: getLabel( attributeChanges.mw.from.parts[ 0 ].template.params[ param ] ) };
		}
		for ( param in attributeChanges.mw.to.parts[ 0 ].template.params ) {
			params[ param ] = ve.extendObject(
				{ to: getLabel( attributeChanges.mw.to.parts[ 0 ].template.params[ param ] ) },
				params[ param ]
			);
		}
		for ( param in params ) {
			// All we know is that *something* changed, without the normal
			// helpful just-being-given-the-changed-bits, so we have to filter
			// this ourselves.
			// Trim string values, and convert empty strings to undefined
			from = ( params[ param ].from || '' ).trim() || undefined;
			to = ( params[ param ].to || '' ).trim() || undefined;
			if ( from !== to ) {
				change = this.describeChange( param, { from: from, to: to } );
				if ( change ) {
					if ( !paramChanges ) {
						paramChanges = document.createElement( 'ul' );
						descriptions.push( paramChanges );
					}
					listItem = document.createElement( 'li' );
					if ( typeof change === 'string' ) {
						listItem.appendChild( document.createTextNode( change ) );
					} else {
						// eslint-disable-next-line no-loop-func
						change.forEach( function ( node ) {
							listItem.appendChild( node );
						} );
					}
					paramChanges.appendChild( listItem );
				}
			}
		}
	}
	return descriptions;
};

/**
 * @inheritdoc ve.dm.Node
 */
ve.dm.MWMyTransclusionNode.static.cloneElement = function () {
	// Parent method
	var clone = ve.dm.MWMyTransclusionNode.super.static.cloneElement.apply( this, arguments );
	delete clone.attributes.originalMw;
	return clone;
};

/**
 * Escape a template parameter. Helper function for #getWikitext.
 *
 * @static
 * @param {string} param Parameter value
 * @return {string} Escaped parameter value
 */
ve.dm.MWMyTransclusionNode.static.escapeParameter = function ( param ) {
	var match, needsNowiki,
		input = param,
		output = '',
		inNowiki = false,
		bracketStack = 0,
		linkStack = 0;

	while ( input.length > 0 ) {
		match = input.match( /(?:\[\[)|(?:\]\])|(?:\{\{)|(?:\}\})|\|+|<\/?nowiki>|<nowiki\s*\/>/ );
		if ( !match ) {
			output += input;
			break;
		}
		output += input.slice( 0, match.index );
		input = input.slice( match.index + match[ 0 ].length );
		if ( inNowiki ) {
			if ( match[ 0 ] === '</nowiki>' ) {
				inNowiki = false;
				output += match[ 0 ];
			} else {
				output += match[ 0 ];
			}
		} else {
			needsNowiki = true;
			if ( match[ 0 ] === '<nowiki>' ) {
				inNowiki = true;
				needsNowiki = false;
			} else if ( match[ 0 ] === '</nowiki>' || match[ 0 ].match( /<nowiki\s*\/>/ ) ) {
				needsNowiki = false;
			} else if ( match[ 0 ].match( /(?:\[\[)/ ) ) {
				linkStack++;
				needsNowiki = false;
			} else if ( match[ 0 ].match( /(?:\]\])/ ) ) {
				if ( linkStack > 0 ) {
					linkStack--;
					needsNowiki = false;
				}
			} else if ( match[ 0 ].match( /(?:\{\{)/ ) ) {
				bracketStack++;
				needsNowiki = false;
			} else if ( match[ 0 ].match( /(?:\}\})/ ) ) {
				if ( bracketStack > 0 ) {
					bracketStack--;
					needsNowiki = false;
				}
			} else if ( match[ 0 ].match( /\|+/ ) ) {
				if ( bracketStack > 0 || linkStack > 0 ) {
					needsNowiki = false;
				}
			}

			if ( needsNowiki ) {
				output += '<nowiki>' + match[ 0 ] + '</nowiki>';
			} else {
				output += match[ 0 ];
			}
		}
	}
	return output;
};

/**
 * Get the wikitext for this transclusion.
 *
 * @static
 * @param {Object} content MW data content
 * @return {string} Wikitext like `{{foo|1=bar|baz=quux}}`
 */
ve.dm.MWMyTransclusionNode.static.getWikitext = function ( content ) {
	var i, len, part, template, param,
		wikitext = '';

	// Normalize to multi template format
	if ( content.params ) {
		content = { parts: [ { template: content } ] };
	}
	// Build wikitext from content
	for ( i = 0, len = content.parts.length; i < len; i++ ) {
		part = content.parts[ i ];
		if ( part.template ) {
			// Template
			template = part.template;
			wikitext += '{{' + template.target.wt;
			for ( param in template.params ) {
				wikitext += '|' + param + '=' +
					this.escapeParameter( template.params[ param ].wt );
			}
			wikitext += '}}';
		} else {
			// Plain wikitext
			wikitext += part;
		}
	}
	return wikitext;
};

/* Methods */

/**
 * Handle attribute change events.
 *
 * @param {string} key Attribute key
 * @param {string} from Old value
 * @param {string} to New value
 */
ve.dm.MWMyTransclusionNode.prototype.onAttributeChange = function ( key ) {
	if ( key === 'mw' ) {
		this.partsList = null;
	}
};

/**
 * Check if transclusion contains only a single template.
 *
 * @param {string|string[]} [templates] Names of templates to allow, omit to allow any template name
 * @return {boolean} Transclusion only contains a single template, which is one of the ones in templates
 */
ve.dm.MWMyTransclusionNode.prototype.isSingleTemplate = function ( templates ) {
	var i, len,
		templateNS = mw.config.get( 'wgNamespaceIds' ).template,
		partsList = this.getPartsList();

	function normalizeTemplateTitle( name ) {
		var title = mw.Title.newFromText( name, templateNS );
		return title ? title.getPrefixedText() : name;
	}

	if ( partsList.length !== 1 ) {
		return false;
	}
	if ( templates === undefined ) {
		return true;
	}
	if ( typeof templates === 'string' ) {
		templates = [ templates ];
	}
	for ( i = 0, len = templates.length; i < len; i++ ) {
		if (
			partsList[ 0 ].templatePage &&
			partsList[ 0 ].templatePage === normalizeTemplateTitle( templates[ i ] )
		) {
			return true;
		}
	}
	return false;
};

/**
 * Get a simplified description of the transclusion's parts.
 *
 * @return {Object[]} List of objects with either template or content properties
 */
ve.dm.MWMyTransclusionNode.prototype.getPartsList = function () {
	var i, len, href, page, part, content;

	if ( !this.partsList ) {
		this.partsList = [];
		content = this.getAttribute( 'mw' );
		for ( i = 0, len = content.parts.length; i < len; i++ ) {
			part = content.parts[ i ];
			if ( part.template ) {
				href = part.template.target.href;
				page = href ? mw.libs.ve.normalizeParsoidResourceName( href ) : null;
				this.partsList.push( {
					template: part.template.target.wt,
					templatePage: page
				} );
			} else {
				this.partsList.push( { content: part } );
			}
		}
	}

	return this.partsList;
};

/**
 * Wrapper for static method
 *
 * @return {string} Wikitext like `{{foo|1=bar|baz=quux}}`
 */
ve.dm.MWMyTransclusionNode.prototype.getWikitext = function () {
	return this.constructor.static.getWikitext( this.getAttribute( 'mw' ) );
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWMyTransclusionNode );


// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################
// ######################################################################################################################################


/**
 * Handling of unadapted templates in translations.
 *
 * @copyright See AUTHORS.txt
 * @license GPL-2.0-or-later
 * @file
 */

/**
 * This class exists to override inlineType and blockType. Those actually inherit
 * the ve.dm.MW* classes, so this is not part of the inheritance tree. Also the
 * static methods are partially "inherited" from this class.
 *
 * @class
 * @extends ve.dm.MWTransclusionNode
 * @constructor
 */
ve.dm.MWDrawIOTransclusionNode2 = function VeDmMWDrawIOTransclusionNode2() {
	// Parent constructor
    ve.dm.MWDrawIOTransclusionNode2.super.apply( this, arguments );
    
	// Mixin constructors
	ve.dm.ResizableNode.call( this );
};

/* Inheritance */

// FIXME:LMP > This avoids the template/transclusion dialog also coming up
//OO.inheritClass( ve.dm.MWDrawIOTransclusionNode2, ve.dm.MWTransclusionNode );
OO.inheritClass( ve.dm.MWDrawIOTransclusionNode2, ve.dm.MWMyTransclusionNode);

// FIXME> Add for resize?
OO.mixinClass(  ve.dm.MWDrawIOTransclusionNode2, ve.dm.ResizableNode );

/* Static Properties */

ve.dm.MWDrawIOTransclusionNode2.static.name = 'mwDrawIO';
ve.dm.MWDrawIOTransclusionNode2.static.inlineType = 'mwDrawIO';
ve.dm.MWDrawIOTransclusionNode2.static.blockType = 'mwDrawIO';

/* Static Methods */
ve.dm.MWTransclusionNode.static.matchTagNames = ['div'];

/*
<div about="#mwt1" typeof="mw:Transclusion" data-parsoid="{&quot;stx&quot;:&quot;html&quot;,&quot;dsr&quot;:[10,44,null,null],&quot;pi&quot;:[[{&quot;k&quot;:&quot;type&quot;,&quot;named&quot;:true,&quot;spc&quot;:[&quot;&quot;,&quot;&quot;,&quot;&quot;,&quot; &quot;]}]]}" data-mw="{&quot;parts&quot;:[{&quot;template&quot;:{&quot;target&quot;:{&quot;wt&quot;:&quot;#drawio:SampleChartA&quot;,&quot;function&quot;:&quot;drawio&quot;},&quot;params&quot;:{&quot;type&quot;:{&quot;wt&quot;:&quot;png&quot;}},&quot;i&quot;:0}}]}">
<div id="drawio-img-box-775430669">
<div id="drawio-placeholder-775430669" class="DrawioEditorInfoBox"><b>SampleChartA</b><br>empty app.diagrams.net chart</div> 
&lt;a id='drawio-img-href-775430669' href=''&gt;&lt;img id='drawio-img-775430669' src='' title='drawio: SampleChartA' alt='drawio: SampleChartA' style='height: auto; width: 100%; max-width: 0; display:none;' /&gt;&lt;/img&gt;&lt;/a&gt;</div>
<div id="drawio-iframe-box-775430669" style="display:none;">
<div id="drawio-iframe-overlay-775430669" class="DrawioEditorOverlay" style="display:none;"></div></div></div>
 */
ve.dm.MWDrawIOTransclusionNode2.static.matchFunction = function( element ) {
    debugger;
    // FIXME; example way we could make the DE match correctly
    return element.getAttribute( 'class' ) !== 'ThisIsDivTest';
}




ve.dm.MWDrawIOTransclusionNode2.static.toDataElement = function ( domElements ) {
    debugger;

	var dataElement,
		mwDataJSON = domElements[ 0 ].getAttribute( 'data-mw' ),
		mwData = mwDataJSON ? JSON.parse( mwDataJSON ) : {};

	// Parent method
	console.log("mwData",mwData.parts[0].template.target.wt);
    //if(mwData.parts[0].template.target.wt == '#drawio:ChartName5') 
    {
		dataElement = ve.dm.MWDrawIOTransclusionNode2.super.static.toDataElement.apply( this, arguments );
	    dataElement.attributes.cx = mwData;

	    // FIXME: LMP>  Used by ve.ce.ResizableNode.getAttributeChanges
	    dataElement.attributes.width = 200;
	    dataElement.attributes.height = 200;

		// if(dataElement.attributes.cx.parts[0].template.target.wt=='#drawio:ChartName5') {
		// }
		return dataElement;
	}
};

ve.dm.MWDrawIOTransclusionNode2.static.toDomElements = function ( dataElement ) {
    debugger;

	var elements = ve.dm.MWDrawIOTransclusionNode2.super.static.toDomElements.apply( this, arguments );
	console.log("elements",elements);
	if ( Object.keys( dataElement.attributes.cx ).length ) {
		// Do not add empty data for data-cx. For example, nodes in source page has no data for cx.
		elements[ 0 ].setAttribute( 'data-cx', JSON.stringify( dataElement.attributes.cx ) );
	}
	return elements;
};


// ################################################################################
// ################################################################################
// ################################################################################
// ################################################################################


// FIXME:HACK > Added because the regular node needs it
ve.dm.MWDrawIOTransclusionNode2.prototype.getCurrentDimensions = function () {
    var _params=this.getAttribute( 'mw' ).parts[0].template.params;
    var _width = _params.width;
    var _height = _params.height;
    if (typeof _width === 'undefined') _width="200" ; else _width=_width.wt;
    if (typeof _height === 'undefined') _height="200" ; else _height = _height.wt;

	return {
		width: +_width,
		height: +_height
	};
};

ve.dm.MWDrawIOTransclusionNode2.static.createScalable = function ( dimensions ) {
	var scalable = new ve.dm.Scalable( {
		// LMP-FIXME: For now fix it so that we have fixed aspect ratiop
		fixedRatio: true,

		currentDimensions: {
			width: dimensions.width,
			height: dimensions.height
		},
		minDimensions: {
			width: 200,
			height: 100
		},
		maxDimensions: {
			width: 1000,
			height: 1000
		}
	} );

	return scalable ;
};
ve.dm.MWDrawIOTransclusionNode2.prototype.createScalable = function () {
	return this.constructor.static.createScalable( this.getCurrentDimensions() );
};


// ################################################################################
// ################################################################################
// ################################################################################
// ################################################################################


ve.dm.modelRegistry.register( ve.dm.MWDrawIOTransclusionNode2 );









