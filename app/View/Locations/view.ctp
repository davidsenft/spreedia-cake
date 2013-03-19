<div id='hb_top' class='alignright'></div>

<div id='wrapper' class='center'>

	<!-- <div id='hb_location'></div> -->

	<!-- left side panel -->
	<div id="panel" class="left fixed-for-big">
		<!-- <dl class="vertical tabs" style='margin-bottom:0;'>
			<dd class="active"><a href="#simple1">List</a></dd>
			<dd><a href="#simple2">Map</a></dd>
			<dd><a href="#simple3">Activity</a></dd>
		</dl> -->
		<div id='hb_panel' class='panel' style='border-top:0;'></div>
	</div>

	<?php if ($page['format'] == 'map'){ ?>

	<!-- map -->
	<table style='width:100%;height:100%;'>
		<tr class='top-height'><td>&nbsp;</td></tr>
		<tr><td id='map_canvas'>&nbsp;</td></tr>
	</table>

	<?php }else{ ?>

	<!-- store list -->
	<div id="content" class="right">
		<div id='hb_storelist'></div>
	</div>
	<?php } ?>

</div>

<!-- ******************************************************************** -->
<!-- HANDLEBARS TEMPLATES -->
<!-- ******************************************************************** -->

<?php $this->Handlebars->template('top');
$this->Handlebars->template('location');
$this->Handlebars->template('storelist');
$this->Handlebars->template('panel'); ?>


<!-- ******************************************************************** -->
<!-- EXTERNAL SCRIPTS -->
<!-- SOME OF THIS SHIT SHOULD NOT NEED TO BE REPEATED... -->
<!-- ******************************************************************** -->

<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script type="text/javascript">
	window.jQuery || document.write('<script src="<?php echo $this->webroot; ?>js/jquery-1.9.1.js"><\/script>')</script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/jquery-ui-1.10.1.custom.min.js"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/handlebars-1.0.rc.1.js"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/handlebars-helpers.js"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/spreedia.js"></script>
<?php if ($page['format'] == "map"){ ?>
<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=AIzaSyDKlAkDEo8E6j9NI1xru5cRCSHqCxzy2kM&sensor=false"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/spreedia-map.js"></script>
<?php } ?>

<!-- ******************************************************************** -->
<!-- INITIAL DATA LOAD (cached) -->
<!-- ******************************************************************** -->

<script type="text/javascript" src="<?php echo $_SERVER['REQUEST_URI']; ?>/js"></script>

<!-- ******************************************************************** -->
<!-- ON DOCUMENT READY -->
<!-- ******************************************************************** -->

<script type="text/javascript">

$(document).ready(function(){

	console.log("loading templates...");
	Spreedia.handle("location", result["location"]);
	Spreedia.handle("storelist", {"stores" : result["stores"]});
	Spreedia.handle("panel", {"icons" : result["icons"], "prices" : result["prices"]});
	// Spreedia.handle("top", {"page" : result["page"]});

	Spreedia.init();
	Spreedia.stores_init();

});

</script>