<?php
$ini = parse_ini_file("config.ini");
$idp = $ini["IdP"];
$idpSource = $ini["IdPSource"];
$ds = $ini["documentSource"];

preg_match('/^[a-zA-Z]{2}/', $_SERVER['HTTP_ACCEPT_LANGUAGE'], $accepted_language);

$json = json_encode(array("IdP" => $idp, "IdPSource" => $idpSource, "documentSource" => $ds, "lang" => $ini["lang"], "searchInterval" => $ini["searchInterval"], "accepted_language" => $accepted_language[0]));

header('Content-type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 1 Jan 1990 00:00:00 GMT');

print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);
?>
