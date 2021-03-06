/*!
 * VisualEditor ContentEditable MWDrawIONode class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */
/**
 * ContentEditable paragraph node.
 *
 * @class
 * @extends ve.ce.MWBlockExtensionNode
 * @mixins ve.ce.ResizableNode
 *
 * @constructor
 * @param {ve.dm.MWDrawIONode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.MWDrawIONode = function VeCeMWDrawIO( model, config ) {
	config = config || {};

	// Parent constructor
	ve.ce.MWDrawIONode.super.apply( this, arguments );

	// Mixin constructors
	ve.ce.ResizableNode.call( this, this.$element, config );

	this.$imageLoader = null;
	this.geoJson = null;
	this.mapData = {};

	this.updateMapPosition = $.debounce( 300, $.proxy( this.updateMapPosition, this ) );
	this.updateGeoJson = $.debounce( 300, $.proxy( this.updateGeoJson, this ) );

	// Events
	this.model.connect( this, { attributeChange: 'onAttributeChange' } );
	this.connect( this,
		{ focus: 'onMapFocus',
//		resizing: 'onResizableResizing'

	 }
	);

	// Ensure we have the styles to render the map node
	// mw.loader.using( 'ext.kartographer' );

	// DOM changes
	this.$element
		.empty()
		.addClass( 've-ce-mwDrawIONode' )
		.css( this.model.getCurrentDimensions() );
};


/* Inheritance */

OO.inheritClass( ve.ce.MWDrawIONode, ve.ce.MWBlockExtensionNode );

OO.mixinClass( ve.ce.MWDrawIONode, ve.ce.ResizableNode );

//FIXME: Because this is an extension mode
OO.mixinClass( ve.ce.MWDrawIONode, ve.ce.MWTransclusionNode );
ve.ce.MWDrawIONode.prototype.getTemplatePartDescriptions = function ( _model ) {
    debugger;
}

/* Static Properties */

// LMP> Must match the VE.DM type
ve.ce.MWDrawIONode.static.name = 'mwDrawIO_CONTEXT2';

ve.ce.MWDrawIONode.static.tagName = 'div';

ve.ce.MWDrawIONode.static.primaryCommandName = 'mwDrawIO_CONTEXT1';

/* Methods */

/**
 * A map requires interactive rendering
 *
 * Maps without GeoJSON can be rendered as static
 *
 * @return {boolean} Maps requires interactive rendering
 */
ve.ce.MWDrawIONode.prototype.requiresInteractive = function () {
	var mwData = this.model.getAttribute( 'mw' );

    // debugger ;

    // FIXME:LMP> Choose a way to select this if we want> mwData.parts[0].XXX
	return false;
};

/**
 * Update the rendering of the 'align', src', 'width' and 'height' attributes
 * when they change in the model.
 *
 * @method
 * @param {string} key Attribute key
 * @param {string} from Old value
 * @param {string} to New value
 */
ve.ce.MWDrawIONode.prototype.onAttributeChange = function () {
	this.update();
};

/**
 * @inheritdoc
 */
ve.ce.MWDrawIONode.prototype.onSetup = function () {
	ve.ce.MWDrawIONode.super.prototype.onSetup.call( this );

	this.update();
};

/**
 * Update the map rendering
 */
ve.ce.MWDrawIONode.prototype.update = function () {
	var requiresInteractive = true; //FIXME> this.requiresInteractive(),
		align = ve.getProp( this.model.getAttribute( 'mw' ), 'attrs', 'align' ) ||
			( this.model.doc.getDir() === 'ltr' ? 'right' : 'left' ),
		alignClasses = {
			left: 'tleft',
			center: 'tnone',
			none: 'tnone',
			right: 'tright'
			/*
			left: 'mw-halign-left',
			center: 'mw-halign-center',
			none: 'mw-halign-none',
			right: 'mw-halign-right'
			*/
			/* LMP-FIXME : Left / Center / Right
			left: 'floatleft',
			center: 'center',
			right: 'floatright'
			*/
		};

	if ( requiresInteractive ) {
		if ( !this.map && this.getRoot() ) {
			this.setupMap();
			/* LMP-FIXME
			mw.loader.using( [
				'ext.kartographer.box',
				'ext.kartographer.editing'
			] ).then( this.setupMap.bind( this ) );
			*/
		} else if ( this.map ) {
			this.updateGeoJson();
			this.updateMapPosition();
		}
	} else {
		if ( this.map ) {
			// Node was previously interactive
			this.map.remove();
			this.map = null;
		}
		this.updateStatic();
		$( '<img>' ).attr( 'src', this.model.getUrl( 1000, 1000 ) );
    }
    debugger;
	this.$element
		.removeClass( 'tleft tright tnone' )
//		.removeClass( 'mw-halign-none mw-halign-left mw-halign-center mw-halign-right' )
//		.removeClass( 'floatleft center floatright' )
		.addClass( alignClasses[ align ] )
		.css( this.model.getCurrentDimensions() );
};

/**
 * Setup an interactive map
 */
ve.ce.MWDrawIONode.prototype.setupMap = function () {
	var mwData = this.model.getAttribute( 'mw' ),
		mwAttrs = mwData && mwData.attrs,
        node = this;
        debugger;
/*
	this.map = mw.loader.require( 'ext.kartographer.box' ).map( {
		container: this.$element[ 0 ],
		center: [ +mwAttrs.latitude, +mwAttrs.longitude ],
		zoom: +mwAttrs.zoom
		// TODO: Support style editing
	} );
	*/

  var geoJson = ""; // FIXME:HACK>Doesnt exist> mwData && mwData.body.extsrc;

  // Container that allows for DrawIO Scaling to certain size
  var scaledcontainer2 = $( '<div>' ) ;
	scaledcontainer2.addClass('drawio-scaled-container');
	scaledcontainer2.appendTo( this.$element[ 0 ] ) ;
	scaledcontainer2.css({'height':'100%', 'width': '100%'});

    // Add DrawIO to VE container
    // FIXME:LMP: This is hardcoded to my example ChartName5.drawio.png as an example
    this.$wavedromdiv=$( '<img id="drawio-img-775430669" src="/mediawiki-1.35.0/images/2/21/ChartName5.drawio.png?ts=20201123073750" title="drawio: ChartName5" alt="drawio: ChartName5" style="height: auto; width: 100%; max-width: 371px;"></img>' );
    
	this.$wavedromdiv.appendTo( scaledcontainer2 ) ;
	$( '<div id=WaveDrom_Display_9998>' ).appendTo( scaledcontainer2 ); // LMP-FIXME: Needs to be something more concrete, there could be 9998 waves on a page

	this.map = this.$wavedromdiv;


		this.updateMapPosition();
		node.updateGeoJson();

		// LMP-FIXME:  Moved to setup phase, and inner done via CSS add
		//	WaveDrom.ProcessAll(); // LMP-FIXME
		//	document.head.innerHTML += '<style type="text/css">div.wavedromMenu{position:fixed;border:solid 1pt#CCCCCC;background-color:white;box-shadow:0px 10px 20px #808080;cursor:default;margin:0px;padding:0px;}div.wavedromMenu>ul{margin:0px;padding:0px;}div.wavedromMenu>ul>li{padding:2px 10px;list-style:none;}div.wavedromMenu>ul>li:hover{background-color:#b5d5ff;}</style>';

		//WaveDrom.RenderWaveForm(9998, WaveDrom.eva('InputJSON_9998'), 'WaveDrom_Display_');

	/*
	this.map.on( 'layeradd', this.updateMapPosition, this );
	this.map.doWhenReady( function () {
		node.updateGeoJson();

		// Disable interaction
		node.map.dragging.disable();
		node.map.touchZoom.disable();
		node.map.doubleClickZoom.disable();
		node.map.scrollWheelZoom.disable();
		node.map.keyboard.disable();

		WaveDrom.ProcessAll(); // LMP-FIXME
	} );
	*/

};

/**
 * Update the GeoJSON layer from the current model state
 */
ve.ce.MWDrawIONode.prototype.updateGeoJson = function () {
	var mwData = this.model.getAttribute( 'mw' ),
		geoJson = "";

	if ( geoJson !== this.geoJson ) {
		// LMP-FIXME : mw.loader.require( 'ext.kartographer.editing' ).updateKartographerLayer( this.map, mwData && mwData.body.extsrc ).then( this.updateMapPosition.bind( this ) );
		this.geoJson = geoJson;
		this.$wavedromdiv.text(geoJson);
		//alert(geoJson);
		// WaveDrom.ProcessAll(); // LMP-FIXME
		//WaveDrom.RenderWaveForm(9998, WaveDrom.eva('InputJSON_9998'), 'WaveDrom_Display_');

	}
};

/**
 * Updates the map position (center and zoom) from the current model state.
 */
ve.ce.MWDrawIONode.prototype.updateMapPosition = function () {
	var mwData = this.model.getAttribute( 'mw' ),
		mapData = this.mapData,
		updatedData = mwData && mwData.attrs,
		current;

	if ( !updatedData ) {
		// auto calculate the position
		/* LMP-FIXME
		this.map.setView( null, mapData.zoom );
		current = this.map.getMapPosition();
		// update missing attributes with current position.
		mwData.attrs.latitude = mapData.latitude = current.center.lat.toString();
		mwData.attrs.longitude = mapData.longitude = current.center.lng.toString();
		mwData.attrs.zoom = mapData.zoom = current.zoom.toString();
		*/
	} else if (
		isNaN( updatedData.latitude ) || isNaN( updatedData.longitude ) || isNaN( updatedData.zoom ) ||
		mapData.latitude !== updatedData.latitude ||
		mapData.longitude !== updatedData.longitude ||
		mapData.zoom !== updatedData.zoom
	) {
		//LMP-FIXME: this.map.setView( [ updatedData.latitude, updatedData.longitude ], updatedData.zoom );
		mapData.latitude = updatedData.latitude;
		mapData.longitude = updatedData.longitude;
		mapData.zoom = updatedData.zoom;
	} else {
		//LMP-FIXME : this.map.invalidateSize();
	}
};

/**
 * Update the static rendering
 *
 * @param {number} width Width
 * @param {number} height Height
 */
ve.ce.MWDrawIONode.prototype.updateStatic = function ( width, height ) {
	var url, node = this;

	if ( !this.model.getCurrentDimensions().width ) {
		return;
	}

	if ( this.$imageLoader ) {
		this.$imageLoader.off();
		this.$imageLoader = null;
	}

    //FIXME:LMP> no getURL in our model either; url = this.model.getUrl( width, height );
    url = "https://www.w3.org/People/mimasa/test/imgformat/img/w3c_home.jpg"

    // FIXME:LMP> Not sure what is NOT working here...
    /*
	this.$imageLoader = this.$( '<img>' ).on( 'load', function () {
		node.$element.css( 'backgroundImage', 'url(' + url + ')' );
    } ).attr( 'src', url );
    */
};

/**
 * @inheritdoc ve.ce.ResizableNode
 */
ve.ce.MWDrawIONode.prototype.onResizableResizing = function () {

	// Mixin method
	ve.ce.ResizableNode.prototype.onResizableResizing.apply( this, arguments );

	if ( false ) { //FIXME:LMP:  Removed> !this.requiresInteractive() ) {
		this.updateStatic( 1000, 1000 );
	} else if ( true /*this.map*/ ) {

	    debugger;

		// LMP-FIXME : this.map.invalidateSize();
		// Resize SVG
	    var drawioContainer = this.$element[0].querySelector( '.drawio-scaled-container');
		drawioContainer.setAttribute('width', arguments[ 0 ].width );
		drawioContainer.setAttribute('height', arguments[ 0 ].height );
	}
};

/**
 * @inheritdoc ve.ce.ResizableNode
 */
ve.ce.MWDrawIONode.prototype.getAttributeChanges = function ( width, height ) {

    var mwData = ve.copy( this.model.getAttribute( 'mw' ) );

    console.log("START VeCeMWDrawIONode.getAttributeChanges #################################################"  );

    
    console.log( width);
    console.log( height);
    console.log( mwData );
    console.log( mwData.attrs ); // FIXME: attrs is underfined, why?
    console.log( mwData.parts[0] ); // FIXME: attrs is underfined, why?

    console.log("END VeCeMWDrawIONode.getAttributeChanges #################################################"  );

    // FIXME: LMP: These attrs dont exist; the actual type is mwData.parts
    debugger;
	// mwData.attrs.width = width.toString();
	// mwData.attrs.height = height.toString();
    mwData.parts[0].template.params.width = width.toString();
    mwData.parts[0].template.params.height = height.toString();

    // FIXME:LMP: PARSOID ERROR
    // should be mwData.parts[0].template.params.width.wt = width.toString();
    // should be mwData.parts[0].template.params.height.wt = height.toString();
    
	return { mw: mwData };
};

/**
 * Handle focus events
 */
ve.ce.MWDrawIONode.prototype.onMapFocus = function () {
	if ( !this.requiresInteractive() ) {
        // FIXME: Do someting on focus selection?
        debugger;
        
		// Preload larger static map for resizing
        //$( '<img>' ).attr( 'src', this.model.getUrl( 1000, 1000 ) );

        //FIXME:LMP> no getURL in our model either; url = this.model.getUrl( width, height );
        var url = "https://www.w3.org/People/mimasa/test/imgformat/img/w3c_home.jpg"
        $( '<img>' ).attr( 'src', url );
	}
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWDrawIONode );
