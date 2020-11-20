/*!
 * VisualEditor DataModel MWDrawIONode class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * DataModel MW Maps node.
 *
 * @class
 * @extends ve.dm.MWBlockExtensionNode
 * @mixins ve.dm.ResizableNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 * @param {ve.dm.Node[]} [children]
 */
ve.dm.MWDrawIONode = function VeDmMWDrawIO() {
	// Parent constructor
	ve.dm.MWDrawIONode.super.apply( this, arguments );

	// Mixin constructors
	ve.dm.ResizableNode.call( this );
};

/* Inheritance */

OO.inheritClass( ve.dm.MWDrawIONode, ve.dm.MWBlockExtensionNode );

OO.mixinClass( ve.dm.MWDrawIONode, ve.dm.ResizableNode );

/* Static Properties */

ve.dm.MWDrawIONode.static.name = 'mwDrawIO';

ve.dm.MWDrawIONode.static.extensionName = 'drawio'; // TAG / FIXME> {{}} vs <drawio />

ve.dm.MWDrawIONode.static.matchTagNames = [ 'div' ];

/* Static methods */

ve.dm.MWDrawIONode.static.toDataElement = function () {
	var dataElement = ve.dm.MWDrawIONode.super.static.toDataElement.apply( this, arguments );

	dataElement.attributes.width = +dataElement.attributes.mw.attrs.width;
	dataElement.attributes.height = +dataElement.attributes.mw.attrs.height;

	return dataElement;
};

ve.dm.MWDrawIONode.static.getUrl = function ( dataElement, width, height ) {
	var mwAttrs = dataElement.attributes.mw.attrs;

	return 'https://maps.wikimedia.org/img/osm-intl,' +
		mwAttrs.zoom + ',' +
		mwAttrs.latitude + ',' +
		mwAttrs.longitude + ',' +
		( width || mwAttrs.width ) + 'x' +
		( height || mwAttrs.height ) +
		'.jpeg';
};

ve.dm.MWDrawIONode.static.createScalable = function ( dimensions ) {
	var scalable = new ve.dm.Scalable( {
		// LMP-FIXME: For now fix it so that we have fixed aspect ratiop
		fixedRatio: true,
//		fixedRatio: false,

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

ve.dm.MWDrawIONode.prototype.getCurrentDimensions = function () {
	return {
		width: +this.getAttribute( 'mw' ).attrs.width,
		height: +this.getAttribute( 'mw' ).attrs.height
	};
};

/* Methods */

ve.dm.MWDrawIONode.prototype.getUrl = function ( width, height ) {
	return this.constructor.static.getUrl( this.element, width, height );
};

/**
 * @inheritdoc
 */
ve.dm.MWDrawIONode.prototype.createScalable = function () {
	return this.constructor.static.createScalable( this.getCurrentDimensions() );
};

/**
 * Don't allow maps to be edited if they contain features that are not
 * supported not supported by the editor.
 *
 * @inheritdoc
 */
ve.dm.MWDrawIONode.prototype.isEditable = function () {
	//var containsDynamicFeatures = this.usesAutoPositioning() || this.usesExternalData();
	//return !this.usesMapData() || !containsDynamicFeatures;

	// LMP-FIXME:  Certain DrawIO formats cant be supported; this should decide what
	// for now pretend all are ok.
	return true;
};

/**
 * Checks whether the map uses auto-positioning.
 *
 * @return {boolean}
 */
ve.dm.MWDrawIONode.prototype.usesAutoPositioning = function () {
	var mwAttrs = this.getAttribute( 'mw' ).attrs;
	return !( mwAttrs.latitude && mwAttrs.longitude && mwAttrs.zoom );
};

/**
 * Checks whether the map uses external data.
 *
 * @return {boolean}
 */
ve.dm.MWDrawIONode.prototype.usesExternalData = function () {
	var mwData = this.getAttribute( 'mw' ),
		geoJson = mwData.body.extsrc;
	return /ExternalData/.test( geoJson );
};

/**
 * Checks whether the map contains any map data.
 *
 * @return {boolean}
 */
ve.dm.MWDrawIONode.prototype.usesMapData = function () {
	var mwData = this.getAttribute( 'mw' );
	return !!mwData.body.extsrc;
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWDrawIONode );
