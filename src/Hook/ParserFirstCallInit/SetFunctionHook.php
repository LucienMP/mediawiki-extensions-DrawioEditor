<?php

namespace MediaWiki\Extension\DrawioEditor\Hook\ParserFirstCallInit;

use MediaWiki\Extension\DrawioEditor\DrawioEditor;
use MWException;
use Parser;

class SetFunctionHook {

	/**
	 * @param Parser &$parser
	 * @return bool
	 * @throws MWException
	 */
	public static function callback( &$parser ) {
        $drawioEditor = new DrawioEditor();
        
        // Legacy Parser Function {{#drawio:filename|param=...}}
		$parser->setFunctionHook( 'drawio', [ $drawioEditor, 'parseLegacyParserFunc' ] );

        // Extension; <drawio name=filename param=..../> 
        $parser->setHook( 'drawio', [ $drawioEditor, 'parseExtension' ] );

        return true;
	}
}
