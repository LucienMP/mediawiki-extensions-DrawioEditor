
function DrawioEditor(id, filename, type, interactive, updateHeight, updateWidth, updateMaxWidth, isEDITLinkVersion=false) {
    var that = this;
    this.id = id;
    this.filename = filename;
    this.imgType = type;
    this.interactive = interactive;
    this.updateHeight = updateHeight;
    this.updateWidth = updateWidth;
    this.updateMaxWidth = updateMaxWidth;

    if (this.imgType == 'svg') {
        this.imgMimeType = 'image/svg+xml';
    } else if (this.imgType == 'png') {
        this.imgMimeType = 'image/png';
    } else {
        throw new Error('unknown file type');
    }

    this.imageBox = $("#drawio-img-box-" + id);
    this.image = $("#drawio-img-" + id);
    if (interactive) {
        this.imageURL = this.image.attr('data');
    } else {
        this.imageURL = this.image.attr('src');
    }
    this.imageHref = $("#drawio-img-href-" + id);
    this.placeholder = $("#drawio-placeholder-" + id);

    this.iframeBox = $("#drawio-iframe-box-" + id);
    this.iframeBox.resizable({
        "handles": "s",
	    "distance": 0,
    	start: function(event, ui) {
            that.showOverlay();
    	},
        stop: function(event, ui) {
            $(this).css("width", '');
            that.hideOverlay();
        }
    });
    this.iframeBox.resizable("enable");

    this.iframeOverlay = $("#drawio-iframe-overlay-" + id);
    this.iframeOverlay.hide();
 
    /* FIXME:LMP This code depends on the iframe being EDIT link, or VE editor */
    //isEDITLinkVersion=false;
    // console.log("this.imageHref", this.imageHref);

    if( isEDITLinkVersion ) {
        var url = mw.config.get( 'wgDrawioEditorBaseURL' ) + "?" ;
        //alert("some url:"+url);
        url = url + "&embed=1";
        url = url + "&proto=json";

        // Enable development javascript
        url = url + "&dev=1";

        // Skin; dark, atlas, min
        url = url + "&ui=atlas";

        // Disable buttons, and menu for saving/exiting
        url = url + "&saveAndExit=0&noExitBtn=0&noSaveBtn=0";

        // Start with spinner
        url = url + "&spin=1&modified=unsavedChanges";
        // prev src = 'https://embed.diagrams.net/?embed=1&proto=json&spin=1&analytics=0&db=0&gapi=0&od=0&picker=0'
        this.iframe = $('<iframe>', {
            src: url,
        id: 'drawio-iframe-' + id,
        class: 'DrawioEditorIframe'
        })
        this.iframe.appendTo(this.iframeBox);
    } else {
        // VE version has a div with id=DrawIOContainer
        this.iframe = $("#DrawIOContainer");
    }   

    this.iframeWindow = this.iframe.prop('contentWindow');

    if(isEDITLinkVersion) {
        // this.initCallback();
        // this.sendMsgToIframe({ action: 'init'});
        this.sendMsgToIframe({
            'action': 'init',
        });
    }
    this.show();
}

DrawioEditor.prototype.destroy = function() {
    this.iframe.remove();
}

DrawioEditor.prototype.show = function() {
    this.imageBox.hide();
    this.iframeBox.height(Math.max(this.imageBox.height()+100, 800));
    this.iframeBox.width(1000);
    this.iframeBox.show();
}

DrawioEditor.prototype.hide = function() {
    this.iframeBox.hide();
    this.imageBox.show();
}

DrawioEditor.prototype.showOverlay = function() {
    this.iframeOverlay.show();
}

DrawioEditor.prototype.hideOverlay = function() {
    this.iframeOverlay.hide();
}

DrawioEditor.prototype.updateImage = function (imageinfo) {
    this.imageURL = imageinfo.url + '?ts=' + imageinfo.timestamp;
    if (this.interactive) {
        this.image.attr("data", this.imageURL);
    } else {
        this.image.attr("src", this.imageURL);
    }
    this.imageHref.attr("href", imageinfo.descriptionurl);
    if (this.updateHeight)
        this.image.css('height', imageinfo.height);
    if (this.updateWidth)
        this.image.css('width', imageinfo.width);
    if (this.updateMaxWidth)
        this.image.css('max-width', imageinfo.width);
    if (this.placeholder) {
        this.placeholder.hide();
        this.image.show();
    }
}

DrawioEditor.prototype.sendMsgToIframe = function(data) {
    // FIXME: LMP: Disabled for diagrams
//  this.iframeWindow.postMessage(JSON.stringify(data), 'https://embed.diagrams.net');
    this.iframeWindow.postMessage(JSON.stringify(data), 'http://localhost');
}

DrawioEditor.prototype.showDialog = function(title, message) {
    this.hideSpinner();
    this.sendMsgToIframe({
        'action': 'dialog',
        'title': title,
        'message': message,
        'button': 'Discard',
        'modified': true
    });
}

DrawioEditor.prototype.showSpinner = function() {
    this.iframeBox.resizable("disable");
    this.showOverlay();
    this.sendMsgToIframe({
        'action': 'spinner',
	'show': true
    });
}

DrawioEditor.prototype.hideSpinner = function() {
    this.iframeBox.resizable("enable");
    this.hideOverlay();
    this.sendMsgToIframe({
        'action': 'spinner',
        'show': false
    });
}

DrawioEditor.prototype.downloadFromWiki = function() {
    var that = this;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
	    if (this.status == 200) {
                var res = this.response;
                var fr = new FileReader();
                fr.onload = function(ev) { that.loadImageFromDataURL(res.type, ev.target.result); };
                fr.readAsDataURL(res);
	    } else {
	        that.showDialog('Load failed',
	            'HTTP request to fetch image failed: ' + this.status +
		    '<br>Image: ' + that.imageURL);
	    }
        }
    }
    xhr.onload = function() {

    }
    xhr.open('GET', this.imageURL);
    xhr.responseType = 'blob';
    xhr.send();
}

DrawioEditor.prototype.loadImageFromDataURL = function(type, dataurl) {
        if (type != this.imgMimeType) {
	    this.showDialog('Load failed',
	        'Invalid mime type when loading image from wiki:' +
		'<br>Actual: ' + type + ' / Expected: ' + this.imgMimeType +
		'<br>Image: ' + this.imageURL);
	    return;
        }
        if (this.imgType == 'svg') {
            this.sendMsgToIframe({ action: 'load', xml: dataurl,
                    autosave: 1,     // FIXME: LMP: Causes update event notification on every change
                });
        } else if (this.imgType == 'png') {
            this.sendMsgToIframe({ action: 'load', xmlpng: dataurl,
                    autosave: 1,     // FIXME: LMP: Causes update event notification on every change
                });
        }
}

DrawioEditor.prototype.loadImage = function() {
    // if (!this.imageURL.length) {
    if (this.imageURL == undefined) {
        // just load without data if there's no current image
        this.sendMsgToIframe(
            {
                action: 'load',
                autosave: 1     // FIXME: LMP: Causes update event notification on every change
            });
        this.hideSpinner();
	    return;
    }
    // fetch image from wiki. it must contain both image data and
    // draw.io xml data. see DrawioEditor.saveCallback()
    this.downloadFromWiki();
}
 
DrawioEditor.prototype.uploadToWiki = function(blob) {
    if(document.getElementsByClassName('oo-ui-inputWidget-input').length > 0) {
        var enterd_filename = document.getElementsByClassName('oo-ui-inputWidget-input')[0].value;
        if(this.filename == 'ChartName5' && (enterd_filename != '' && enterd_filename != this.filename)) {
            this.filename = enterd_filename;
        }
    }
    var type = 'png';
    if(this.imgType) {
        type = this.imgType;
    }
    var that = this;
	var api = new mw.Api();
    api.upload(blob, { filename: this.filename+'.drawio.'+type, ignorewarnings: 1, format: 'json' } )
        .done( function(data) {
            if (!data.upload) {
				if (data.error) {
						that.showDialog('Save failed',
				   'The wiki returned the follwing error when uploading:<br>' +
				   data.error.info);
			    } else {
						that.showDialog('Save failed',
				   'The upload to the wiki failed.' +
				   '<br>Check javascript console for details.');
			    }
			    console.log('upload to wiki failed');
			    console.log(data);
			} else {
				that.updateImage(data.upload.imageinfo);
				that.hideSpinner();
			}
        })
		.fail( function(retStatus, data) {
            if( retStatus == "exists" ){
				that.updateImage(data.upload.imageinfo);
				that.hideSpinner();
			} else {
				that.showDialog('Save failed', 
					'Upload to wiki failed!' +
				'<br>Error: ' + data.error.info +
				'<br>Check javascript console for details.');
			}
        });
    
}

DrawioEditor.prototype.save = function(datauri) {
    // the data in the data uri contains both the image _and_ draw.io XML, see
    // this.saveCallback()

    parts = /^data:([^;,=]+\/[^;,=]+)?((?:;[^;,=]+=[^;,=]+)+)?(?:;(base64))?,(.+)$/.exec(datauri);
    
    // currently this save/upload to wiki code assumes that drawio passes data
    // URIs with base64 encoded data. this is currently the case but may not be
    // true forever. the check below errors out if the URI data is not base64
    // encoded (and if the data URI is otherwise deemed invalid.
    if (!parts || parts[1] != this.imgMimeType || parts[3] != 'base64' ||
            typeof parts[4] !== 'string' || parts[4].length < 1) {
	that.showDialog('Save failed', 'Got unexpected data from drawio export.');
	return;
    }

    // convert base64 to uint8 array
    datastr = atob(parts[4]);
    var expr = /"http:\/\/[^"]*?1999[^"]*?"/gmi;
    datastr = datastr.replace( expr, '"http://www.w3.org/2000/svg"' );
    data = new Uint8Array(datastr.length)
    for (i = 0; i < datastr.length; i++) {
        data[i] = datastr.charCodeAt(i);
    }
    
    this.uploadToWiki(new Blob([data], {type: this.imgMimeType}));
}

DrawioEditor.prototype.exit = function() {
    this.hide();
    editor = null;
    this.destroy();
}

DrawioEditor.prototype.saveCallback = function() {
    this.showSpinner();

    // xmlsvg and xmlpng are known to work. the xml prefix causes the original
    // chart.io xml data to be added to the file, so it can be reimported later
    // without any data loss.
    var format = 'xml'+ this.imgType;

    this.sendMsgToIframe({
        'action': 'export',
        'embedImages': true,
        'format': format,
    });

    // TODO: prevent exit while saving
}

DrawioEditor.prototype.exportCallback = function(type, data) {
    this.showSpinner();
    this.save(data);
}

DrawioEditor.prototype.exitCallback = function() {
    this.exit();
}

DrawioEditor.prototype.initCallback = function () {
    this.loadImage();
}


var editor;
// var this_use = this;

window.editDrawio = function(id, filename, type, interactive, updateHeight, updateWidth, updateMaxWidth) {
    debugger;
    //FIXME: Added only on edit
    window.addEventListener('message', drawioHandleMessage);

    if (!editor) {
        editor = new DrawioEditor(id, filename, type, interactive, updateHeight, updateWidth, updateMaxWidth, true);
        // this_use.hideSpinner();
    } else {
        alert("Only one DrawioEditor can be open at the same time!");
    }
};

// function drawioHandleMessageOld(e) {
//     debugger;

//     // we only act on event coming from draw.io iframes
//     // if (e.origin != 'https://embed.diagrams.net')
//     //     return;

//     if (!editor)
//         return;

//     evdata = JSON.parse(e.data);

//     switch(evdata['event']) {
//         case 'init':
//             editor.initCallback();
//             break;

//         case 'load':
//             break;

//         case 'save':
//             editor.saveCallback();
//             break;

//         case 'export':
//             editor.exportCallback(evdata['format'], evdata['data']);
//             break;

//         case 'exit':
//             editor.exitCallback();
//             // editor is null after this callback

//             // FIXME: Remove event handler
//             window.removeEventListener('message',drawioHandleMessage);
//             break;

//         default:
//             alert('Received unknown event from drawio iframe: ' + evdata['event']);
//     }
// };

function drawioHandleMessage(e) {
    var date = new Date();
    evdata = JSON.parse(e.data);
    console.log( date.toLocaleTimeString() + "drawioHandleMessage: [" + evdata['event'] + "]" );
    debugger;

    // FIXME:LMP:Extract original event from jquery wrapper
    // e = eJqueryEvent.originalEvent;

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
            // this.editor.hide();
            // editor is null after this callback
            break;

        case 'openLink':
            // Help>About
            break;

        case 'autosave':
            // this.actions.setAbilities( { done: true } );
            this.editor.saveCallback();
            // FIXME: Update and set the MW apply button chages here
            break;

        default:
            alert('Received unknown event from drawio iframe: ' + evdata['event']);
    }
}

//FIXME: LMP; moved to editDrawio; window.addEventListener('message', drawioHandleMessage);
