var configScenario = {};
configScenario.currentChannel = "Mobile";
configScenario.selectedCustomer = "";
configScenario.currentOffers = [];

/**
* on document ready
*/
function onMobileAppReady() {
	var token = getToken();

	getConfigurationByToken(token).done(function (config) {
		configScenario = config;
		configScenario.currentChannel = "Mobile";
		updateMobileAppUI();
	});
}


function onSelectCustomerBtn(element) {
	var customerLogin = $('#inputCustomerLogin').val();
	if(customerLogin == "") return;

	configScenario.selectedCustomer = getCustomerByLogin(customerLogin, configScenario.customers);

	loadOffers().done(function () {
		displayOffers();
	});	
	window.location.href='#pageOffers';
}


function onLoadConfigurationBtn(element) {
	var token = $('#tokenLoad').val();
	if(token == "") return;
	window.location.href='#pageLogin';
	loadConfiguration(token);
}

function loadConfiguration(token) {
	getConfigurationByToken(token).done(function (config) {
    	configScenario = config;
    	updateMobileAppUI();
    });
}

function updateMobileAppUI() {
	// adding available customers to datalist
	$('#dataList_customers').html('');
	for (i = 0; i < configScenario.customers.length; i++) { 
		$('#dataList_customers').append('<option value="'+ configScenario.customers[i].customerLogin + '">' 
			+ configScenario.customers[i].firstName + ' ' + configScenario.customers[i].lastName + '</option>') ;
	}

	$('#submitBtn').val(configScenario.mobileApp.login_button_text);
	$('#titleMobileApp').html("Mobile App");
	$('#tokenLoad').val(configScenario.token);
	$('#homeBackground').attr('src', configScenario.mobileApp.homescreen_image);
}



function loadOffers() {
	var token = readToken();
	var customer = configScenario.selectedCustomer.customerLogin;
	var channel = configScenario.currentChannel;
	var maxOffers = configScenario.mobileApp.maxOffersMobile;
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
	
	$('#nba_table').html('');

	var countNBO = offerList.length;
  	console.log("[displayOffers] countNBO= " + countNBO);
  	
  	var htmlOfferList = '<ul data-role="listview" id="offerList">';
  	for (var i=0; i<countNBO; i++) {
  		var offer = offerList[i];
   		
  		if ( offer.offerName != "Default Offer" && offer.offerName != null ) {
			console.log("[displayOffers] offerCode=" + offer.offerCode + " offerName=" + offer.offerName);
  				
  			htmlOfferList += "<li><a onclick=\"showOfferDetails('" + offer.offerCode + "');\" >"
	   			+"<img src=\"" + offer.offerImg + "\" height=\"100\" >"
	   			+"<h2>" + offer.offerName + "</h2><p></p></a></li>";	
	   	} else {
			countNBO = countNBO-1;
		}
  	}
  	htmlOfferList += '</ul>';

  	$("#numberOfOffers").html(countNBO);
  	$('#nba_table').html( htmlOfferList ).trigger('create');
  	
  	hideAll();
  	$('#offers').show();
}

function showOfferDetails(offerCode) {
	hideAll();
	$('#offerDetails').toggle( "slide" );
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

	console.log("onResponseBtnClick exeucted");
	respondToOffer(token, customer, offerCode, response, channel, details)
	  .done(function(){
		
		loadOffers().done(function () {
			displayOffers();
		});

	  });
}

function hideAll() {
	$("#header_offers").hide();
	$('#offerDetails').hide();
	$('#offers').hide();
}
