/*!
 * VisualEditor MWDrawIOContextItem class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Context item for a MWDrawIOInlineNode or MWDrawIONode.
 *
 * @class
 * @extends ve.ui.LinearContextItem
 *
 * @constructor
 * @param {ve.ui.Context} context Context item is in
 * @param {ve.dm.Model} model Model item is related to
 * @param {Object} config Configuration options
 */
ve.ui.MWDrawIOContextItem = function VeUiMWDrawIOContextItem() {
	// Parent constructor
	ve.ui.MWDrawIOContextItem.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWDrawIOContextItem, ve.ui.LinearContextItem );

/* Static Properties */

ve.ui.MWDrawIOContextItem.static.name = 'mwDrawIOA';

ve.ui.MWDrawIOContextItem.static.icon = 'articles';

ve.ui.MWDrawIOContextItem.static.label = OO.ui.deferMsg( 'visualeditor-mwdrawiocontextitem-title' );

//ve.ui.MWDrawIOContextItem.static.modelClasses = [ ve.dm.MWDrawIOInlineNode, ve.dm.MWDrawIONode ];
//ve.ui.MWDrawIOContextItem.static.modelClasses = [ ve.dm.MWDrawIONode ];

// FIXME> Adding the TransclusionNode2 
//ve.ui.MWDrawIOContextItem.static.modelClasses = [ ve.dm.MWDrawIOTransclusionNode2, ve.dm.MWDrawIOInlineNode, ve.dm.MWDrawIONode ];
ve.ui.MWDrawIOContextItem.static.modelClasses = [ ve.dm.MWDrawIOTransclusionNode2 ];

//ve.ui.MWDrawIOContextItem.static.commandName = 'mwDrawIOB';


// FIXME: LMP trying to launch properly
ve.ui.MWDrawIOContextItem.static.name = 'mwDrawIOC';
ve.ui.MWDrawIOContextItem.static.commandName = 'mwDrawIOCMD_ContextEdit';

// 
// LMP:FIXME> This should be used when you want to match other blocks, OR narrow a match if you are matching other 
// blocks contexts, or do not wish a context menu for your block for some reason.
ve.ui.MWDrawIOContextItem.static.isCompatibleWith = function ( model ) {
    var compatible = ve.ui.MWDrawIOContextItem.super.static.isCompatibleWith.call( this, model );

    // #############################################################################
    //debugger;

    // true/false
    return (model instanceof ve.dm.MWDrawIOTransclusionNode2);
}

/* Methods */

/**
 * Get a DOM rendering of the reference.
 *
 * @private
 * @return {jQuery} DOM rendering of reference
 */
ve.ui.MWDrawIOContextItem.prototype.getRendering = function () {
	if ( !this.model.isEditable() ) {
		return $( '<div>' )
			.addClass( 've-ui-mwdrawioContextItem-nosupport' )
			.text( this.getDescription() );
	}
};

/**
 * @inheritdoc
 */
ve.ui.MWDrawIOContextItem.prototype.getDescription = function () {
	return this.model.isEditable() ? '' : ve.msg( 'visualeditor-mwdrawiocontextitem-nosupport' );
};

/**
 * @inheritdoc
 */
ve.ui.MWDrawIOContextItem.prototype.renderBody = function () {
	this.$body.empty().append( this.getRendering() );
};

/* Registration */

ve.ui.contextItemFactory.register( ve.ui.MWDrawIOContextItem );
