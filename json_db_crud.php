<?php

function array_group_by( $array, $id ){
	$groups = array();
	foreach( $array as $row ) {
		$dt = strftime('%d/%m/%Y', strtotime($row -> docDate));
		$row -> docDate = $dt;
		$groups[ $row -> $id ][] = $row;
		unset($row -> $id);
	}
	return $groups;
}

/*
//echo @mysql_ping() ? 'true' : 'false';
$result[] = array('result' => mysql_ping() ? 'true' : 'false');
$json = json_encode($result);
print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);
return;
*/

//mysql_connect("localhost","rid50","nitwit");
//mysql_select_db("location");

//mysql_connect("localhost","root","mew123");

$ini = parse_ini_file("config.ini");
$dsn = $ini["dsn"];
$username = $ini["username"];
$password = $ini["password"];

//dsn = "mysql:host=fintas;dbname=mewdesigncomps"

$v = explode(':', $dsn, 2);
$v = explode(';', $v[1], 2);
$v2 = explode('=', $v[0]);
$server = strtolower($v2[1]);
$v2 = explode('=', $v[1]);
$db = strtolower($v2[1]);

//$pos = strpos($dsn, "host=");
//$server = substr($dsn, $pos, strpos($dsn, ";", $pos) - $pos);

mysql_connect($server, $username, $password);
mysql_select_db($db);


if ($_SERVER['REQUEST_METHOD'] == 'POST') { 

	//$sql_conn = mysql_connect("localhost","rid50","nitwit") or die("Connection failed : " . mysql_error());
	//mysql_connect("localhost","rid50","nitwit") or die(mysql_error());
	//mysql_select_db("location") or die(mysql_error());
	
	
	//$q=mysql_query("SELECT * FROM pathtracks WHERE birthyear>'".$_REQUEST['year']."'");
	/*
	//$query = "SELECT * FROM pathtrack";
	$result = "";
	foreach($_post[latitude] as $key) {
		//$query = "INSERT INTO pathtrack (user_name, provider, latitude, longitude, accuracy, time) VALUES ('$_POST[user_name]', '$_POST[provider]', $_POST[latitude], $_POST[longitude], $_POST[accuracy], $_POST[time])";
		//$q=mysql_query($query);
	//	if (mysql_errno())
	//		break;
	$result += $key . " / ";
	}
	*/
	//$input = file_get_contents('php://input');
	
	//$input = substr($input, 5);  //remove json= 
	//$input = urldecode($input); 
	//$jsonObj = json_decode($input, true); 
	
	//$input = 7;
	//if( !empty($jsonObj)) {  
	//    try { 
	//	$input = "5";
	
	        //$input = $_POST['latitude'][1]; 
	        //$input = $input . $jsonObj[latitude]; 
	//    } 
	//} 
	/*
	$input = "";
	foreach($_POST as $key => $value) {
		//$input .= $key . " | ";
		//$input .= $value[0] . " * " . $value[1];
		//break;
		if(is_array($value)) {
			foreach($value as $val)
			//$$key = $value;
				$input .= $val . " / ";
		//	}
		} else {
			$input .= $key . " | ";
		}
	}
	*/
	
	$input = "";
	$query = "";
	$k = "";
	$keys = array_keys($_POST);
	for ($i = 0; $i < count($_POST[$keys[0]]); $i++) {
		//foreach($_POST as $key => $value)
		$v = "";
		for ($j = 0; $j < count($keys); $j++) 
		{ 
			if ($i == 0) {
				if ($j != 0)
					$k .= ",";
				$k .= $keys[$j];
			}
	
			if ($j != 0)
				$v .= ",";
	
			if ($j < 2)
				$v .= "'";
			$v .= $_POST[$keys[$j]][$i];
			if ($j < 2)
				$v .= "'";
			
			//$input .= count($value) . " / ";
		}
		if ($i != 0)
			$query .= ",";
		$query .= "(" . $v . ")";
		//break;
	}
	
	$query = "INSERT INTO pathtrack(" . $k . ")VALUES" . $query;
	
	mysql_query($query);

	//$input = "";
	//$keys = array_keys($_POST);
	//$input = $keys[0]; // user_name
	//$input = count($_POST[$keys[0]]); // 123
	
	//$input = $_POST[user_name][0]; // roman
	//$input = count($_POST['user_name']); // 119
	//$input = count(array_keys($_POST)); // 6
	//$input = count($_POST); // 6
	
	//print($query);


	if (mysql_errno()) { 
	    //header("HTTP/1.1 500 Internal Server Error");
	    //echo nl2br($query."\n");
	    //echo mysql_error(); 
	    //$result = array('result' => mysql_error());
	    //print(json_encode($result));
		//print(json_encode(array('result' => mysql_error())));
		//print("[{'result':\"" . mysql_error() . "\"}]");
		
		$result[] = array('error' => mysql_error());
		$json = json_encode($result);
		print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);
	}
	else
	{
		//print(json_encode(array('result' => 'success')));
		//print("[{'result':'success'}]");

		$result[] = array('success' => 'success');
		$json = json_encode($result);
		print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);
	}
} else if ($_SERVER['REQUEST_METHOD'] == 'GET') { 

	header('Content-type: application/json; charset=utf-8');
	header('Cache-Control: no-cache, must-revalidate');
	header('Expires: Mon, 1 Jan 1990 00:00:00 GMT');

	//print("<span>kuku</span>");

	/*
	$query="SELECT doc.docFileNumber, docDate, docApprover, docArea, docBlock, docStreet, docBuilding, docPACINumber, docTitle
		FROM doc
		INNER JOIN docHistory
		ON doc.docFileNumber = docHistory.docFileNumber";
	*/	

	$statement = "SELECT docFileNumber, docDate, docApprover, docArea, docBlock, docStreet, docBuilding, docPACINumber, docTitle, docComment FROM doc";
	$dsDoc = mysql_query($statement);
	if (mysql_errno()) { 
		$result[] = array('error' => mysql_error());
		$json = json_encode($result);
		print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);
	} else {
		$statement = "SELECT docFileNumber, docDate, docApprover FROM docHistory";
		$dsHistory = mysql_query($statement);
		if (mysql_errno()) { 
			$result[] = array('error' => mysql_error());
			$json = json_encode($result);
			print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);
		} else {
			$result = array();
			while($r = mysql_fetch_array($dsHistory, MYSQL_ASSOC))
				$result[] = (object)$r;
			
			// group rows from $query_docHistory by their docFileNumber
			$dsHistoryGr = array_group_by( $result, 'docFileNumber' );

			// let's combine results:
			$result = array(); $r5 = array();
			//foreach( $dsDoc as $row1 ){
			while($r = mysql_fetch_array($dsDoc, MYSQL_ASSOC)) {
				$r2 = (object)$r;

				//$dt = date_create($r2 -> docDate)->format('d/m/Y');
				//$dt = date_format(date_create($r2 -> docDate), 'd/m/Y');
				// To format dates in other languages, you should use the setlocale() and strftime() functions instead of date().
				if ($r2->docPACINumber == null)
					$r2->docPACINumber = "";
					
				$dt = strftime('%d/%m/%Y', strtotime($r2 -> docDate));
				
				$r3 = array(docDate => $dt, docApprover => $r2 -> docApprover);

				//$r3 = array(docDate => date_format(date_create($r2 -> docDate), 'd/m/Y'), docApprover => $r2 -> docApprover);
				//$r3 = array(docDate => date_create($r2 -> docDate)->format('d/m/Y'), docApprover => $r2 -> docApprover);
				//$r3 = array(docDate => $r2 -> docDate, docApprover => $r2 -> docApprover);
				unset($r2 -> docDate);
				unset($r2 -> docApprover);
				
				if (isset($dsHistoryGr[ $r2 -> docFileNumber ]))
					array_unshift($dsHistoryGr[ $r2 -> docFileNumber ], (object)$r3);
				else
					$dsHistoryGr[ $r2 -> docFileNumber ][] = (object)$r3;
				
				$r2 -> docHistory = isset( $dsHistoryGr[ $r2 -> docFileNumber ]) ? $dsHistoryGr[ $r2 -> docFileNumber ] : array();
				$r4["doc"] = $r2;
				$r5["docs"][] = $r4;
			}

			$result[] = $r5;
			
			//$result = "";
			//while($e=mysql_fetch_assoc($q))
			//while($e=mysql_fetch_array($q, MYSQL_ASSOC))
			//	$result[]=$e;

			$json = json_encode($result);
			print(isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json);
			
			//mysql_free_result($retval);
			//print(json_encode($result));
		
			//print(json_encode(array('result' => 'success')));
			//print('{"result":"success"}');
		}
	}
}

mysql_close();

?>
