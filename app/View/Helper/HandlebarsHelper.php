<?php

App::uses('AppHelper', 'View/Helper');

class HandlebarsHelper extends AppHelper {

	public function template($name){
		$root = $_SERVER['DOCUMENT_ROOT'];
		$buf = "\n<script id=\"".$name."-template\" type=\"text/x-handlebars-template\" data-template-name=\"application\">";
		$buf .= "\n".file_get_contents($root."/app/webroot/hb/".$name.".tmpl")."\n";
		echo $buf . "</script>\n";
	}
	
}