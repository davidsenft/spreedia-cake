<!DOCTYPE html>
<!--[if lt IE 8 ]> <html lang="en" class="ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en"> <!--<![endif]-->
<head>
<!--<meta http-equiv="X-UA-Compatible" content="IE=edge">-->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<link href='http://fonts.googleapis.com/css?family=Roboto+Slab:100,300,400,700' rel='stylesheet' type='text/css'>
<link href='http://fonts.googleapis.com/css?family=Questrial|Cutive+Mono|Josefin+Sans:100,300,400,600,700,100italic,300italic,400italic,600italic,700italic|Libre+Baskerville:400,700,400italic|Andada|Raleway+Dots|Open+Sans+Condensed:300,300italic,700|IM+Fell+French+Canon+SC|Alegreya:400italic,700italic,900italic,400,700,900' rel='stylesheet' type='text/css'>

<title><?php echo $page['seotitle']; ?></title>

<?php
echo $this->Html->css('reset');
echo $this->Html->css('jquery-ui-1.10.1.custom.min.css');
echo $this->Html->css('spreedia');

?>

<script type="text/javascript">
/*  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-21598194-1']);
  _gaq.push(['_setDomainName', 'spreedia.com']);
  _gaq.push(['_trackPageview']);
  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })(); */
</script>

</head>
<body class="<?php echo $page['listingtype']; ?> <?php echo $page['format']; ?> <?php echo $page['datatype']; ?>" data-format="<?php echo $page['format']; ?>" data-datatype="<?php echo $page['datatype']; ?>" data-title="<?php echo $page['title']; ?>">

<!-- ******************************************************************** -->
<!-- CONTENT -->
<!-- ******************************************************************** -->
<?php
	// session/auth error messages
	// debug($_SESSION);
  /* echo $this->Session->flash('auth'); */
?>

<?php echo $this->fetch('content'); ?>

</body>
</html>