<?php
//require_once('/var/simplesamlphp/lib/_autoload.php');
require_once('c:/simplesaml/lib/_autoload.php');
$as = new SimpleSAML_Auth_Simple('mewSQLStatic');

//$as->requireAuth( array('saml:idp' => 'http://localhost/simplesaml') );
$as->requireAuth( array('KeepPost' => TRUE, 'loginNames' => $_GET['loginNames']));
$attributes[] = $as->getAttributes();

$authSource = $as->getAuthSource();
$session = SimpleSAML_Session::getInstance();
$session->doLogout($authSource);

//$as->logout(array());

$json = json_encode($attributes);

header('Content-type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 1 Jan 1990 00:00:00 GMT');

print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);
?>
