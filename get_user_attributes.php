<?php
session_start();

try {
	$ua = new GetUserAttributes();
	$result = $ua->get();
} catch (Exception $e) {
	$result[] = array('error' => $e->getMessage());
}

$json = json_encode($result);

header('Content-type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 1 Jan 1990 00:00:00 GMT');

print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);
		
class GetUserAttributes {
	/**
	 * The DSN we should connect to.
	 */
	private $dsn;

	/**
	 * The username we should connect to the database with.
	 */
	private $username;

	/**
	 * The password we should connect to the database with.
	 */
	private $password;

	/**
	 * The attributes we return.
	 */
	private $attributes;
	
	/**
	 * Constructor for this authentication source.
	 *
	 * @param array $config  Configuration.
	 */
	public function __construct() {
		date_default_timezone_set('UTC');
		$ini = parse_ini_file("config.ini");
		$this->dsn = $ini["dsn"];
		$this->username = $ini["username"];
		$this->password = $ini["password"];
	}

	/**
	 * Create a database connection.
	 *
	 * @return PDO  The database connection.
	 */
	private function connect() {
		try {
			$db = new PDO($this->dsn, $this->username, $this->password);
		} catch (PDOException $e) {
			throw new Exception('Failed to connect to \'' .	$this->dsn . '\': '. $e->getMessage());
		}

		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        /* Ensure that we are operating with UTF-8 encoding.
         * This command is for MySQL. Other databases may need different commands.
         */
		$driver = explode(':', $this->dsn, 2);
		$driver = strtolower($driver[0]);

		/* Driver specific initialization. */
		switch ($driver) {
		case 'mysql':
			/* Use UTF-8. */
			$db->exec("SET NAMES 'utf8'");
			break;
		case 'pgsql':
			/* Use UTF-8. */
			$db->exec("SET NAMES 'UTF8'");
			break;
		}

		return $db;
	}


	public function get() {
		$db = $this->connect();
		
		try {
			$sth = $db->prepare('SELECT loginName, upn, displayName FROM userRepository WHERE loginName = :loginName');
		} catch (PDOException $e) {
			throw new Exception('Failed to prepare query: ' . $e->getMessage());
		}

		if (isset($_POST['loginNames']))
			$assoc_ar = json_decode($_POST['loginNames'], true);
		else
			$assoc_ar = json_decode($_GET['loginNames'], true);
		
		foreach ($assoc_ar as $key => $value) {
			foreach ($value as $key2 => $value2) {
				if ($value2 == "") {
					if (isset($_SESSION['loginName'])) {
						$loginName = $_SESSION['loginName'];
					} else {
						$loginName = 'basma';
					}
				} else {
					$loginName = $value2;
				}
				
				try {
					$res = $sth->execute(array('loginName' => $loginName));
				} catch (PDOException $e) {
					throw new Exception('Failed to execute query: ' . $e->getMessage());
				}

				try {
					$row = $sth->fetch(PDO::FETCH_ASSOC);
				} catch (PDOException $e) {
					throw new Exception('Failed to fetch result set: ' . $e->getMessage());
				}
				
				if ($row) {
					$this->attributes[] = array(
						'LoginName' => $loginName,
						'DisplayName' => $row['displayName'],
						'UserPrincipalName' => $row['upn'],
					);
				}
			}
		}
		
		
/*
		SimpleSAML_Logger::info('mewmodule:' . $this->authId . ': Got ' . count($data) . ' rows from database');

		if (count($data) === 0) {
			// No rows returned - invalid loginName/password.
			SimpleSAML_Logger::error('mewmodule:' . $this->authId . ': No rows in result set. Probably wrong loginName/password.');
			throw new SimpleSAML_Error_Error('WRONGUSERPASS');
		}
*/
		/* Extract attributes. We allow the resultset to consist of multiple rows. Attributes
		 * which are present in more than one row will become multivalued. NULL values and
		 * duplicate values will be skipped. All values will be converted to strings.
		 */
/*
		 $attributes = array();
		foreach ($data as $row) {
			foreach ($row as $name => $value) {

				if ($value === NULL) {
					continue;
				}

				$value = (string)$value;

				if (!array_key_exists($name, $attributes)) {
					$attributes[$name] = array();
				}

				if (in_array($value, $attributes[$name], TRUE)) {
					// Value already exists in attribute.
					continue;
				}

				$attributes[$name][] = $value;
			}
		}

		SimpleSAML_Logger::info('mewmodule:' . $this->authId . ': Attributes: ' . implode(',', array_keys($attributes)));
*/
		return $this->attributes;
	}
}

?>