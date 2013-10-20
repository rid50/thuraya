<?php
//require_once('/var/simplesamlphp/lib/_autoload.php');
require_once('c:/simplesaml/lib/_autoload.php');

//	http_redirect('http://mewdesigncomps/index.html');

$url = 'http://mewdesigncomps/index.html';

$ini = parse_ini_file("mew.ini");
$idp = $ini["IdP"];
if ($idp == "AD") {
	header("HTTP/1.1 301 Moved Permanently");
	//header('IdP: ' . $idp);
	header('Location: ' . $url, TRUE, 301);
	exit();
}

$as = new SimpleSAML_Auth_Simple('mewSQLAuth');
if ($as->isAuthenticated()) {
	//http_redirect($url, $attributes, true, HTTP_REDIRECT_PERM);
	header("HTTP/1.1 301 Moved Permanently");
	header('Location: ' . $url, TRUE, 301);
	//header('IdP: AD');
} else {
	$as->requireAuth( array('ReturnTo' => $url) );
	//$attributes[] = $as->getAttributes();
	//$url = $url . '?loginName=' . $attributes["loginName"];
}
?>
