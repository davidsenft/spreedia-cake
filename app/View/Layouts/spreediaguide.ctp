<!DOCTYPE html>
<!--[if lt IE 8 ]> <html lang="en" class="ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en"> <!--<![endif]-->
<head>
<!--<meta http-equiv="X-UA-Compatible" content="IE=edge">-->

<?php
echo $this->Html->meta('icon');
?>

<link rel="canonical" href="http://www.spreedia.com/boston"/>
<link rel="shortcut icon" type="image/png" href="/favicon.png"/>
<link rel="publisher" href="https://plus.google.com/100786137942129756081"/>

<?php
echo $this->fetch('meta');
echo $this->fetch('css');
echo $this->fetch('script');
?>

<script type="text/javascript">
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-21598194-1']);
  _gaq.push(['_setDomainName', 'spreedia.com']);
  _gaq.push(['_trackPageview']);
  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
</script>	

<title>Ye title: <?php echo $title_for_layout; ?></title>

</head>
<body>
<?php echo $this->fetch('content'); ?>
</body>
</html>