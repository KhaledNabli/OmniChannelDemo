/* Copyright (C) 2015 SAS Institute Inc - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the GPL license.
 *
 * You should have received a copy of the XYZ license with
 * this file. If not, please write to: khaled.nabli@sas.com
 */

var websiteConfig = {};

jQuery(document).ready(function () {
	console.log("-- Demo Website is ready to start --");
	var token = decodeURIComponent(getQueryVariable("token"));

	if(token == "") {
		console.log("-- Warning: No Token present in the URL. website.js will do nothing here...");
		return;
	}
	
	console.log("-- Demo loading config for token " + token + " --");
	getConfigurationByToken(token).done(function (config) {
		console.log("-- Demo libs loaded successfully for demo: " + config.general.demoName + " --");
		websiteConfig = config;
		websiteConfig.web = base64_decodeProperties(config.web);
		websiteConfig.web.nbaPlaceHolderSelectors = [];
		
		if(websiteConfig.web.nbaPlaceHolderSelector1) {
			websiteConfig.web.nbaPlaceHolderSelectors.push(websiteConfig.web.nbaPlaceHolderSelector1);
		}

		if(websiteConfig.web.nbaPlaceHolderSelector2) {
			websiteConfig.web.nbaPlaceHolderSelectors.push(websiteConfig.web.nbaPlaceHolderSelector2);
		}

		if(websiteConfig.web.nbaPlaceHolderSelector3) {
			websiteConfig.web.nbaPlaceHolderSelectors.push(websiteConfig.web.nbaPlaceHolderSelector3);
		}

		if(websiteConfig.web.nbaPlaceHolderSelector4) {
			websiteConfig.web.nbaPlaceHolderSelectors.push(websiteConfig.web.nbaPlaceHolderSelector4);
		}

		websiteConfig.web.placeholderCount = countPlaceHolders();

		prepareWebsite();
	});

});



function prepareWebsite() {
	console.log("-- Prepare Website for Omni-Channel Demo");

	// remove validators
	jQuery(websiteConfig.web.loginUserInputSelector).unbind();
	jQuery(websiteConfig.web.loginBtnInputSelector).unbind();
	jQuery(websiteConfig.web.loginFormSelector).unbind();

	// remove listeners
	jQuery(websiteConfig.web.loginUserInputSelector).off();
	jQuery(websiteConfig.web.loginBtnInputSelector).off();
	jQuery(websiteConfig.web.loginFormSelector).off();


	var startPageURL = getBaseURL() + ".?page=start&token=" + encodeURIComponent(websiteConfig.token);
	var loginPageURL = getBaseURL() + ".?page=login&token=" + encodeURIComponent(websiteConfig.token);
	var landingPageURL = getBaseURL() + ".?page=landing&token=" + encodeURIComponent(websiteConfig.token);
	// manipulate link to start page
	if(websiteConfig.web.startLinkSelector != "" && jQuery(websiteConfig.web.startLinkSelector)) {
		pointElementToLink(websiteConfig.web.startLinkSelector, startPageURL);
	}
	if(websiteConfig.web.loginLinkSelector != "" && jQuery(websiteConfig.web.loginLinkSelector)) {
		pointElementToLink(websiteConfig.web.loginLinkSelector, loginPageURL);
	}
	if(websiteConfig.web.loginLinkHtml.trim() != "" 
		&& websiteConfig.web.loginLinkSelector.trim() != "" 
		&& jQuery(websiteConfig.web.loginLinkSelector)) {
		console.log("Debug: Set Link of (" + websiteConfig.web.loginLinkSelector + ") innerHtml to: " + websiteConfig.web.loginLinkHtml)
		jQuery(websiteConfig.web.loginLinkSelector).html(websiteConfig.web.loginLinkHtml);
	}
	
	// manipulate form action to landing.html
	if(websiteConfig.web.loginFormSelector != "") {
		// check if this is pointing to a form.
		var tagType =  jQuery(websiteConfig.web.loginFormSelector).prop("tagName");
		if (tagType == "FORM") {
			jQuery(websiteConfig.web.loginFormSelector).attr("action", landingPageURL);
			jQuery(websiteConfig.web.loginFormSelector).attr("onsubmit", "processLoginBtnClick(this);");
			console.log("Debug: Set FORM of (" + websiteConfig.web.loginFormSelector + ") to point to: " + landingPageURL);	
		} else {
			console.log("Warning: Selector (" + websiteConfig.web.loginFormSelector + ") is not pointing to a valid <form> element!");	
		}
	}


	// manipulate login btn onclick event;
	if(websiteConfig.web.loginBtnInputSelector != "") {
		var tagType =  jQuery(websiteConfig.web.loginBtnInputSelector).prop("tagName");
		if (tagType == "INPUT" || tagType == "BUTTON" || tagType == "A" ) {
			console.log("Debug: Set " + tagType + " of " + websiteConfig.web.loginBtnInputSelector + " to submit Login Form."); 
			jQuery(websiteConfig.web.loginBtnInputSelector).removeAttr("href");
			jQuery(websiteConfig.web.loginBtnInputSelector).attr("onclick", "processLoginBtnClick(this,event)");
		} else {
			console.log("Warning: Selector (" + websiteConfig.web.loginBtnInputSelector + ") is not pointing to a valid <a>, <input> or <button> element!");	
		}
		
	}

	// Build Offers 
	if (getQueryVariable("page") == "landing") {
		buildOfferPage();
	}
}


function pointElementToLink(selector, link) {
	var tagType = jQuery(selector).prop("tagName");
	console.log("Debug: Link of " + selector + " to " + link);

	// if it is an ancher
	if(tagType == "A") {
		jQuery(selector).attr('href', link);

	}

	// if it is an button
	else if(tagType == "BUTTON") {
		jQuery(selector).attr("type", "button");
	}


	jQuery(selector).removeAttr('onclick');
	jQuery(selector).on('click', function () {
		window.location.href = link;
	});
}


function getBaseURL() {
	return window.location.href.split("?")[0];
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

/**
* 
*
*/
function processLoginBtnClick(elem,event) {
	console.log("Processing Login Proccess");
	var userid = jQuery(websiteConfig.web.loginUserInputSelector).val();

	if(userid == undefined || userid == "") {
		console.log("Could not get customer login. Please check the selector for input field");
		alert("Please enter a valid customer login");
		event.preventDefault();
		return;
	}

	var customerObj = getCustomerByLogin(userid, websiteConfig.customers);
	console.log(customerObj);

	if(customerObj.customerLogin != userid) {
		console.log("Could not find user for this login: " + userid);
		alert("Please enter a valid user login");
		event.preventDefault();
		return;
	}


	console.log("Storing CustomerLogin: " + userid + " into local storage");
	window.sessionStorage.ocdWebsiteLogin = userid;

	// if there is no form - then forward directly
	if(websiteConfig.web.loginFormSelector == "") {
		var landingPageURL = getBaseURL() + ".?page=landing&token=" + encodeURIComponent(websiteConfig.token);
		window.location.href = landingPageURL;
	}
	
	return;
}

/**
* 
*
*/
function buildOfferPage() {
	console.log("Build Offer Page");
	var placeHolderContent = [];
	var customerLogin = window.sessionStorage.ocdWebsiteLogin;
	var customerdetails = getCustomerByLogin(customerLogin, websiteConfig.customers);



	placeHolderContent.push({"name": "Token", 			"value": websiteConfig.token});
	placeHolderContent.push({"name": "CustomerLogin", 	"value": customerLogin});
	placeHolderContent.push({"name": "Firstname",		"value": customerdetails.firstName });
	placeHolderContent.push({"name": "Lastname",		"value": customerdetails.lastName });
	placeHolderContent.push({"name": "CustomerPicture",	"value": customerdetails.pictureUrl });
	placeHolderContent.push({"name": "CustomerSegment",	"value": customerdetails.lifeStageSegment });

	refreshOffers(false);
	renderHtmlPlacehoder(placeHolderContent);	
}

function refreshOffers(doNotTrack) {
	var token = websiteConfig.token;
	var customerLogin = window.sessionStorage.ocdWebsiteLogin;
	if(customerLogin == "" || customerLogin == undefined) {
		alert("Could not find the customer id in local storage. Please use the login page first.");
		return;
	}
	var maxOffers = websiteConfig.web.placeholderCount;
	// request offers from API
	return getOffersForCustomer(token, customerLogin, "Website", maxOffers, doNotTrack).done(function (offers) {
		if(checkIfOffersHasChanged(websiteConfig.currentOffers, offers)) {
			websiteConfig.currentOffers = offers;
			displayOffers(offers);	
		} else {
			console.log("getOffersForCustomer is returning the same offers - i will do nothing!");
		}

		// hide all More Info Areas
		jQuery(".ocdMoreInfoArea").hide();
	});
}

function checkIfOffersHasChanged(oldOfferList, newOfferList) {
	if(oldOfferList == undefined || newOfferList == undefined) {
		return true;
	}

	if(oldOfferList.length == undefined || newOfferList.length == undefined || newOfferList.length != oldOfferList.length) {
		return true;
	}

	for(var i = 0; i < oldOfferList.length; i++) {
		if(oldOfferList[i].offer != newOfferList[i].offer) {
			return true;
		}
	}

	return false;
}


function countPlaceHolders() {
	if(websiteConfig.web.nbaPlaceHolderSelectors.length > 0) {
		return websiteConfig.web.nbaPlaceHolderSelectors.length;
	}

	var foundPlaceHolders = 0;
	for(var i = 1; i < 10;  i++) {
		var searchSelector = ".ocdOfferName" + i;
		if(jQuery(searchSelector).length == 0) {
			break;
		}
		foundPlaceHolders = i;
	}

	return foundPlaceHolders;
}

function displayOffers(offers) {
	var countOffers = offers.length;
	var countPlaceholder = websiteConfig.web.placeholderCount;

	for ( var i = 0; i < Math.max(countPlaceholder, countOffers); i ++ ) {
		if(i < countOffers) {
			var templateContent = [];
			var templateVariable = {};
			var offerObj = offers[i];
			offerObj.offerdetails = getOfferByCode(offerObj.offer, websiteConfig.nba);
			offerObj.customerdetails = getCustomerByLogin(offerObj.customer, websiteConfig.customers);
			offerObj.index = i+1;

			templateContent.push({"name": "Token", 			"value": websiteConfig.token});
			templateContent.push({"name": "CustomerLogin", 	"value": offerObj.customer});
			templateContent.push({"name": "OfferIndex", 	"value": offerObj.index});
			templateContent.push({"name": "OfferCode", 		"value": offerObj.offer });
			templateContent.push({"name": "OfferName", 		"value": offerObj.offerdetails.offerName });
			templateContent.push({"name": "OfferDesc", 		"value": offerObj.offerdetails.offerDesc });
			templateContent.push({"name": "OfferImage", 	"value": offerObj.offerdetails.offerImg });
			templateContent.push({"name": "Firstname",		"value": offerObj.customerdetails.firstName });
			templateContent.push({"name": "Lastname",		"value": offerObj.customerdetails.lastName });
			templateContent.push({"name": "CustomerPicture","value": offerObj.customerdetails.pictureUrl });
			templateContent.push({"name": "CustomerSegment","value": offerObj.customerdetails.lifeStageSegment });
			templateContent.push({"name": "TrackAsAccept", 	"value": renderTrackingElement(offerObj.offer, "accept")});
			templateContent.push({"name": "TrackAsReject", 	"value": renderTrackingElement(offerObj.offer, "reject")});
			templateContent.push({"name": "TrackAsInterest","value": renderTrackingElement(offerObj.offer, "show interest")});
			templateContent.push({"name": "ShowMoreInfo","value": renderShowMoreInfoElement(offerObj.offer, true)});


			// this content is to be displayed in equivaled classes:
			var placeHolderContent = [];
			placeHolderContent.push({"name": "OfferIndex"	+ (i+1), 	"value": offerObj.index});
			placeHolderContent.push({"name": "OfferCode"	+ (i+1), 	"value": offerObj.offer });
			placeHolderContent.push({"name": "OfferName"	+ (i+1), 	"value": offerObj.offerdetails.offerName });
			placeHolderContent.push({"name": "OfferDesc"	+ (i+1), 	"value": offerObj.offerdetails.offerDesc });
			placeHolderContent.push({"name": "OfferImage"	+ (i+1), 	"value": offerObj.offerdetails.offerImg });
			placeHolderContent.push({"name": "TrackAsAccept"+ (i+1), 	"value": "", "trackResponse": "accept", "offerCd": offerObj.offer });
			placeHolderContent.push({"name": "TrackAsReject"+ (i+1), 	"value": "", "trackResponse": "reject", "offerCd": offerObj.offer });
			placeHolderContent.push({"name": "TrackAsInterest"+ (i+1),	"value": "", "trackResponse": "show interest", "offerCd": offerObj.offer });
		
			renderHtmlTemplate(websiteConfig.web.nbaHtmlTemplate, templateContent, websiteConfig.web.nbaPlaceHolderSelectors[i]);
			renderHtmlPlacehoder(placeHolderContent);
		} else {
			jQuery(websiteConfig.web.nbaPlaceHolderSelectors[i]).remove();
			var placeHolderContent = [];
			placeHolderContent.push({"name": "OfferIndex"	+ (i+1), "value": "" });
			placeHolderContent.push({"name": "OfferCode"	+ (i+1), "value": "" });
			placeHolderContent.push({"name": "OfferName"	+ (i+1), "value": "" });
			placeHolderContent.push({"name": "OfferDesc"	+ (i+1), "value": "" });
			placeHolderContent.push({"name": "OfferImage"	+ (i+1), "value": "" });
			renderHtmlPlacehoder(placeHolderContent);
		}
	}
}


/**
* 
*	templateContent = ["offerCd": "TR001", "offerNm", "My Personal Offer"]
*/
function renderHtmlTemplate(htmlTemplate, templateContent, templatePlaceholder) {
	// for each value, search an replace in htmlTemplate like
	// value: offerCd -> template %UPCASE(offerCd)% -> %OFFERCD%
	var renderedHtml = templateContent.reduce(function(previousValue, currentValue, index, array) {
		var find = "%" + currentValue["name"] + "%";
		var replaceWith = currentValue["value"];
		return replaceAll(find, replaceWith, previousValue);
	}, htmlTemplate);

	// remove all click events from placeholder
	jQuery(templatePlaceholder).off();
	jQuery(templatePlaceholder).removeAttr("href")
	var tagType = jQuery(templatePlaceholder).prop("tagName");

	if(tagType != "DIV") {
		console.log("Warning: Placeholder (" + templatePlaceholder + ") is not pointing to an <div> element. It is strongly recommended to use <div> elements as Placeholder for content.");
	}

	if(tagType == "A") {
		console.log("Warning: Placeholder (" + templatePlaceholder + ") is pointing to an <a> element. I will remove the href element to prevent unpredicted.");
		jQuery(templatePlaceholder).removeAttr('href');
	}

	if(tagType == "IMG") {
		alert("Error: Placeholder is pointing to an Image - this will not work!");
		return;
	}

	jQuery(templatePlaceholder).html(renderedHtml);
	return renderedHtml;
}


/**
* 
*	templateContent = ["offerCd": "TR001", "offerNm", "My Personal Offer"]
*/
function renderHtmlPlacehoder(placeHolderContent) {
	// for each value, search for class == .ocdToken and update innerHtml
	return placeHolderContent.map(function(item) {
		var selector = ".ocd" + item.name;
		var selectedElement = jQuery(selector);
		if(!selectedElement) {
			return;
		}

		selectedElement.off();

		// add click event handler
		if(item.trackResponse != undefined && item.trackResponse != "") {
			selectedElement.attr("onClick", "trackResponse('" + item.offerCd + "', '" + item.trackResponse + "');");
			return;
		}

		var tagType = selectedElement.prop("tagName");

		// set value
		if(tagType == "IMG") {
			if(item.value != "") {
				selectedElement.attr("src", item.value);
			} else {
				selectedElement.remove();
			}

		} else if (tagType == "INPUT") { 
			selectedElement.val(item.value);
		} else {
			selectedElement.html(item.value);
		}

		return selectedElement;
	});
}


function alterScore(scoreIndex, scoreValue) {
	var token = websiteConfig.token;
	var customerLogin = window.sessionStorage.ocdWebsiteLogin;

	return changeAnalyticsScore(token, customerLogin, scoreIndex, scoreValue);
}

function trackResponse(offerCd, responseCd) {
	var token = websiteConfig.token;
	var customerLogin = window.sessionStorage.ocdWebsiteLogin;
	
	return respondToOffer(token, customerLogin, offerCd, responseCd, "Website", "").done(function () {
		refreshOffers(true).done(function() {
			jQuery(".ocdMoreInfoArea." + offerCd).show();
		});
	});
}

function renderTrackingElement(offerCd, responseCd) {
	return " onClick=\"trackResponse('" + offerCd + "', '" + responseCd + "');\" ";
}

function renderShowMoreInfoElement(offerCd, trackAsInterest) {
	var token = websiteConfig.token;
	var customerLogin = window.sessionStorage.ocdWebsiteLogin;
	var resultString =" onclick=\"$('.ocdMoreInfoArea."+ offerCd +"').show(); ";
	if(trackAsInterest) {
		resultString = resultString + "respondToOffer('" + token + "', '" + customerLogin + "', '" + offerCd + "', 'show interest', 'Website')";
	}

	resultString = resultString + "\"";
	return resultString;
}

function replaceAll(find, replace, str) {
	return str.replace(new RegExp(find, 'g'), replace);
}

