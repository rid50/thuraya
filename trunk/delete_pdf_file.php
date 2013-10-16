<?php
	//foreach ($_POST as $key=>$element) {
	//	echo $key."<br/>";
	//}

	//var_dump($_POST);
	//print_r($_POST);
	
	//$fileName = $_POST['fileName'];
	$fp = fopen($_POST['fileName'], "r+");
	flock($fp, LOCK_EX); 	// acquire an exclusive lock
	flock($fp, LOCK_UN);    // release the lock
	fclose($fp);
	unlink($_POST['fileName']);
?>
