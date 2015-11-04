
var configScenario = "";

function startConfigurator() {
	var tokenFromURL = readTokenFromURL(); // look after # if token is present
    var tokenFromLS = readToken(); // look if token is present in localStorage
    var token = "";


    if(tokenFromURL != undefined && tokenFromURL != "undefined" && tokenFromURL != "") {
        token = tokenFromURL;
    } else if (tokenFromLS != undefined && tokenFromLS != "undefined" && tokenFromLS != "") {
        token = tokenFromLS;
    }

	loadConfiguration(token);
}

function loadConfiguration(token) {
    console.log("load config for token: " + token);
	getConfigurationByToken(token).done(function (config) {
    	configScenario = config;

        if(token != "" && config.token == token) {
            // if token is valid, then save it for later usage
            saveToken(config.token);
        }

    	initConfigurator();
    });
}


function onLoadTokenBtn(element) {
	var token = $('#selectToken').val();
    //var token = $('#selectToken').val().split(' | ')[0];
    if(token != "") {
        saveToken(token);
        loadConfiguration(token);
    }

	$('#popupLoadToken').modal('hide');
}

function onUndoConfigurationBtn(element) {
    var token = configScenario.token;
    console.log("undo all changes for token: " + token);
    if(token != "") {
        saveToken(token);
        loadConfiguration(token);
    }
}

function createChannelLinks(token) {
    var baseUrl = window.location.href.split("OmniChannelDemo")[0];
    baseUrl = baseUrl + 'OmniChannelDemo/';

    if(token != '') {
        var encodedToken = encodeURIComponent(token);
        $('#advisorLink').html(baseUrl + 'AdvisorApp/#' + encodedToken);
        $('#advisorLink').attr('href', baseUrl + 'AdvisorApp/#' + encodedToken);

        $('#mobileLink').html(baseUrl + 'MobileApp/#' + encodedToken);
        $('#mobileLink').attr('href', baseUrl + 'MobileApp/#' + encodedToken);

        $('#websiteLink').html(baseUrl + 'Website/?token=' + encodedToken);
        $('#websiteLink').attr('href', baseUrl + 'Website/?token=' + encodedToken);
    }   
}
/**
*	Init configuration ui
*
*/
function initConfigurator() {

	// console.log("configScenario: " + configScenario);

    createChannelLinks(configScenario.token);

    // setup labels in configurator gui
    initLabels();

	$("#sendSms").prop("checked", checkIfTrue(configScenario.general.sendSms));
	$("#rtdmBackend").prop("checked", checkIfTrue(configScenario.general.rtdmBackend));

	$("#scoreLabel1").html(configScenario.customers[0].firstName);
	$("#scoreLabel2").html(configScenario.customers[1].firstName);

	//$('#token').val(configScenario.token);
	if (!configScenario.token) {
		$("#tokenDiv").hide();
	} else {
		$('#token').html(configScenario.token);
		$("#tokenDiv").show();		
	}

	if (checkIfTrue(configScenario.general.rtdmBackend)) {
		//console.log("true: " + configScenario.general.rtdmBackend);
	    $("#raceServer_form_group").show();
	} else {
		//console.log("false: " + configScenario.general.rtdmBackend);
		$("#raceServer_form_group").hide();
	}

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
                $('#' + property).val(base64_decode(configScenario.web[property]));
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
        	configScenario.nba[i]["maxContacts"],
        	configScenario.nba[i]["customer1Score"], 
        	configScenario.nba[i]["customer2Score"], 
            configScenario.nba[i]["changeScoreByInterest"],
            configScenario.customers[0].firstName, 
            configScenario.customers[1].firstName
            );
    	}
    }


    // set template Code
    var editor = ace.edit("nbaHtmlTemplateEditor");
    editor.setTheme("ace/theme/eclipse");
    editor.getSession().setMode("ace/mode/html");
    editor.setValue(base64_decode(configScenario.web.nbaHtmlTemplate));

    $(".upload-image").off();
    $(".upload-image").on("dblclick", onClickUploadImageField);
    $(".image-preview").off();
    $(".image-preview").on("click", onClickPreviewImage);

} /* end initConfigurator() */

function initLabels() {
    $("#c1bar1Label").html(configScenario.labels.analyticsBar1Label);
    $("#c1bar2Label").html(configScenario.labels.analyticsBar2Label);
    $("#c1bar3Label").html(configScenario.labels.analyticsBar3Label);
    $("#c1bar4Label").html(configScenario.labels.analyticsBar4Label);

    $("#c2bar1Label").html(configScenario.labels.analyticsBar1Label);
    $("#c2bar2Label").html(configScenario.labels.analyticsBar2Label);
    $("#c2bar3Label").html(configScenario.labels.analyticsBar3Label);
    $("#c2bar4Label").html(configScenario.labels.analyticsBar4Label);
}


function onResetConfigurationBtn() {
	window.localStorage.omnichanneltoken = "";
	loadConfiguration("");
	$("#token").html('not yet saved');

    $('#advisorLink').html('Please save your configuration!');
    $('#advisorLink').attr('href', '#');

    $('#mobileLink').html('Please save your configuration!');
    $('#mobileLink').attr('href', '#');

    $('#websiteLink').html('Please save your configuration!');
    $('#websiteLink').attr('href', '#');
	//$("#tokenDiv").hide();
}


function onSaveConfigurationBtn() {

	/*** for-loop to get all fromFields from configurator.html ***/
	for (var property in configScenario.general) {
        if (configScenario.general.hasOwnProperty(property)) {
            if (property)
               configScenario.general[property] = $('#' + property).val();
        }
    }

    for (var property in configScenario.customers[0]) {
		if (configScenario.customers[0].hasOwnProperty(property)) {
            if (property)
                configScenario.customers[0][property] = $('#c1' + property).val();
        }       
    }

    for (var property in configScenario.customers[1]) {
		if (configScenario.customers[1].hasOwnProperty(property)) {
            if (property)
                configScenario.customers[1][property] = $('#c2' + property).val();
        }       
    }

    for (var property in configScenario.labels) {
		if (configScenario.labels.hasOwnProperty(property)) {
            if (property)
                configScenario.labels[property] = $('#' + property).val();
        }       
    }

    for (var property in configScenario.mobileApp) {
		if (configScenario.mobileApp.hasOwnProperty(property)) {
            if (property)
                configScenario.mobileApp[property] = $('#' + property).val();
        }       
    }

    for (var property in configScenario.advisorApp) {
		if (configScenario.advisorApp.hasOwnProperty(property)) {
            if (property)
                configScenario.advisorApp[property] = $('#' + property).val();
        }       
    }

    for (var property in configScenario.web) {
		if (configScenario.web.hasOwnProperty(property)) {
            if (property)
                configScenario.web[property] = base64_encode($('#' + property).val());
        }       
    }

    var editor = ace.edit("nbaHtmlTemplateEditor");
    configScenario.web.nbaHtmlTemplate = base64_encode(editor.getValue());

    /* save grids */
    configScenario.nba 				 			= getNbaRecords();
	configScenario.customers[0].actionHistory   = getHistoryRecords('c1');
	configScenario.customers[1].actionHistory 	= getHistoryRecords('c2');
	configScenario.general.sendSms 			    = getCheckbox('sendSms');
	configScenario.general.rtdmBackend			= getCheckbox('rtdmBackend');

    //console.log (" save config: " + JSON.stringify(configScenario));

    // check if getting NBA records was successful
    if (configScenario.nba != false) {
        // save configuration - call api
        saveConfiguration(JSON.stringify(configScenario)).done(function (config) {
        	configScenario = config;

        	if(configScenario.token != undefined && configScenario.token != "") {
                saveToken(config.token);
                createChannelLinks(config.token);
                $('#token').html(configScenario.token);
            } else {

            }

        	$("#tokenDiv").show();
        });

        /* rebuild the offers table after saving, because images could have been changed */
        clearNbaRecords();
        if(configScenario.nba) {
            for(var i = 0; i < configScenario.nba.length; i++) {
                addNbaRecord(configScenario.nba[i]["offerCode"], 
                configScenario.nba[i]["offerName"], 
                configScenario.nba[i]["offerDesc"],
                configScenario.nba[i]["offerImg"],
                configScenario.nba[i]["offerSms"],
                configScenario.nba[i]["maxContacts"],
                configScenario.nba[i]["customer1Score"], 
                configScenario.nba[i]["customer2Score"], 
                configScenario.nba[i]["changeScoreByInterest"],
                configScenario.customers[0].firstName, 
                configScenario.customers[1].firstName 
                );
            }
        }

        // after saving and rebuilding the offers table, we need to listen again on the double click event
        $(".upload-image").off();
        $(".upload-image").on("dblclick", onClickUploadImageField);
        $(".image-preview").off();
        $(".image-preview").on("click", onClickPreviewImage);

        // setup labels in configurator gui
        initLabels();
    } // endif 
	
    return false;
} /* end saveConfiguration */


/** Next Best Action Functions **/
/******************************/
function clearNbaRecords() {
	$('#configuratorNbaTbody').html("");
}

function addNbaRecord(code,name,desc,img,sms,maxContacts,c1score,c2score,adjustscore, c1name, c2name) {
	//console.log("maxContacts: " + maxContacts);
	if (!code) code = "";
	if (!name) name = "";
	if (!desc) desc = "";
	if (!img) img = "";
	if (!sms) sms = "";
	if (!maxContacts) maxContacts = "";
	if (!c1score) c1score = "";
	if (!c2score) c2score = "";   
    if (!adjustscore) adjustscore = "";
    if (!c1name) c1name = configScenario.customers[0].firstName;
    if (!c2name) c2name = configScenario.customers[1].firstName; 

	/*$('#configuratorNbaTbody').append(
        "<tr><td><div style='padding: 7px 0px'><input name='offerCode' type='text' size=\"4\" value='"+code+"' class='form-control input-md'/></div> </td>"
        +"<td><textarea name='offerName' rows=\"3\" placeholder='Offer Name' class='form-control input-md'>"+name+"</textarea></td>" 
        +"<td><textarea name='offerDesc' rows=\"3\" type='text' placeholder='Description' class='form-control input-md'>"+desc+"</textarea></td>"
        +"<td><textarea name='offerImg' rows=\"3\" type='text' placeholder='Image' class='form-control input-md'>"+img+"</textarea></td>"
        +"<td><textarea name='offerSms' rows=\"3\" type='text' placeholder='SMS' class='form-control input-md'>"+sms+"</textarea></td>"
        +"<td><div style='padding: 7px 0px'><input name='maxContacts' type='text' placeholder='' size=\"4\" value='"+maxContacts+"' class='form-control input-md'/></div></td>"
        +"<td><div style='padding: 7px 0px'><input name='customer1Score' type='text' placeholder='' size=\"4\" value='"+c1score+"' class='form-control input-md'/></div></td>"
        +"<td><div style='padding: 7px 0px'><input name='customer2Score' type='text' placeholder='' size=\"4\" value='"+c2score+"' class='form-control input-md'/></div></td>"
        +"<td><div style='padding: 7px 0px'><input name='changeScoreByInterest' type='text' placeholder='' size=\"4\" value='"+adjustscore+"' class='form-control input-md'/></div></td>"
        +"<td><a onclick='dropRecord(this);' class='pull-right btn btn-danger btn-block'>Delete</a></td></tr>"      
    );*/
    var existingRecords = $('#configuratorNbaTbody').html();

    $('#configuratorNbaTbody').html("<tr>"
        +"<td>"
        +"<div class='form-group'>"
        +"  <label class='col-lg-3 col-sm-3  control-label'>Code</label>"
        +"  <div class='col-lg-9 col-sm-12' >"
        +"    <input name='offerCode' value='"+code+"' type='text' class='form-control'>"
        +"  </div>"
        +"</div>"
        
        +"<div class='form-group'>"
        +"  <label class='col-lg-3 col-sm-3 control-label'>Name</label>"
        +"  <div class='col-lg-9 col-sm-12'>"
        +"    <input name='offerName' value='"+name+"' type='text' class='form-control'>"
        +"  </div>"
        +"</div>"

        +"<div class='form-group'>"
        +"  <label class='col-lg-3 col-sm-8 control-label'>Max Contacts</label>"
        +"  <div class='col-lg-9 col-sm-12 '>"
        +"    <input name='maxContacts' value='"+maxContacts+"' type='number' class='form-control'>"
        +"  </div>"
        +"</div>"
        +"</td>"

        +"<td>"
        +"<div class='form-group'>"
        +"  <label class='col-lg-1 col-sm-2 control-label'>Desc</label>"
        +"  <div class='col-lg-11 col-sm-12'>"
        +"    <input name='offerDesc' value='"+desc+"' type='text' class='form-control'>"
        +"  </div>"
        +"</div>"
        
        +"<div class='form-group'>"
        +"  <label class='col-lg-1 col-sm-2 control-label'>SMS</label>"
        +"  <div class='col-lg-11 col-sm-12'>"
        +"    <input name='offerSms' value='"+sms+"' type='text' class='form-control'>"
        +"  </div>"
        +"</div>"

        +"<div class='form-group'>"
        +"  <label class='col-lg-1 col-sm-2 control-label'>Image</label>"
        +"  <div class='col-lg-11 col-sm-12'>"
        +"    <input name='offerImg' value='"+img+"' type='url' placeholder='*** Please save demo first and double click here to upload image ***' class='form-control upload-image' >"
        +"  </div>"
        +"</div>"
        +"</td>"

        +"<td>"
        +"  <img alt='*** Upload Image and save demo to see preview ***' src='"+img+"' class='img-responsive' style='margin: 0 auto;padding:1px;border-radius:10px;border:1px solid #021a40;'>"
        +"</td>"

        +"<td>"
        +"<div class='form-group'>"
        +"  <label class='col-lg-6 col-sm-12  control-label'>"+c1name+"</label>"
        +"  <div class='col-lg-4 col-sm-12'>"
        +"    <input name='customer1Score' value='"+c1score+"' type='text' class='form-control'>"
        +"  </div>"
        +"</div>"
        
        +"<div class='form-group'>"
        +"  <label class='col-lg-6 col-sm-12 control-label'>"+c2name+"</label>"
        +"  <div class='col-lg-4 col-sm-12'>"
        +"    <input name='customer2Score' value='"+c2score+"' type='text' class='form-control'>"
        +"  </div>"
        +"</div>"

        +"<div class='form-group'>"
        +"  <label class='col-lg-6 col-sm-12 control-label'>Adjust by</label>"
        +"  <div class='col-lg-4 col-sm-12'>"
        +"    <input name='changeScoreByInterest' value='"+adjustscore+"' type='text' class='form-control'>"
        +"  </div>"
        +"</div>"
        +"</td>"

        +"<td><a onclick='dropRecord(this);' class='pull-right btn btn-danger btn-block'>"
        +"    Delete</a>"
        +"</td></tr>"      
    ); 

    $('#configuratorNbaTbody').append(existingRecords);
    $(".upload-image").off();
    $(".upload-image").on("dblclick", onClickUploadImageField);
    $(".image-preview").off();
    $(".image-preview").on("click", onClickPreviewImage);

    return false; 
}

function getNbaRecords() {
	var aNbaRecords = [];

	$('#configuratorNbaTbody tr').each(function() {
		var code 		= $(this).find("input[name='offerCode']").val();
		/*var name        = $(this).find("textarea[name='offerName']").val();     
        var desc        = $(this).find("textarea[name='offerDesc']").val();
        var img         = $(this).find("textarea[name='offerImg']").val();
        var sms         = $(this).find("textarea[name='offerSms']").val();*/
        var name 		= $(this).find("input[name='offerName']").val();		
		var desc 		= $(this).find("input[name='offerDesc']").val();
		var img 		= $(this).find("input[name='offerImg']").val();
		var sms 		= $(this).find("input[name='offerSms']").val();
		var contacts 	= $(this).find("input[name='maxContacts']").val();
		var c1score 	= $(this).find("input[name='customer1Score']").val();
		var c2score 	= $(this).find("input[name='customer2Score']").val();
        var adjustscore     = $(this).find("input[name='changeScoreByInterest']").val();	
        if (code == "" || name == "") {
            alert('You forgot to enter an offer code or name!');
            return false;
        } else {
		    aNbaRecords.unshift({offerCode: code, offerName: name, offerDesc: desc, offerImg: img, offerSms: sms, maxContacts: contacts, customer1Score: c1score, customer2Score: c2score, changeScoreByInterest: adjustscore});
	    }
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
	
	$('#'+prefix+'configuratorActionHistoryTbody').append("<tr>"
		+"<td><div style='padding: 7px 0px'><input name='historyDate' type='date' size=\"4\" placeholder='Date' value='"+date+"' class='form-control input-md'></div></td>"
      	+"<td><textarea name='historyAction' placeholder='Description' class='form-control input-md'>"+action+"</textarea></td>" 
      	+"<td><textarea name='historyChannel' type='text' placeholder='Action' class='form-control input-md'>"+channel+"</textarea></td>"
      	+"<td><textarea name='historyResponse' type='text' placeholder='Action' class='form-control input-md'>"+response+"</textarea></td>"
      	+"<td><a onclick='dropRecord(this);' class='pull-right btn btn-danger btn-block'>Delete</a></td></tr>"		
	); 
    return false; 
}

function getHistoryRecords(prefix) {
	var aHistoryRecords = [];

	$('#'+prefix+'configuratorActionHistoryTbody tr').each(function() {
		var action 		= $(this).find("textarea[name='historyAction']").val();
		var date 		= $(this).find("input[name='historyDate']").val();
		var response 	= $(this).find("textarea[name='historyResponse']").val();
		var channel 	= $(this).find("textarea[name='historyChannel']").val();
		aHistoryRecords.push({historyAction: action, historyDate: date, historyResponse: response, historyChannel: channel});
	});
	return aHistoryRecords;
}

function rtdmCheckboxOnChange(element){
	if (element.checked) {
		$("#raceServer_form_group").show();
	} else {
		$("#raceServer_form_group").hide();
	}
}

function smsCheckboxOnChange(element){
	if (element.checked) {	
	} else {
	}
}

function getCheckbox(elementId) {
	if ($("#"+elementId).prop("checked")) {
		return true;
	} else {
		return false;
	}
}

function checkIfTrue(value) {
	if ( value == true || value == "true" ) {
		return true;
	} 
	return false;
}



function onUploadWebsiteCommitBtn(element) {
    if(readToken() == "") {
        alert("Please save your configuration first.");
        return;
    }
    var page = $('#uploadWebsiteForPage').val();
    var token = window.localStorage.omnichanneltoken;
    var url = $('#uploadUrlInput').val();;
    var options = $("input[name='uploadOptions[]']:checked").map(function(index, item) {return $(item).val();}).toArray();
    $('#popupUploadWebsite').modal('hide');



    return $.ajax("./Website/", {
        type: 'POST',
        data: {action : "upload", token : token, url : url, page : page, uploadOptions: JSON.stringify(options)},
    }).done(function (result) {
        if(result == "") result = "upload successfull";
        $('#websiteInfo-'+page).html(result);
        //console.log("setting #websiteInfo-"+ page + " : " + result);
    });
}

function onUploadWebsiteBtn(page) {
    if(readToken() == "") {
        alert("Please save your configuration first.");
        return;
    }
    $('#uploadWebsiteForPage').val(page);
    $('#popupUploadWebsite').modal('show');

}

function onEditWebsiteBtn(page) {
    if(readToken() == "") {
        alert("Please save your configuration first.");
        return;
    }
    var redirectUrl = "./Website/?token=" + encodeURIComponent(readToken()) + "&action=edit&page=" + page;
    window.open(redirectUrl);
}

function onViewWebsiteBtn(page) {
    if(readToken() == "") {
        alert("Please save your configuration first.");
        return;
    }
    var redirectUrl = "./Website/?token=" + encodeURIComponent(readToken()) + "&action=read&page=" + page;
    window.open(redirectUrl);
}


function onClickUploadImageField(event) {
    var currentToken = readToken();

    if(currentToken == "") {
        alert("Please save your configuration before uploading images.");
        return;
    }
    // we apply a trick here:
    // we register all elements with the class = "upload-image" to call this function on click
    
    // find the element id who was clicked and store the id and css-selector
    var elem = event.currentTarget;
    // if element do not have an id assigned - then assign temporary id
    if(!elem.id || elem.id == "") {
        elem.id = "tempImageUploadId" + Math.ceil(Math.random()*1000000);
    }
    var fieldId = elem.id;
    var fieldSelector = "#" + fieldId;

    // the selector is stored in a hidden field to be used when we upload the picture
    $("#formUploadImage").children("input[name='uploadTriggeredBy']").val(fieldSelector);
    $("#formUploadImage").children("input[name='imageDesc']").val("OmniChannelDemo Token:" + readToken() + " Field:" + fieldSelector);
    // show the modal window
    $('#popupUploadImage').modal('show');
}

function onUploadImageSubmit(elem, e) {
    // upload picture with ajax method
    var formData = new FormData($(elem)[0]);

    $.ajax({
        url: "./images/",
        type: "POST",
        data: formData,
        async: false,
        success: function (result) {
            if(result.status == "success") {
                // when the picture is uploaded, we need to store the url in the field which initiated the upload
                // the field is identified by the selector which is stored in the hidden field (name = uploadTriggeredBy)
                var fieldToUpdate = $(elem).children("input[name='uploadTriggeredBy']").val();
                // update the value of the field with the new url
                $(fieldToUpdate).val(result.imageUrl);
                // hide modal window
                $('#popupUploadImage').modal('hide');
            } else {
                alert(result.message);
            }
        },
        cache: false,
        contentType: false,
        processData: false
    });

    e.preventDefault();
}


function onClickPreviewImage(event) {
    // get element of clicked target
    var elem = event.currentTarget;
    var fieldId = elem.id;
    var fieldSelector = "#" + fieldId;

    // retrieve value of attribute FOR
    var forValue = $(fieldSelector).attr('for');
    // retrieve the label text
    var fieldTitle = $(fieldSelector).text();

    $('#imgPreviewImage').attr('src', $('#' + forValue).val());
    //console.log(" input image field value: " + $('#' + forValue).val());

    $('#modalTitlePreviewImage').text(fieldTitle);

    $('#popupPreviewImage').modal('show');
}




function onLoadExistingDemoBtn() {

    getExistingDemos().done(function (config) {
        for (i = 0; i < config.length; i++) { 
            $('#selectToken').append('<option value="' + config[i].token + '">' + config[i].token + ' | ' + config[i].config_name + ' | ' + config[i].config_desc + ' </option>') ;
        }
    });

    $("#selectToken").select2();

}