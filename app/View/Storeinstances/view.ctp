
<div id='hb_top' class='alignright'></div>

<div id='wrapper' class='center'>

	<h1>HI THERE, WORLD</h1>

</div>

<!-- ******************************************************************** -->
<!-- HANDLEBARS TEMPLATES -->
<!-- ******************************************************************** -->

<?php $this->Handlebars->template('top');
?>

<!-- ******************************************************************** -->
<!-- EXTERNAL SCRIPTS -->
<!-- THIS SHIT SHOULD NOT NEED TO BE REPEATED!!! -->
<!-- ******************************************************************** -->

<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script type="text/javascript">
	window.jQuery || document.write('<script src="<?php echo $this->webroot; ?>js/jquery-1.9.1.js"><\/script>')</script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/jquery-ui-1.10.1.custom.min.js"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/handlebars-1.0.rc.1.js"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/handlebars-helpers.js"></script>
<script type="text/javascript" src="<?php echo $this->webroot; ?>js/spreedia.js"></script>

<!-- ******************************************************************** -->
<!-- ON DOCUMENT READY -->
<!-- ******************************************************************** -->

<script type="text/javascript">

$(document).ready(function(){

	$.getJSON(".json", {}, function(result){

		console.log("loading templates...");
		Spreedia.handle("top", {"page" : result["page"]});

		Spreedia.init();

	});

});

</script>