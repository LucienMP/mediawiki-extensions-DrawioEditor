
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
        throw new Error('unkown file type');
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

    if( isEDITLinkVersion ) {
        this.iframe = $('<iframe>', {
            src: 'https://embed.diagrams.net/?embed=1&proto=json&spin=1&analytics=0&db=0&gapi=0&od=0&picker=0',
        id: 'drawio-iframe-' + id,
        class: 'DrawioEditorIframe'
        })
        this.iframe.appendTo(this.iframeBox);
    } else {
        // VE version has a div with id=DrawIOContainer
        this.iframe = $("#DrawIOContainer");
    }   

    this.iframeWindow = this.iframe.prop('contentWindow');

    this.show();
}

DrawioEditor.prototype.destroy = function() {
    this.iframe.remove();
}

DrawioEditor.prototype.show = function() {
    this.imageBox.hide();
    this.iframeBox.height(Math.max(this.imageBox.height()+100, 800));
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
                console.log("img res",res);
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
    // console.log("xhr",xhr);
    xhr.responseType = 'blob';
    xhr.send();
    console.log("xhr",xhr);
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
    if (!this.imageURL.length) {
        // just load without data if there's no current image
        this.sendMsgToIframe(
            {
                action: 'load',
                autosave: 1     // FIXME: LMP: Causes update event notification on every change
            });
	return;
    }
    // fetch image from wiki. it must contain both image data and
    // draw.io xml data. see DrawioEditor.saveCallback()
    this.downloadFromWiki();
}
 
DrawioEditor.prototype.uploadToWiki = function(blob) {
    var that = this;

	var api = new mw.Api();
    api.upload(blob, { filename: this.filename, ignorewarnings: true, format: 'json' } )
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

window.editDrawio = function(id, filename, type, interactive, updateHeight, updateWidth, updateMaxWidth) {
    debugger;

    //FIXME: Added only on edit
    window.addEventListener('message', drawioHandleMessage);

    if (!editor) {
        editor = new DrawioEditor(id, filename, type, interactive, updateHeight, updateWidth, updateMaxWidth, true);
    } else {
        alert("Only one DrawioEditor can be open at the same time!");
    }
};

function drawioHandleMessage(e) {
    debugger;

    // we only act on event coming from draw.io iframes
    if (e.origin != 'https://embed.diagrams.net')
        return;

    if (!editor)
        return;

    evdata = JSON.parse(e.data);

    switch(evdata['event']) {
        case 'init':
            editor.initCallback();
            break;

        case 'load':
            break;

        case 'save':
            editor.saveCallback();
            break;

        case 'export':
            editor.exportCallback(evdata['format'], evdata['data']);
            break;

        case 'exit':
            editor.exitCallback();
            // editor is null after this callback

            // FIXME: Remove event handler
            window.removeEventListener('message',drawioHandleMessage);
            break;

        default:
            alert('Received unknown event from drawio iframe: ' + evdata['event']);
    }
};

//FIXME: LMP; moved to editDrawio; window.addEventListener('message', drawioHandleMessage);
