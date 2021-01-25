<?php
header('Access-Control-Allow-Origin: *');

echo($_SERVER['SCRIPT_URI'] ."\n");
echo($_SERVER['HTTP_REFERER'] ."\n");

$server = $_SERVER['SCRIPT_URI'];
$reffer = $_SERVER['HTTP_REFERER'];

$server = substr($server, strpos($server, '//') + 2, strpos($server, '/', 9) - strpos($server, '//') - 2);

echo($server ."\n");  

$reffer = substr($reffer, strpos($reffer, '//') + 2, strpos($reffer, '/', 9) - strpos($reffer, '//') - 2);

echo($reffer ."\n");  

if($reffer == $server){
	echo('Its ok to go ahead');
}

?>
