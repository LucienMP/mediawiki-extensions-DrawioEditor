/*!
 * VisualEditor MWDrawIOBlockExtensionContextItem class.
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
ve.ui.MWDrawIOBlockExtensionContextItem = function VeUiMWDrawIOBlockExtensionContextItem() {
	// Parent constructor
	ve.ui.MWDrawIOBlockExtensionContextItem.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWDrawIOBlockExtensionContextItem, ve.ui.LinearContextItem );

/* Static Properties */

//ve.ui.MWDrawIOBlockExtensionContextItem.static.name = 'mwDrawIOA';

ve.ui.MWDrawIOBlockExtensionContextItem.static.icon = 'articles';

ve.ui.MWDrawIOBlockExtensionContextItem.static.label = OO.ui.deferMsg( 'visualeditor-mwdrawiocontextitem-title' );

//ve.ui.MWDrawIOBlockExtensionContextItem.static.modelClasses = [ ve.dm.MWDrawIOInlineNode, ve.dm.MWDrawIONode ];
//ve.ui.MWDrawIOBlockExtensionContextItem.static.modelClasses = [ ve.dm.MWDrawIONode ];

// FIXME> Adding the TransclusionNode2
//ve.ui.MWDrawIOBlockExtensionContextItem.static.modelClasses = [ ve.dm.MWDrawIOTransclusionNode2, ve.dm.MWDrawIOInlineNode, ve.dm.MWDrawIONode ];
ve.ui.MWDrawIOBlockExtensionContextItem.static.modelClasses = [ ve.dm.MWDrawIOBlockExtensionNode ];

//ve.ui.MWDrawIOBlockExtensionContextItem.static.commandName = 'mwDrawIOB';


// FIXME: LMP trying to launch properly
ve.ui.MWDrawIOBlockExtensionContextItem.static.name = 'mwDrawIOD';
ve.ui.MWDrawIOBlockExtensionContextItem.static.commandName = 'mwDrawIOCMD_ContextEditBlockExtension';


/* Methods */

/**
 * Get a DOM rendering of the reference.
 *
 * @private
 * @return {jQuery} DOM rendering of reference
 */
ve.ui.MWDrawIOBlockExtensionContextItem.prototype.getRendering = function () {
	if ( !this.model.isEditable() ) {
		return $( '<div>' )
			.addClass( 've-ui-mwdrawioContextItem-nosupport' )
			.text( this.getDescription() );
	}
};

/**
 * @inheritdoc
 */
ve.ui.MWDrawIOBlockExtensionContextItem.prototype.getDescription = function () {
	return this.model.isEditable() ? '' : ve.msg( 'visualeditor-mwdrawiocontextitem-nosupport' );
};

/**
 * @inheritdoc
 */
ve.ui.MWDrawIOBlockExtensionContextItem.prototype.renderBody = function () {
	this.$body.empty().append( this.getRendering() );
};

/* Registration */

ve.ui.contextItemFactory.register( ve.ui.MWDrawIOBlockExtensionContextItem );
