<!-- ******************************************************************** -->
<!-- SCAFFOLD -->
<!-- ******************************************************************** -->

<?php /* if ($parent) echo "My parent is ".$parent['name']."<br><br>"; */ ?>

<div class="row">
	<div class="twelve columns">
		<div id='hb_location'></div>
		<hr>
	</div>
</div>

<div class="row">
	<div class="four columns">
		<div class='panel'>
			<h3>Buttons</h3>
			<p>The buttons go here</p>
		</div>
	</div>
	<div class="eight columns">
		<div id='hb_storelist'></div>
	</div>
	<hr>
</div>

<!-- ******************************************************************** -->
<!-- HANDLEBARS TEMPLATES -->
<!-- ******************************************************************** -->
<script id="location-template" type="text/x-handlebars-template" data-template-name="application">
<?php require_once("/Users/davidsenft/Projects/spreedia-cake/app/webroot/hb/location.js"); ?>
</script>
<script id="storelist-template" type="text/x-handlebars-template" data-template-name="application">
<?php require_once("/Users/davidsenft/Projects/spreedia-cake/app/webroot/hb/storelist.js"); ?>
</script>

<!-- ******************************************************************** -->
<!-- EXTERNAL SCRIPTS -->
<!-- ******************************************************************** -->
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/handlebars-1.0.rc.1.js"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/handlebars-compare.js"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/underscore-min.js"></script>
<?php echo $this->Html->script('foundation/foundation.min'); ?>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/foundation/app.js"></script> <!-- move elsewhere -->
<script type="text/javascript">
	window.jQuery || document.write('<script src="<?php echo $this->webroot; ?>js/jquery-1.8.3.min.js"><\/script>')</script>


<!-- ******************************************************************** -->
<!-- ON DOCUMENT READY -->
<!-- ******************************************************************** -->
<script type="text/javascript">

$(document).ready(function(){
	var location_template = Handlebars.compile($("#location-template").html());
	var storelist_template = Handlebars.compile($("#storelist-template").html());

	$.getJSON(".json", {}, function(result){
		var location = result['location'];
		var parent = result['parent'];
		var stores = result['stores'];
		console.log(stores);

		context = result;
		var location_html = location_template(location);
		var storelist_html = storelist_template({"stores" : stores});
		$("#hb_location").html(location_html);
		$("#hb_storelist").html(storelist_html);

		init();
	});
});

function init(){
	$(".commas > *:not(:last-child)").after(",");
	$("#featured").orbit(); // remove; foundation demo
}
</script>