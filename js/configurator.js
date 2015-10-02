
var configScenario = "";

function startConfigurator() {
	console.log("startConfigurator");
	var token = "";

	if(window.localStorage.omnichanneltoken) {
		token = window.localStorage.omnichanneltoken;
	} else {
		token = "";
	}

	callApi({action: 'getConfig', token: token}).done(function (jsonData) {
    	console.log("Loading Data done." + JSON.stringify(jsonData));
    	configScenario = jsonData;
    	initConfigurator();
    });

	console.log("end startConfigurator");
}

/**
*	Init configuration ui
*
*/
function initConfigurator() {

	console.log("configScenario: " + configScenario);

	$('#token').val(configScenario.token);

	for (var property in configScenario.general) {
		if (configScenario.general.hasOwnProperty(property)) {
            if (property)
                $('#' + property).val(configScenario.general[property]);
        }       
    }

    for (var property in configScenario.customers[0]) {
		if (configScenario.customers[0].hasOwnProperty(property)) {
            if (property)
                $('#c1' + property).val(configScenario.customers[0][property]);
        }       
    }

    for (var property in configScenario.customers[1]) {
		if (configScenario.customers[1].hasOwnProperty(property)) {
            if (property)
                $('#c2' + property).val(configScenario.customers[1][property]);
        }       
    }

    for (var property in configScenario.labels) {
		if (configScenario.labels.hasOwnProperty(property)) {
            if (property)
                $('#' + property).val(configScenario.labels[property]);
        }       
    }

    for (var property in configScenario.mobileApp) {
		if (configScenario.mobileApp.hasOwnProperty(property)) {
            if (property)
                $('#' + property).val(configScenario.mobileApp[property]);
        }       
    }

    for (var property in configScenario.advisorApp) {
		if (configScenario.advisorApp.hasOwnProperty(property)) {
            if (property)
                $('#' + property).val(configScenario.advisorApp[property]);
        }       
    }

    for (var property in configScenario.web) {
		if (configScenario.web.hasOwnProperty(property)) {
            if (property)
                $('#' + property).val(configScenario.web[property]);
        }       
    }


	clearHistoryRecords('c1');
    if(configScenario.customers[0].actionHistory) {
    	for(var i = 0; i < configScenario.customers[0].actionHistory.length; i++) {
        	addHistoryRecord('c1',
        		configScenario.customers[0].actionHistory[i]["historyDate"], 
        		configScenario.customers[0].actionHistory[i]["historyAction"], 
        		configScenario.customers[0].actionHistory[i]["historyChannel"],
        		configScenario.customers[0].actionHistory[i]["historyResponse"] );
    	}
    }

    clearHistoryRecords('c2');
    if(configScenario.customers[1].actionHistory) {
    	for(var i = 0; i < configScenario.customers[1].actionHistory.length; i++) {
        	addHistoryRecord('c2',
        		configScenario.customers[1].actionHistory[i]["historyDate"], 
        		configScenario.customers[1].actionHistory[i]["historyAction"], 
        		configScenario.customers[1].actionHistory[i]["historyChannel"],
        		configScenario.customers[1].actionHistory[i]["historyResponse"] );
    	}
    }


    clearNbaRecords();
    if(configScenario.nba) {
    	for(var i = 0; i < configScenario.nba.length; i++) {
        	addNbaRecord(configScenario.nba[i]["offerCode"], 
        	configScenario.nba[i]["offerName"], 
        	configScenario.nba[i]["offerDesc"],
        	configScenario.nba[i]["offerImg"],
        	configScenario.nba[i]["offerSms"],
        	configScenario.nba[i]["customer1Score"], 
        	configScenario.nba[i]["customer2Score"] );
    	}
    }
}



function callApi(parameters) {
	return $.ajax("api/", {
        type: 'POST',
        data: parameters
    } );
}


function saveConfiguration() {
	console.log("Saving Config");

	/*** for-loop to get all fromFields from configurator.html ***/
	/*for (var property in configScenario.formFields) {
        if (configScenario.formFields.hasOwnProperty(property)) {
            if (property && $('#' + property + "Input").val())
               configScenario.formFields[property] = $('#' + property + "Input").val();
        }
    }*/

    callApi({action: 'saveConfig', config: JSON.stringify(configScenario)}).done(function (jsonData) {
    	console.log("Savin Data done." + JSON.stringify(jsonData));
    	configScenario = jsonData;
    	$('#token').val(configScenario.token);
    	/* save generated token from server into local storage of browser */
    	window.localStorage.omnichanneltoken = configScenario.token;
    });
	
    return false;
}


/** Next Best Action Functions **/
/******************************/
function clearNbaRecords() {
	$('#configuratorNbaTbody').html("");
}

function addNbaRecord(code,name,desc,img,sms,c1score,c2score) {
	console.log("offerSms: " + sms);
	if (!code) code = "";
	if (!name) name = "";
	if (!desc) desc = "";
	if (!img) img = "";
	if (!sms) sms = "";
	if (!c1score) c1score = "";
	if (!c2score) c2score = "";

	$('#configuratorNbaTbody').append(
		"<tr><td><div style='padding: 7px 0px'><input name='offerCode' type='text' placeholder='code' size=\"4\" value='"+code+"' class='form-control input-md'/></div> </td>"
		+"<td><textarea name='offerName' rows=\"3\" placeholder='Offer Name' class='form-control input-md'>"+name+"</textarea></td>" 
      	+"<td><textarea name='offerDesc' rows=\"3\" type='text' placeholder='Description' class='form-control input-md'>"+desc+"</textarea></td>"
      	+"<td><textarea name='offerImg' rows=\"3\" type='text' placeholder='Image' class='form-control input-md'>"+img+"</textarea></td>"
      	+"<td><textarea name='offerSms' rows=\"3\" type='text' placeholder='SMS' class='form-control input-md'>"+sms+"</textarea></td>"
      	+"<td><div style='padding: 7px 0px'><input name='c1score' type='text' placeholder='ID' size=\"4\" value='"+c1score+"' class='form-control input-md'/></div></td>"
      	+"<td><div style='padding: 7px 0px'><input name='c2score' type='text' placeholder='ID' size=\"4\" value='"+c2score+"' class='form-control input-md'/></div></td>"
      	+"<td><a onclick='dropRecord(this);' class='pull-right btn btn-danger btn-block'>Delete</a></td></tr>"		
	); 
    return false; 
}

function getNbaRecords() {
	var aNbaRecords = [];

	$('#configuratorNbaTbody tr').each(function() {
		var id 		 	= $(this).find("input[name='nbaID']").val();
		var desc 		= $(this).find("textarea[name='nbaName']").val();
		var detailImg 	= $(this).find("textarea[name='nbaImage']").val();
		var propensity 	= $(this).find("input[name='nbaPropensity']").val();		
		aNbaRecords.push({id: id, desc: desc, detailImg: detailImg, propensity: propensity});
	});
	return aNbaRecords;
}

function dropRecord(object) {
	var tr = $(object).closest('tr');
    tr.remove();

}


/** Action History Functions **/
/******************************/
function clearHistoryRecords(prefix) {
	$('#'+prefix+'configuratorActionHistoryTbody').html("");
}

function addHistoryRecord(prefix,date,action,channel,response) {
	if (!date) date = "";
	if (!action) action = "";
	if (!channel) channel = "";
	if (!response) response = "";
	
	$('#'+prefix+'configuratorActionHistoryTbody').append(
		"<tr><td><textarea name='historyAction' placeholder='Description' class='form-control input-md'>"+action+"</textarea></td>" 
      	+"<td><div style='padding: 7px 0px'><input name='historyDate' type='date' size=\"4\" placeholder='Date' value='"+date+"' class='form-control input-md'></div></td>"
      	+"<td><textarea name='historyResponse' type='text' placeholder='Action' class='form-control input-md'>"+response+"</textarea></td>"
      	+"<td><textarea name='historyChannel' type='text' placeholder='Action' class='form-control input-md'>"+channel+"</textarea></td>"
      	+"<td><a onclick='dropRecord(this);' class='pull-right btn btn-danger btn-block'>Delete</a></td></tr>"		
	); 
    return false; 
}

function getHistoryRecords(prefix) {
	var aHistoryRecords = [];

	$('#'+prefix+'configuratorActionHistoryTbody tr').each(function() {
		var id 		 	 = $(this).find("input[name='historyID']").val();
		var desc 		 = $(this).find("textarea[name='historyDescription']").val();
		var responsedate = $(this).find("input[name='historyDate']").val();
		var response 	 = $(this).find("textarea[name='historyResponse']").val();
		aHistoryRecords.push({id: id, desc: desc, responseDate: responsedate, response: response});
	});
	return aHistoryRecords;
}
