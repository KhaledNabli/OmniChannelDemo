var configScenario = {};
configScenario.currentChannel = "Mobile";
configScenario.selectedCustomer = "";
configScenario.currentOffers = [];
var map;

/**
* on document ready
*/
function onMobileAppReady() {
	var token = getToken();
	console.log("onMobileAppReady getToken: " + token);

	getConfigurationByToken(token).done(function (config) {
		configScenario = config;
		configScenario.currentChannel = "Mobile";
		console.log("maxOffers from config " + token + ": " + configScenario.mobileApp.maxOffersMobile);
		updateMobileAppUI();
	});
}

function updateMobileAppUI() {
	// add listeners on map move (drag and drop)
	
	//google.maps.event.addListener(marker, 'dragend', function() { alert('marker dragged'); } );

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
	$('#titleMobileApp').html('Mobile App');
	$('#submitBtn').html(configScenario.mobileApp.login_button_text);	
	$("body").css("overflow", "hidden");
}

function onResetDemoBtn(element) {
	console.log("reset demo for token " + configScenario.token);
	resetDemo(configScenario.token);
	window.location.href='#';
	onNavHomeBtn();
	$('#navHome').removeClass('ui-btn-active');
	$('#navLogin').removeClass('ui-btn-active');
	$('#navOffer').removeClass('ui-btn-active');
}

function onNavLoginBtn(element) {
	$('#titleMobileApp').html('Login');
	$('#homePage').hide();
	$('#offerPage').hide();
	$('#offerDetails').hide();
	$('#mapPage').hide();
	slidePage('#loginPage', 'right');
}

function onNavMapBtn(element) {
	$('#titleMobileApp').html(configScenario.mobileApp.title_geo_offer_panel);
	$('#homePage').hide();
	$('#offerPage').hide();
	$('#offerDetails').hide();
	$('#loginPage').hide();
	$('#mapPage').show();

	// get Geo Offer Information
	$('#imgGeoOffer').attr('src', getOfferImageByCode('geo_offer',configScenario.nba));
	$('#titleGeoOffer').html(getOfferNameByCode('geo_offer',configScenario.nba));
	console.log('getOfferImage: ' + getOfferImageByCode('geo_offer',configScenario.nba));

	var defaultLatLng = new google.maps.LatLng(
		configScenario.mobileApp.geo_latitude, configScenario.mobileApp.geo_longtitude);

	if ( navigator.geolocation ) {
		function success(pos) {
			// Location found
			drawMap(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
		}
		function fail(error) {
			drawMap(defaultLatLng);// Failed to find location, show default map
		}
		// Find the users current position.  Cache the location for 5 minutes, timeout after 6 seconds
		navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000, enableHighAccuracy:true, timeout: 6000});
	} else {
		drawMap(defaultLatLng);// No geolocation support, show default map
	}
}

function onNavHomeBtn(element) {
	$('#titleMobileApp').html('Mobile App');
	slidePage('#homePage', 'left')
	$('#loginPage').hide();
	$('#offerPage').hide();
	$('#offerDetails').hide();
	$('#mapPage').hide();
}

function onNavOfferBtn(element) {
	//$('#titleMobileApp').html(configScenario.mobileApp.title_offer_panel);
	$('#titleMobileApp').html('Offers');
	$('#homePage').hide();
	$('#loginPage').hide();
	$('#offerDetails').hide();
	$('#mapPage').hide();
	slidePage('#offerPage', 'right');
}

function onSelectCustomerBtn(element) {
	var customerLogin = $('#inputCustomerLogin').val();
	if(customerLogin == "") return;

	configScenario.selectedCustomer = getCustomerByLogin(customerLogin, configScenario.customers);

	loadOffers().done(function () {
		displayOffers();
	});	

	onNavOfferBtn();
	$('#navOffer').addClass('ui-btn-active');
	$('#navHome').removeClass('ui-btn-active');
	$('#navLogin').removeClass('ui-btn-active');

	changeHeaderNavButton('navIconLeft','ui-icon-bars','$("#leftPanel").panel("open");');
}


function onLoadConfigurationBtn(element) {
	var token = $('#tokenLoad').val();
	if(token == "") return;
	window.location.href='#';
	loadConfiguration(token);
}

function loadConfiguration(token) {
	getConfigurationByToken(token).done(function (config) {
    	configScenario = config;
    	updateMobileAppUI();
    });
}

function loadOffers() {
	var token = readToken();
	var customer = configScenario.selectedCustomer.customerLogin;
	var channel = configScenario.currentChannel;
	var maxOffers = configScenario.mobileApp.maxOffersMobile;
	return getOffersForCustomer(token, customer, channel, maxOffers, true).done(function (offers) {
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
  	$('#titleMobileApp').html(countNBO + ' Top Offers');
  	
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
  	slidePage('#offerPage', 'up');
}

function changeHeaderNavButton(elementid, icon, onClickFunction) {
	$('#' + elementid).removeClass('ui-icon-bars');
	$('#' + elementid).removeClass('ui-icon-carat-l');
	$('#' + elementid).removeClass('ui-icon-carat-r');

	$('#' + elementid).addClass(icon);
	$('#' + elementid).attr('onclick', onClickFunction);
}

function showOfferDetails(offerCode) {
	hideAll();
	changeHeaderNavButton('navIconLeft','ui-icon-carat-l','onSelectCustomerBtn(this);');

	$('#offerDetails').toggle( );
	var offer = getOfferByCode(offerCode, configScenario.nba);
	
	$('#offerDetailsLabel').html(offer.offerName);
	$('#offerDetailsDescription').html(offer.offerDesc);
	$('#offerDetailsImage').attr('src', offer.offerImg);

	// set the offerCode as a hidden value
	$('#offerDetailsOfferCode').val(offerCode);

	// track response of offer details click 
	var token = readToken();
	var customer =configScenario.selectedCustomer.customerLogin;
	var channel = configScenario.currentChannel;
	var details = "";
	respondToOffer(token, customer, offerCode, "show interest", channel, details)
	  .done(function(){
	});

}

function onResponseBtnClick(element, response) {
	changeHeaderNavButton('navIconLeft','ui-icon-bars','$("#leftPanel").panel("open");');

	//read the offerCode from the hidden value
	var token = readToken();
	var customer =configScenario.selectedCustomer.customerLogin;
	var channel = configScenario.currentChannel;
	var offerCode = $('#offerDetailsOfferCode').val();
	var details = "";

	console.log("onResponseBtnClick exeucted");
	respondToOffer(token, customer, offerCode, response, channel, details)
	  .done(function(){
		slidePage('#offerDetails', 'right', 'hide');

		loadOffers().done(function () {
			displayOffers();
		});

	  });
}

function onGeoResponseBtnClick(element, response) {
	changeHeaderNavButton('navIconLeft','ui-icon-bars','$("#leftPanel").panel("open");');

	//read the offerCode from the hidden value
	var token = readToken();
	var customer = $('#inputCustomerLogin').val();
	//var customer = configScenario.selectedCustomer.customerLogin;
	var channel = 'Geolocation';
	var offerCode = 'geo_offer';
	var details = "";

	console.log("onGeoResponseBtnClick exeucted" + token +" "+ customer +" "+ offerCode +" "+ response +" "+ channel );
	respondToOffer(token, customer, offerCode, response, channel, details)
	  .done(function(){
	  	// do nothing
	  });
}

function hideAll() {
	$('#offerDetails').hide();
	$('#offerPage').hide();
}

function slidePage(pageId, direction, type) {
	var effect = 'slide';
    // Set the options for the effect type chosen
    var options = { direction: direction };

    // Set the duration (default: 400 milliseconds)
    var duration = 400;
    if(type == "hide") {
    	$(pageId).hide(effect, options, duration); 
	} else {
    	$(pageId).show(effect, options, duration);
    }
}


function drawMap(latlng) {
	var myOptions = {
		zoom: parseInt(configScenario.mobileApp.geo_zoom),
		center: latlng,
		mapTypeControl: false,
		zoomControl: false,
		streetViewControl: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("mapPageInner"), myOptions);
	
	google.maps.event.addListener(map, 'dragend', function() { 
		$('#mapLatPosition').html('' + map.getCenter().lat());
		$('#mapLngPosition').html('' + map.getCenter().lng()); 
	} );
	// Add an overlay to the map of current lat/lng
	var marker = new google.maps.Marker({
		position: latlng,
		draggable: true,
		icon: configScenario.mobileApp.map_pin_image,
    	animation: google.maps.Animation.DROP,
		map: map,
		title: "Greetings!"
	});
}
