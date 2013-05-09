<div id='hb_top'></div>

<div id="modal-back"></div>

<div id='wrapper' class='center'>

	<div id='hb_storeinstance'></div>

</div>

<!-- ******************************************************************** -->
<!-- HANDLEBARS TEMPLATES -->
<!-- ******************************************************************** -->
<?php 
$this->Handlebars->template('top');
$this->Handlebars->template('storeinstance'); ?>

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