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
	"pass" => "CXfmZqwVzDpfzTKJ");



$mysql_link = new mysqli($logging_db['host'], $logging_db['user'], $logging_db['pass'], $logging_db['user']);

if ($mysql_link->connect_errno) {
    // Let's try this:
    echo "Sorry, this website is experiencing problems.";

    echo "Error: Failed to make a MySQL connection, here is why: \n";
    echo "Errno: " . $mysql_link->connect_errno . "\n";
    echo "Error: " . $mysql_link->connect_error . "\n";
    
    exit;
}




// parse parameters
if($_SERVER['REQUEST_METHOD'] == "GET") {
	@$action = $_GET['action'];
	@$token = $_GET['token'];
	@$config = $_GET['config'];
} else {
	@$action = $_POST['action'];
	@$token = $_POST['token'];
	@$config = $_POST['config'];
}


process($token, $action, $config);
return;






















function process($token, $action, $config) {
	@header('Content-type: application/json');


	if($action == 'resetDemo') {
		resetDemo();;
	}

	else if($action == 'saveConfig') {
		echo json_encode(saveConfig($config));
	}
	else if($action == 'getOffers') {
		echo json_encode(getOffers($token, $customer, $list_size));
	}
	else if($action == 'respondToOffer') {

	}
	else if($action == 'getHistory') {
		echo json_encode(getOffers($token, $customer, $list_size));
	}

	else if($action == 'getConfig') { // $action == 'getConfig'
		echo json_encode(getConfig($token));
	} 
	else {
		// display error.
		$endpointVariables = array("Name" => "token", "Type" => "String", "Mandatory" => false);
		$serviceEndpoints = array( 	
			array("Name" => "Reset Demo", "Description" => "....", "Endpoint" => "/api?action=resetDemo&token=...", "Variables" => $endpointVariables),
			array("Name" => "Get Configuration", "Description" => "....", "Endpoint" => "/api?action=getConfig[&token=...]"),
			array("Name" => "Save Configuration", "Description" => "....", "Endpoint" => "/api?action=saveConfig&config=..."),
			array("Name" => "Get Offers", "Description" => "....", "Endpoint" => "/api?action=getOffers&customer=...&maxOffer=...&token=..."),
			array("Name" => "Respond to Offer", "Description" => "....", "Endpoint" => "/api?action=respondToOffer&offer=...&customer=...&token=..."),
			array("Name" => "Get History", "Description" => "....", "Endpoint" => "/api?action=getHistory&customer=...&token=...")
		);
		$serviceEndpointDesc = array("Serice Endpoints" => $serviceEndpoints);

		echo json_encode($serviceEndpointDesc);	
	}

	// log usage



	return;
}








/**
*
*/
function getConfig($token) {
	global $demoConfigFile;
	$config = null;

	if(!empty($token)) {
		$config = json_decode(getConfigFromDatabase($token));

	}

	if(empty($config) || $config == null){
		// load from default config.json
		$config = json_decode(file_get_contents($demoConfigFile), true);
		if(!empty($token)) {
			$config["error"] = "invalid token id. therefore providing default settings.";
			$config["token"] = generateRandomToken();
		}
	}
 
	return $config;
}


/**
*
*/
function getConfigFromDatabase($token) {
	global $mysql_link;
	$config = null;

	$configQuerySql = "SELECT * FROM `demo_config` WHERE `token` = '".$token."'";
	$configQueryResult = $mysql_link->query($configQuerySql);



	if(!$configQueryResult || $configQueryResult->num_rows != 1) {
		return null;
	}
	else {
		$configItem = $configQueryResult->fetch_assoc();;
		$config = $configItem["config_json"];
	}


	return $config;
}


/**
*
*/
function saveConfig($config) {
	$token = $config["token"];
	$userEmail = $config["general"]["userEmail"];
	$userIP = gethostbyaddr($_SERVER['REMOTE_ADDR']);;

	if(empty($token)) {
		// save new configuration
		$token = generateRandomToken();
		$config["token"] = $token;


		$createConfigSql = "INSERT INTO `omnichanneldemo`.`demo_config` (`id`, `token`, `config_json`, `create_dttm`, `modify_dttm`, `modify_by`, `email_to`) VALUES (NULL, '".$token."', '".json_encode($config)."', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '".$userIP."', '".$userEmail."');";


	} else {
		// update existing configuration
		$updateConfigSql = "UPDATE `omnichanneldemo`.`demo_config` SET `config_json` = '".json_encode($config)."', `email_to` = '".$userEmail."', `modify_by` = '".$userIP."',WHERE `demo_config`.`id` = 2;";
	}

	return $config;
}

/**
*
*/
function generateRandomToken($bytes = 6){
	return base64_encode(openssl_random_pseudo_bytes($bytes));
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