// this is the only variable in global space allowed
// may be renamed later to advisorScenario
var configScenario = {};
configScenario.currentChannel = "Advisor";
configScenario.maxOffers = 4;
configScenario.selectedCustomer = "";
configScenario.currentOffers = [];
configScenario.currentHistoy = [];


/**
* on document ready
*/
function onAdvisorReady() {
	var token = "";

    if(readTokenFromURL() != undefined) {
        token = readTokenFromURL();
        window.localStorage.omnichanneltoken = token;
    } else {
		token = readToken();
	}

	getConfigurationByToken(token).done(function (config) {
		configScenario = config;
		configScenario.currentChannel = "Advisor";
		configScenario.maxOffers = 4;
		updateAdvisorUI();
	});
}


function onSelectCustomerBtn(element) {
	var customerLogin = $('#inputCustomerLogin').val();
	if(customerLogin == "") return;

	configScenario.selectedCustomer = getCustomerByLogin(customerLogin, configScenario.customers);

	$('#nav_custDetails').addClass("active");
	$('#nav_overview').removeClass("active");
	$('#tab_custDetails').addClass("active");
	$('#tab_overview').removeClass("active");
	
	$('#customerName').val(configScenario.selectedCustomer.firstName + " " + configScenario.selectedCustomer.lastName);
	$('#mobileNumber').val(configScenario.selectedCustomer.mobileNumber);
	$('#lifeStageSegment').val(configScenario.selectedCustomer.lifeStageSegment);
	$('#age').val(configScenario.selectedCustomer.age);
	$('#email').val(configScenario.selectedCustomer.email);
	$('#pictureUrl').attr('src', configScenario.selectedCustomer.pictureUrl);



	$('#bar_analyticsBar1').css("width",configScenario.selectedCustomer.analyticsBar1Value);
	$('#txt_analyticsBar1').text(configScenario.selectedCustomer.analyticsBar1Value);
	$('#analyticsBar1Label').text(configScenario.labels.analyticsBar1Label);

	$('#bar_analyticsBar2').css("width",configScenario.selectedCustomer.analyticsBar2Value);
	$('#txt_analyticsBar2').text(configScenario.selectedCustomer.analyticsBar2Value);
	$('#analyticsBar2Label').text(configScenario.labels.analyticsBar2Label);

	$('#bar_analyticsBar3').css("width",configScenario.selectedCustomer.analyticsBar3Value);
	$('#txt_analyticsBar3').text(configScenario.selectedCustomer.analyticsBar3Value);
	$('#analyticsBar3Label').text(configScenario.labels.analyticsBar3Label);

	$('#bar_analyticsBar4').css("width",configScenario.selectedCustomer.analyticsBar4Value);
	$('#txt_analyticsBar4').text(configScenario.selectedCustomer.analyticsBar4Value);
	$('#analyticsBar4Label').text(configScenario.labels.analyticsBar4Label);

	$('#nav_overview').removeClass('active');
	$('#nav_nba').removeClass('active');
	$('#nav_history').removeClass('active');

	$('#nav_custDetails').addClass('active');

	$('#tab_overview').removeClass('active');
	$('#tab_custDetails').addClass('active');
	
	$('#nav_custDetails').toggle();
	$('#nav_nba').toggle();
	$('#nav_history').toggle();
}

function onClickNavItemNba(element) {
	loadOffers().done(function () {
		displayOffers();
	});
}

function onClickNavItemHistory(element) {
	loadHistory().done(function () {
		displayHistory();
	});	
}

function onResetDemoBtn(element) {
	resetDemo(configScenario.token);
	$('#popupLoadToken').modal('hide');
}

function onLoadConfigurationBtn(element) {
	var token = $('#tokenLoad').val();
	$('#popupLoadToken').modal('hide');
	if(token == "") return;

	loadConfiguration(token);
	
}

function loadConfiguration(token) {
	getConfigurationByToken(token).done(function (config) {
    	configScenario = config;
    	updateAdvisorUI();
    });
}

function updateAdvisorUI() {
	// adding available customers to datalist
	$('#dataList_customers').html('');
	for (i = 0; i < configScenario.customers.length; i++) { 
		$('#dataList_customers').append('<option value="'+ configScenario.customers[i].customerLogin + '">' 
			+ configScenario.customers[i].firstName + ' ' + configScenario.customers[i].lastName + '</option>') ;
	}

	$('#btn_SubmitLabel').html(configScenario.advisorApp.submitBtnAdvisor);
	$('#titleAdvisor').html(configScenario.advisorApp.titleAdvisor);
	$('#tokenLoad').val(configScenario.token);
	$('#offerDetailsAcceptBtnLabel').html(configScenario.labels.acceptBtnAdvisor);
	$('#offerDetailsRejectBtnLabel').html(configScenario.labels.rejectBtnAdvisor);

	$('#analyticsBar1Label').html(configScenario.labels.analyticsBar1Label);
	$('#analyticsBar2Label').html(configScenario.labels.analyticsBar2Label);
	$('#analyticsBar3Label').html(configScenario.labels.analyticsBar3Label);
	$('#analyticsBar4Label').html(configScenario.labels.analyticsBar4Label);
	
}




function showOfferDetails(offerCode) {
	var offer = getOfferByCode(offerCode, configScenario.nba);
	
	$('#offerDetailsLabel').html(offer.offerName);
	$('#offerDetailsDescription').html(offer.offerDesc);
	$('#offerDetailsImage').attr('src', offer.offerImg);

	// set the offerCode as a hidden value
	$('#offerDetailsOfferCode').val(offerCode);

}

function onResponseBtnClick(element, response) {
	//read the offerCode from the hidden value
	var token = readToken();
	var customer =configScenario.selectedCustomer.customerLogin;
	var channel = configScenario.currentChannel;
	var offerCode = $('#offerDetailsOfferCode').val();
	var details = "";
	$('#offerDetailsModal').modal('toggle');  // modal close

	console.log("onResponseBtnClick exeucted");
	respondToOffer(token, customer, offerCode, response, channel, details)
	  .done(function(){
		
		loadOffers().done(function () {
			displayOffers();
		});

		loadHistory().done(function () {
			displayHistory();
		});	
	  });
}

function loadOffers() {
	var token = readToken();
	var customer = configScenario.selectedCustomer.customerLogin;
	var channel = configScenario.currentChannel;
	var maxOffers = configScenario.maxOffers;
	return getOffersForCustomer(token, customer, channel, maxOffers).done(function (offers) {
			console.log("Offers Loaded..."); 
			console.log(offers);
			// store result in currentOffers - but transform response
			configScenario.currentOffers = offers.map(function (offerItem) {
				var offer = getOfferByCode(offerItem.offer, configScenario.nba);
				offer.score = offerItem.score;
				return offer;
			});
		});
	}


function displayOffers() {
	// assume offers are stored in configScenario.currentOffers
	offerList = configScenario.currentOffers;
	stars = 5;

	$('#nbaTbody').html('');
   	for (var i=0; i < offerList.length; i++) {  // eligible offers for customer
   		var offer 			 = offerList[i];
   		var starsNumberValue = stars-i;
   		offerRow = '<tr>'
	   		+'<td width="20%">'
	   		+'<a href="#" onclick="showOfferDetails(\''+ offer.offerCode +'\');" data-toggle="modal" data-target=".bs-example-modal-sm">'
	   		+'<img src="' + offer.offerImg + '" width="200" class="img-thumbnail"></a>'
	   		+'</td>'
	   		+'<td width="80%">'
	   		+'<h4><b>' + offer.offerName + '</b> <img src="./images/'+ starsNumberValue +'starsborder.png"></h4>'
	   		+'<p>' + offer.offerDesc + '</p>'
	   		+'</td><td>' + offer.score + '</td>'
	   		+'</tr>';

   		$('#nbaTbody').append(offerRow);
   	}
}

function loadHistory() {
	var token = readToken();
	var customer = configScenario.selectedCustomer.customerLogin;
	var channel = configScenario.currentChannel;
	return getHistoryForCustomer(token, customer).done(function (historyList) {
			console.log("History Loaded..."); 
			console.log(historyList);
			// store result in currentOffers - but transform response
			//configScenario.currentHistory = historyList;
			configScenario.currentHistory = historyList.map(function (historyItem) {
				var offer = getOfferByCode(historyItem.offerCd, configScenario.nba);
				offer.historyChannel = historyItem.channel;
				offer.historyDate = historyItem.datetime;
				offer.historyType = historyItem.entrytype;
				offer.historyDetails = historyItem.responsedetails;
				offer.historyResponse = historyItem.responsetype;
				return offer;
			});
	});
}


function displayHistory() {
	// assume offers are stored in configScenario.currentOffers
	historyList = configScenario.currentHistory;

	$('#historyTbody').html('');
   	for (var i=0; i < historyList.length; i++) {  // eligible offers for customer
   		var historyItem		= historyList[i];

   		var historyDate     = historyItem.historyDate; 
		var historyType     = historyItem.historyType;
		var historyOffer    = historyItem.offerName;
		var historyChannel  = historyItem.historyChannel;
		var historyCounts   = "";
		var historyResponse = historyItem.historyResponse;

		historyRow = '<tr>'
		    +'<td>'+historyDate+'</td>'
		    +'<td>'+historyType+'</td>'
		    +'<td>'+historyOffer+'</td>'
		    +'<td>'+historyChannel+'</td>'
		    +'<td>'+historyCounts+'</td>'
		    +'<td>'+historyResponse+'</td>'
		    +'</tr>';
		$('#historyTbody').append(historyRow);
   	}
}