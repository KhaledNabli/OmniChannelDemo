
function sendEventToEsp(event) {
	var espServer  = $("#espServer").val();
	var espProject = $("#espProject").val();
	var espQuery   = $("#espQuery").val();
	var espWindow  = $("#espWindow").val();

	var espUrl = "http://" + espServer + ":8081/inject/" + espProject + "/" + espQuery + "/" + espWindow + "?blocksize=1&quiesce=false";

	event.opcode   = "i";
	var eventBlock = [[event]];
	var eventJSON  = JSON.stringify(eventBlock);

	console.log(eventJSON);

	return $.ajax({
		type: "POST",
		url: espUrl,
		contentType : "JSON",
		data: eventJSON})
	.always(function(responseXml, status) {
		console.log(responseXml);
	});
}

function sendEventToESPProxy(proxyUrl, espUrl, eventObject) {
	if(espUrl == "") {
		return;
	}

	espUrl += "?blocksize=1&quiesce=false";

	if(eventObject.opcode == undefined) {
		eventObject.opcode   = "i";
	}
	
	var eventBlock = [[eventObject]];
	var eventJSON  = JSON.stringify(eventBlock);
	
	var proxyRequestData = {espRequestUrl: espUrl, espRequestData: eventJSON};

	return $.post(proxyUrl, proxyRequestData);
}

function processEvent() {	
	var espUrl = "http://" + configScenario.general.demoDescription + 
				":8081/inject/Limit_Management/Threshold_Messaging/New_Txns?blocksize=1&quiesce=false";
	var espPrice   = $("#espAmount").val();
	var espType    = $("#espType").val();
	var espChannel = $("#espChannel").val();

	var newEvent = {};
	newEvent.IndivID 	= parseInt($('#inputCustomerLogin').val());
	newEvent.Type 		= $("#espType").val();
	newEvent.Channel 	= $("#espChannel").val();
	newEvent.Amount 	= parseFloat($("#espAmount").val());
	//sendEventToEsp(newEvent);
	console.log("event to be sent to ESP: " + espUrl);
	console.log(newEvent);

	sendEventToESPProxy("http://dachgpci01.emea.sas.com/ESPServiceAdapter/", espUrl, newEvent);
}