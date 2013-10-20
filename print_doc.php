<?php
require('db_repo.php');

if (isset($_POST['func'])) {
	$func = $_POST['func'];
	$param = $_POST['param'];
} else {
	$func = $_GET['func'];
	$param = $_GET['param'];
}

try {
	$dbrep = new DatabaseRepository();
	if (method_exists($dbrep, $func)) {
		$r = $dbrep->$func($param);
		//$res[] = $r[0]["docs"][0]["doc"];
		//include "./tcpdf/arab.php";
		include "./tcpdf/" . "$func" . ".php";
	} else
		throw new Exception('Failed to execute the method: ' . $func);

	//throw new Exception (print_r($res));
	
	if (count($res) == 0)
		$result[] = array('error' => "A document with a file number $param does not exist");
	else
		$result[] = array('pdf_file_name' => $file_name);	//$file_name gets its value in tcpdf\arab.php module

} catch (Exception $e) {
	$result[] = array('error' => $e->getMessage());
}

//header('Content-type: application/json; charset=utf-8');
//header('Cache-Control: no-cache, must-revalidate');
//header('Expires: Mon, 1 Jan 1990 00:00:00 GMT');

$json = json_encode($result);
print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);

/*
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
	
	//header( 'Location: tcpdf\arab.php' ) ;
	
	//echo print_r($res);
	if (count($res) > 0)
		echo $res[0]->docArea;
	else
		echo "A document with a file number $fileNumber does not exist";
*/		
?>
