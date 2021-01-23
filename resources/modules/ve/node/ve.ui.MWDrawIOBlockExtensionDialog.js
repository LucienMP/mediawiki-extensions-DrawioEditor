/*!
 * VisualEditor UserInterface MWDrawIODialog class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */
/**
 * Dialog for editing MW maps.
 *
 * @class
 * @extends ve.ui.MWExtensionDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.MWDrawIOBlockExtensionDialog = function VeUiMWDrawIOBlockExtensionDialog() {
	// Parent constructor
	ve.ui.MWDrawIOBlockExtensionDialog.super.apply( this, arguments );

	this.updateGeoJson = $.debounce( 300, $.proxy( this.updateGeoJson, this ) );
	this.resetMapPosition = $.debounce( 300, $.proxy( this.resetMapPosition, this ) );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWDrawIOBlockExtensionDialog, ve.ui.MWExtensionDialog );

/* Static Properties */

ve.ui.MWDrawIOBlockExtensionDialog.static.name = 'mwDrawIO_ExtensionBlockDialog';

ve.ui.MWDrawIOBlockExtensionDialog.static.title = OO.ui.deferMsg( 'visualeditor-mwdrawiodialog-title' );

// https://doc.wikimedia.org/VisualEditor/master/#!/api/OO.ui.Window-static-property-size
ve.ui.MWDrawIOBlockExtensionDialog.static.size = 'full';

ve.ui.MWDrawIOBlockExtensionDialog.static.allowedEmpty = true;

//ve.ui.MWDrawIOBlockExtensionDialog.static.modelClasses = [ ve.dm.MWDrawIONode, ve.dm.MWDrawIOInlineNode ];
//ve.ui.MWDrawIOBlockExtensionDialog.static.modelClasses = [ ve.dm.MWDrawIONode ];

// FIXME> Adding, trying to add in Node2
//ve.ui.MWDrawIOBlockExtensionDialog.static.modelClasses = [ ve.dm.MWDrawIOTransclusionNode2, ve.dm.MWDrawIONode, ve.dm.MWDrawIOInlineNode ];
ve.ui.MWDrawIOBlockExtensionDialog.static.modelClasses = [ ve.dm.MWDrawIOBlockExtensionNode ];

/* Methods */

// ########################################################################################################################
// ########################################################################################################################
// ########################################################################################################################
// ########################################################################################################################

ve.ui.MWDrawIOBlockExtensionDialog.prototype.drawioHandleMessage = function (eJqueryEvent) {

	// FIXME:LMP: Display event in console
	var date = new Date();
	e = eJqueryEvent.originalEvent;
	evdata = JSON.parse(e.data);
	console.log( date.toLocaleTimeString() + "drawioHandleMessage: [" + evdata['event'] + "]" );
	debugger;

	// FIXME:LMP:Extract original event from jquery wrapper
	e = eJqueryEvent.originalEvent;

	// FIXME: LMP: Disable for debugging of local diagrams.net
/*
	// we only act on event coming from draw.io iframes
	if (e.origin != 'https://embed.diagrams.net')
		return;
*/
	if (!this.editor)
		return;

	evdata = JSON.parse(e.data);

	switch(evdata['event']) {
		case 'init':
			this.editor.initCallback();
			break;

		case 'load':
			break;

		case 'save':
			this.editor.saveCallback();
			break;

		case 'export':
			this.editor.exportCallback(evdata['format'], evdata['data']);
			break;

		case 'exit':
			this.editor.exitCallback();
			// editor is null after this callback
			break;

		case 'openLink':
			// Help>About
			break;

		case 'autosave':
			// FIXME: Update and set the MW apply button chages here
			break;

		default:
			alert('Received unknown event from drawio iframe: ' + evdata['event']);
	}
};


/**
 * @inheritdoc
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.initialize = function () {
	var panel,
		positionPopupButton,
		$currentPositionTable;

	// Parent method
	ve.ui.MWDrawIOBlockExtensionDialog.super.prototype.initialize.call( this );


    /* ******************************* START OF TAB ******************************* */
    /* ******************************* START OF TAB ******************************* */
    /* ******************************* START OF TAB ******************************* */

	// Layout for the formula inserter (formula tab panel) and options form (options tab panel)
	this.indexLayout = new OO.ui.IndexLayout();

	diagramTabPanel = new OO.ui.TabPanelLayout( 'diagram', {
			label: ve.msg( 'math-visualeditor-mwlatexdialog-card-formula' ),
			padded: true
	} );

	optionsTabPanel = new OO.ui.TabPanelLayout( 'options', {
			label: ve.msg( 'math-visualeditor-mwlatexdialog-card-options' ),
			padded: true
	} );

	this.indexLayout.addTabPanels( [
		diagramTabPanel,
		optionsTabPanel
	] );


	/* ******************************* START OF OPTIONS ******************************* */
	/* ******************************* START OF OPTIONS ******************************* */
	/* ******************************* START OF OPTIONS ******************************* */

	/* GitHub README.md
	 * 	https://github.com/wikimedia/mediawiki-extensions-DrawioEditor/blob/master/README.md#usage
	 *
	 * Format:
	 *   {{#drawio:ChartName}} / {{#drawio:ChartName|width=100%|max-width=chart|height=auto}}
	 *   {{#drawio:ChartName|max-width=800px}} : 800px max-width scaling
	 *   {{#drawio:ChartName|max-width=none}}  : Chart scales infinitely
	 *   {{#drawio:ChartName|width=600px}}     : 600px fixed width
	 *   {{#drawio:ChartName|width=chart}}     : Actual chart width
	 *   {{#drawio:ChartName|width=chart|height=chart}} : Fixed height and width using the actual chart dimensions
	 *
	 * size formats NN%, NNpx, auto, chart
	 */

	this.map = null;
	this.scalable = null;
	this.updatingGeoJson = false;

	this.dimensions = new ve.ui.DimensionsWidget();

	this.alignWidget = new ve.ui.AlignWidget( {
		dir: this.getDir()
	} );


    // FIXME> Remove me
	this.resetMapButton = new OO.ui.ButtonWidget( {
		label: ve.msg( 'visualeditor-mwdrawiodialog-reset-map' )
	} );


	this.dimensionsField = new OO.ui.FieldLayout( this.dimensions, {
		align: 'right',
		label: ve.msg( 'visualeditor-mwdrawiodialog-size' )
	} );

	this.alignField = new OO.ui.FieldLayout( this.alignWidget, {
		align: 'right',
		label: ve.msg( 'visualeditor-mwdrawiodialog-align' )
	} );


	/* LMP START */
	this.alignCheckbox = new OO.ui.CheckboxInputWidget();
	this.alignCheckboxField = new OO.ui.FieldLayout( this.alignCheckbox, {
	        $overlay: this.$overlay,
	        align: 'right',
	        label: ve.msg( 'visualeditor-dialog-media-position-checkbox' ),
	        help: ve.msg( 'visualeditor-dialog-media-position-checkbox-help' )
	} );
	this.alignFieldset = new OO.ui.FieldsetLayout( {
	        $overlay: this.$overlay,
	        label: ve.msg( 'visualeditor-dialog-media-position-section' ),
	        help: ve.msg( 'visualeditor-dialog-media-position-section-help' ),
	        icon: 'parameter'
	} );

	// Build position fieldset
	this.alignFieldset.$element.append(
	        this.alignCheckboxField.$element,
	        this.alignField.$element
	);
	/* LMP END */


	// DrawIO Image representation input
	this.typeFieldset = new OO.ui.FieldsetLayout( {
		$overlay: this.$overlay,
		label: ve.msg( 'visualeditor-mwdrawio-style-title' ),
		help: ve.msg( 'visualeditor-mwdrawio-style-title-help' ),
		icon: 'parameter'
	} );


	this.typeSelectDropdown = new OO.ui.DropdownWidget( { $overlay: this.$overlay } );
	this.typeSelect = this.typeSelectDropdown.getMenu();
	this.typeSelect.addItems( [
			// TODO: Inline images require a bit of further work, will be coming soon
			new OO.ui.MenuOptionWidget( {
					data: 'thumb',
					icon: 'image-thumbnail',
					label: ve.msg( 'visualeditor-mwdrawio-pulldownA' )
			} ),
			new OO.ui.MenuOptionWidget( {
					data: 'frameless',
					icon: 'image-frameless',
					label: ve.msg( 'visualeditor-mwdrawio-pulldownB' )
			} ),
			new OO.ui.MenuOptionWidget( {
					data: 'frame',
					icon: 'image-frame',
					label: ve.msg( 'visualeditor-mwdrawio-pulldownC' )
			} )
	] );

	// Build type fieldset
	this.typeFieldset.$element.append(
			this.typeSelectDropdown.$element
	);

    // FIXME: Select the correct pulldown for the style, or select the "default"
    // this.typeSelect.selectItemByData( this.imageModel.getType() || 'none' );

    // FIXME: Selec the enable/disable based on tag values


    /* ******************************* SART OF EDITOR ******************************* */
    /* ******************************* SART OF EDITOR ******************************* */
    /* ******************************* SART OF EDITOR ******************************* */
    // URL is going to be set later during setup
    var url = 'about:blank';

    var panel2 = $( '<iframe source="'+url+'">' ).addClass( 've-ui-mwWavedromDialog-waveWidget' );
    panel2.attr('id', 'DrawIOContainer');
    panel2.css( {'border':'1px solid black', 'border-radius': '5px'});
    panel2.height( '80%' );
    panel2.width( '80%' );
	panel = new OO.ui.PanelLayout( {
		padded: true,
		expanded: false
	} );
	panel.$element.append(
    );



    /* ******************************* SART OF LAYOUT ******************************* */
    /* ******************************* SART OF LAYOUT ******************************* */
    /* ******************************* SART OF LAYOUT ******************************* */

    optionsTabPanel.$element.append(
        this.dimensionsField.$element,
        this.alignFieldset.$element,
        this.typeFieldset.$element
    );


    diagramTabPanel.$element.append(
        panel2
    );


    this.$body.append( this.indexLayout.$element );


    // FIXME: ====================================================================================================================
    debugger;

    // id=random
    var id=775430669, filename="ChartName5", type="png", interactive=0, updateHeight=100, updateWidth=100, updateMaxWidth=100;
    this.editor = new DrawioEditor(id, filename, type, interactive, updateHeight, updateWidth, updateMaxWidth);


    // window.addEventListener('message', drawioHandleMessage);
    //$(window).on("message", this.drawioHandleMessage );
    that=this;
    $(window).on("message", function(e) {  that.drawioHandleMessage(e);  }  );

};

/**
 * Handle change events on the dimensions widget
 *
 * @param {string} newValue
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.onDimensionsChange = function () {
	var dimensions, center;

	dimensions = this.dimensions.getDimensions();
	// this.scalable.getBoundedDimensions(	this.dimensions.getDimensions()	);

	// center = this.map && this.map.getCenter();
	center = null ;

	// Set container width for centering
//	this.$mapContainer.css( { height: 300, /* LMP-FIXME height */ width: dimensions.width } );
//	this.$mapContainer.css( { height: 400, /* LMP-FIXME height */ width: 600 } );
//	this.$mapContainer.css( { height: '80%', /* LMP-FIXME height */ width: '80%' } );

    // FIXME:LMP: map went missing...
    debugger;
    //this.$map.css( dimensions );

	this.updateSize();

/*
	if ( center ) {
		this.map.setView( center, this.map.getZoom() );
	}
*/

//	DrawIO.ProcessAll(); // LMP-FIXME
//DrawIO.RenderWaveForm(9999, DrawIO.eva('InputJSON_9999'), 'DrawIO_Display_');

	// this.map.invalidateSize();
	this.updateActions();
};

/**
 * Reset the map's position
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.resetMapPosition = function () {
	var position,
		dialog = this;

	if ( !this.map ) {
		return;
	}

	position = this.getInitialMapPosition();
	this.map.setView( position.center, position.zoom );

	this.updateActions();
	this.resetMapButton.setDisabled( true );

	this.map.once( 'moveend', function () {
		dialog.resetMapButton.setDisabled( false );
	} );
};

/**
 * Update action states
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.updateActions = function () {
	console.log( "XXXXXXXXXXXXXX Modified XXXXXXXXXXXXXX" );

	var newMwData, modified,
		mwData = this.selectedNode && this.selectedNode.getAttribute( 'mw' );

	if ( mwData ) {
		newMwData = ve.copy( mwData );
		this.updateMwData( newMwData );
		modified = !ve.compare( mwData, newMwData );
	} else {
		modified = true;
	}

	// Did the align buttons get changed?
	/*
	if( this.align.getSelectedItem().getData() )
	{

	}
	*/

	this.actions.setAbilities( { done: modified } );
};

/**
 * @inheritdoc ve.ui.MWExtensionWindow
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.insertOrUpdateNode = function () {
	// Parent method
	ve.ui.MWDrawIOBlockExtensionDialog.super.prototype.insertOrUpdateNode.apply( this, arguments );

	// Update scalable
	this.scalable.setCurrentDimensions(
		this.scalable.getBoundedDimensions(
			this.dimensions.getDimensions()
		)
	);
};

/**
 * @inheritdoc ve.ui.MWExtensionWindow
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.updateMwData = function ( mwData ) {
	/*
	 * mwData.attrs updated results in "Apply Changes"
	 *
	 */
	var center, scaled, latitude, longitude, zoom,
		dimensions = // this.scalable.getBoundedDimensions(
			this.dimensions.getDimensions()
		;//);

	// Parent method
	ve.ui.MWDrawIOBlockExtensionDialog.super.prototype.updateMwData.call( this, mwData );

	var currentModelAlignment = mwData.attrs.align;

	// Maybe align=.... tag is missing
	if (typeof currentModelAlignment !== 'undefined') currentModelAlignment = "none";

	// this.alignCheckbox.setSelected( alignment !== 'none' );
	var isSelected = this.alignCheckbox.isSelected() ;

	// LMP: Disable alignment selection if "wrap text" is not selected
	this.alignWidget.setDisabled( !isSelected );

    debugger ; // FIXME: What type is selected node?

	// if ( !( this.selectedNode instanceof ve.dm.MWDrawIOTransclusionNode2 ) ) 
	{
//		mwData.attrs.width = dimensions.width.toString();
//		mwData.attrs.height = dimensions.height.toString();

	    if( isSelected ) {
			// LMP: Case of just freshly un-selecting the wrap button, this is null - default to left
			//			var selected=this.alignWidget.getSelectedItem();
			var selected=this.alignWidget.findSelectedItem();
			if( selected === null ) selected=this.alignWidget.selectItemByData( 'left' );

			mwData.attrs.align = selected.getData();

			// XXX
			debugger;
	    }
	    else
	    {
			mwData.attrs.align = 'none' ;
	    }
	}
};

/**
 * @inheritdoc
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.getReadyProcess = function ( data ) {

	// https://www.mediawiki.org/wiki/OOUI/Windows
	// https://www.mediawiki.org/wiki/OOUI/Windows/Process_Dialogs
	// this.$wavedromdiv.text( this.input.getValue() ) ;

    // FIXME> this is where we should load the embedded URL; take the path from a wgDrawIOURL 

    // BAD: suffers CORS
    //$('#ve-ui-mwWavedromDialog-waveWidget').load('/path/file.html body')
    // BAD: Doesnt work
    //$('#ve-ui-mwWavedromDialog-waveWidget').src = "" ;
    //$('#DrawIOContainer').src = "https://...." ;

    // OK:
    // FIXME: Is there a better way to do this using OO.ui?
    document.getElementById('DrawIOContainer').src="https://embed.diagrams.net/?embed=1&saveAndExit=0&noExitBtn=1&noSaveBtn=1&ui=atlas&spin=1&modified=unsavedChanges&proto=json";

	// FIXME: For debugging version
    document.getElementById('DrawIOContainer').src="http://localhost/drawio.git/src/main/webapp/index.html?dev=1&embed=1&saveAndExit=0&noExitBtn=1&noSaveBtn=1&ui=atlas&spin=1&modified=unsavedChanges&proto=json";


	return ve.ui.MWDrawIOBlockExtensionDialog.super.prototype.getReadyProcess.call( this, data )
		.next( function () {
			this.setupDrawIORender();
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.getSetupProcess = function ( data ) {
	data = data || {};
	return ve.ui.MWDrawIOBlockExtensionDialog.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
            debugger ; // FIXME: What type is selected node?
			var inline = this.selectedNode instanceof ve.dm.MWDrawIOBlockExtensionNode,
				mwAttrs = this.selectedNode && this.selectedNode.getAttribute( 'mw' ).attrs || {};


// FIXME> DrawIO handling should go here
//			this.input.clearUndoStack();

			this.actions.setMode( this.selectedNode ? 'edit' : 'insert' );

			if ( this.selectedNode && !inline ) {
				//this.scalable = this.selectedNode.getScalable();

				var scalable = new ve.dm.Scalable( {
					// LMP-FIXME: For now fix it so that we have fixed aspect ratiop
					fixedRatio: false,

					currentDimensions: {
						width: (this.selectedNode.getElement()).attributes.width,
						height: (this.selectedNode.getElement()).attributes.height
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
				this.scalable = scalable ;

			} else {
                debugger ; // FIXME: What type is selected node?
				//this.scalable = ve.dm.MWDrawIONode.static.createScalable(
                this.scalable = ve.dm.MWDrawIOBlockExtensionNode.static.createScalable(
					{ width: 850, height: 400 }
//					inline ? { width: 850, height: 400 } : { width: 400, height: 300 }
				);
			}

            // Events
/* FIXME> LMP > Add proper events for read/write/exit of the div
			this.input.connect( this, {
				change: 'updateGeoJson',
				resize: 'updateSize'
            } );
*/
			this.dimensions.connect( this, {
				widthChange: 'onDimensionsChange',
				heightChange: 'onDimensionsChange'
			} );
			this.alignWidget.connect( this, { choose: 'updateActions' } );
			this.alignCheckbox.connect( this, { change: 'updateActions' } );

			this.resetMapButton.connect( this, { click: 'resetMapPosition' } );

			this.dimensionsField.toggle( !inline );

//			this.alignField.toggle( !inline );

			// TODO: Support block/inline conversion
			this.alignCheckbox.setSelected( mwAttrs.align !== 'none' ); // undefined, none, left, center, right
			this.alignWidget.selectItemByData( mwAttrs.align || 'right' );

			this.resetMapButton.$element.toggle( !!this.selectedNode );

			this.dimensions.setDimensions( this.scalable.getCurrentDimensions() );

			this.updateActions();
		}, this );
};

/**
 * Setup the map control
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.setupDrawIORender = function () {
	var dialog = this;

	//	DrawIO.ProcessAll(); // LMP-FIXME
	//WaveDrom.RenderWaveForm(9999, WaveDrom.eva('InputJSON_9999'), 'WaveDrom_Display_');

	if ( this.map ) {
		return;
	}
/*
	mw.loader.using( 'ext.kartographer.editor' ).then( function () {
		var geoJsonLayer,
			defaultShapeOptions = { shapeOptions: L.mapbox.simplestyle.style( {} ) },
			mapPosition = dialog.getInitialMapPosition();

		// TODO: Support 'style' editing
		dialog.map = mw.loader.require( 'ext.kartographer.box' ).map( {
			container: dialog.$map[ 0 ],
			center: mapPosition.center,
			zoom: mapPosition.zoom,
			alwaysInteractive: true
		} );

		dialog.map.doWhenReady( function () {

			dialog.updateGeoJson();
			dialog.onDimensionsChange();
			// Wait for dialog to resize as this triggers map move events
			setTimeout( function () {
				dialog.resetMapPosition();
			}, OO.ui.theme.getDialogTransitionDuration() );

			// if geojson and no center, we need the map to automatically
			// position itself when the feature layer is added.
			if (
				dialog.input.getValue() &&
				( !mapPosition.center || isNaN( mapPosition.center[ 0 ] ) || isNaN( mapPosition.center[ 1 ] ) )
			) {
				dialog.map.on( 'layeradd', function () {
					dialog.map.setView( null, mapPosition.zoom );
					dialog.updateActions();
				} );
			}

			geoJsonLayer = mw.loader.require( 'ext.kartographer.editing' )
				.getKartographerLayer( dialog.map );
			new L.Control.Draw( {
				edit: { featureGroup: geoJsonLayer },
				draw: {
					circle: false,
					// TODO: Determine metric preference from locale information
					polyline: defaultShapeOptions,
					polygon: defaultShapeOptions,
					rectangle: defaultShapeOptions,
					marker: { icon: L.mapbox.marker.icon( {} ) }
				}
			} ).addTo( dialog.map );

			function update() {
				// Prevent circular update of map
				dialog.updatingGeoJson = true;
				try {
					// dialog.input.setValue( JSON.stringify( geoJsonLayer.toGeoJSON(), null, '  ' ) );
				} finally {
					dialog.updatingGeoJson = false;
				}
				dialog.updateActions();
			}

			function created( e ) {
				e.layer.addTo( geoJsonLayer );
				update();
			}

			function updatePositionContainer() {
				var position = dialog.map.getMapPosition(),
					scaled = dialog.map.getScaleLatLng( position.center.lat, position.center.lng, position.zoom );
				dialog.$currentPositionLatField.text( scaled[ 0 ] );
				dialog.$currentPositionLonField.text( scaled[ 1 ] );
				dialog.$currentPositionZoomField.text( position.zoom );
			}

			function onMapMove() {
				dialog.updateActions();
				updatePositionContainer();
			}

			dialog.map
				.on( 'draw:edited', update )
				.on( 'draw:deleted', update )
				.on( 'draw:created', created )
				.on( 'moveend', onMapMove );

		} );
	} );
	*/
};

/**
 * Get the initial map position (coordinates and zoom level)
 *
 * @return {Object} Object containing latitude, longitude and zoom
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.getInitialMapPosition = function () {
	var latitude, longitude, zoom,
		pageCoords = mw.config.get( 'wgCoordinates' ),
		mwData = this.selectedNode && this.selectedNode.getAttribute( 'mw' ),
		mwAttrs = mwData && mwData.attrs;

	if ( mwAttrs && mwAttrs.zoom ) {
		latitude = +mwAttrs.latitude;
		longitude = +mwAttrs.longitude;
		zoom = +mwAttrs.zoom;
	} else if ( pageCoords ) {
		// Use page coordinates if Extension:GeoData is available
		latitude = pageCoords.lat;
		longitude = pageCoords.lon;
		zoom = 5;
	} else if ( !mwAttrs || !mwAttrs.extsrc ) {
		latitude = 30;
		longitude = 0;
		zoom = 2;
	}

	return {
		center: [ latitude, longitude ],
		zoom: zoom
	};
};

/**
 * Update the GeoJSON layer from the current input state
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.updateGeoJson = function () {
	var self = this;



	if ( /* !this.map || */ this.updatingGeoJson ) {
		return;
	}

    // FIXME> change to update diagram io
	//this.$wavedromdiv.text( this.input.getValue() ) ;

	// WaveDrom.ProcessAll(); // LMP-FIXME
	//WaveDrom.RenderWaveForm(9999, WaveDrom.eva('InputJSON_9999'), 'WaveDrom_Display_');


/*
	mw.loader.require( 'ext.kartographer.editing' )
		.updateKartographerLayer( this.map, this.input.getValue() )
		.done( function () {
			self.input.setValidityFlag( true );
		} )
		.fail( function () {
			self.input.setValidityFlag( false );
		} )
		.always( function () {
			self.updateActions();
		} );
*/
};

/**
 * @inheritdoc
 */
ve.ui.MWDrawIOBlockExtensionDialog.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.MWDrawIOBlockExtensionDialog.super.prototype.getTeardownProcess.call( this, data )
		.first( function () {
            // Events
// FIXME>            
//			this.input.disconnect( this );
			this.dimensions.disconnect( this );
			this.resetMapButton.disconnect( this );

			this.dimensions.clear();
			if ( this.map ) {
				this.map.remove();
				this.map = null;
			}
		}, this );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.MWDrawIOBlockExtensionDialog );
