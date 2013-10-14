<?php
	//foreach ($_POST as $key=>$element) {
	//	echo $key."<br/>";
	//}

	//var_dump($_POST);
	//print_r($_POST);

//echo "\n".$xmlData;echo "\nName:".$xml->fruit->apple->getName();echo " Type:".$xml->fruit->apple->attributes()->type;echo "\nFruit?:".$xml->fruit->apple->attributes()->{'has-fruit'};
	
	$fileNumber = $_GET['fileNumber'];
	//$fileNumber = $_POST['fileNumber'];
	
	//$fileNumber = 45678;
	
	$filename = "docs.xml";
	$handle = fopen($filename, "r");
	$xmldoc = fread($handle, filesize($filename));
	fclose($handle);

	//$xml = new SimpleXMLElement($_POST['xml']);
	$xml = new SimpleXMLElement($xmldoc);
	$res = $xml->xpath("//docFileNumber[. = $fileNumber]/parent::*");
	//$res = $xml->xpath("//docFileNumber[. = $fileNumber]");

	include ("tcpdf\arab.php");
	
	if (count($res) == 0)
		$result[] = array('error' => "A document with a file number $fileNumber does not exist");
	else
		$result[] = array('pdf_file_name' => $file_name);	//$file_name gets its value in tcpdf\arab.php module
	
	//header('Content-type: application/json; charset=utf-8');
	//header('Cache-Control: no-cache, must-revalidate');
	//header('Expires: Mon, 1 Jan 1990 00:00:00 GMT');

	$json = json_encode($result);
	print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);
	
?>
