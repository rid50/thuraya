<?php
class DatabaseRepository {
	private $dsn;
	private $username;
	private $password;
	private $result;
	
	public function __construct() {
		//date_default_timezone_set('Asia/Kuwait');
		date_default_timezone_set('UTC');
		$domain = 'mew';
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
	private function connect($dbName = "tamdidat") {								//!!!!!!!!!!!!!!!!!!!!!!!!!!! hard coded database name
		//throw new Exception('Domain: ' . $_SERVER["USERDOMAIN"]);

		//error_log('dbName: ' . $this->dsn . 'dbname=' . $dbName . " \n", 3, "error.log");
/*
		if ($dbName == "")
			$dsn = $this->dsn . 'dbname=' . $dbName;
		else {
			$dsn = 
			$dsn = explode(';', $this->dsn, 2);
			error_log('json_encode($dsn): ' . json_encode($dsn) . " \n", 3, "error.log");
		
		}
*/	
		if ($dbName == '')
			$dbName = "tamdidat";													//!!!!!!!!!!!!!!!!!!!!!!!!!!! hard coded database name
			
		try {
			$dbh = new PDO($this->dsn . 'dbname=' . $dbName, $this->username, $this->password);
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

	public function getCheckups($param) {
		$page = $_GET['page']; // get the requested page
		$limit = $_GET['rows']; // get how many rows we want to have into the grid
		$sidx = $_GET['sidx']; // get index row - i.e. user click to sort
		$sord = $_GET['sord']; // get the direction
		$searchField = null;
		if (isset($_GET['searchField'])){ $searchField = $_GET['searchField']; }
		$searchOper = null;		// eq, bw, bn, ew, en, cn, nc, ne, lt, le, gt, ge, in, ni
		if (isset($_GET['searchOper'])){ $searchOper = $_GET['searchOper']; }

		//$searchOper = $_GET['searchOper'];	// eq, bw, bn, ew, en, cn, nc, ne, lt, le, gt, ge, in, ni
		//$searchString = $_GET['searchString'];
		
		if (isset($_GET['searchString']))
			$searchString = trim($_GET['searchString']);

		//throw new Exception('searchString: ' . $searchString);
			
		if(!$sidx) $sidx = 1;

		//$addressPieces = null;
		//if ($searchField == 'address') {
		//	$addressPieces = explode("|", $searchString);
		//}
		
		$where = "";
		switch ($searchOper) {
			case 'eq':
				$where .= "$searchField = '$searchString'";
				break;
			case 'ne':
				$where .= "$searchField <> '$searchString'";
				break;
			case 'bw':	//begin with
				if ($searchField == 'address') {
					$where .= " CONCAT(area.area_name, ' ', IF(sector_addrs = '-' AND qasimaa = '-', '', sector_addrs), ' ', IF(qasimaa = '-', '', qasimaa)) LIKE '$searchString%'";
					//$where .= " CONCAT(file_no, form_no) LIKE '$searchString%'";
					//$where .= " CONCAT(file_no, '', form_no) LIKE '1041/20085%'";
					//$where .= " area.area_name LIKE '$searchString%'";
					//if (isset($addressPieces[0]))
					//	$where .= "area.area_name LIKE '$addressPieces[0]%'";
					//if (isset($addressPieces[1]))
					//	$where .= " AND sector_addrs == '$addressPieces[1]'";
					//if (isset($addressPieces[2]))
					//	$where .= " AND qasimaa == '$addressPieces[2]'";
				} else
					$where .= "$searchField LIKE '$searchString%'";
				break;
			case 'bn':	//doesn't begin with
				$where .= "$searchField NOT LIKE '$searchString%'";
				break;
			case 'ew':	//ends with
				$where .= "$searchField LIKE '%$searchString'";
				break;
			case 'en':	//doesn't end with
				$where .= "$searchField NOT LIKE '%$searchString'";
				break;
			case 'cn':	//contains
				if ($searchField == 'address') {
					$where .= " CONCAT(area.area_name, ' ', IF(sector_addrs = '-' AND qasimaa = '-', '', sector_addrs), ' ', IF(qasimaa = '-', '', qasimaa)) LIKE '%$searchString%'";
					//if (isset($addressPieces[0]))
					//	$where .= "area.area_name LIKE '%$addressPieces[0]%'";
					//if (isset($addressPieces[1]))
					//	$where .= " AND sector_addrs == '$addressPieces[1]'";
					//if (isset($addressPieces[2]))
					//	$where .= " AND qasimaa == '$addressPieces[2]'";
				} else
					$where .= "$searchField LIKE '%$searchString%'";
				break;
			case 'nc':	//doesn't contain
				$where .= "$searchField NOT LIKE '%$searchString%'";
				break;
			case 'lt':	// less then
				$where .= "$searchField < '$searchString'";
				break;
			case 'le':	// less or equal
				$where .= "$searchField <= '$searchString'";
				break;
			case 'gt':	//more then
				$where .= "$searchField > '$searchString'";
				break;
			case 'ge':	//more or equal
				$where .= "$searchField >= '$searchString'";
				break;
			case 'in':	//in
				$where .= "$searchField IN($searchString)";
				break;
			case 'ni':	// not in
				$where .= "$searchField NOT IN ($searchString)";
				break;
		}

		//throw new Exception('Where: ' . ($where == ""));
		//throw new Exception('Where: ' . $where);

		//$dbh = $this->connect();
		$dbh = $this->connect(isset($param['dbName']) ? $param['dbName'] : '');
		try {
			$st = "SELECT COUNT(*) AS count";
			
			if ($where == "") {
				$st .= " FROM check_form"; 
			} else {
				$st .= " FROM check_form LEFT JOIN area ON check_form.area_id = area.id 
						LEFT JOIN checker ON check_form.checker = checker.id 
						LEFT JOIN checker AS checker_2 ON check_form.checker_2 = checker_2.id 
						LEFT JOIN checker AS checker_3 ON check_form.checker_3 = checker_3.id
						WHERE " . $where;
			}
			
			//throw new Exception('Statement: ' . $st);
//			الشويخ الصناعية 2 71
			
				//FROM check_form LEFT JOIN area ON check_form.area_id = area.id
				//				LEFT JOIN checker ON check_form.checker = checker.id";
			$ds = $dbh->query($st);
			$r = $ds->fetch(PDO::FETCH_ASSOC);

			$count = $r['count'];

			if( $count > 0 ) {
				$total_pages = ceil($count/$limit);
				if ($page > $total_pages) $page = $total_pages;
			} else {
				$total_pages = 0;
			}

			//if ($page > $total_pages) $page = $total_pages;
			$start = $limit * $page - $limit;

			//$st = "SELECT file_no, form_no, date_ins, CONCAT(area.area_name, ' منع: ', sector_addrs, ' قطعة أرض: ', qasimaa) AS address, 
			//$st = "SELECT file_no, form_no, date_ins, CONCAT(area.area_name, ' ', sector_addrs, ' ', qasimaa) AS address, 
			$st = "SELECT file_no, form_no, date_ins, CONCAT(area.area_name, ' ', IF(sector_addrs = '-' AND qasimaa = '-', '', sector_addrs), ' ', IF(qasimaa = '-', '', qasimaa)) AS address, 
				checker.ch_name, check_1_dt, result_1, checker_2.ch_name AS ch_name_2, check_2_dt, result_2, checker_3.ch_name AS ch_name_3, check_3_dt, result_3
				FROM check_form LEFT JOIN area ON check_form.area_id = area.id 
								LEFT JOIN checker ON check_form.checker = checker.id 
								LEFT JOIN checker AS checker_2 ON check_form.checker_2 = checker_2.id 
								LEFT JOIN checker AS checker_3 ON check_form.checker_3 = checker_3.id ";
			if ($where == "")
				$st .= " ORDER BY $sidx $sord LIMIT $start, $limit";
			else
				$st .= " WHERE " . $where . " ORDER BY $sidx $sord LIMIT $start, $limit";
				
			//throw new Exception('Statement: ' . $st);
				
			$ds = $dbh->query($st);
		} catch (PDOException $e) {
			throw new Exception('Failed to execute/prepare query: ' . $e->getMessage());
		}

		//$this->result = array();
		if (!isset($this->result)) $this->result = new stdClass();
		$this->result->page = $page;
		$this->result->total = $total_pages;
		$this->result->records = $count;
		$i = 0;
		while($r = $ds->fetch(PDO::FETCH_ASSOC)) {
			$this->result->rows[$i]['cell'] = (object)$r;
			$i++;
		}
		return $this->result;
	}

	public function getAreas() {
		$dbh = $this->connect();
		try {
			$st = "SELECT id, area_name FROM area ORDER BY area_name ASC";

			$ds = $dbh->query($st);
		} catch (PDOException $e) {
			throw new Exception('Failed to execute/prepare query: ' . $e->getMessage());
		}
		
		$this->result = array();
		while($r = $ds->fetch(PDO::FETCH_ASSOC)) {
			$this->result[] = (object)$r;
		}
		return $this->result;
	}
	
	public function getCheckers($param) {
		//error_log('isset($param[dbName]): ' . isset($param[dbName]) . " \n", 3, "error.log");
		//error_log('$param[dbName]: ' . $param[dbName] . " \n", 3, "error.log");

		$dbh = $this->connect(isset($param['dbName']) ? $param['dbName'] : '');
		try {
			$st = "SELECT id, ch_name FROM checker ORDER BY ch_name ASC";

			$ds = $dbh->query($st);
		} catch (PDOException $e) {
			throw new Exception('Failed to execute/prepare query: ' . $e->getMessage());
		}
		
		$this->result = array();
		while($r = $ds->fetch(PDO::FETCH_ASSOC)) {
			$this->result[] = (object)$r;
		}
		return $this->result;
	}
	
	public function getDocs($param) {
		return $this->get($param);
	}

	private function get($param) {
	
		$dbh = $this->connect();

		try {
			if ($param['docFileNumber'] == null || $param['docFileNumber'] == "") {

				//error_log($param['filter']['dateFrom'] . "---" . $param['filter'][dateTo], 3, "error.log");
			
				$dtFrom = date_create_from_format('d/m/Y', $param['filter']['dateFrom'])->format('Y-m-d');
				$dtTo = DateTime::createFromFormat('d/m/Y', $param['filter']['dateTo'])->format('Y-m-d');

				//error_log("---- \n ----", 3, "error.log");
				
				//error_log($dtFrom . "---" . $dtTo, 3, "error.log");

				if ($param['filter']['fileNumber'] != null) {
					$where = " doc.docFileNumber = '{$param['filter']['fileNumber']}'";
					//if ($param['filter'][approver] != null)
					//	$param['filter'][approver] = null;
				} else {
					$where = " doc.docDate BETWEEN '$dtFrom' AND '$dtTo'";
					//if ($param['filter'][paciNumber] != null)
					//	$where .= " AND doc.docPACINumber = '{$param['filter'][paciNumber]}'";
					if ($param['filter']['areaId'] != null)
						$where .= " AND doc.docAreaId = '{$param['filter']['areaId']}'";
					if ($param['filter']['block'] != null)
						$where .= " AND doc.docBlock = '{$param['filter']['block']}'";
					if ($param['filter']['plot'] != null)
						$where .= " AND doc.docPlot = '{$param['filter']['plot']}'";
/*						
					if ($param['filter'][sectionId] != null) {
						if ($param['filter'][sectionId] == 123)
							$where .= " AND (doc.sectionId = 1 OR doc.sectionId = 2 OR doc.sectionId = 3)";
						else if ($param['filter'][sectionId] == -10)
							$where .= " AND (doc.sectionId < -9 AND doc.sectionId > -20)";
						else if ($param['filter'][sectionId] == -20)
							$where .= " AND (doc.sectionId < -19 AND doc.sectionId > -30)";
						else
							$where .= " AND doc.sectionId = '{$param['filter'][sectionId]}'";
					}
*/					
//					if ($param['filter'][employeeId] != null)
//						$where .= " AND doc.employeeId = '{$param['filter'][employeeId]}'";
				}

				if ($param['filter']['employeeId'] != null)
					$where .= " AND doc.employeeId = '{$param['filter']['employeeId']}'";
				
				if ($param['filter']['sectionId'] != null) {
					if ($param['filter']['sectionId'] == 123)
						$where .= " AND (doc.sectionId = 1 OR doc.sectionId = 2 OR doc.sectionId = 3)";
					else if ($param['filter']['sectionId'] == -10)
						$where .= " AND (doc.sectionId < -9 AND doc.sectionId > -20)";
					else if ($param['filter']['sectionId'] == -20)
						$where .= " AND (doc.sectionId < -19 AND doc.sectionId > -30)";
					else
						$where .= " AND doc.sectionId = '{$param['filter']['sectionId']}'";
				}
				//else
				//	throw new Exception($where);
				
				
				//$st = "SELECT docFileNumber, docDate, docApprover, docAreaId, docBlock, docStreet, docBuilding, docPACINumber, docTitle, docComment, sectionId, employeeId FROM doc";
				//$st = "SELECT docFileNumber, docDate, docApprover, area.area_name as docArea, docBlock, docPlot, docTitle, docComment, sectionId, employeeId FROM doc INNER JOIN area ON doc.docAreaId = area.id";
				$st = "SELECT docFileNumber, docDate, docApprover, docAreaId, docBlock, docPlot, docTitle, docComment, sectionId, employeeId FROM doc";
				$st .= " WHERE " . $where . " ORDER BY docDate ASC, docFileNumber ASC ";

				//error_log($st . "---", 3, "error.log");

				//throw new Exception($st);
				//throw new Exception((string)($param['filter'][paciNumber] != null));

				//if ($param['filter'][approver] != null)
				//	$where .= " AND (doc.docApprover = '{$param['filter'][approver]}' OR docHistory.docApprover = '{$param['filter'][approver]}')";

				$st2 = "SELECT docHistory.docFileNumber, docHistory.docDate, docHistory.docApprover FROM docHistory INNER JOIN doc ON doc.docFileNumber = docHistory.docFileNumber";
				$st2 .= " WHERE " . $where;

				//throw new Exception($st2);
				
				$stDoc = $dbh->query($st);
				$stHistory = $dbh->query($st2);
			} else {
				//$st = "SELECT docFileNumber, docDate, docApprover, docArea, docBlock, docStreet, docBuilding, docPACINumber, docTitle, docComment, sectionId, employeeId FROM doc WHERE docFileNumber = :docFileNumber";
				$st = "SELECT docFileNumber, docDate, docApprover, docAreaId, docBlock, docPlot, docTitle, docComment, sectionId, employeeId FROM doc WHERE docFileNumber = :docFileNumber";
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
		if (!$found && $param['filter'][approver] != null && $r -> docApprover == $param['filter'][approver])
				$found = true;
				
			$r2 = (object)$r;
			if ($r2 -> docApprover != $param['filter'][approver])
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

//			if (!$found && $param['filter'][approver] != null && $r2 -> docApprover != $param['filter'][approver])
//				continue;
			
			//if ($r2->docPACINumber == null)
			//	$r2->docPACINumber = "";
			if ($r2->docPlot == null)
				$r2->docPlot = "";
			
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
			//throw new Exception((string)(array_search($param['filter'][approver], $dsHistoryGr[ $r2 -> docFileNumber ][1])));
			
			//if ((int)$param['filter'][actorRole] + 1 == count($dsHistoryGr[ $r2 -> docFileNumber ]))
			{
			//if ($r2 -> docFileNumber == 12348)
				//throw new Exception($r2 -> docFileNumber . " --- " . count($dsHistoryGr[ $r2 -> docFileNumber ]));
			
				//throw new Exception ((string)($param['filter'][approver] == null));
			
				if ($param['filter']['approver'] != null) {
					$found = false;
					foreach ($dsHistoryGr[ $r2 -> docFileNumber ] as $history) {
						//if ($r2 -> docFileNumber == 12348)
							//throw new Exception($history->docApprover);
							
						if ($param['filter']['approver'] == $history->docApprover) {
							$found = true;
							break;
						}
					}
					
					//if ($r2 -> docFileNumber == 12348)
						//throw new Exception($history->docApprover);
					
					if (!$found)
						continue;
				}
				//if ($param['filter'][approver] != null)
				//	if (!in_array($param['filter'][approver], $dsHistoryGr[ $r2 -> docFileNumber ][docApprover]))
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

		//$result = array();
		
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

		//if ($param[docPACINumber] == "")
		//	$param[docPACINumber] = null;
		if ($param[docPlot] == "")
			$param[docPlot] = null;

		try {
			//if ($param == "") {
				$stDoc = $dbh->query("SELECT COUNT(*) FROM docHistory WHERE docFileNumber = '$param[docFileNumber]'");

				//throw new Exception('Number of columns: ' . $stDoc->fetchColumn());
				$udateIfExists = $param[docFileNumber] == $param[originFileNumber] && $param["udateIfExists"] == true;
				if($stDoc->fetchColumn() == 0 || $udateIfExists)
				{
					if ($param[originFileNumber] == null) {
						//$aa = " - In - ";
						$st = "INSERT INTO doc (docFileNumber, docDate, docApprover, docAreaId, docBlock, docPlot, docTitle)
							VALUES (:docFileNumber, :docDate, :docApprover, :docAreaId, :docBlock, :docPlot, :docTitle)";
					} else {
						//$aa = " - Up - ";
						if($udateIfExists)
							$st = "UPDATE doc SET docFileNumber=:docFileNumber, docAreaId=:docAreaId, docBlock=:docBlock, docPlot=:docPlot, docTitle=:docTitle
								WHERE docFileNumber = '$param[originFileNumber]'";
						else
							$st = "UPDATE doc SET docFileNumber=:docFileNumber, docDate=:docDate, docApprover=:docApprover, docAreaId=:docAreaId, docBlock=:docBlock, docPlot=:docPlot, docTitle=:docTitle
								WHERE docFileNumber = '$param[originFileNumber]'";
					}
					
					// $st = "INSERT INTO doc (docFileNumber, docDate, docApprover, docArea, docBlock, docStreet, docBuilding, docPACINumber, docTitle)
					//	VALUES (:docFileNumber, :docDate, :docApprover, :docArea, :docBlock, :docStreet, :docBuilding, :docPACINumber, :docTitle)
					//	ON DUPLICATE KEY UPDATE docFileNumber=:docFileNumber, docDate=:docDate, docApprover=:docApprover, 
					//	docArea=:docArea, docBlock=:docBlock, docStreet=:docStreet, docBuilding=:docBuilding, docPACINumber=:docPACINumber, docTitle=:docTitle";
					
					$areaId = $param[docAreaId];
					if ($areaId == NULL) {
						//throw new Exception('Area name: ' . $param[docAreaName]);
						$stDoc = $dbh->prepare("INSERT INTO area(id, area_name) VALUES(NULL, '$param[docAreaName]');");
						$stDoc->execute();
						//throw new Exception('Area name: ' . $param[docAreaName]);
						//$stDoc = $dbh->prepare("SELECT LAST_INSERT_ID() AS kuk;");
						//$stDoc->execute();
						//$areaId = $dbh->fetch(PDO::FETCH_BOTH);
						//throw new Exception('Area name: ');
						//$areaId = $areaId[0];
						//SET $areaId2 = LAST_INSERT_ID();
						$areaId = $dbh->lastInsertId();
						$this->result[] = $areaId;
						//throw new Exception('Area name: ' . $areaId);
						//$areaId = $areaId['ID'];
					}

					$stDoc = $dbh->prepare($st);
										
					if($udateIfExists) {
						$ar = array(
							'docFileNumber' => $param[docFileNumber],
							'docAreaId' => $areaId,
							'docBlock' => $param[docBlock],
							'docPlot' => $param[docPlot],
							//'docBuilding' => $param[docBuilding],
							//'docPACINumber' => $param[docPACINumber],
							'docTitle' => $param[docTitle],
						);
					} else {
						$dt = date_create_from_format('d/m/Y', $param[docDate]);
						$ar = array(
							'docFileNumber' => $param[docFileNumber],
							'docDate' => date_format($dt, "Y-m-d"),
							'docApprover' => $param[docApprover],
							'docAreaId' => $areaId,
							'docBlock' => $param[docBlock],
							'docPlot' => $param[docPlot],
							//'docBuilding' => $param[docBuilding],
							//'docPACINumber' => $param[docPACINumber],
							'docTitle' => $param[docTitle],
						);
					}
					
					$stDoc->execute($ar);
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
		
		return $this->result;
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
				$st .= " WHERE docFileNumber = '$param[docFileNumber]'";
				//$st = "UPDATE doc SET docComment = " . $dbh->quote($param[docComment]) . ", employeeId = NULL WHERE docFileNumber = $dbh->quote($param[docFileNumber])";
				
				$stDoc = $dbh->exec($st);
				
				$dt = date_create_from_format('d/m/Y', $param[docHistory][docDate]);
				$dt = date_format($dt, 'Y-m-d');
				//$appr = $param[docHistory][docApprover];
				//$st = "INSERT INTO docHistory (docFileNumber, docDate, docApprover)	VALUES ($param[docFileNumber], '$dt', '$appr')";
				$st = "INSERT INTO docHistory (docFileNumber, docDate, docApprover)	VALUES ('$param[docFileNumber]', '$dt', '{$param[docHistory][docApprover]}')";
				$stDoc = $dbh->exec($st);
			} else {
				if ($param[employeeId] != null)
					$st = "UPDATE doc SET employeeId = " . $dbh->quote($param[employeeId]);
				else
					$st = "UPDATE doc SET employeeId = NULL";
				
				$st .= " WHERE docFileNumber = '$param[docFileNumber]'";
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
			$stDoc = $dbh->query("SELECT COUNT(*) FROM docHistory WHERE docFileNumber = $param[docFileNumber]");

			//throw new Exception('Number of columns: ' . $stDoc->fetchColumn());
			if($stDoc->fetchColumn() == 0 || $param["deleteIfExists"] == true) {
				$st = "DELETE FROM doc WHERE docFileNumber = '$param[docFileNumber]'";
				$stDoc = $dbh->exec($st);
			} else
				throw new Exception("1003"); 	//"The document $param[docFileNumber] has been already approved, it cannot be deleted"
		} catch (PDOException $e) {
			throw new Exception('Failed to execute/prepare query: ' . $e->getMessage());
		}
	}
}

?>
