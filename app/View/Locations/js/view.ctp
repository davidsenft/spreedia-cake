var result = {<?php foreach($_serialize as $obj_name){
	echo "\"".$obj_name."\":".json_encode(${$obj_name}).",";
} ?>}