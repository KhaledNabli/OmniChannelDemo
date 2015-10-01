
var configScenario = "";

function startConfigurator() {
	console.log("startConfigurator");
	var dataProviderUrl = "api/config.json";

	$.ajax({
		url: "api",
		data: { action: 'getConfig' }, 
		dataType: 'json',
  		success: function (jsonData) {
  			//var myObj = {data};
  			configScenario = jsonData;
  			//console.log(myObj);
  			//console.log("returned jsonData: \n" + JSON.stringify(jsonData));
  			initConfigurator();
  		}
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
		console.log("property: " +property);
		if (configScenario.general.hasOwnProperty(property)) {
            if (property)
                $('#' + property).val(configScenario.general[property]);
        }       
    }

    for (var property in configScenario.customers[0]) {
		console.log("property: " +property);
		if (configScenario.customers[0].hasOwnProperty(property)) {
            if (property)
                $('#c1' + property).val(configScenario.customers[0][property]);
        }       
    }

    for (var property in configScenario.customers[1]) {
		console.log("property: " +property);
		if (configScenario.customers[1].hasOwnProperty(property)) {
            if (property)
                $('#c2' + property).val(configScenario.customers[1][property]);
        }       
    }

    clearNbaRecords();
    if(configScenario.nba) {
    	for(var i = 0; i < configScenario.nba.length; i++) {
        	addNbaRecord(configScenario.nba[i]["offerCode"], 
        	configScenario.nba[i]["offerName"], 
        	configScenario.nba[i]["offerDesc"],
        	configScenario.nba[i]["offerImg"],
        	configScenario.nba[i]["offerSMS"],
        	configScenario.nba[i]["customer1Score"], 
        	configScenario.nba[i]["customer2Score"] );
    	}
    }
}


/** Next Best Action Functions **/
/******************************/
function clearNbaRecords() {
	$('#configuratorNbaTbody').html("");
}

function addNbaRecord(code,name,desc,img,sms,c1score,c2score) {
	if (!code) code = "";
	if (!name) name = "";
	if (!desc) desc = "";
	if (!img) img = "";
	if (!sms) sms = "";
	if (!c1score) c1score = "";
	if (!c2score) c2score = "";

	$('#configuratorNbaTbody').append(
		"<tr><td><div style='padding: 7px 0px'><input name='offerCode' type='text' placeholder='code' size=\"4\" value='"+code+"' class='form-control input-md'/></div> </td>"
		+"<td><textarea name='offerName' 		 placeholder='Offer Name' class='form-control input-md'>"+name+"</textarea></td>" 
      	+"<td><textarea name='offerDesc'      type='text' placeholder='Description' class='form-control input-md'>"+desc+"</textarea></td>"
      	+"<td><textarea name='offerImg'      type='text' placeholder='Image' class='form-control input-md'>"+img+"</textarea></td>"
      	+"<td><textarea name='offerSMS'      type='text' placeholder='SMS' class='form-control input-md'>"+sms+"</textarea></td>"
      	+"<td><div style='padding: 7px 0px'><input name='c1score' type='text' placeholder='ID' size=\"4\" value='"+c1score+"' class='form-control input-md'/></div></td>"
      	+"<td><div style='padding: 7px 0px'><input name='c2score' type='text' placeholder='ID' size=\"4\" value='"+c2score+"' class='form-control input-md'/></div></td>"
      	+"<td><a onclick='dropRecord(this);' class='pull-right btn btn-danger btn-block'>Delete Row</a></td></tr>"		
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