<?php

/**
 * Simple AD authentication source
 *
 * This class is an example authentication source which authenticates an user
 * against a Microsoft Active Directory.
 *
 * @package simpleSAMLphp
 * @version $Id$
 */
class sspmod_mewmodule_Auth_Source_mewADAuth extends sspmod_core_Auth_UserPassBase {


	/**
	 * The DC we should connect to.
	 */
	private $ldap_dc;


	/**
	 * The username we should connect to the AD with.
	 */
	private $ldap_username;


	/**
	 * The password we should connect to the AD with.
	 */
	private $ldap_password;


	/**
	 * The LDAP base DN
	 *
	 */
	private $ldap_base_dn;


	/**
	 * Constructor for this authentication source.
	 *
	 * @param array $info  Information about this authentication source.
	 * @param array $config  Configuration.
	 */
	public function __construct($info, $config) {
		assert('is_array($info)');
		assert('is_array($config)');

		/* Call the parent constructor first, as required by the interface. */
		parent::__construct($info, $config);

		$this->ldap_dc = $config['ldap_dc'];
		$this->ldap_username = $config['ldap_username'];
		$this->ldap_password = $config['ldap_password'];
		$this->ldap_base_dn = $config['ldap_base_dn'];
	}


	/**
	 * Create a database connection.
	 *
	 * @return PDO  The database connection.
	 */
	private function connect() {
		$conn = ldap_connect("ldap://".$this->ldap_dc, 636);
		$bind = @ldap_bind($conn, $this->ldap_username, $this->ldap_password);
		if ($bind) {
			return $conn;
		} else {
			throw new Exception('Failed to connect: ' .	$e->getMessage());
		}
	}

	/**
	 * Attempt to log in using the given username and password.
	 *
	 * On a successful login, this function should return the users attributes. On failure,
	 * it should throw an exception. If the error was caused by the user entering the wrong
	 * username or password, a SimpleSAML_Error_Error('WRONGUSERPASS') should be thrown.
	 *
	 * Note that both the username and the password are UTF-8 encoded.
	 *
	 * @param string $username  The username the user wrote.
	 * @param string $password  The password the user wrote.
	 * @return array  Associative array with the users attributes.
	 */
	protected function login($loginName, $password) {
		assert('is_string($loginName)');
		assert('is_string($password)');

		$conn = $this->connect();

		$attributes = array("sAMAccountName", "displayName", "userPrincipalName", "dn");

		$filter = "samaccountname=" . $loginName;

		try {
			$ldap_result = ldap_search($conn, $this->ldap_base_dn, $filter, $attributes) or die ("Error in search query");
			$entries = ldap_get_entries($conn, $ldap_result);
			if ($entries["count"] == 0) {
				SimpleSAML_Logger::warning('mewmodule: Could not find user ' . var_export($loginName, TRUE) . '.');
				throw new SimpleSAML_Error_Error('WRONGUSERPASS');
			} else {
				$bind = @ldap_bind($conn, $entries[0]["dn"], $password);
				if ($bind) {
					/* Create the attribute array of the user. */
					$attributes = array(
						'LoginName' => $entries[0]["samaccountname"][0],
						'DisplayName' => $entries[0]["displayname"][0],
						'UserPrincipalName' => $entries[0]["userprincipalname"][0],
					);
					
					$_SESSION['loginName'] = $loginName;
					return $attributes;
				} else {
					SimpleSAML_Logger::warning('mewmodule: Could not find user ' . var_export($loginName, TRUE) . '.');
					throw new SimpleSAML_Error_Error('WRONGUSERPASS');
				}
			}
		} catch (Exception $e) {
			throw new Exception("Failed to get a LDAP identity for ( $loginName ): " . $e->getMessage());
		}
	}
}
?>