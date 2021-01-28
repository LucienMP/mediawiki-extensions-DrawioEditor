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

ve.ui.MWDrawIODialogTool.static.name = 'mwDrawIOMenuClass';
ve.ui.MWDrawIODialogTool.static.group = 'object';
ve.ui.MWDrawIODialogTool.static.icon = 'articles'; // LMP-A: oojs-ui.styles.icons-content, MENU
ve.ui.MWDrawIODialogTool.static.title = OO.ui.deferMsg( 'visualeditor-mwdrawiodialog-title' );
ve.ui.MWDrawIODialogTool.static.commandName = 'mwDrawIOCMD_Insert';

// FIXME> Trying to get Transclusion to work
//ve.ui.MWDrawIODialogTool.static.modelClasses = [ ve.dm.MWDrawIOTransclusionNode2, ve.dm.MWDrawIONode, ve.dm.MWDrawIOInlineNode];//, ve.dm.MWDrawIOTransclusionNode2 ];
ve.ui.MWDrawIODialogTool.static.modelClasses = [ ve.dm.MWDrawIOTransclusionNode2 ];


/* Registration */

ve.ui.toolFactory.register( ve.ui.MWDrawIODialogTool );

/* Commands */

ve.ui.commandRegistry.register(
    new ve.ui.Command(
        'mwDrawIOCMD_Insert', 'window', 'open',

        // Dialog to open
        { args: [ 'mwDrawIO_ExtensionBlockDialog' ], supportedSelections: [ 'linear' ] }
    )
);

ve.ui.commandRegistry.register(
    new ve.ui.Command(
        'mwDrawIOCMD_ContextEdit', 'window', 'open',

        // Dialog to open
        { args: [ 'mwDrawIO_TransclusionDialog' ], supportedSelections: [ 'linear' ] }
    )
);

ve.ui.commandRegistry.register(
    new ve.ui.Command(
        'mwDrawIOCMD_ContextEditBlockExtension', 'window', 'open',

        // Dialog to open
        { args: [ 'mwDrawIO_ExtensionBlockDialog' ], supportedSelections: [ 'linear' ] }
    )
);
