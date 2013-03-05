<!-- ******************************************************************** -->
<!-- SCAFFOLD -->
<!-- ******************************************************************** -->

<?php /* if ($parent) echo "My parent is ".$parent['name']."<br><br>"; */ ?>


<div id='top' class='alignright'>

	<!-- location title -->
	<div id='hb_location'></div>

	<!-- drop down symbol -->
	<span class='green symbol' style='padding-right:8px;'>q</span>
	<span class='green symbol'>i</span>

	<!-- navigation -->
	<nav>
		<ul class='right bebas hide-for-small'>
			<!--<li><a href='/me'>davidsenft</a></li>-->
			<li><a href='/explore' class='active'>Explore</a></li>
			<li><a href='/magazine'>Magazine</a></li>
			<li><a href='/favorites'>Favorites</a></li>
			<li><a href='/recs'>Personalize</a></li>
		</ul>
	</nav>

</div>

<div id="wrapper" class='center page-width'>

	<!-- left side panel -->
	<div id="panel" class="left fixed-for-big">
		<dl class="vertical tabs" style='margin-bottom:0;'>
			<dd class="active"><a href="#simple1">List</a></dd>
			<dd><a href="#simple2">Map</a></dd>
			<dd><a href="#simple3">Activity</a></dd>
		</dl>
		<div id='hb_panel' class='panel' style='border-top:0;'></div>
	</div>

	<!-- right side content -->
	<div id="content" class="right list">
		<div id='hb_storelist'></div>
	</div>

</div>

<!-- ******************************************************************** -->
<!-- HANDLEBARS TEMPLATES -->
<!-- ******************************************************************** -->
<script id="location-template" type="text/x-handlebars-template" data-template-name="application">
<?php require_once($this->webroot."hb/location.js"); ?>
</script>
<script id="storelist-template" type="text/x-handlebars-template" data-template-name="application">
<?php require_once($this->webroot."hb/storelist.js"); ?>
</script>
<script id="panel-template" type="text/x-handlebars-template" data-template-name="application">
<?php require_once($this->webroot."hb/panel.js"); ?>
</script>

<!-- ******************************************************************** -->
<!-- EXTERNAL SCRIPTS -->
<!-- ******************************************************************** -->
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/handlebars-1.0.rc.1.js"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/handlebars-helpers.js"></script>
<script type="text/javascript">
	window.jQuery || document.write('<script src="<?php echo $this->webroot; ?>js/jquery-1.8.3.min.js"><\/script>')</script>


<!-- ******************************************************************** -->
<!-- ON DOCUMENT READY -->
<!-- ******************************************************************** -->
<script type="text/javascript">

$(document).ready(function(){
	var location_template = Handlebars.compile($("#location-template").html());
	var storelist_template = Handlebars.compile($("#storelist-template").html());
	var panel_template = Handlebars.compile($("#panel-template").html());

	$.getJSON(".json", {}, function(result){
		// get template contexts
		var location = result['location'];
		var stores = result['stores'];
		var icons = result['icons'];

		// get template html
		var location_html = location_template(location);
		var storelist_html = storelist_template({"stores" : stores});
		var panel_html = panel_template({"icons" : icons});

		// create templates
		$("#hb_location").html(location_html);
		$("#hb_storelist").html(storelist_html);
		$("#hb_panel").html(panel_html);

		init();
	});
});

function init(){
	// $(".commas > *:not(:last-child)").after(",");
	$(".hover").hover(function(){
		$(this).addClass("over");
	},function(){
		$(this).removeClass("over");
	});
}
</script>