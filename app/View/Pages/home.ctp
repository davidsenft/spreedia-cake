<div id='hb_top'></div>

<div id='wrapper' class='center'>
	<h1 class='spreediaregular green'>L</h1>
</div>

<!-- ******************************************************************** -->
<!-- HANDLEBARS TEMPLATES -->
<!-- ******************************************************************** -->
<?php
$this->Handlebars->template('top'); ?>

<!-- ******************************************************************** -->
<!-- EXTERNAL SCRIPTS -->
<!-- ******************************************************************** -->

<?php $this->Script->loadAll($page['format']); ?>


<!-- ******************************************************************** -->
<!-- ON DOCUMENT READY -->
<!-- ******************************************************************** -->

<script type="text/javascript">

$(document).ready(function(){
	Spreedia.userid = <?php echo $_SESSION['Auth']['User']['id']; ?>;
	Spreedia.init();
});

</script>