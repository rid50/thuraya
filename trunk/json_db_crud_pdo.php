<?php
require('db_repo.php');
session_start();

$param = null;
if (isset($_POST['func'])) {
	$func = $_POST['func'];
	if (isset($_POST['param'])){ $param = $_POST['param']; }
	//$param = $_POST['param'];
} else {
	$func = $_GET['func'];
	if (isset($_GET['param'])){ $param = $_GET['param']; }
	//$param = $_GET['param'];
}

try {
	$dbrep = new DatabaseRepository();
	
	if (method_exists($dbrep, $func)) {
		$result = $dbrep->$func($param);
	} else
		throw new Exception("Failed to execute the method: $func");
	
	//$result = $dbrep->getData();
} catch (Exception $e) {
	$result[] = array('error' => $e->getMessage());
}


header('Content-type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 1 Jan 1990 00:00:00 GMT');

$json = json_encode($result);
print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);

?>
