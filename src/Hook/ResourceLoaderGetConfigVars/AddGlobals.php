<?php

namespace MediaWiki\Extension\DrawioEditor\Hook\ResourceLoaderGetConfigVars;

use MediaWiki\Extension\DrawioEditor\DrawioEditor;
use MediaWiki\MediaWikiServices;
use MWException;
use Parser;

class AddGlobals {

	public static function callback( array &$vars ) {

		// Get the configuration
		$config = MediaWikiServices::getInstance()->getMainConfig();

		// Get the base URL
		$limit = $config->get( 'DrawioEditorBaseURL' );
		$img_required_type = $config->get( 'DrawioEditorImageType' );
		$vars['wgDrawioEditorBaseURL'] = $limit;
		$vars['DrawioEditorImageType'] = $img_required_type;
/* FIXME: set this to check if the configuration is missing
		if ( $limit ... ) {
				throw new \RuntimeException(
						'The value of wgDrawioEditorBaseURL is not valid. It should be set to URL for your drawio/diagrams.net webapp.'
				);
		}
*/
		return true;
	}

}
