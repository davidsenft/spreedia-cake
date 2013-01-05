What's up guys!

My location is <?php echo $location['name']; ?>!<br><br>

<?php if (isset($parent)) echo "My parent is ".$parent['name']."<br><br>"; ?>

CITY: <?php echo $location['isCity'] ? "true" : "false"; ?><br><br>

TOP: <?php echo $location['parent'] ? "false" : "true"; ?><br><br>

STORES: <?php echo count($stores); ?>