<?php
	//foreach ($_POST as $key=>$element) {
	//	echo $key."<br/>";
	//}

	//var_dump($_POST);
	//print_r($_POST);
	
	$fileName = $_POST['fileName'];
	$xml = $_POST['xml'];
	$file = fopen($fileName,"w");
	fwrite($file, $xml);
	fclose($file);
	//echo $_SERVER['LOGON_USER']

	//echo "ok";
?>
