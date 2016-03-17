<?php

$wgExtensionCredits['parserhook'][] = array(
   'name' => 'DrawioEditor',
   'version' => "1.0",
   'description' => 'draw.io flow chart creation and inline editing',
   'author' => 'Markus Gebert',
   'url' => 'http://www.github.com/mgeb/mediawiki-drawio-editor'
);

$wgHooks['ParserFirstCallInit'][] = 'DrawioEditor::onParserSetup';
$wgHooks['OutputPageParserOutput'][] = 'DrawioEditor::onOutputPageParserOutput';

$wgExtensionMessagesFiles['DrawioEditor'] = __DIR__ . '/DrawioEditor.i18n.php';

$wgResourceModules['ext.drawioeditor'] = array(
    'scripts' => 'ext.drawioeditor.js',
    'styles' => 'ext.drawioeditor.css',
    'dependencies' => array('jquery.ui.resizable'),
    'localBasePath' => __DIR__ . '/resources',
    'remoteExtPath' => 'DrawioEditor/resources',
);

/* Config Defaults */
$wgDrawioEditorImageType = 'svg';

class DrawioEditor {
    public static function onParserSetup(&$parser) {
        $parser->setFunctionHook( 'drawio', 'DrawioEditor::parse' );
    }

    public static function onOutputPageParserOutput(&$outputPage, $parseroutput) {
        $outputPage->addModules('ext.drawioeditor');
    }

    public static function parse(&$parser, $name=null) {
        global $wgUser, $wgEnableUploads;
        global $wgDrawioEditorImageType;
        
        /* disable caching before any output is generated */
        $parser->disableCache();

	/* parse named arguments */
	$opts = array();
        foreach (array_slice(func_get_args(), 2) as $rawopt) {
            $opt = explode('=', $rawopt, 2);
	    $opts[trim($opt[0])] = count($opt) === 2 ? trim($opt[1]) : true;
	}
       
        $height = array_key_exists('height', $opts) ? $opts['height'] : null;
        $width = array_key_exists('width', $opts) ? $opts['width'] : null;
        $type = array_key_exists('type', $opts) ? $opts['type'] : $wgDrawioEditorImageType;

        /* input validation */
        if ($name == null || !strlen($name))
            return self::errorMessage('Usage Error');
        if ($width && (!is_numeric($width) || $width < 1))
            return self::errorMessage('Invalid width');
        if ($height && (!is_numeric($height) || $height < 1))
            return self::errorMessage('Invalid height');
	if (!in_array($type, ['svg', 'png']))
            return self::errorMessage('Invalid type');

        /* input processing */
	$name = wfStripIllegalFilenameChars($name);
	$dispname = htmlspecialchars($name, ENT_QUOTES);

        /* random id to reference html elements */
        $id = mt_rand();

        /* prepare image information */
        $img_name = $name.".drawio.".$type;
        $img = wfFindFile($img_name);
        if ($img) {
            $img_url = $img->getViewUrl();
            $img_url_ts = $img_url.'?ts='.$img->nextHistoryLine()->img_timestamp;
            $img_desc_url = $img->getDescriptionUrl();
	    $img_height = $height ? $height : $img->getHeight();
	    $img_width = $width ? $width : $img->getWidth();
        } else {
            $img_url = '';
            $img_url_ts = '';
            $img_desc_url = '';
	    $img_height = $height ? $height : 0;
	    $img_width = $width ? $width : 0;
        }
        
        /* check for conditions that should or will prevent an edit of the chart */
        $readonly = (!$wgEnableUploads
            || (!$img && !$wgUser->isAllowed('upload'))
            || ($img && !$wgUser->isAllowed('reupload'))
            || $parser->getTitle()->isProtected('edit')
            );

        /* prepare edit href */
        $edit_ahref = sprintf("<a href='javascript:editDrawio(\"%s\", %s, \"%s\", %s, %s)'>",
            $id, json_encode($img_name, JSON_HEX_QUOT | JSON_HEX_APOS),
	    $type, $height ? 'true' : 'false', $width ? 'true' : 'false');
        
        /* output begin */
        $output = '<div>';

        /* div around the image */
        $output .= '<div id="drawio-img-box-'.$id.'">';

        /* display edit link */
        if (!$readonly) {
            $output .= '<div align="right">';
	    $output .= '<span class="mw-editsection">';
	    $output .= '<span class="mw-editsection-bracket">[</span>';
            $output .= $edit_ahref;
            $output .= wfMessage('edit')->text().'</a>';
	    $output .= '<span class="mw-editsection-bracket">]</span>';
	    $output .= '</span>';
	    $output .= '</div>';
        }

        /* prepare image */
        $img_fmt  = '<img id="drawio-img-%s" src="%s" title="%s" alt="%s" height="%s" width="%s"';
        if (!$img) {
           $img_fmt .= ' style="display:none;"';
        }
        $img_fmt .= '></img>';
        $img_html = sprintf($img_fmt, $id, $img_url_ts, 'drawio: '.$dispname, 'drawio: '.$dispname, $img_height, $img_width);

        /* output image and optionally a placeholder if the image does not exist yet */
        if (!$img) {
            // show placeholder
            $output .= sprintf('<div id="drawio-placeholder-%s" class="DrawioEditorInfoBox">'.
                '<b>%s</b><br/>empty draw.io chart</div> ',
                $id, $dispname);
        }
        // the image element must be there in any case (it's hidden as long as there is no content.
        $output .= '<a id="drawio-img-href-'.$id.'" href="'.$img_desc_url.'">';
        $output .= $img_html;
        $output .= '</a>';
        $output .= '</div>';
        
        /* editor and overlay divs, iframe is added by javascript on demand */
        $output .= '<div id="drawio-iframe-box-'.$id.'" style="display:none;">';
	$output .= '<div id="drawio-iframe-overlay-'.$id.'" class="DrawioEditorOverlay" style="display:none;"></div>';
	$output .= '</div>';

        /* output end */
        $output .= '</div>';

        return array($output, 'isHTML'=>true, 'noparse'=>true);
    }

    private static function errorMessage($msg) {
        $output  = '<div class="DrawioEditorInfoBox" style="border-color:red;">';
        $output .= '<p style="color: red;">DrawioEditor Usage Error:<br/>'.htmlspecialchars($msg).'</p>';
	$output .= '</div>';

        return array($output, 'isHTML'=>true, 'noparse'=>true);
    }
}
?>