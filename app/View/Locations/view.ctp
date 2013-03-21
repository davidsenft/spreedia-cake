<div id='hb_top' class='alignright'></div>

<div id='wrapper' class='center'>

	<!-- <div id='hb_location'></div> -->

	<!-- left side panel -->
	<div id="panel" class="left fixed-for-big">
		<button id='bigredbutton'>PUSH ME</button>
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
<?php 
$this->Handlebars->template('top');
$this->Handlebars->template('location');
$this->Handlebars->template('storelist');
$this->Handlebars->template('panel'); ?>

<!-- ******************************************************************** -->
<!-- EXTERNAL SCRIPTS -->
<!-- ******************************************************************** -->

<?php $this->Script->loadAll($page['format']); ?>


<!-- ******************************************************************** -->
<!-- INITIAL DATA LOAD (cacheable) -->
<!-- ******************************************************************** -->

<?php $this->Script->locationData($params); ?>


<!-- ******************************************************************** -->
<!-- ON DOCUMENT READY -->
<!-- ******************************************************************** -->

<script type="text/javascript">

$(document).ready(function(){
	// initial data load (external js)
	Spreedia.loadLocation(result); 

	$('#bigredbutton').click(function(){
		// ajax data load (json)
		Spreedia.loadLocationAjax(15);
	});

	alert(Spreedia.address());
});

</script>