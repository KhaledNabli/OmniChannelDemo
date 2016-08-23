
var configScenario = {};
var map = {};

function onMobileAppReady() {
	swipeDetection();

	// token could be in form of AP%2BEMcxz (AP+EMcxz) we need to apply decodeURI when ever we read from URL.
	var token = decodeURIComponent(location.href.split("#")[1]);
	
	console.log("onMobileAppReady getToken: " + token);

	getConfigurationByToken(token).done(function (config) {
		configScenario = config;
		configScenario.currentChannel = "Mobile";
		configScenario.currentPageName = "Login";
		configScenario.loggedIn = "false";
		console.log("maxOffers from config " + token + ": " + configScenario.mobileApp.maxOffersMobile);
		updateMobileAppUI();
	});

}

function swipeDetection() {

	$(".page").on("swipeleft",function(element){
			var animation = "SwipeLeft";
            elementId = $(element.currentTarget).attr('id');
            console.log("left swipe detected on " + elementId);
            if (elementId == "pageHome") {
            	onNavItemClick('Offers', animation);
            } else if (elementId == "leftPane") {
				closePane('left');
            } else if (elementId == "pageOffers") {
				onNavItemClick('Ewallet', animation);
            } else if (elementId == "pageEwallet") {
				onNavItemClick('Geo', animation);
            } else if (elementId == "pageGeo") {
				onNavItemClick('Payment', animation);
            }
          });

	$(".page").on("swiperight",function(element){
			var animation = "SwipeRight";
            elementId = $(element.currentTarget).attr('id');
            console.log("right swipe detected on " + elementId);
            if (["pageLogin","pageHome"].includes(elementId) == true) {
            	openPane('left');
            } else if (elementId == "rightPane") {
				closePane('right');
            } else if (elementId == "pageOffers") {
				onNavItemClick('Home', animation);
			} else if (elementId == "pageOfferDetails") {
				onNavItemClick('Offers', animation);
			} else if (elementId == "pageEwalletDetails") {
				onNavItemClick('Ewallet', animation);
            } else if (elementId == "pageEwallet") {
				onNavItemClick('Offers', animation);
            } else if (elementId == "pageGeo") {
				onNavItemClick('Ewallet', animation);
            } else if (elementId == "pagePayment") {
				onNavItemClick('Geo', animation);
            }
          });
}

function updateMobileAppUI() {
	// set theme color
	setThemeColor(configScenario.mobileApp.colorThemePage,   "page");
	setThemeColor(configScenario.mobileApp.colorThemeBar,    "bar");
	setThemeColor(configScenario.mobileApp.colorThemeBarText,"bar-text");
	setThemeColor(configScenario.mobileApp.colorThemeButton, "button");
	setThemeColor(configScenario.mobileApp.colorThemeText,   "text-theme");
	setThemeColor(configScenario.mobileApp.colorThemeBorder, "border-theme");
	
	if (configScenario.mobileApp.homescreen_image != "") {
		$('.pageBackgroundImage').css("background-image","url('"+configScenario.mobileApp.homescreen_image+"')");
	}
	
	$('#titleMobileApp').html(configScenario.mobileApp.title_mobile_app);
	$('#submitBtn').html(configScenario.mobileApp.login_button_text);
	$('#appleTouchIcon').attr('href', configScenario.mobileApp.appIcon_image);
	$('#shortcutIcon').attr('href', configScenario.mobileApp.appIcon_image);
	$('#inputCustomerLogin').val(configScenario.customers[0].customerLogin);

	var markerLatLng = new google.maps.LatLng(
		configScenario.mobileApp.geo_latitude, 
		configScenario.mobileApp.geo_longtitude);

	var LatLng = new google.maps.LatLng(
		parseFloat(configScenario.mobileApp.geo_latitude)+0.002, 
		parseFloat(configScenario.mobileApp.geo_longtitude)-0.002);

	google.maps.event.addDomListener(window, 'load', drawMap(LatLng,markerLatLng));
}

function onNavItemClick(navToPageName, animation) {

	var idPrevPage = "page" + configScenario.currentPageName;
	var idNextPage = "page" + navToPageName;
	var navIconPosition = "";

	// if you click on same nav icon again - do nothing
	if (idPrevPage == idNextPage) {
		return;
	}

	//fill navigation History Array
	configScenario.mobileApp.navHistory.push(navToPageName);
	console.log(configScenario.mobileApp.navHistory);

	if (animation == "SwipeLeft" || animation == "SwipeRight") {
	} else {
		if (navToPageName == "Home" || navToPageName == "Offers") {
			animation = "ShowUpLeft";
		} else if (navToPageName == "Geo" || navToPageName == "Payment") {
			animation = "ShowUpRight";
		} else {
			animation = "ShowUpCenter";
		}
	}  	
	appear(idNextPage, idPrevPage, animation);	
	
	$("#nav"  + configScenario.currentPageName).removeClass("active");
	$("#nav" + navToPageName).addClass("active");
	
	// set global page variable to new page name
	configScenario.currentPageName = navToPageName;
	google.maps.event.trigger(map, 'resize');

	console.log("navToPageName: " + navToPageName);
	if (navToPageName == 'Ewallet') {
		loadHistory().done(function () {
			displayWallet();
		});
	} else if (navToPageName == 'Offers') {
		loadOffers().done(function () {
			displayOffers();
		});
	}
}

function appear(page, prevpage, animation) {
	var animationClass = "animate" + animation;
	var page = "#" + page;
	var prevpage = "#" + prevpage;
	
	$(page).removeClass("hidePage");
	$(page).addClass(animationClass);
	
	$(page).on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(e){
		console.log("hide page: " + prevpage);
		$(prevpage).addClass("hidePage");
		removeAnimations();
  	});
}

function openPane(element) {
	var pane = "#" + element + "Pane";
	$(pane).removeClass(element + 'PaneClose');
	$(pane).addClass(element + 'PaneOpen');
}

function closePane(element) {
	var pane = "#" + element + "Pane";
	$(pane).removeClass(element + 'PaneOpen');
	$(pane).addClass(element + 'PaneClose');
}

function onResetDemoButtonClick() {
	resetDemo(configScenario.token);
	location.reload();
}

function onBackButtonClick() {
	configScenario.mobileApp.navHistory.pop();
	var backToPage = configScenario.mobileApp.navHistory.pop();
	var animation = "SwipeRight";
	onNavItemClick(backToPage, animation);
}

function onSubmitButtonClick() {
	configScenario.mobileApp.navHistory = Array();
	configScenario.mobileApp.navHistory.push("Home");
	configScenario.loggedIn = "true";
	var customerLogin = $('#inputCustomerLogin').val();
	if(customerLogin == "") return;

	configScenario.selectedCustomer = getCustomerByLogin(customerLogin, configScenario.customers);

	loadOffers().done(function () {
		displayOffers();
	});	

	$('#custName').html(configScenario.selectedCustomer.firstName + ' ' + configScenario.selectedCustomer.lastName);
	$('#imgCustomer').attr("src",configScenario.selectedCustomer.pictureUrl);
	$('#custMobile').val(configScenario.selectedCustomer.mobileNumber);
	$('#custEmail').val(configScenario.selectedCustomer.email);
	$('#custAge').val(configScenario.selectedCustomer.age);

	$('#footerNavBar').toggle();
	$('#footerNavBarHome').toggle();

	onNavItemClick('Home', 'ShowUpCenter');
}

function onLogoutButtonClick() {
	configScenario.loggedIn = "false";
	removeAnimations();
	$('#badgeNumberOfOffers').hide();
	$('#footerNavBarHome').show();
	$('#footerNavBar').hide();
	onNavItemClick('Login');
}

function loadOffers() {
	var token = configScenario.token;
	var customer = configScenario.selectedCustomer.customerLogin;
	var channel = configScenario.currentChannel;
	var maxOffers = configScenario.mobileApp.maxOffersMobile;
	return getOffersForCustomer(token, customer, channel, maxOffers, true).done(function (offers) {
			console.log("Offers Loaded..."); 
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
	
	$('#offerListDiv').html('');

	var countNBO = offerList.length;
  	$('#titleOfferPage').html(countNBO + ' Top Offers');
  	
  	var htmlOfferList = '<ul id="nbaTable" class="border-theme table-view">';
  	for (var i=0; i<countNBO; i++) {
  		var offer = offerList[i];
   		
  		if ( offer.offerName != "Default Offer" && offer.offerName != null ) {
  			//console.log("offer name= " + offer.offerName);
			
			htmlOfferList +='<li class="border-theme table-view-cell media">'
		        +'  <a data-ignore="push" class="navigate-right" onclick="showOfferDetails(\''+ offer.offerCode +'\');">'
		        +'    <img id="img_' + offer.offerCode + '" class="media-object pull-left" src="'+ offer.offerImg +'" style="max-height:100px;max-width:150px">'
		        +'    <div class="text-theme media-body">'	+ offer.offerName 
		        +'      <p class="text-theme ">' + offer.offerDesc + '</p>'
		        +'    </div>'
		        +'  </a>'
		        +'</li>';	
	   	} else {
			countNBO = countNBO-1;
		}
  	}
  	htmlOfferList += '</ul>';

  	$("#badgeNumberOfOffers").html(countNBO);
  	$('#offerListDiv').html( htmlOfferList );//.trigger('create');
  	$('#badgeNumberOfOffers').show();	
}

function showOfferDetails(offerCode) {
	removeAnimations();
	onNavItemClick('OfferDetails', 'SwipeLeft');

	var offer = getOfferByCode(offerCode, configScenario.nba);
	
	$('#offerDetailsLabel').html(offer.offerName);
	$('#offerDetailsDescription').html(offer.offerDesc);
	$('#offerDetailsImage').attr('src', offer.offerImg);
	$('#offerDetailsOfferCode').val(offerCode);

	// track response of offer details click 
	var token = configScenario.token;
	var customer =configScenario.selectedCustomer.customerLogin;
	var channel = configScenario.currentChannel;
	var details = "";
	respondToOffer(token, customer, offerCode, "show interest", channel, details)
	  .done(function(){
	});
}

function loadHistory() {
	var token = configScenario.token;
	var customer = configScenario.selectedCustomer.customerLogin;
	
	return getHistoryForCustomer(token, customer).done(function (historyList) {

			configScenario.currentHistory = historyList.map(function (historyItem) {
				var offer = {};
				//console.log(historyItem);

				if (historyItem.offerCd) {
					offer.offerName = getOfferNameByCode(historyItem.offerCd, configScenario.nba);
				} else if (historyItem.offer) {
					offer.offerName = historyItem.offer;
				}

				offer.historyChannel  = historyItem.channel;
				offer.historyDate     = historyItem.datetime;
				offer.historyType     = historyItem.entrytype;
				offer.historyDetails  = historyItem.responsedetails;
				offer.historyResponse = historyItem.responsetype;
				//console.log(offer);
				return offer;
			});
	});
}

function displayWallet() {
	historyList = configScenario.currentHistory;
	console.log(historyList);
	
	$('#historyListDiv').html('');

	var count = historyList.length;
  	
  	var htmlHistoryList = '<ul id="historyTable" class="border-theme table-view">';
  	for (var i=0; i<count; i++) {
  		var offer = historyList[i];
   		
  		if ( offer.offerName != "" && offer.offerName != null ) {
			
			if (offer.historyResponse == "accept") {
				htmlHistoryList +='<li class="border-theme table-view-cell media">'
					+'  <a class="text-theme navigate-right" onclick="showHistoryDetails(\''+ offer.offerName +'\');">'
					+'    <span class="text-theme media-object pull-left icon icon-star-filled"></span>'
					+'    <div class="media-body text-theme">'
					+     offer.offerName
			        +'    </div>'
			        +'  </a>'
			        +'</li>';
		    }	

	   	} else {
			count = count-1;
		}
  	}
  	htmlHistoryList += '</ul>';

  	$('#historyListDiv').html( htmlHistoryList );
}

function showHistoryDetails(offerName) {
	removeAnimations();
	onNavItemClick('EwalletDetails', 'SwipeLeft');

	$('#historyPageBackButton').attr("onclick","onBackToHistoryListButtonClick();");
	$('#eWalletDetailsTitle').html(offerName);
	$('#historyDetailsImage').attr('src', './images/qrcode.png');
}

function onAcceptPopupClick(element, response) {
	//read the offerCode from the hidden value
	var token = configScenario.token;
	var customer =configScenario.selectedCustomer.customerLogin;
	var channel = 'Geolocation';
	var offerCode = 'geo_offer';
	var details = "";

	respondToOffer(token, customer, offerCode, response, channel, details)
	  .done(function(){
	  		closeGeoPopup();
	});
}

function onResponseBtnClick(element, response) {
	//read the offerCode from the hidden value
	var token = configScenario.token;
	var customer = configScenario.selectedCustomer.customerLogin;
	var channel = configScenario.currentChannel;
	var offerCode = $('#offerDetailsOfferCode').val();
	var details = "";

	respondToOffer(token, customer, offerCode, response, channel, details)
	  .done(function(){

		loadOffers().done(function () {
			displayOffers();
		});

		onNavItemClick('Offers');
	  });
}

function openNotification() {
	$('#notificationMessage').html("You have a new message!");
	$('#notification').toggle();
	removeAnimations();	
}

function openGeoPopup() {
	$('#imgGeoOffer').attr("src",getOfferImageByCode('geo_offer',configScenario.nba));
	$('#notification').toggle();
	$('#transparentOverlay').toggle();
	$('#popupPushMessage').toggle();

	var token = configScenario.token;
	var customer = configScenario.selectedCustomer.customerLogin;
	var channel = 'Geolocation';
	var offerCode = 'geo_offer';
	var details = "";
	var response = 'open popup';

	respondToOffer(token, customer, offerCode, response, channel, details)
	  .done(function(){
	  	// do nothing
	  });
}

function closeGeoPopup() {
	$('#transparentOverlay').toggle();
	$('#popupPushMessage').toggle();
}

function drawMap(latlng,markerLatLng) {
	var halfScreenWidth = $(window).width() / 2;
	var halfScreenHeight = $(window).height() / 2;
	console.log("screen: " + halfScreenWidth + " " + halfScreenHeight);
	$("#yourPosition").attr("style", "left:" + halfScreenWidth + "px");

	var myOptions = {
		zoom: parseInt(configScenario.mobileApp.geo_zoom),
		center: latlng,
		mapTypeControl: false,
		zoomControl: true,
		streetViewControl: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("mapPageInner"), myOptions);
	
	google.maps.event.addListener(map, 'dragend', function() { 
		// update latitude and longtitude
		$('#mapLatPosition').html('' + map.getCenter().lat());
		$('#mapLngPosition').html('' + map.getCenter().lng()); 
		distance = getDistanceFromLatLonInKm(
						configScenario.mobileApp.geo_latitude,
						configScenario.mobileApp.geo_longtitude,
						map.getCenter().lat(),
						map.getCenter().lng());
		$('#mapDistance').html('Distance: ' + parseInt(distance*1000) + ' m');
		
		if(distance*1000 <= 50) {
			openNotification();
		}
	} );
	// Add an overlay to the map of current lat/lng
	var marker = new google.maps.Marker({
		position: markerLatLng,
		draggable: false,
		icon: configScenario.mobileApp.map_pin_image,
    	animation: google.maps.Animation.DROP,
		map: map
	});

	// display latitude and longtitude (first time)
	$('#mapLatPosition').html('' + map.getCenter().lat());
	$('#mapLngPosition').html('' + map.getCenter().lng());
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1); 
	var a = 
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	    Math.sin(dLon/2) * Math.sin(dLon/2)
	    ; 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
  	return deg * (Math.PI/180)
}

function setThemeColor(color, element) {
	/* style sheet string with placeholder for color */
	var styleString = "";

	if (element == "page") {
		
		$('.backgroundTransparent').css('background-color', color);
		//$('.page-layer').css('background-color', color);
		//styleString = ".page-layer { background-color: {{color}}; }";
	} else if (element == "bar") {
		$('.bar').css('background-color', color);
		$('.topbar').css('background-color', color);
	} else if (element == "button") {
		$('.btn-positive').css('background-color', color);
	} else if (element == "bar-text") {
		$('.bar-text-theme').css('color', color);
		styleString = ".bar-tab .tab-item.active {"
    				+ "  color: {{color}}; }";
	} else if (element == "text-theme") {
		$('.text-theme').css('color', color);
		styleString = ".text-theme, .navigate-right:after, .push-right:after {"
    				+ "  color: {{color}}; }";
	} else if (element == "border-theme") {
		$('.badge-theme').css('background-color', color);
		$('.border-theme').css('border-bottom-color', color);
		$('.border-theme').css('border-top-color', color);
		styleString = ".border-theme { border-bottom-color: {{color}}; border-top-color: {{color}}; }"
                    + ".nav-theme { color: {{color}}; }"
                    + ".bar-tab .tab-item { color: {{color}}; }"
                    + ".badge-theme{ background-color: {{color}};}";
	}

    var node = document.createElement('style');
    /* replace color placeholder and add style sheet string */
    node.innerHTML = styleString.replace(new RegExp("{{color}}",'g'), color);
    document.body.appendChild(node);
}

function removeAnimations() {
	$('.page').removeClass("animateShowUpLeft");
	$('.page').removeClass("animateShowUpCenter");
	$('.page').removeClass("animateShowUpRight");
	$('.page').removeClass("animateSwipeLeft");
	$('.page').removeClass("animateSwipeRight");
}