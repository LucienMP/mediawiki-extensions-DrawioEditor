<?php

namespace MediaWiki\Extension\DrawioEditor;

use Config;
use File;
use MediaWiki\MediaWikiServices;
use Parser;
use RequestContext;

class DrawioEditor {

	/**
	 * @var Config
	 */
	protected $config;

	/**
	 * @var MediaWikiServices
	 */
	protected $services;

	public function __construct() {
		$this->services = MediaWikiServices::getInstance();
		$this->config = $this->services->getMainConfig();
	}

	/**
	 * @param Parser &$parser
	 * @param string|null $name
	 * @return array
	 */
	public function parse( &$parser, $name = null ) {
        wfDebugLog( 'DRAWIO', "Enter parse for:".$name ) ;

		/* disable caching before any output is generated */
		$parser->getOutput()->updateCacheExpiry( 0 );

		/* parse named arguments */
		$opts = [];
		foreach ( array_slice( func_get_args(), 2 ) as $rawopt ) {
			$opt = explode( '=', $rawopt, 2 );
			$opts[ trim( $opt[ 0 ] ) ] = count( $opt ) === 2 ? trim( $opt[ 1 ] ) : true;
		}

		$opt_type = array_key_exists( 'type', $opts )
			? $opts[ 'type' ]
			: $this->config->get( 'DrawioEditorImageType' );
		$opt_interactive = array_key_exists( 'interactive', $opts )
			? true
			: $this->config->get( 'DrawioEditorImageInteractive' );
		$opt_height = array_key_exists( 'height', $opts ) ? $opts[ 'height' ] : 'auto';
		$opt_width = array_key_exists( 'width', $opts ) ? $opts[ 'width' ] : '100%';
		$opt_max_width = array_key_exists( 'max-width', $opts ) ? $opts[ 'max-width' ] : false;

		/* process input */
		if ( $name == null || !strlen( $name ) ) {
			return $this->errorMessage( 'Usage Error' );
		}
		if ( !in_array( $opt_type, [ 'svg', 'png' ] ) ) {
			return $this->errorMessage( 'Invalid type' );
		}

		$len_regex = '/^((0|auto|chart)|[0-9]+(\.[0-9]+)?(px|%|mm|cm|in|em|ex|pt|pc))$/';
		$len_regex_max = '/^((0|none|chart)|[0-9]+(\.[0-9]+)?(px|%|mm|cm|in|em|ex|pt|pc))$/';

		if ( !preg_match( $len_regex, $opt_height ) ) {
			return $this->errorMessage( 'Invalid height' );
		}
		if ( !preg_match( $len_regex, $opt_width ) ) {
			return self::errorMessage( 'Invalid width' );
		}

		if ( $opt_max_width ) {
			if ( !preg_match( '/%$/', $opt_width ) ) {
				return $this->errorMessage( 'max-width is only allowed when width is relative' );
			}
			if ( !preg_match( $len_regex_max, $opt_max_width ) ) {
				return $this->errorMessage( 'Invalid max-width' );
			}
		} else {
			$opt_max_width = 'chart';
		}

		$name = wfStripIllegalFilenameChars( $name );
		$dispname = htmlspecialchars( $name, ENT_QUOTES );

        /* random id to reference html elements */
        //FIXME:LMP Boxes get rand ids, for now make it constant, this needs fixing in ve.X classes
        // $id = mt_rand();
		$id = 775430669;

		/* prepare image information */
        $img_name = $name . ".drawio." . $opt_type;
        
        $img = $this->services->getRepoGroup()->findFile( $img_name );       
		if ( $img ) {
            // FIXME: LMP: Not sure why this is needed, mayve findFile is caching stomething;
            // REF; https://doc.wikimedia.org/mediawiki-core/REL1_35/php/LocalFile_8php_source.html#l01332
            // REF; https://github.com/LucienMP/mediawiki-extensions-DrawioEditor
            
            $img->resetHistory();

			$historyLine = $img->nextHistoryLine();
            $img_url = $img->getViewUrl();
            

            /* FIXME* LMP: Something wrong with the history lookup, almost like its cached...
            // FIXME: LMP: Notice: Undefined property: stdClass::$img_timestamp in /home/lucienmp/Wiki/KekWiki/mediawiki-1.35.0/extensions/DrawioEditor/src/DrawioEditor.php on line 95
            wfDebugLog( 'DRAWIO', "crash about to happen..." ) ;
            $somevar = var_export($historyLine, true);
            wfDebugLog( 'DRAWIO', "CRASHY: " . $somevar ) ;

    ** FIRST INVOCATION
   'img_name' => 'ChartName5.drawio.png',
   'img_size' => '7301',
   'img_width' => '291',
   'img_height' => '181',
   'img_metadata' => 'a:6:{s:10:"frameCount";i:0;s:9:"loopCount";i:1;s:8:"duration";d:0;s:8:"bitDepth";i:8;s:9:"colorType";s:16:"truecolour-alpha";s:8:"metadata";a:1:{s:15:"_MW_PNG_VERSION";i:1;}}',
   'img_bits' => '8',
   'img_media_type' => 'BITMAP',
   'img_major_mime' => 'image',
   'img_minor_mime' => 'png',
   'img_timestamp' => '20201114093744',
   'img_sha1' => '0toqt5jhxniuzri0n59rymmxqdjy3bb',
   'img_description_text' => '',
   'img_description_data' => NULL,
   'img_description_cid' => '1',
   'img_user' => '2',
   'img_user_text' => 'Lucienmp',
   'img_actor' => '2',
   'oi_archive_name' => '',
   'oi_deleted' => '0',

   ** SECOND INVOCATION
   'oi_name' => 'ChartName5.drawio.png',
   'oi_archive_name' => '20201114093743!ChartName5.drawio.png',
   'oi_size' => '6640',
   'oi_width' => '221',
   'oi_height' => '221',
   'oi_bits' => '8',
   'oi_media_type' => 'BITMAP',
   'oi_major_mime' => 'image',
   'oi_minor_mime' => 'png',
   'oi_timestamp' => '20201114065223',
   'oi_deleted' => '0',
   'oi_sha1' => 'fm6fmvus2auld02tmnv4tywm7lhnyts',
   'oi_description_text' => '',
   'oi_description_data' => NULL,
   'oi_description_cid' => '1',
   'oi_user' => '2',
   'oi_user_text' => 'Lucienmp',
   'oi_actor' => '2',
   'oi_metadata' => 'a:6:{s:10:"frameCount";i:0;s:9:"loopCount";i:1;s:8:"duration";d:0;s:8:"bitDepth";i:8;s:9:"colorType";s:16:"truecolour-alpha";s:8:"metadata";a:1:{s:15:"_MW_PNG_VERSION";i:1;}}',
            */

            $img_url_ts = $img_url . '?ts=' . ( $historyLine !== false ? $historyLine->img_timestamp : '' );
			$img_desc_url = $img->getDescriptionUrl();
			$img_height = $img->getHeight() . 'px';
			$img_width = $img->getWidth() . 'px';
		} else {
			$img_url = '';
			$img_url_ts = '';
			$img_desc_url = '';
			$img_height = 0;
			$img_width = 0;
		}

		$css_img_height = $opt_height === 'chart' ? $img_height : $opt_height;
		$css_img_width = $opt_width === 'chart' ? $img_width : $opt_width;
		$css_img_max_width = $opt_max_width === 'chart' ? $img_width : $opt_max_width;

		/* prepare edit href */
		$edit_ahref = sprintf( "<a href='javascript:editDrawio(\"%s\", %s, \"%s\", %s, %s, %s, %s)'>",
			$id,
			json_encode( $img_name, JSON_HEX_QUOT | JSON_HEX_APOS ),
			$opt_type,
			$opt_interactive ? 'true' : 'false',
			$opt_height === 'chart' ? 'true' : 'false',
			$opt_width === 'chart' ? 'true' : 'false',
			$opt_max_width === 'chart' ? 'true' : 'false' );

		/* output begin */
		$output = '<div>';

		/* div around the image */
		$output .= '<div id="drawio-img-box-' . $id . '">';

		/* display edit link */
		if ( !$this->isReadOnly( $img ) ) {
			$output .= '<div align="right">';
			$output .= '<span class="mw-editdrawio">';
			$output .= '<span class="mw-editsection-bracket">[</span>';
			$output .= $edit_ahref;
			$output .= wfMessage( 'edit' )->text() . '</a>';
			$output .= '<span class="mw-editsection-bracket">]</span>';
			$output .= '</span>';
			$output .= '</div>';
		}

		/* prepare image */
		$img_style = sprintf( 'height: %s; width: %s; max-width: %s;',
			$css_img_height, $css_img_width, $css_img_max_width );
		if ( !$img ) {
			$img_style .= ' display:none;';
		}

		if ( $opt_interactive ) {
			$img_fmt = '<object id="drawio-img-%s" data="%s" type="text/svg+xml" style="%s"></object>';
			$img_html = sprintf( $img_fmt, $id, $img_url_ts, $img_style );
		} else {
			$img_fmt = '<img id="drawio-img-%s" src="%s" title="%s" alt="%s" style="%s"></img>';
			$img_html = '<a id="drawio-img-href-' . $id . '" href="' . $img_desc_url . '">';
			$img_html .= sprintf(
				$img_fmt, $id, $img_url_ts,
				'drawio: ' . $dispname, 'drawio: ' . $dispname, $img_style
			);
			$img_html .= '</a>';
		}

		/* output image and optionally a placeholder if the image does not exist yet */
		if ( !$img ) {
			// show placeholder
			$output .= sprintf( '<div id="drawio-placeholder-%s" class="DrawioEditorInfoBox">' .
				'<b>%s</b><br/>empty app.diagrams.net chart</div> ',
				$id, $dispname );
		}
		// the image or object element must be there in any case
		// (it's hidden as long as there is no content.)
		$output .= $img_html;
		$output .= '</div>';

		/* editor and overlay divs, iframe is added by javascript on demand */
		$output .= '<div id="drawio-iframe-box-' . $id . '" style="display:none;">';
		$output .= '<div id="drawio-iframe-overlay-' . $id
			. '" class="DrawioEditorOverlay" style="display:none;"></div>';
		$output .= '</div>';

		/* output end */
		$output .= '</div>';

		/*
		 * link the image to the ParserOutput, so that the mediawiki knows that
		 * it is used by the hosting page (through the DrawioEditor extension).
		 * Note: This only works if the page is edited after the image has been
		 * created (i.e. saved in the DrawioEditor for the first time).
		 */
		if ( $img ) {
			$parser->getOutput()->addImage( $img->getTitle()->getDBkey() );
		}

		return [ $output, 'isHTML' => true, 'noparse' => true ];
	}

	/**
	 * @param string $msg
	 * @return array
	 */
	private function errorMessage( $msg ) {
		$output = '<div class="DrawioEditorInfoBox" style="border-color:red;">';
		$output .= '<p style="color: red;">DrawioEditor Usage Error:<br/>'
			. htmlspecialchars( $msg ) . '</p>';
		$output .= '</div>';

		return [ $output, 'isHTML' => true, 'noparse' => true ];
	}

	/**
	 * @param File|null $img
	 * @return bool
	 */
	private function isReadOnly( $img ) {
		$user = RequestContext::getMain()->getUser();
		$parser = $this->services->getParser();

		return !$this->config->get( 'EnableUploads' ) ||
			( !$img && !$this->services->getPermissionManager()->userHasRight( $user, 'upload' ) ) ||
			( !$img && !$this->services->getPermissionManager()->userHasRight( $user, 'reupload' ) ) ||
			( $parser->getTitle() ? $parser->getTitle()->isProtected( 'edit' ) : false );
	}
}
