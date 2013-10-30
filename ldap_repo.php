<?php
$ini = parse_ini_file("config.ini");
$dc = $ini["ldap_dc"];
$username = $ini["ldap_username"];
$password = $ini["ldap_password"];
$base_dn = $ini["ldap_base_dn"];

$conn = ldap_connect("ldap://".$dc, 636);
$bind = @ldap_bind($conn, $username, $password);
if ($bind) {
	$attributes = array("sAMAccountName", "displayName", "userPrincipalName", "dn");
	
	$assoc_ar = json_decode($_POST['param']['loginNames'], true);

	try {
		foreach ($assoc_ar as $key => $value) {
			foreach ($value as $key2 => $value2) {
				if ($value2 == "") {
					if (isset($_SERVER["AUTH_USER"])) {
						$filter = "samaccountname=" . array_pop(explode('\\', $_SERVER["AUTH_USER"]));
					} else {
						$filter = "samaccountname=basma";
					}
				} else {
					$filter = "samaccountname=" . $value2;
				}

				try {
					$ldap_result = ldap_search($conn, $base_dn, $filter, $attributes) or die ("Error in search query");
					$entries = ldap_get_entries($conn, $ldap_result);
					if ($entries["count"] == 0) {
						$result[] = array(
							'LoginName' => array_pop(explode('=', $filter)),
							'DisplayName' => array_pop(explode('=', $filter)),
							'UserPrincipalName' => "",
							'distinguishedName' => "",
						);
					} else {
						for ($i = 0; $i < $entries["count"]; $i++)
						{
							$result[] = array(
								'LoginName' => $entries[$i]["samaccountname"][0],
								'DisplayName' => $entries[$i]["displayname"][0],
								'UserPrincipalName' => $entries[$i]["userprincipalname"][0],
								'distinguishedName' => $entries[$i]["dn"],
							);
						}
					}
				} catch (Exception $e) {
					throw new Exception("Failed to get a LDAP identity for ( $value2 ): " . $e->getMessage());
				}
			}
		}
	} catch (Exception $e) {
		$result[] = array('error' => $e->getMessage());
	}
} else {
	$result[] = array('error' => "Unable to bind to server: Can't contact LDAP server");
}

header('Content-type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 1 Jan 1990 00:00:00 GMT');

$json = json_encode($result);
print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);

