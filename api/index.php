<?php

if(!empty($_POST['data']) and !empty($_POST['uid'])){
// putting data to the new file based on uid
    $data = $_POST['data'];
    $uid = $_POST['uid'];


    $fname = $uid.".txt";
    $file = fopen("upload/".$fname, 'wb'); //creates new file
    fwrite($file, $data."\n");
    fclose($file);
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
