<?php
session_set_cookie_params(3600*24*30);
session_start();


header("Content-Type: text/html;charset=UTF-8");

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


return processRequest();
// Continue reading in processRequest();






function processRequest() {
	$token = getRequestParameter("token");
	$page = getRequestParameter("page");
	$action = getRequestParameter("action");


	if(empty($token)) {
		die ("please provide a token");
	}

	if(empty($page)) {
		$page = "start";
	}

	if(empty($action)) {
		$action = "read";
	}


	if($action == "read") {
		echo getPageFromDatabase($token, $page);


	} else if ($action == "edit") {
		displayEditor($token, $page);

	} else if ($action == "save") {
		$content = getRequestParameter("content");
		savePageToDatabase($token, $page, $content);
		// overwrite existing page

	} else if ($action == "upload") {
		$url = getRequestParameter("url");
		uploadWebsiteToDatabase($token, $page, $url, "");
		// read website and store it for token and page

	}
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
		die("invalid token");
	}
	else {
		$configItem = $configQueryResult->fetch_assoc();;
		$config = json_decode($configItem["config_json"]);
	}


	return $config;
}



/**
*
*/
function getPageFromDatabase($token,$page) {
	global $mysql_link;
	$content = null;

	$mysql_link->query("set names 'utf8'");
	$pageQuerySql = "SELECT * FROM `demo_website` WHERE `token` = '".$token."' and `site` = '".$page."'";
	$pageQueryResult = $mysql_link->query($pageQuerySql);



	if(!$pageQueryResult || $pageQueryResult->num_rows != 1) {
		die("invalid token " . $pageQueryResult->num_rows);
	}
	else {
		$pageItem = $pageQueryResult->fetch_assoc();;
		$content = $pageItem["content"];
	}


	return $content;
}

function savePageToDatabase($token, $page, $content) {
	global $mysql_link;
	$mysql_link->query("set names 'utf8';");

	$updateSqlQuery ="INSERT INTO `omnichanneldemo`.`demo_website` (`token`, `site`, `content`, `create_dttm`, `modify_dttm`, `modify_by`) VALUES ('".$token."', '".$page."', '".$mysql_link->real_escape_string($content)."', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '')  ON DUPLICATE KEY UPDATE `content`=VALUES(`content`)";

	return $mysql_link->query($updateSqlQuery);
} 

function getPageFromUrl($URL)
{
    #Get the source content of the URL
    $source =  utf8_encode(file_get_contents($URL));



    return $source;
}


function http_get_contents($url)
    {
    	error_reporting(E_ALL);
        $ch = curl_init();
        $host = parse_url($url, PHP_URL_HOST); //Ex: www.google.com
        curl_setopt($ch, CURLOPT_TIMEOUT, 500);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.9.0.3) Gecko/2008092417 Firefox/3.0.4");
		curl_setopt($ch, CURLOPT_REFERER, "http://google.com/");
		//curl_setopt($ch, CURLOPT_HEADER, 1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_ENCODING, "gzip");
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
		//curl_setopt($ch, CURLOPT_SSLVERSION, 3);

        if(FALSE === ($retval = curl_exec($ch))) {
            echo curl_error($ch);
        } else {
            return $retval;
        }
    }


function uploadWebsiteToDatabase($token, $page, $url, $options) {
	$source = http_get_contents($url);

	// clean up?
	//$source = cleanHtml($source);
	$source = manipulateWebsiteDOM($source, $url, "");
	//$source = cleanHtml($source);


	savePageToDatabase($token, $page, $source);
}



function manipulateWebsiteDOM($source, $url, $options){
	$scheme = parse_url($url, PHP_URL_SCHEME); //Ex: http
    $host = parse_url($url, PHP_URL_HOST); //Ex: www.google.com
    $raw_url = $scheme . '://' . $host . '/'; //Ex: http://www.google.com

	$doc = new DOMDocument();
	@$doc->loadHTML($source);
	// add base tag in head
	$heads = $doc->getElementsByTagName('head');
	if($heads->length > 0) {
		$baseElement = $doc->createElement('base','');
		$baseElement->setAttribute("href", $raw_url);
		$heads->item(0)->insertBefore($baseElement, $heads->item(0)->firstChild);
	}

	$baseUrl = "http://localhost/OmniChannelDemo/";


	// add js script tag in head
	$bodys = $doc->getElementsByTagName('body');
	if($bodys->length > 0) {
		$jsElement1 = $doc->createElement('script','');
		$jsElement1->setAttribute("src", $baseUrl . "js/ext/jquery-1.11.3.min.js");
		$jsElement2 = $doc->createElement('script','');
		$jsElement2->setAttribute("src", $baseUrl . "js/api.js");
		$jsElement3 = $doc->createElement('script','');
		$jsElement3->setAttribute("src", $baseUrl . "js/website.js");
		$bodys->item(0)->appendChild($jsElement1);
		$bodys->item(0)->appendChild($jsElement2);
		$bodys->item(0)->appendChild($jsElement3);
	}
	return $doc->saveHTML();
}


function cleanHtml($content) {
	$html = $content;

	// Specify configuration
	$config = array(
	           'indent'         => true,
	           'output-xhtml'   => false,
	           'wrap'           => 400);

	// Tidy
	$tidy = new tidy;
	$tidy->parseString($html, $config, 'utf8');
	$tidy->cleanRepair();

	// Output
	return $tidy;
}

function getRequestParameter($parameter) {
	if($_SERVER['REQUEST_METHOD'] == "POST")
		return @$_POST[$parameter];
	else
		return @$_GET[$parameter];
}

function displayEditor($token, $page) {
	$content = getPageFromDatabase($token, $page);
	$config = getConfigFromDatabase($token);


?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title><?php echo $page ." Page of ". $config->general->demoName; ?></title>
  <style type="text/css" media="screen">
    body {
        overflow: hidden;
        background: #333;
    }

    #editor {
        margin: 0;
        position: absolute;
        top: 0px;
        bottom: 40px;
        left: 0;
        right: 0;
        font-size: 16px;
    }

    #control_buttons {
        margin: 0;
        position: absolute;
        bottom: 10px;
        right: 10px;
    }
  </style>
</head>
<body>

<div id="control_buttons">
	<input type="button" value="Undo"/>
	<input type="button" value="Save" onclick="saveContent();"/>
</div>

<div>
<pre>
	<code id="editor"><?php echo htmlentities($content); ?>
	</code>
</pre>
</div>



<script src="../js/ext/ace/ace.js" type="text/javascript" charset="utf-8"></script>
<script src="../js/ext/jquery-1.11.3.min.js" type="text/javascript" charset="utf-8"></script>
<script>
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/html");

    function saveContent() {
    	var token = "<?php echo $token; ?>";
    	var page = "<?php echo $page; ?>";
    	var content = editor.getValue();
    	return $.ajax("./", {
	        type: 'POST',
	        data: {action: "save",token: token, page: page, content: content}
	    } ).done(function() {
	    	alert("Website Saved successfully.");
	    });;
    }

</script>


</body>
</html>

<?php

}







?>

