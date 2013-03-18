
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
<!-- ON DOCUMENT READY -->
<!-- ******************************************************************** -->

<script type="text/javascript">

$(document).ready(function(){

	// serialized json data
	var myjson = {<?php foreach($_serialize as $obj_name){
		echo "\"".$obj_name."\":".json_encode(${$obj_name}).",";
	} ?>}

	$.getJSON("<?php echo $_SERVER['REQUEST_URI']; ?>.json", {}, function(result){
		// get template contexts
		var location = result['location'];
		var stores = result['stores'];
		var icons = result['icons'];
		var prices = result['prices'];
		var page = result['page'];

		// give info to handlebars
		// Handlebars.icons = icons;

		// compile templates
		var location_template = Handlebars.compile($("#location-template").html());
		var storelist_template = Handlebars.compile($("#storelist-template").html());
		var panel_template = Handlebars.compile($("#panel-template").html());
		var top_template = Handlebars.compile($("#top-template").html());

		// get template html
		var location_html = location_template(location);
		var storelist_html = storelist_template({"stores" : stores});
		var panel_html = panel_template({"icons" : icons, "prices" : prices});
		var top_html = top_template({"page" : page});

		// inject html
		$("#hb_location").html(location_html);
		$("#hb_storelist").html(storelist_html);
		$("#hb_panel").html(panel_html);
		$("#hb_top").html(top_html);

		init();
		if ($("body").hasClass("map")) Spreedia.initializeMap(stores);
	});
});

function getScrollOffset() {
    // var x = 0, y = 0;
    var y = 0;
    if( typeof( window.pageYOffset ) == 'number' ) {
        // Netscape
        // x = window.pageXOffset;
        y = window.pageYOffset;
    } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
        // DOM
        // x = document.body.scrollLeft;
        y = document.body.scrollTop;
    } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
        // IE6 standards compliant mode
        // x = document.documentElement.scrollLeft;
        y = document.documentElement.scrollTop;
    }
    // return [x, y];
    return y;
}

function init(){

	// activate (add .active class) according to page format
	$(".format").filter("[data-activate='" + $("body").data("format") + "']").addClass("active");

	// anything with .click class
	$(".click").click(function(){
		$(this).toggleClass("clicked");
		if ($(this).is("button.icon")) Spreedia.updateIcon($(this).attr("data-id"));
		// else if ($(this).is("button.price")) Spreedia.updatePrice($(this).attr("data-id"));
	});

	$("#sortby").change(function(){
		Spreedia.sortStores();
	});

	// anything with .hover class gets .over class on hover
	$(".hover").hover(function(){
		$(this).addClass("over");
	},function(){
		$(this).removeClass("over");
	});

	// white gradient at the top of a list page
	if ($("body").hasClass("list")){
		$(window).scroll(function () {
			var offset = getScrollOffset();
			if (offset > 0){
				$("body").addClass("offset");
			}else{
				$("body").removeClass("offset");
			}
		});
	}

	// pricerange slider
	var range = $("#slider-pricerange");
	function slidefunc(event, ui){Spreedia.updatePrice(ui.values[0], ui.values[1]);}
	range.slider({range: true, min: 1, max: 4, values: [ 1, 4 ], slide: slidefunc});
	Spreedia.updatePrice(range.slider("values",0), range.slider("values",1));

	// user location
	Spreedia.updateDistances();

}
</script>