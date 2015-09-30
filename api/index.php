<?php
session_set_cookie_params(3600*24*30);
session_start();



@$http_proxy = "srv01gr.unx.sas.com:80";
@$demoConfigFile = "config.json";
@$demoConfig = array();
@$enable_logging = true;
@$logging_db = array(
	"host" => "localhost:3306", 
	"user" => "omnichanneldemo",
	"pass" => "BChZtzqt8ANh6L7Z");


// mysql connection 
/*
$link = mysqli_connect($logging_db['host'], $logging_db['user'], $logging_db['pass']);
if ($link) {
   	die('no connection to configuration database');
}
*/


// parse parameters
if($_SERVER['REQUEST_METHOD'] == "GET") {
	@$action = $_GET['action'];
	@$token = $_GET['token'];
	@$param = $_GET['param'];
} else {
	@$action = $_POST['action'];
	@$token = $_POST['token'];
	@$param = $_POST['param'];
}


process($token, $action, $param);
return;






















function process($token, $action, $param) {
	if($action == 'reset') {
		resetDemo();
		
		return true;
	}

	else if($action == 'save') {
		@header('Content-type: application/json');



		@logUsage("DEMO_SAVE", $param, "", "");
		return true;
	}
	else if($action == 'getOffers') {
		@header('Content-type: application/json');


		@logUsage("DEMO_SAVE", $param, "", "");
		return true;
	}
	else if($action == 'respondToOffer') {
		@header('Content-type: application/json');



		@logUsage("DEMO_SAVE", $param, "", "");
		return true;
	}
	else if($action == 'getHistory') {
		@header('Content-type: application/json');

		echo json_encode(getOffers($token, $customer, $list_size));

		return true;
	}



	else {
		@header('Content-type: application/json');

		echo json_encode(getConfig($token));

		return true;	
	}
}








/**
*
*/
function getConfig($token) {
	global $demoConfigFile;


	if($token) {
		$config = getConfigFromDatabase($token);
	}

	if(empty($config)){
		// load from default config.json
		$config = json_decode(file_get_contents($demoConfigFile), true);
	}

	return $config; //$config["userEmail"]
}



/**
*
*/
function saveConfig($token, $config) {
	
	return $token;	
}



/**
*
*/
function getOffers($token, $customer, $list_size){
	// calculate score

	// limit number of offers

	// track display information
}


/**
*
*/
function respondToOffer($token, $customer, $offerCd, $responseCd, $channelCd, $details) {
	// check if offer is valid

	// mark response in data base

	// increase / decrease scores

	// 
}


/**
*
*/
function getCustomerHistory($token, $customer) {

	return $historyList;
}



/**
*
*/
function resetDemo() {
	return $token;
}


function logUsage($eventType, $demoScenario, $detail1, $detail2) {
	global $enable_logging;
	global $logging_db;

	if($enable_logging == false) {
		return false; 
	}


	$userIp = (isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? "Proxy: " . ($_SERVER['HTTP_X_FORWARDED_FOR']) : $_SERVER['REMOTE_ADDR']);
	$userHost =  gethostbyaddr($_SERVER['REMOTE_ADDR']);
	$userSystem =  "Computer: " .  ($userHost != null ?  $userHost : "Unknown" ) . ". Browser: " . htmlspecialchars($_SERVER["HTTP_USER_AGENT"]) ;


	$link = mysqli_connect($logging_db['host'], $logging_db['user'], $logging_db['pass']);
	if (!$link) {
	   	return false;
	}

	$sqlInsertQuery = "INSERT INTO beacondemo.demo_events (id, session,event_dttm, event_type, user_ip, user_system, user_scenario, detail1, detail2) VALUES (NULL, \"". session_id() ."\" ,CURRENT_TIMESTAMP, \"" . $eventType . "\", \"".$userIp."\",\"".$userSystem."\", \"". addslashes(json_encode($demoScenario)) ."\", \"".$detail1."\",  \"".$detail2."\");";
	//echo $sqlInsertQuery;
	mysqli_query($link,$sqlInsertQuery);
	mysqli_close($link);
	return true;
}


?>