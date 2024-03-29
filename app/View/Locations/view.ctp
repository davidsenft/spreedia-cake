<!-- ************************************************ -->
<!-- THIS IS THE SAME PAGE AS Users/favorites.ctp!!!! -->
<!--   Updates made to one should be made to both!!   -->
<!-- ************************************************ -->

<div id='hb_top'></div>

<div id='secondary'>
	<span id="hb_breadcrumbs" class='hide-for-small'></span>
	<a id='openpanel' class='modal-open' data-modal='panel' href='javascript:void(0);'>SORT AND FILTER</a>
</div>

<div id="modal-back"></div>

<div id='login-modal' class='modal' style='display:none;'>
	<h2>Please Log In</h2>
	<p>Yeah.</p>
</div>

<div id='wrapper' class='center'>

	<!-- <div id='hb_location'></div> -->

	<!-- panel tabs -->
	<!-- <dl id="paneltabs">
		<dd id="sortbytab"><a href="javascript:void()" data-panel="sortby">Sort</a></dd>
		<dd id="pricerangetab"><a href="javascript:void()" data-panel="pricerange" class="dolladisplay">$-$$$$</a></dd>
		<dd id="iconstab"><a href="javascript:void()" data-panel="icons">Categories</a></dd>
	</dl> -->

	<!-- panel TODO: this doesn't really need to be a template -->
	<div id="panel" class="left modal">
		<div id='hb_panel' class='panel' style='border-top:0;'></div>
	</div>

	<!-- stores map -->
	<table id="map" class="content_view" style='width:100%;height:100%;'>
		<tr class='top-height'><td>&nbsp;</td></tr>
		<tr><td id='map_canvas'>&nbsp;</td></tr>
	</table>

	<!-- stores list -->
	<div id="list" class="content_view">
		<div id='hb_storelist'></div>
	</div>

	<div id='storeinstance_ajax'>
		<div id='hb_storeinstance'></div>
	</div>

</div>

<!-- ******************************************************************** -->
<!-- HANDLEBARS TEMPLATES -->
<!-- ******************************************************************** -->
<?php 
$this->Handlebars->template('top');
$this->Handlebars->template('breadcrumbs');
$this->Handlebars->template('location');
$this->Handlebars->template('storelist');
$this->Handlebars->template('storeinstance');
$this->Handlebars->template('panel'); ?>

<!-- ******************************************************************** -->
<!-- EXTERNAL SCRIPTS -->
<!-- ******************************************************************** -->

<?php $this->Script->loadAll($page['format']); ?>


<!-- ******************************************************************** -->
<!-- INITIAL DATA LOAD (cacheable) -->
<!-- ******************************************************************** -->

<?php $this->Script->jsData($params); ?>


<!-- ******************************************************************** -->
<!-- ON DOCUMENT READY -->
<!-- ******************************************************************** -->

<script type="text/javascript">

$(document).ready(function(){
	Spreedia.userid = <?php echo $_SESSION['Auth']['User']['id']; ?>;
	Spreedia.init();
});

</script>