
function resetDemo(token) {
	return callApi({action: 'resetDemo', 
					token: token
				});
}

function respondToOffer(token, customer, offerCd, responseCd, channelCd, details) {
	return callApi({action: 'respondToOffer', 
					token: token, 
					customer: customer, 
					offer: offerCd, 
					response: responseCd, 
					channel: channelCd, 
					details: details
				});
}

function getOffersForCustomer(token, customer, channel, maxOffers, doNotTrack) {
	return callApi({action: 'getOffers',
					token: token,
					customer: customer, 
					channel: channel,
					maxOffers : maxOffers,
					DoNotTrack : doNotTrack
				});
}

function getHistoryForCustomer(token, customer) {
	return callApi({action: 'getHistory', 
					token: token, 
					customer: customer
				});
}

function getExistingDemos(userEmail, maxItems) {
	return callApi({action: 'getAllDemos',
					maxItems: maxItems,
					userEmail : userEmail
				});
}


function getConfigurationByToken(token) {
	return callApi({action: 'getConfig', 
					token: token
				});
}

function saveConfiguration($config) {
	return callApi({action: 'saveConfig', 
					config: JSON.stringify(configScenario)
				});
}
	

function callApi(parameters) {
	var baseUrl = window.location.protocol + "//" + window.location.host + "/OmniChannelDemo/api/";
	return $.ajax(baseUrl, {
        type: 'POST',
        data: parameters
    } );
}





function getToken() {
	var token = "";
	var tokenFromUrl = readTokenFromURL();
    if(tokenFromUrl != undefined && tokenFromUrl != "") {
    	// TODO: check if token is valid before overwriting the existing one
        token = readTokenFromURL();  // Mathias: this line was missing!!
        saveToken(tokenFromUrl);
    } else {
		token = readToken();
	}
	console.log ("getToken: " + token);
	return token;
}


function readTokenFromURL() {
	var tokenFromParameter = getQueryVariable("token");
	var tokenAfterHash = window.location.href.split('#')[1];
	return decodeURIComponent(tokenFromParameter ? tokenFromParameter : tokenAfterHash);
}



function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  } 
}

function getBaseURL() {
	return window.location.href.split("?")[0];
}




function readToken() {
	return window.localStorage.omnichanneltoken ? window.localStorage.omnichanneltoken : "";
}


function saveToken(token) {
	window.localStorage.omnichanneltoken = token;
}

function getOfferNameByCode(offerCode, offerList) {
	var offerName = "";
	
	for(var i=0;i<offerList.length;i++) {
		if (offerCode == offerList[i].offerCode) {
			offerName = offerList[i].offerName;
			//console.log("offer found! " + offerList[i].offerName);
		}
	}

	return offerName;
}

function getOfferImageByCode(offerCode, offerList) {
	var offerImg = "";
	
	for(var i=0;i<offerList.length;i++) {
		if (offerCode == offerList[i].offerCode) {
			offerImg = offerList[i].offerImg;
			console.log("offer found! " + offerList[i].offerImg);
		}
	}

	return offerImg;
}

function getOfferByCode(offerCode, offerList) {
	var offer = {};
	var offerIndex = getOfferIndexByCode(offerCode, offerList);
	
	if(offerIndex >= 0) {
		offer = offerList[offerIndex];
	}

	return offer;
}


function getOfferIndexByCode(offerCode, offerList) {
	var offerIndex = -1;

	for (var k=0; k < offerList.length; k++) {
		if (offerCode == offerList[k].offerCode) {
			var offerIndex = k;
			break;
		}
	}

	return offerIndex;
}


function getCustomerByLogin(customerLogin, customerList) {
	var customer = {};
	var customerIndex = getCustomerIndexByLogin(customerLogin, customerList);
	
	if(customerIndex >= 0) {
		customer = customerList[customerIndex];
	}

	return customer;
}

function getCustomerIndexByLogin(customerLogin, customerList) {
	var customerIndex = -1;

	for (var k=0; k < customerList.length; k++) {
		if (customerLogin == customerList[k].customerLogin) {
			var customerIndex = k;
			break;
		}
	}

	return customerIndex;
}

function base64_encodeProperties(propertyArray) {
	for (var property in propertyArray) {
		if (propertyArray.hasOwnProperty(property)) {
            if (property) propertyArray[property] = base64_encode(propertyArray[property]);
        }       
    }

    return propertyArray;
}


function base64_decodeProperties(propertyArray) {
	for (var property in propertyArray) {
		if (propertyArray.hasOwnProperty(property)) {
            if (property) propertyArray[property] = base64_decode(propertyArray[property]);
        }       
    }

    return propertyArray;
}


function base64_encode(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function base64_decode(str) {
    return decodeURIComponent(escape(window.atob(str)));
}
