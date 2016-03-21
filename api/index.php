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

$mysql_link->query("set names 'utf8';");





return processRequest();
exit;
/**********************************************/







function getRequestParameter($parameter) {
	if($_SERVER['REQUEST_METHOD'] == "POST")
		return @$_POST[$parameter];
	else
		return @$_GET[$parameter];
}


function processRequest() {
	@header('Content-type: application/json');

	$action = getRequestParameter("action");
	$token = getRequestParameter("token");

	

	if ($action == 'getAllDemos') {
		$maxItems = getRequestParameter("maxItems");
		$userEmail = getRequestParameter("userEmail");
		logUsage($action, "", $maxItems, $userEmail);
		echo json_encode(getAllConfigsFromDatabase($userEmail, $maxItems));
	}

	else if ($action == 'getStandardDemos') {
		logUsage($action, "", "", "");
		echo json_encode(getDefaultConfigsFromDatabase());
	}

	else if($action == 'resetDemo') {
		resetDemo($token);
		logUsage($action, "", $token, "");
	}

	else if($action == 'saveConfig') {
		$config = getRequestParameter("config");
		$savedConfig = saveConfig(json_decode($config));
		logUsage($action, "", $savedConfig->token, $config);
		echo json_encode($savedConfig);
	}
	else if($action == 'copyConfig') {
		// copy token config to a new token
		// copy website...
		$newToken = copyConfig($token);
		logUsage($action, "", $newToken, "");
		echo json_encode($newToken);
	}


	else if($action == 'getOffers') {
		$customer = getRequestParameter("customer");
		$channel = getRequestParameter("channel");
		$list_size = getRequestParameter("maxOffers");
		$do_not_track = getRequestParameter("DoNotTrack");
		logUsage($action, "", $token, $channel);
		echo json_encode(getOffers($token, $customer, $channel, $list_size, $do_not_track));
	
	}
	else if($action == 'respondToOffer') {
		$customer = getRequestParameter("customer");
		$offerCd = getRequestParameter("offer");
		$responseCd = getRequestParameter("response");
		$channelCd = getRequestParameter("channel");
		$details = getRequestParameter("details");
		logUsage($action, "", $token, $channelCd);
		echo json_encode(respondToOffer($token, $customer, $offerCd, $responseCd, $channelCd, $details));

	}
	else if($action == 'getHistory') {
		$customer = getRequestParameter("customer");
		logUsage($action, "", $token, $customer);
		echo json_encode(getCustomerHistory($token, $customer));
	}

	else if($action == 'getConfig') {
		logUsage($action, "", $token, "");
		echo json_encode(getConfig($token));
	} 
	else {
		// display how to use service.
		$endpointVariables = array("Name" => "token", "Type" => "String", "Mandatory" => false);
		$serviceEndpoints = array( 	
			array("Name" => "Reset Demo", "Description" => "....", "Endpoint" => "/api?action=resetDemo&token=...", "Variables" => $endpointVariables),
			array("Name" => "Get Configuration", "Description" => "....", "Endpoint" => "/api?action=getConfig[&token=...]"),
			array("Name" => "Save Configuration", "Description" => "....", "Endpoint" => "/api?action=saveConfig&config=..."),
			array("Name" => "Get Offers", "Description" => "....", "Endpoint" => "/api?action=getOffers&customer=...&maxOffer=...&token=..."),
			array("Name" => "Respond to Offer", "Description" => "....", "Endpoint" => "/api?action=respondToOffer&offer=...&customer=...&token=..."),
			array("Name" => "Get History", "Description" => "....", "Endpoint" => "/api?action=getHistory&customer=...&token=...")
		);
		$serviceEndpointDesc = array("Service Endpoints" => $serviceEndpoints);

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
		$config = getConfigFromDatabase($token);
	}

	if(empty($config) || $config == null){
		// load from default config.json
		$config = json_decode(file_get_contents($demoConfigFile));

		if(!empty($token)) {
			$config->token = "";
			$config->message = "Token is invalid. You got the default configuration.";
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



	if(!$configQueryResult || @$configQueryResult->num_rows != 1) {
		return null;
	}
	else {
		$configItem = $configQueryResult->fetch_assoc();;
		$config = json_decode($configItem["config_json"]);
		$config->readOnly = $configItem["read_only"];
	}


	return $config;
}


/**
*
*/
function saveConfig($config) {

	if($config == null || empty($config)) return array("error" => "no configuration to save");
	global $mysql_link;

	$token = $config->token;
	$tokenValid = false; // true when token is valid
	$copyConfig = false; // true when config is marked as readOnly

	$userEmail = 	$config->general->userEmail;
	$configName = 	$config->general->demoName;
	$configDesc = 	$config->general->demoDescription;
	$userIP = gethostbyaddr($_SERVER['REMOTE_ADDR']);
	$config->message = "";

	if(!empty($token)) {
		// check if token is valid.
		$configFromDB = getConfigFromDatabase($token);
		if($configFromDB != null) $tokenValid = true;

		$copyConfig = @$configFromDB->readOnly != null;

		if($tokenValid && !$copyConfig) {
			// update existing configuration
			$configString = $mysql_link->real_escape_string(json_encode($config));
			$updateConfigSql = "UPDATE `omnichanneldemo`.`demo_config` SET  `config_name` = '".$configName."',  `config_desc` = '".$configDesc."', `config_json` = '".$configString."', `email_to` = '".$userEmail."', `modify_by` = '".$userIP."', `modify_dttm` = CURRENT_TIMESTAMP WHERE `demo_config`.`token` = '" . $token . "' ;";
			$mysql_link->query($updateConfigSql);
			$config->message = "Configuration saved successfully.";
		}
	}

	if(empty($token) || !$tokenValid || $copyConfig) {
		// save new configuration
		$oldToken = $token;
		$token = generateRandomToken();
		$config->token = $token;
		$configString = $mysql_link->real_escape_string(json_encode($config));

		$createConfigSql = "INSERT INTO `omnichanneldemo`.`demo_config` (`id`, `token`, `config_name`, `config_desc`, `config_json`, `create_dttm`, `modify_dttm`, `modify_by`, `email_to`) VALUES (NULL, '".$token."', '".$configName."', '".$configDesc."', '".$configString."', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '".$userIP."', '".$userEmail."');";
		$createConfigResult = $mysql_link->query($createConfigSql);
		$config->message = "Configuration saved successfully - with new Token: " . $token;;

		if($copyConfig) {
			$copyWebsiteSql = "INSERT INTO demo_website SELECT '". $token ."', site, content, NOW(), NOW(), '". $userIP ."' FROM demo_website WHERE token = '" . $oldToken . "';";
			$mysql_link->query($copyWebsiteSql);
			$config->message = $config->message . " & migrating website.";
		}
	}


	resetDemo($token);
	return $config;
}


function copyConfig($token) {
	global $mysql_link;
	
	$configFromDB = getConfigFromDatabase($token);
	$newToken = "";
	if($configFromDB != null) {
		$newToken = generateRandomToken();
		$configFromDB->token = $newToken;

		$userEmail = $configFromDB->general->userEmail;
		$configName = $configFromDB->general->demoName;
		$configDesc = "Copy of token " . $token . "\n" . $configFromDB->general->demoDescription;
		$userIP = gethostbyaddr($_SERVER['REMOTE_ADDR']);
		$configString = $mysql_link->real_escape_string(json_encode($configFromDB));

		$createConfigSql = "INSERT INTO `omnichanneldemo`.`demo_config` (`id`, `token`, `config_name`, `config_desc`, `config_json`, `create_dttm`, `modify_dttm`, `modify_by`, `email_to`) VALUES (NULL, '".$newToken."', '".$configName."', '".$configDesc."', '".$configString."', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '".$userIP."', '".$userEmail."');";
		$createConfigResult = $mysql_link->query($createConfigSql);

		$copyWebsiteSql = "INSERT INTO demo_website SELECT '". $newToken ."', site, content, NOW(), NOW(), '". $userIP ."' FROM demo_website WHERE token = '".$token."';";
		$mysql_link->query($copyWebsiteSql);
	}

	return $newToken;
}



function getAllConfigsFromDatabase($email, $limit) {
	global $mysql_link;
	$result = array();

	$criteria = "";

	if(!empty($email)) {
		$criteria = "WHERE `email_to` = '".$email."'";
	}

	if(!empty($limit)) {
		$criteria = $criteria . " LIMIT ". $limit;
	}

	$configQuerySql = "SELECT id, token, config_name, config_desc, read_only, create_dttm, modify_dttm, email_to  FROM `demo_config` " . $criteria . " ORDER BY `modify_dttm` DESC"; 
	$configQueryResult = $mysql_link->query($configQuerySql);
	$configQuerySize = @$configQueryResult->num_rows;

	for($i = 0; $i < $configQuerySize; $i++) {
		$result[$i] = $configQueryResult->fetch_assoc();
	}

	return $result;
}

function getDefaultConfigsFromDatabase() {
	global $mysql_link;
	$result = array();


	$configQuerySql = "SELECT id, token, config_name, config_desc, read_only, create_dttm, modify_dttm, email_to  FROM `demo_config` WHERE read_only = '1' ORDER BY `modify_dttm` DESC"; 
	$configQueryResult = $mysql_link->query($configQuerySql);
	$configQuerySize = @$configQueryResult->num_rows;

	for($i = 0; $i < $configQuerySize; $i++) {
		$result[$i] = $configQueryResult->fetch_assoc();
	}

	return $result;
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
function getOffers($token, $customer, $channel, $list_size = 10, $do_not_track){
	global $mysql_link;
	$offerList = array();

	$offerListSql = "SELECT a.*, b.entrytype, b.count FROM `customer_offers` a LEFT JOIN contact_response_counts b ON (a.token = b.token AND a.customer=b.customer AND a.offer=b.offerCd AND b.entrytype = 'Display') WHERE a.`responded` = '0' and a.`token` = '". $token ."' and a.`customer` = '".$customer."' and (count is null or display_limit >= count) and score > 0 order by score DESC;";

	$offerListResult = $mysql_link->query($offerListSql);
	// limit number of offers
	$offerListSize = @$offerListResult->num_rows;
	for($i = 0; $i < $offerListSize; $i++) {
		if($i >= $list_size) break;
		$offerList[$i] = $offerListResult->fetch_assoc();
		// track display information
		if(!$do_not_track) {
			insertHistoryEntry($token, $customer, $offerList[$i]['offer'], '', $channel, 'Display', '', '', "");
		}
		
	}


	return $offerList;
}


/**
*
*/
function respondToOffer($token, $customer, $offerCd, $responseCd, $channelCd, $details) {
	global $mysql_link;


	// check if offer is valid
	$config = getConfig($token);
	if($config == null) return array('msg' => 'invalid token');

	if(empty($offerCd)) return array('msg' => 'offerCode is required');


	$offerIndex = getOfferIndexByCode($config->nba, $offerCd);
	if($offerIndex == -1) return array('msg' => 'invalid offerCode');

	$offer = $config->nba[$offerIndex];


	// increase / decrease scores
	if($responseCd == "show interest") {
		$responded = 0;
		$changeScore = $offer->changeScoreByInterest;
	} else {
		$responded = 1;
		$changeScore = 0;
	}

	// update offer table
	$updateOfferSql = "UPDATE `customer_offers` SET `responded` = '".$responded."', `score` = (`score` + ".$changeScore.") WHERE `token` = '".$token."' and `customer` = '".$customer."' and `offer` = '".$offerCd."';";
	$mysql_link->query($updateOfferSql);

	insertHistoryEntry($token, $customer, $offerCd, "", $channelCd, "Response", $responseCd, $details, ""); // TODO: need to be fixed

	// send SMS if response is accept
	$smsSendResponse = "noSMS";
	if($responseCd == "accept") {
		$smsSendResponse = sendSMS($token, $customer, $offer);
	}

	return array('msg' => 'response successful with ' .$smsSendResponse);
}


/**
*
*/
function insertHistoryEntry($token, $customer, $offerCd, $offer, $channel, $entrytype, $responsetype, $responsedetails, $datetime) {
	global $mysql_link;

	if($datetime == "") {
		$insertHistorySql = "INSERT INTO `omnichanneldemo`.`contact_response_history` (`token`, `customer`, `offerCd`, `offer`, `channel`, `entrytype`, `responsetype`, `responsedetails`, `datetime`) VALUES ('".$token."', '".$customer."', '".$offerCd."', '".$offer."', '".$channel."', '".$entrytype."', '".$responsetype."', '".$responsedetails."', now())";
	} else {
		$insertHistorySql = "INSERT INTO `omnichanneldemo`.`contact_response_history` (`token`, `customer`, `offerCd`, `offer`, `channel`, `entrytype`, `responsetype`, `responsedetails`, `datetime`) VALUES ('".$token."', '".$customer."', '".$offerCd."', '".$offer."', '".$channel."', '".$entrytype."', '".$responsetype."', '".$responsedetails."', '" . $datetime . "')";
	}
	return $mysql_link->query($insertHistorySql);	
}


/**
*
*/
function getCustomerHistory($token, $customer) {
	global $mysql_link;
	$historyList = array();
	//$historyListSql = "SELECT * FROM `contact_response_history` WHERE `token` = '".$token."' and `customer` = '".$customer."' ORDER BY `datetime` DESC";
	$historyListSql = "SELECT * FROM `contact_response_history` WHERE `token` = '".$token."' and `customer` = '".$customer."' ORDER BY `datetime` DESC";
	
	$historyListResult = $mysql_link->query($historyListSql);
	$historyListSize   = @$historyListResult->num_rows;
	for($i = 0; $i < $historyListSize; $i ++) {
		$historyList[$i] = $historyListResult->fetch_assoc();
	}

	return $historyList;
}



/**
*
*/
function resetDemo($token) {
	global $mysql_link;
	//check if token is valid
	$config = getConfigFromDatabase($token);
	if($config == null) return;

	// delete old entries form contact and response history
	$mysql_link->query("DELETE FROM `contact_response_history` WHERE `token` = '". $token ."'");

	// delete old offers
	$mysql_link->query("DELETE FROM `customer_offers` WHERE `token` = '". $token ."'");

	// reset offers from config-
	$customer1Id = $config->customers[0]->customerLogin;
	$customer2Id = $config->customers[1]->customerLogin;
	$offerListSize = sizeof($config->nba);
	for($offerIndex = 0; $offerIndex < $offerListSize; $offerIndex++) {
		$offerCode = $config->nba[$offerIndex]->offerCode;
		$customer1Score = $config->nba[$offerIndex]->customer1Score;
		$customer2Score = $config->nba[$offerIndex]->customer2Score;
		$displayCount = $config->nba[$offerIndex]->maxContacts;

		// insert offer twice - for each customer
		$insertOfferSql = "INSERT INTO `omnichanneldemo`.`customer_offers` (`token`, `customer`, `offer`, `score`, `display_limit`, `responded`) VALUES ('".$token."', '".$customer1Id."', '".$offerCode."', '".$customer1Score."', '".$displayCount."', '0'), ('".$token."', '".$customer2Id."', '".$offerCode."', '".$customer2Score."', '".$displayCount."', '0');";
		$mysql_link->query($insertOfferSql);
	}



	// reset contact history from config
	$customerListSize = sizeof($config->customers);
	for($customerIndex = 0; $customerIndex < $customerListSize; $customerIndex++) {
		$customer = $config->customers[$customerIndex];
		$historyListSize = sizeof($customer->actionHistory);
		for($historyIndex = 0; $historyIndex < $historyListSize; $historyIndex++) {
			$historyEntry = $customer->actionHistory[$historyIndex];
			insertHistoryEntry($token, $customer->customerLogin, "", $historyEntry->historyAction, $historyEntry->historyChannel, "History", $historyEntry->historyResponse, "", $historyEntry->historyDate);
		}
	}

	return;
}

/**
*
*/
function getCustomerIndexByLogin($customerList, $customerLogin) {
	$index = -1;

	$customerListSize = sizeof($customerList);
	for($customerIndex = 0; $customerIndex < $customerListSize; $customerIndex++) {
		if($customerList[$customerIndex]->customerLogin == $customerLogin) {
			$index = $customerIndex;
			break;
		}
	}

	return $index;
}

/**
*
*/
function getOfferIndexByCode($offerList, $offerCode) {
	$index = -1;

	$offerListSize = sizeof($offerList);
	for($offerIndex = 0; $offerIndex < $offerListSize; $offerIndex++) {
		if($offerList[$offerIndex]->offerCode == $offerCode) {
			$index = $offerIndex;
			break;
		}
	}

	return $index;
}


function sendSMS($token, $customerId, $offer) {
	global $mysql_link;
	//check if token is valid
	$config = getConfigFromDatabase($token);
	if($config == null) return;

	//echo ' sendSms = ' .$config->general->sendSms;
	//echo ' customer: ' .$customerId;
	$response = "SMS activated";
	if($config->general->sendSms==0 || $config->general->sendSms==""){
		$response = "SMS deactivated";
		return $response;
	} 

	global $http_proxy;
	

	$customerListSize = sizeof($config->customers);
	$customer = null;
	for($customerIndex = 0; $customerIndex < $customerListSize; $customerIndex++) {
		$customer = $config->customers[$customerIndex];
		if($config->customers[$customerIndex]->customerLogin == $customerId) {
			break;
		}
	}

	$mobileNumber = $customer->mobileNumber;
	$mobileName   = $customer->firstName;
	$mobileSmsText= $offer->offerSms;
	$offerName    = $offer->offerName;
/*
TODO: Add Support:
%Token%
%OfferIndex%
%OfferCode%
%OfferName%
%OfferDesc%
%OfferImage%
%CustomerLogin%
%CustomerId%
%Firstname%
%Lastname%
%CustomerPicture%
%CustomerSegment%


*/



	$newText      = str_replace("%FIRSTNAME%",$mobileName,$mobileSmsText);   // REPLACE name placeholder in SMS text
	$newText      = str_replace("%OFFERNAME%",$offerName,$newText); // REPLACE offername placeholder in SMS text
	//$newText      = str_replace(" ","+",$newText);  // REPLACE all spaces with a plus symbol
	
	$serverUrl = "http://dachgpci01.emea.sas.com/MessagingService/rest/";

	$requestParameter = array("sender" => "SAS.Demo", "recipient" => $mobileNumber, "body" => $newText, "channel" => "SMS", "provider" => "NEXMO");

	$options = array(
		    'http' => array(
		        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
		        'method'  => "POST",
		        'content' => http_build_query($requestParameter),
		    ),
		);

	$context  = stream_context_create($options);
	@file_get_contents($serverUrl, false, $context);

		
	return $response;		
}



function logUsage($eventType, $userPayload, $detail1, $detail2) {
	global $enable_logging;
	global $mysql_link;

	if($enable_logging == false) {
		return false; 
	}

	$userIp = (isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? "Proxy: " . ($_SERVER['HTTP_X_FORWARDED_FOR']) : $_SERVER['REMOTE_ADDR']);
	$userHost =  gethostbyaddr($_SERVER['REMOTE_ADDR']);
	$userSystem =  "Computer: " .  ($userHost != null ?  $userHost : "Unknown" ) . ". Browser: " . htmlspecialchars($_SERVER["HTTP_USER_AGENT"]) ;

	$sqlInsertQuery = "INSERT INTO omnichanneldemo.demo_events (id, session,event_dttm, event_type, user_ip, user_system, user_scenario, detail1, detail2) VALUES (NULL, \"". session_id() ."\" ,CURRENT_TIMESTAMP, \"" . $eventType . "\", \"".$userIp."\",\"".$userSystem."\", \"". addslashes(json_encode($userPayload)) ."\", \"".$detail1."\",  \"".$detail2."\");";
	$mysql_link->query($sqlInsertQuery);
	return true;
}

?>