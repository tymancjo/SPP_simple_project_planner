<?php

if(!empty($_POST['data']) and !empty($_POST['uid'])){
// checking if this call is from the same origin
$server = $_SERVER['SCRIPT_URI'];
$reffer = $_SERVER['HTTP_REFERER'];

$server = substr($server, strpos($server, '//') + 2, strpos($server, '/', 9) - strpos($server, '//') - 2);
$reffer = substr($reffer, strpos($reffer, '//') + 2, strpos($reffer, '/', 9) - strpos($reffer, '//') - 2);
if($reffer == $server){
		// putting data to the new file based on uid
		    $data = $_POST['data'];
		    $uid = $_POST['uid'];
		    $fname = $uid.".txt";
		    $file = fopen("upload/".$fname, 'wb'); //creates new file
		    fwrite($file, $data."\n");
		    fclose($file);
		    
	}
}

if(!empty($_GET['uid'])){
// responding with the data from selected file
 	$filetoread = 'upload/'.$_GET['uid'].'.txt';
 	// print($filetoread);
 	if (file_exists ( $filetoread )){
	 	$respond = file_get_contents($filetoread);
		echo $respond;
 	} else {
 		echo 'false';
 	}
}

if(!empty($_GET['c']) and $_GET['c'] == 'showAll' ){
	// listing all saved files. Withoud possibility to acess if you dont have key
	
	$path = 'upload/';
	$files = array_diff(scandir($path), array('.', '..'));

	echo getcwd() . "\n <br>";

	foreach ($files as $item) {
    	echo $item . "\n <br>";
	}
}

?>
