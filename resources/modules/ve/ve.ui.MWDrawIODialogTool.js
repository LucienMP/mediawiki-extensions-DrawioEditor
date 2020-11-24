/*!
 * VisualEditor MediaWiki UserInterface gallery tool class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki UserInterface gallery tool.
 *
 * @class
 * @extends ve.ui.FragmentWindowTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.MWDrawIODialogTool = function VeUiMWDrawIODialogTool() {
	ve.ui.MWDrawIODialogTool.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWDrawIODialogTool, ve.ui.FragmentWindowTool );

/* Static properties */

ve.ui.MWDrawIODialogTool.static.name = 'mwDrawIO';
ve.ui.MWDrawIODialogTool.static.group = 'object';
ve.ui.MWDrawIODialogTool.static.icon = 'articles'; // LMP-A: oojs-ui.styles.icons-content, MENU
ve.ui.MWDrawIODialogTool.static.title = OO.ui.deferMsg( 'visualeditor-mwdrawiodialog-title' );
//ve.ui.MWDrawIODialogTool.static.modelClasses = [ ve.dm.MWDrawIONode, ve.dm.MWDrawIOInlineNode ];
//ve.ui.MWDrawIODialogTool.static.modelClasses = [ ve.dm.MWDrawIONode ];
ve.ui.MWDrawIODialogTool.static.commandName = 'mwDrawIO';

// FIXME> Trying to get Transclusion to work
//ve.ui.MWDrawIODialogTool.static.modelClasses = [ ve.dm.MWDrawIOTransclusionNode2, ve.dm.MWDrawIONode, ve.dm.MWDrawIOInlineNode];//, ve.dm.MWDrawIOTransclusionNode2 ];
ve.ui.MWDrawIODialogTool.static.modelClasses = [ ve.dm.MWDrawIOTransclusionNode2 ];


//if ( mw.config.get( 'wgDrawIOEnableFrame' ) )
if(true)
{
	/* Registration */

	ve.ui.toolFactory.register( ve.ui.MWDrawIODialogTool );

	/* Commands */
	ve.ui.commandRegistry.register(
		new ve.ui.Command(
			'mwDrawIO', 'window', 'open',
			{ args: [ 'mwDrawIO' ], supportedSelections: [ 'linear' ] }
		)
	);
}
