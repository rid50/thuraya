<?php
class DatabaseRepository {
	private $dsn;
	private $username;
	private $password;
	private $result;
	
	public function __construct() {
		//date_default_timezone_set('Asia/Kuwait');
		date_default_timezone_set('UTC');
		$domain = 'yaruss';
		if ($_SERVER["USERDOMAIN"] != null && (strtolower($_SERVER["USERDOMAIN"]) == "mew" || strtolower($_SERVER["USERDOMAIN"]) == "adeliya"))
			$domain = strtolower($_SERVER["USERDOMAIN"]);
			
		$ini = parse_ini_file("config.ini", true);
		$this->dsn = $ini[$domain]["dsn"];
		$this->username = $ini[$domain]["username"];
		$this->password = $ini[$domain]["password"];

		//error_log($this->dsn . " === "  . $this->username . " === "  . $this->password, 3, "error.log");
	}

	private function array_group_by( $array, $id ){
		$groups = array();
		foreach( $array as $row ) {
			$dt = strftime('%d/%m/%Y', strtotime($row -> docDate));
			$row -> docDate = $dt;
			$groups[ $row -> $id ][] = $row;
			unset($row -> $id);
		}
		return $groups;
	}

	/**
	 * Create a database connection.
	 * @return PDO  The database connection.
	 */
	private function connect() {
		//throw new Exception('Domain: ' . $_SERVER["USERDOMAIN"]);

		try {
			$dbh = new PDO($this->dsn, $this->username, $this->password);
		} catch (PDOException $e) {
			throw new Exception('Failed to connect to \'' .	$this->dsn . '\': '. $e->getMessage());
		}

		$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		/* Ensure that we are operating with UTF-8 encoding.
		 * This command is for MySQL. Other databases may need different commands.
		 */
		$driver = explode(':', $this->dsn, 2);
		$driver = strtolower($driver[0]);

		/* Driver specific initialization. */
		switch ($driver) {
		case 'mysql':
			/* Use UTF-8. */
			$dbh->exec("SET NAMES 'utf8'");
			break;
		case 'pgsql':
			/* Use UTF-8. */
			$dbh->exec("SET NAMES 'UTF8'");
			break;
		}

		return $dbh;
	}
	
	public function getUserAttributes($param) {
		$dbh = $this->connect();
		
		try {
			$sth = $dbh->prepare('SELECT loginName, upn, displayName FROM userRepository WHERE loginName = :loginName');
		} catch (PDOException $e) {
			throw new Exception('Failed to prepare query: ' . $e->getMessage());
		}

		//if (isset($_POST['loginNames']))
		//	$assoc_ar = json_decode($_POST['loginNames'], true);
		//else
		//	$assoc_ar = json_decode($_GET['loginNames'], true);

		$assoc_ar = json_decode($param['loginNames'], true);
			
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
					$this->result[] = array(
						'LoginName' => $loginName,
						'DisplayName' => $row['displayName'],
						'UserPrincipalName' => $row['upn'],
					);
				}
			}
		}
		
		return $this->result;
		
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
	}

	public function getDocs($param) {
		return $this->get($param);
	}

	private function get($param) {
	
		$dbh = $this->connect();

		try {
			if ($param[docFileNumber] == null && $param[docFileNumber] == "") {

				//error_log($param[filter][dateFrom] . "---" . $param[filter][dateTo], 3, "error.log");
			
				$dtFrom = date_create_from_format('d/m/Y', $param[filter][dateFrom])->format('Y-m-d');
				$dtTo = DateTime::createFromFormat('d/m/Y', $param[filter][dateTo])->format('Y-m-d');

				//error_log("---- \n ----", 3, "error.log");
				
				//error_log($dtFrom . "---" . $dtTo, 3, "error.log");

				if ($param[filter][fileNumber] != null) {
					$where = " doc.docFileNumber = {$param[filter][fileNumber]}";
					if ($param[filter][approver] != null)
						$param[filter][approver] = null;
				} else {
					$where = " doc.docDate BETWEEN '$dtFrom' AND '$dtTo'";
					if ($param[filter][paciNumber] != null)
						$where .= " AND doc.docPACINumber = '{$param[filter][paciNumber]}'";
					if ($param[filter][area] != null)
						$where .= " AND doc.docArea = '{$param[filter][area]}'";
					if ($param[filter][block] != null)
						$where .= " AND doc.docBlock = '{$param[filter][block]}'";
					if ($param[filter][street] != null)
						$where .= " AND doc.docStreet = '{$param[filter][street]}'";
					if ($param[filter][sectionId] != null) {
						if ($param[filter][sectionId] == 12)
							$where .= " AND (doc.sectionId = 1 OR doc.sectionId = 2)";
						else
							$where .= " AND doc.sectionId = '{$param[filter][sectionId]}'";
					}
					if ($param[filter][employeeId] != null)
						$where .= " AND doc.employeeId = '{$param[filter][employeeId]}'";
				}
					
				$st = "SELECT docFileNumber, docDate, docApprover, docArea, docBlock, docStreet, docBuilding, docPACINumber, docTitle, docComment, sectionId, employeeId FROM doc";
				$st .= " WHERE " . $where . " ORDER BY docDate ASC, docFileNumber ASC ";

				//error_log($st . "---", 3, "error.log");

				//throw new Exception($st);
				//throw new Exception((string)($param[filter][paciNumber] != null));

				//if ($param[filter][approver] != null)
				//	$where .= " AND (doc.docApprover = '{$param[filter][approver]}' OR docHistory.docApprover = '{$param[filter][approver]}')";

				$st2 = "SELECT docHistory.docFileNumber, docHistory.docDate, docHistory.docApprover FROM docHistory INNER JOIN doc ON doc.docFileNumber = docHistory.docFileNumber";
				$st2 .= " WHERE " . $where;

				//throw new Exception($st2);
				
				$stDoc = $dbh->query($st);
				$stHistory = $dbh->query($st2);
			} else {
				$st = "SELECT docFileNumber, docDate, docApprover, docArea, docBlock, docStreet, docBuilding, docPACINumber, docTitle, docComment, sectionId, employeeId FROM doc WHERE docFileNumber = :docFileNumber";
				$st2 = "SELECT docFileNumber, docDate, docApprover FROM docHistory WHERE docFileNumber = :docFileNumber"; // . " ORDER BY docDate ASC";
				$stDoc = $dbh->prepare($st);
				$stHistory = $dbh->prepare($st2);
				$stDoc->execute(array('docFileNumber' => $param[docFileNumber]));
				$stHistory->execute(array('docFileNumber' => $param[docFileNumber]));
			}
		} catch (PDOException $e) {
			throw new Exception('Failed to execute/prepare query: ' . $e->getMessage());
		}
		
		//error_log($stDoc->rowCount() . " === "  . $stHistory->rowCount(), 3, "error.log");
		
		$result = array();
		//while($r = mysql_fetch_array($dsHistory, MYSQL_ASSOC))
		while($r = $stHistory->fetch(PDO::FETCH_ASSOC)) {
/*
		if (!$found && $param[filter][approver] != null && $r -> docApprover == $param[filter][approver])
				$found = true;
				
			$r2 = (object)$r;
			if ($r2 -> docApprover != $param[filter][approver])
				throw new Exception((string)($r2 -> docApprover));
*/
			$result[] = (object)$r;
		}
				//$found = true;
		
		// group rows from $query_docHistory by their docFileNumber
		$dsHistoryGr = $this->array_group_by( $result, 'docFileNumber' );

		
		//throw new Exception("kuku");
		
		// let's combine results:
		$this->result = array(); $r5 = array();
		//foreach( $dsDoc as $row1 ){
		//while($r = mysql_fetch_array($dsDoc, MYSQL_ASSOC)) {
		while($r = $stDoc->fetch(PDO::FETCH_ASSOC)) {
			$r2 = (object)$r;

//			if (!$found && $param[filter][approver] != null && $r2 -> docApprover != $param[filter][approver])
//				continue;
			
			if ($r2->docPACINumber == null)
				$r2->docPACINumber = "";
			
			//$dt = date_create($r2 -> docDate)->format('d/m/Y');
			//$dt = date_format(date_create($r2 -> docDate), 'd/m/Y');
			// To format dates in other languages, you should use the setlocale() and strftime() functions instead of date().				
			$dt = strftime('%d/%m/%Y', strtotime($r2 -> docDate));
			
			$r3 = array('docDate' => $dt, 'docApprover' => $r2 -> docApprover);

			//$r3 = array(docDate => date_format(date_create($r2 -> docDate), 'd/m/Y'), docApprover => $r2 -> docApprover);
			//$r3 = array(docDate => date_create($r2 -> docDate)->format('d/m/Y'), docApprover => $r2 -> docApprover);
			//$r3 = array(docDate => $r2 -> docDate, docApprover => $r2 -> docApprover);
			unset($r2 -> docDate);
			unset($r2 -> docApprover);
			
			if (isset($dsHistoryGr[ $r2 -> docFileNumber ]))
				array_unshift($dsHistoryGr[ $r2 -> docFileNumber ], (object)$r3);
			else
				$dsHistoryGr[ $r2 -> docFileNumber ][] = (object)$r3;
			
			//throw new Exception(gettype($dsHistoryGr[ $r2 -> docFileNumber ].[docApprover]));
			//throw new Exception((string)(array_search($param[filter][approver], $dsHistoryGr[ $r2 -> docFileNumber ][1])));
			
			//if ((int)$param[filter][actorRole] + 1 == count($dsHistoryGr[ $r2 -> docFileNumber ]))
			{
			//if ($r2 -> docFileNumber == 12348)
				//throw new Exception($r2 -> docFileNumber . " --- " . count($dsHistoryGr[ $r2 -> docFileNumber ]));
			
				//throw new Exception ((string)($param[filter][approver] == null));
			
				if ($param[filter][approver] != null) {
					$found = false;
					foreach ($dsHistoryGr[ $r2 -> docFileNumber ] as $history) {
						//if ($r2 -> docFileNumber == 12348)
							//throw new Exception($history->docApprover);
							
						if ($param[filter][approver] == $history->docApprover) {
							$found = true;
							break;
						}
					}
					
					//if ($r2 -> docFileNumber == 12348)
						//throw new Exception($history->docApprover);
					
					if (!$found)
						continue;
				}
				//if ($param[filter][approver] != null)
				//	if (!in_array($param[filter][approver], $dsHistoryGr[ $r2 -> docFileNumber ][docApprover]))
				//		continue;

				//throw new Exception (print_r($dsHistoryGr[ $r2 -> docFileNumber ]));
				
				$r2 -> docHistory = isset($dsHistoryGr[ $r2 -> docFileNumber ]) ? $dsHistoryGr[ $r2 -> docFileNumber ] : array();
				//$r2 -> docHistory = $dsHistoryGr[ $r2 -> docFileNumber ];
				$r4["doc"] = $r2;
				$r5["docs"][] = $r4;
			}
		}

		$this->result[] = $r5;

		//error_log(count($this->result[0]["docs"]) . "---", 3, "error.log");
		
		//throw new Exception ($this->result[0]["docs"][0]["doc"] -> docFileNumber);
		//throw new Exception (count($this->result[0]["docs"]));
		return $this->result;
	}

	public function byFileNumber($param) {
		return $this->get($param);
	}

	public function byAddress($param) {
		return $this->get($param);
	}

	public function byApprover($param) {
		return $this->get($param);
	}
	
	public function getApprovers($param) {
		$dbh = $this->connect();
		
		try {
			$stDoc = $dbh->query("SELECT DISTINCT docApprover FROM doc");
			$stHistory = $dbh->query("SELECT DISTINCT docApprover FROM docHistory");
		} catch (PDOException $e) {
			throw new Exception('Failed to execute query: ' . $e->getMessage());
		}

		$result = array();
		
		try {
			$data = $stDoc->fetchAll(PDO::FETCH_ASSOC);
		} catch (PDOException $e) {
			throw new Exception('Failed to fetch result set: ' . $e->getMessage());
		}

		foreach ($data as $row) {
			foreach ($row as $value) {
				$this->result[] = $value;
			}
		}

		try {
			$data = $stHistory->fetchAll(PDO::FETCH_ASSOC);
		} catch (PDOException $e) {
			throw new Exception('Failed to fetch result set: ' . $e->getMessage());
		}

		foreach ($data as $row) {
			foreach ($row as $value) {
				if (in_array($value, $this->result)) {
					// Value already exists in result set.
					continue;
				}

				$this->result[] = $value;
			}
		}
		
		return $this->result;
	}

	public function createUpdate($param) {
	//$json = json_decode($param, true);
	//$dt = date_create_from_format('d/m/Y', "19/05/2013");
	//$dt = DateTime::createFromFormat('d/m/Y', '19/05/2013', new DateTimeZone('UTC'));
	//$dt = '19/05/2013';
	//error_log(date($dt), 3, "error.txt");
	//error_log(print_r($dt), 3, "error2.txt");
	//error_log(gettype($dt2), 3, "error.txt");
		$dbh = $this->connect();

		if ($param[docPACINumber] == "")
			$param[docPACINumber] = null;

		try {
			//if ($param == "") {
				$stDoc = $dbh->query("SELECT COUNT(*) FROM docHistory WHERE docFileNumber = $param[docFileNumber]");

				//throw new Exception('Number of columns: ' . $stDoc->fetchColumn());
				if($stDoc->fetchColumn() == 0)
				{
					if ($param[originFileNumber] == null) {
						//$aa = " - In - ";
						$st = "INSERT INTO doc (docFileNumber, docDate, docApprover, docArea, docBlock, docStreet, docBuilding, docPACINumber, docTitle)
							VALUES (:docFileNumber, :docDate, :docApprover, :docArea, :docBlock, :docStreet, :docBuilding, :docPACINumber, :docTitle)";
					} else {
						//$aa = " - Up - ";
						$st = "UPDATE doc SET docFileNumber=:docFileNumber, docDate=:docDate, docApprover=:docApprover, docArea=:docArea, docBlock=:docBlock, docStreet=:docStreet, docBuilding=:docBuilding, docPACINumber=:docPACINumber, docTitle=:docTitle
							WHERE docFileNumber = $param[originFileNumber]";
					}
					
					// $st = "INSERT INTO doc (docFileNumber, docDate, docApprover, docArea, docBlock, docStreet, docBuilding, docPACINumber, docTitle)
					//	VALUES (:docFileNumber, :docDate, :docApprover, :docArea, :docBlock, :docStreet, :docBuilding, :docPACINumber, :docTitle)
					//	ON DUPLICATE KEY UPDATE docFileNumber=:docFileNumber, docDate=:docDate, docApprover=:docApprover, 
					//	docArea=:docArea, docBlock=:docBlock, docStreet=:docStreet, docBuilding=:docBuilding, docPACINumber=:docPACINumber, docTitle=:docTitle";
					
					$stDoc = $dbh->prepare($st);
					
					$dt = date_create_from_format('d/m/Y', $param[docDate]);
					
					$stDoc->execute(array(
						'docFileNumber' => $param[docFileNumber],
						'docDate' => date_format($dt, "Y-m-d"),
						'docApprover' => $param[docApprover],
						'docArea' => $param[docArea],
						'docBlock' => $param[docBlock],
						'docStreet' => $param[docStreet],
						'docBuilding' => $param[docBuilding],
						'docPACINumber' => $param[docPACINumber],
						'docTitle' => $param[docTitle],
					));
				} else
					throw new Exception("1003"); 	//"The document $param[docFileNumber] has been already approved, it cannot be modified"
				
				/*
				$stDoc->closeCursor(); 
				
				$st = "INSERT INTO doc (docFileNumber, docDate, docApprover, docArea, docBlock, docStreet, docBuilding, docPACINumber, docTitle)
				VALUES (:docFileNumber, :docDate, :docApprover, :docArea, :docBlock, :docStreet, :docBuilding, :docPACINumber, :docTitle) ON DUPLICATE KEY UPDATE";
				
				$stDoc = $dbh->prepare($st);
				$stDoc->execute(array(
					'docFileNumber' => $param=>docFileNumber,
				));
				*/
			//}
		} catch (PDOException $e) {
			if ((int)$e->getCode() == 23000)
				throw new Exception("23000"); //"The document $param[docFileNumber] or $param[originFileNumber] already exists"
			else
				throw new Exception('Failed to execute/prepare query: ' . $e->getMessage());
			//1062 Duplicate entry '12348' for key 
		}
	}
	
	public function approve_reject($param) {
		$dbh = $this->connect();

		try {
			$dbh->beginTransaction();
			
			//throw new Exception ($dbh->quote($param[docComment]));
			if ($param[sectionId] != null) {
				$st = "UPDATE doc SET docComment = " . $dbh->quote($param[docComment]);
				//if ($param[sectionId])
				$st .= ", sectionId = " . $param[sectionId];
				$st .= ", employeeId = NULL";
				$st .= " WHERE docFileNumber = $param[docFileNumber]";
				//$st = "UPDATE doc SET docComment = " . $dbh->quote($param[docComment]) . ", employeeId = NULL WHERE docFileNumber = $param[docFileNumber]";
				
				$stDoc = $dbh->exec($st);
				
				$dt = date_create_from_format('d/m/Y', $param[docHistory][docDate]);
				$dt = date_format($dt, 'Y-m-d');
				//$appr = $param[docHistory][docApprover];
				//$st = "INSERT INTO docHistory (docFileNumber, docDate, docApprover)	VALUES ($param[docFileNumber], '$dt', '$appr')";
				$st = "INSERT INTO docHistory (docFileNumber, docDate, docApprover)	VALUES ($param[docFileNumber], '$dt', '{$param[docHistory][docApprover]}')";
				$stDoc = $dbh->exec($st);
			} else {
				if ($param[employeeId] != null)
					$st = "UPDATE doc SET employeeId = " . $dbh->quote($param[employeeId]);
				else
					$st = "UPDATE doc SET employeeId = NULL";
				
				$st .= " WHERE docFileNumber = $param[docFileNumber]";
				//$stDoc = $dbh->prepare($st);
				//$stDoc->execute();
				$stDoc = $dbh->exec($st);
			}
			$dbh->commit();
		} catch (PDOException $e) {
			$dbh->rollBack();
			//throw new Exception('Failed to execute/prepare query: ' . $st);
			throw new Exception('Failed to execute/prepare query: ' . $e->getMessage());
		}
	}

	public function delete($param) {
		$dbh = $this->connect();

		try {
			$st = "DELETE FROM doc WHERE docFileNumber = $param[docFileNumber]";
			$stDoc = $dbh->exec($st);
		} catch (PDOException $e) {
			throw new Exception('Failed to execute/prepare query: ' . $e->getMessage());
		}
	}
}

?>
