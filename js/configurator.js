
var configScenario = {};

function addNewConfigJsonParameters() {
    if (configScenario.customers[0].prefChannel == undefined) { 
        configScenario.customers[0].prefChannel = "SMS";
    }
    if (configScenario.customers[0].telegramId == undefined) { 
        configScenario.customers[0].telegramId = "0";
    }
    if (configScenario.customers[1].prefChannel == undefined) { 
        configScenario.customers[1].prefChannel = "SMS";
    }
    if (configScenario.customers[1].telegramId == undefined) { 
        configScenario.customers[1].telegramId = "0";
    }
    if (configScenario.mobileApp.colorThemeBar == undefined) { 
        configScenario.mobileApp.colorThemeBar = "#1b4476";
    }
    if (configScenario.mobileApp.colorThemeBarText == undefined) { 
        configScenario.mobileApp.colorThemeBarText = "#FFFFFF";
    }
    if (configScenario.mobileApp.colorThemeButton == undefined) { 
        configScenario.mobileApp.colorThemeButton = "#1b4476";
    }
    if (configScenario.mobileApp.colorThemePage == undefined) { 
        configScenario.mobileApp.colorThemePage = "#FFFFFF";
    }
    if (configScenario.mobileApp.colorThemeText == undefined) { 
        configScenario.mobileApp.colorThemeText = "#1b4476";
    }
    if (configScenario.mobileApp.colorThemeBorder == undefined) { 
        configScenario.mobileApp.colorThemeBorder = "#7C7C7C";
    }
}

function startConfigurator() {
    var token = window.location.href.split("#")[1];
    loadConfiguration(token);
}

function loadConfiguration(token) {
    console.log("Loading Configuration for Token: " + token);
    getConfigurationByToken(token).done(function (config) { onLoadConfigurationDone(config);  });
}

function onLoadConfigurationDone(config) {
    console.log("Loading Configuration for Token: " + config.token + " successfull.");
    if(config.message) {
        alert(config.message);
    }
    configScenario = config;
    base64_decodeProperties(configScenario.web);


    if(config.readOnly == "1") {
        
        configScenario.general.demoDescription = "Copy of " + config.general.demoName;
        configScenario.general.demoName = "";
        configScenario.general.userEmail = "";
        console.log("This Demo is marked as read-only.");
    }

    addNewConfigJsonParameters();

    initConfigurator();
}


function onLoadTokenBtn(element) {
    var token = $('#selectToken').val();
    if(token != "") {
        loadConfiguration(token);
    }
    $('#popupLoadToken').modal('hide');
}

function onUndoConfigurationBtn(element) {
    var token = configScenario.token;
    console.log("undo all changes for token: " + token);
    if(token != "") {
        loadConfiguration(token);
    }
}

function updateTokenDemoLinks() {
    var token = configScenario.token;
    var baseUrl = window.location.href.toLowerCase().split("omnichanneldemo")[0];
    baseUrl = baseUrl + 'OmniChannelDemo/';

    if(token != '') {

        $('.token-display').html("Token: " + configScenario.token);
        

        var encodedToken = encodeURIComponent(token);
        $('a.link2advisorapp').html(baseUrl + 'AdvisorApp/#' + encodedToken);
        $('a.link2advisorapp').attr('href', baseUrl + 'AdvisorApp/#' + encodedToken);

        $('a.link2mobileapp').html(baseUrl + 'MobileApp/#' + encodedToken);
        $('a.link2mobileapp').attr('href', baseUrl + 'MobileApp/#' + encodedToken);

        $('a.link2mobileappnextgen').html(baseUrl + 'MobileAppNextGen/#' + encodedToken);
        $('a.link2mobileappnextgen').attr('href', 
            'javascript:window.open("' 
            + baseUrl + 'MobileAppNextGen/#' + encodedToken
            + '","MobileApp","width=367,height=627")'
            );

        $('a.link2website').html(baseUrl + 'Website/?token=' + encodedToken);
        $('a.link2website').attr('href', baseUrl + 'Website/?token=' + encodedToken);
    }
    else {
        $('.token-display').html("Please save your demo!");

        $('a.link2advisorapp').html("Please save your configuration to get the link to Advisor App");
        $('a.link2advisorapp').attr('href', "#");

        $('a.link2mobileapp').html("Please save your configuration to get the link to Mobile App");
        $('a.link2mobileapp').attr('href', "#");

        $('a.link2mobileappnextgen').html("Please save your configuration to get the link to Mobile App");
        $('a.link2mobileappnextgen').attr('href', "#");

        $('a.link2website').html("Please save your configuration to get the link to Website");
        $('a.link2website').attr('href', "#");
    }

    // set navigation items to point to #token in url
    $("a[onclick]").attr("href", "#" + configScenario.token);
    // set url hash to token
    location.hash = configScenario.token;
}





/**
*	Init configuration ui
*
*/
function initConfigurator() {

    // console.log("configScenario: " + configScenario);

    updateTokenDemoLinks();

    // setup labels in configurator gui
    initLabels();

    $("#sendSms").prop("checked", checkIfTrue(configScenario.general.sendSms));
    $("#rtdmBackend").prop("checked", checkIfTrue(configScenario.general.rtdmBackend));

    $("#scoreLabel1").html(configScenario.customers[0].firstName);
    $("#scoreLabel2").html(configScenario.customers[1].firstName);


    displayObjectElements(configScenario.general, "#");
    displayObjectElements(configScenario.customers[0], "#c1");
    displayObjectElements(configScenario.customers[1], "#c2");
    displayObjectElements(configScenario.labels, "#");
    displayObjectElements(configScenario.mobileApp, "#");
    displayObjectElements(configScenario.advisorApp, "#");
    displayObjectElements(configScenario.web, "#");

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
                configScenario.customers[1].firstName);
        }
    }


    // set template Code
    var editor = ace.edit("nbaHtmlTemplateEditor");
    editor.setTheme("ace/theme/eclipse");
    editor.getSession().setMode("ace/mode/html");
    editor.setValue(configScenario.web.nbaHtmlTemplate);

    $(".upload-image").off();
    $("input.upload-image").on("dblclick", onClickUploadImageField);
    $("input.upload-image").attr("placeholder", "Double click here to upload an image.");
    $(".image-preview").off();
    $(".image-preview").on("click", onClickPreviewImage);
    $(".colorPickerInput").colorpicker();
    $('#mobileColorThemeBar').colorpicker('setValue', configScenario.mobileApp.colorThemeBar);
    $('#mobileColorThemePage').colorpicker('setValue', configScenario.mobileApp.colorThemePage);

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
    loadConfiguration("");
}


function readConfigurationFromUI() {

    /*** for-loop to get all fromFields from configurator.html ***/
    readObjectElements(configScenario.general, "#");
    readObjectElements(configScenario.customers[0], "#c1");
    readObjectElements(configScenario.customers[1], "#c2");
    readObjectElements(configScenario.labels, "#");
    readObjectElements(configScenario.mobileApp, "#");
    readObjectElements(configScenario.advisorApp, "#");

    var editor = ace.edit("nbaHtmlTemplateEditor");
    readObjectElements(configScenario.web, "#");
    configScenario.web.nbaHtmlTemplate = editor.getValue();    

    /* save grids */
    configScenario.nba                          = getNbaRecords();
    configScenario.customers[0].actionHistory   = getHistoryRecords('c1');
    configScenario.customers[1].actionHistory   = getHistoryRecords('c2');
    configScenario.general.sendSms              = getCheckbox('sendSms');
    configScenario.general.rtdmBackend          = getCheckbox('rtdmBackend');
}

function onCopyConfiguration() {

    if(configScenario.token != "") {
        copyConfigurationToNewToken(configScenario.token).done(function (newToken) { loadConfiguration(newToken) });
    } else {
        alert("Here is nothing to copy.");
    }

}





function onSaveConfigurationBtn() {

    readConfigurationFromUI();
    base64_encodeProperties(configScenario.web);

    // add validity checks: required fields:
    if(configScenario.general.demoName.length < 5) {
        alert("Please enter a name for your demo. The current name is too short.");
        return;
    }
    if(configScenario.general.demoDescription.length < 5) {
        alert("Please enter a description for your demo. The current description is too short.");
        return;
    }
    if(configScenario.general.userEmail.length < 5) {
        alert("Please enter your email adress. The current adress is too short.");
        return;
    }
    if (configScenario.nba == false) {
        // TODO: display an error.
        alert("Please enter your offers.");
        return;
    }


    saveConfiguration(JSON.stringify(configScenario)).done(function (config) { onLoadConfigurationDone(config); });

    return;
}


function exportConfiguration() {
    
    readObjectElements(configScenario.general, "#");
    readObjectElements(configScenario.customers[0], "#c1");
    readObjectElements(configScenario.customers[1], "#c2");
    readObjectElements(configScenario.labels, "#");
    readObjectElements(configScenario.mobileApp, "#");
    readObjectElements(configScenario.advisorApp, "#");

    var editor = ace.edit("nbaHtmlTemplateEditor");
    readObjectElements(configScenario.web, "#");
    configScenario.web.nbaHtmlTemplate = editor.getValue();
    base64_encodeProperties(configScenario.web);

    /* save grids */
    configScenario.nba                          = getNbaRecords();
    configScenario.customers[0].actionHistory   = getHistoryRecords('c1');
    configScenario.customers[1].actionHistory   = getHistoryRecords('c2');
    configScenario.general.sendSms              = getCheckbox('sendSms');
    configScenario.general.rtdmBackend          = getCheckbox('rtdmBackend');

    return JSON.stringify(configScenario);
}



/** Next Best Action Functions **/
/******************************/
function clearNbaRecords() {
    $('#configuratorNbaTbody').html("");
}

function onAddNewOffer() {
    addNbaRecord();
}

function onAddNewGeoOffer() {
    addNbaRecord('geo_offer','Geo Offer','This is the geo offer shown on the mobile app','','Hi %FIRSTNAME%. Come into our shop a present is waiting for you!','0','0','0','0','','');
}

function addNbaRecord(code,name,desc,img,sms,maxContacts,c1score,c2score,adjustscore, c1name, c2name) {
    var srcTxt = "";
    if (!code) code = "";
    if (!name) name = "";
    if (!desc) desc = "";
    if (!img) {
        img = "";
        srcTxt = "data-src=\"holder.js/150x200?theme=sky&text=No Image.\"";
    } else {
        srcTxt = "src=\"" + img + "\"";
    }
    if (!sms) sms = "";
    if (!maxContacts) maxContacts = "";
    if (!c1score) c1score = "";
    if (!c2score) c2score = "";   
    if (!adjustscore) adjustscore = "";
    if (!c1name) c1name = configScenario.customers[0].firstName;
    if (!c2name) c2name = configScenario.customers[1].firstName; 


    var existingRecords = $('#configuratorNbaTbody').html();

    $('#configuratorNbaTbody').html("<tr>"
        +"<td>"
        +"  <img "+srcTxt+" class='img-responsive'>"
        +"</td>"

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
        +"<div class='input-group'>"
        +"    <input type='text' value='" + img + "'' class='form-control upload-image' name='offerImg' placeholder='double click here to upload image' >"
        +"    <div class='input-group-addon'><a href='#' onClick='onUploadImageIconClick(this);'><span class='glyphicon glyphicon-cloud-upload'></span></a></div>"
        +"    <div class='input-group-addon'><a href='#' onClick='onPreviewImageIconClick(this);'><span class='glyphicon glyphicon-eye-open'></span></a></div>"
        +"</div>"
        +"  </div>"
        +"</div>"
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

    Holder.run();

    return false; 
}

function getNbaRecords() {
    var aNbaRecords = [];

    $('#configuratorNbaTbody tr').each(function() {
        var code 		= $(this).find("input[name='offerCode']").val();
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



function onUploadWebsiteCommitBtn(element, event) {
    if(configScenario.token == "") {
        alert("Please save your configuration first.");
        return;
    }
    var page = $('#uploadWebsiteForPage').val();
    var token = configScenario.token;
    var url = $('#uploadUrlInput').val();;
    var options = $("input[name='uploadOptions[]']:checked").map(function(index, item) {return $(item).val();}).toArray();

    $("#" + page + "PageUrl").val("loading...");
    $('#popupUploadWebsite').modal('hide');

    event.preventDefault();
    
    return $.ajax("./Website/", {
        type: 'POST',
        data: {action : "upload", token : token, url : url, page : page, uploadOptions: JSON.stringify(options)},
    }).done(function (result) {
        $("#" + page + "PageUrl").val(url);
    });
}

function onUploadWebsiteBtn(page) {
    if(configScenario.token == "") {
        alert("Please save your configuration first.");
        return;
    }
    $('#uploadWebsiteForPage').val(page);
    $('#popupUploadWebsite').modal('show');

}

function onEditWebsiteBtn(page) {
    if(configScenario.token == "") {
        alert("Please save your configuration first.");
        return;
    }
    var redirectUrl = "./Website/?token=" + encodeURIComponent(configScenario.token) + "&action=edit&page=" + page;
    window.open(redirectUrl);
}

function onViewWebsiteBtn(page) {
    if(configScenario.token == "") {
        alert("Please save your configuration first.");
        return;
    }
    var redirectUrl = "./Website/?token=" + encodeURIComponent(configScenario.token) + "&action=read&page=" + page;
    window.open(redirectUrl);
}


function onUploadImageIconClick(iconElem) {
    if(configScenario.token == "") {
        alert("Please save your configuration before uploading images.");
        return;
    }

    var elem = $(iconElem).parent().parent().find("input")[0];
    console.log(elem);

    // if element do not have an id assigned - then assign temporary id
    if(!elem.id || elem.id == "") {
        elem.id = "tempImageUploadId" + Math.ceil(Math.random()*1000000);
    }
    var fieldId = elem.id;
    var fieldSelector = "#" + fieldId;

    console.log("Fieldselector to update later: " + fieldSelector);

    // the selector is stored in a hidden field to be used when we upload the picture
    $("#formUploadImage > div > input[name='uploadTriggeredBy']").val(fieldSelector);
    $("#formUploadImage > div > input[name='imageDesc']").val("T:" + configScenario.token + " : F:" + fieldSelector);
    // show the modal window
    $('#popupUploadImage').modal('show');
}


function onPreviewImageIconClick(iconElem) {
    var elem = $(iconElem).parent().parent().find("input");
    $('#imgPreviewImage').attr('src', elem.val());
    $('#imgPreviewImage').show();
    $('#infoText').html("");
    $('#modalTitlePreviewImage').text("Image Preview");
    $('#popupPreviewImage').modal('show');
}

function onInfoClick(element) {
    if(element == "Channel") {
        $('#infoText').html("You can switch between SMS and Telegram. "
                    + "If you use Telegram, you need to enter your TelegramID. "
                    + "Don't forget to enable the checkbox on General Settings tab! <br>"
                    + "<a href='http://dachgpci01.emea.sas.com/docs/MessagingService/MessagingAPI_Telegram.pptx' target='_blank'>Find some documentation here</a>");
        $('#imgPreviewImage').hide();
        $('#modalTitlePreviewImage').text("Preferred Channel Info");   
    } else if(element == "TelegramId") {
        $('#infoText').html("Enter your TelegramId here. <br>"
                    + "<a href='http://dachgpci01.emea.sas.com/docs/MessagingService/MessagingAPI_Telegram.pptx' target='_blank'>Find documentation here to get your id</a>");
        $('#imgPreviewImage').hide();
        $('#modalTitlePreviewImage').text("Telegram Info");   
    }

    $('#popupPreviewImage').modal('show');
    
}



function onClickUploadImageField(event) {
    if(configScenario.token == "") {
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

    console.log("Fieldselector to update later: " + fieldSelector);

    // the selector is stored in a hidden field to be used when we upload the picture
    $("#formUploadImage > div > input[name='uploadTriggeredBy']").val(fieldSelector);
    $("#formUploadImage > div > input[name='imageDesc']").val("T:" + configScenario.token + " : F:" + fieldSelector);
    // show the modal window
    $('#popupUploadImage').modal('show');
}



function onUploadImageSubmit(elem,event) {
    // upload picture with ajax method

    var formData = new FormData($(elem)[0]);

    $.ajax({
        url: "./images/",
        type: "POST",
        data: formData,
        async: false,
        cache: false,
        contentType: false,
        processData: false,
        success: function (result) {
            if(result.status == "success") {
                // when the picture is uploaded, we need to store the url in the field which initiated the upload
                // the field is identified by the selector which is stored in the hidden field (name = uploadTriggeredBy)
                var fieldToUpdate = $("#formUploadImage > div > input[name='uploadTriggeredBy']").val();
                // update the value of the field with the new url
                console.log("Field to update: " + fieldToUpdate);
                $(fieldToUpdate).val(result.imageUrl);
                // hide modal window
                $('#popupUploadImage').modal('hide');
            } else {
                alert(result.message);
            }
        }
    });

    event.preventDefault();
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
    var existingDemosList = [];
    return getExistingDemos().done(function (existingDemos) {
        existingDemosList = existingDemos.map(function (item) {
            var id = item.token;
            var text =  item.config_name + " (Token: "+ item.token + " )";
            return {id: id, text: text};
        });

        $("#selectToken").select2({
            data: existingDemosList
        });

        $('#popupLoadToken').modal('show');
    });
}


function onRestartDemoBtn() {
    return resetDemo(configScenario.token);
}

/**
*   Display elements of object in DOM.
*   Properties: Object or Array
*   selectorPrefix: Prefix for CSS selector.
*/
function displayObjectElements(properties, selectorPrefix) {
    for (var property in properties) {
        $(selectorPrefix + property).val(properties[property]);
    }
}

/**
*   Read elements from DOM and save in Object.
*   Properties: Object or Array
*   selectorPrefix: Prefix for CSS selector.
*/
function readObjectElements(properties, selectorPrefix) {
    for (var property in properties) {
        // if element doesnt exist, do not override value.
        var selectedElements = $(selectorPrefix + property);

        if( selectedElements.length == 1) {
            properties[property] = selectedElements.val();

        } else if ( selectedElements.length > 1 ) {
            console.log("Warning: readObjectElements is pointing to an selector: " + selectorPrefix + property + ", which is not unique. Counting: " + selectedElements.length);

        } else {
            console.log("Note: readObjectElements is pointing to an selector: " + selectorPrefix + property + ", which does not exist.");
        }
    }
}

