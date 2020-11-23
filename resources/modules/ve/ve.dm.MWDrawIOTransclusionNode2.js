'use strict';



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

OO.inheritClass( ve.dm.MWDrawIOTransclusionNode2, ve.dm.MWTransclusionNode );

// FIXME> Add for resize?
OO.mixinClass(  ve.dm.MWDrawIOTransclusionNode2, ve.dm.ResizableNode );








/* Static Properties */

ve.dm.MWDrawIOTransclusionNode2.static.name = 'mwDrawIO';
ve.dm.MWDrawIOTransclusionNode2.static.inlineType = 'mwDrawIO';
ve.dm.MWDrawIOTransclusionNode2.static.blockType = 'mwDrawIO';

/* Static Methods */

ve.dm.MWDrawIOTransclusionNode2.static.toDataElement = function ( domElements ) {
    debugger;

	var dataElement,
		cxDataJSON = domElements[ 0 ].getAttribute( 'data-cx' ),
		cxData = cxDataJSON ? JSON.parse( cxDataJSON ) : {};

	// Parent method
	dataElement = ve.dm.MWDrawIOTransclusionNode2.super.static.toDataElement.apply( this, arguments );
    dataElement.attributes.cx = cxData;

    // FIXME: LMP>  Used by ve.ce.ResizableNode.getAttributeChanges
    dataElement.attributes.width = 200;
    dataElement.attributes.height = 200;

	return dataElement;
};

ve.dm.MWDrawIOTransclusionNode2.static.toDomElements = function ( dataElement ) {
    debugger;

	var elements = ve.dm.MWDrawIOTransclusionNode2.super.static.toDomElements.apply( this, arguments );
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
	return {
		width: 100,
		height: 100
//		width: +this.getAttribute( 'mw' ).attrs.width,
//		height: +this.getAttribute( 'mw' ).attrs.height
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








