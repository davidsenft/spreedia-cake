<?php

App::uses('AppHelper', 'View/Helper');

class ScriptHelper extends AppHelper {

	// loads data as cacheable external js file
	public function jsData($params){
		// leave off format parameter, format as 'js' instead
		$jsurl = "/".$params['controller']."/".$params['action']."/".$params['pass'][0]."/js";
		echo "<script type=\"text/javascript\" src=\"".$jsurl."\"></script>";
	}

	public function loadAll($format){ 

		// TODO: right now we're using this for all pages... split according to all/manystores/onestore/etc.?

		?>
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script type="text/javascript">
	window.jQuery || document.write('<script src="/js/jquery-1.9.1.js"><\/script>')</script>
<script type="text/javascript" src="/js/jquery-ui-1.10.1.custom.min.js"></script>
<script type="text/javascript" src="/js/jquery.iosslider.js"></script>
<script type="text/javascript" src="/js/handlebars-1.0.rc.1.js"></script>
<script type="text/javascript" src="/js/handlebars-helpers.js"></script>
<script type="text/javascript" src="/js/spreedia.js"></script><?php 

		/* if ($format == "map"){ TODO: load this asynchronously in changeFormat() as needed? */

		?>
<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=AIzaSyDKlAkDEo8E6j9NI1xru5cRCSHqCxzy2kM&sensor=false"></script>
<script type="text/javascript" src="/js/spreedia-map.js"></script><?php 

		/*} */

	}
	
}