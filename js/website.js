/* Copyright (C) 2015 SAS Institute Inc - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the GPL license.
 *
 * You should have received a copy of the XYZ license with
 * this file. If not, please write to: khaled.nabli@sas.com
 */

var websiteConfig = {};

$(document).ready(function () {
	console.log("-- Demo libs loaded secussfully--");
	var token = readToken();
	
	console.log("-- Demo loading config for token " + token + "--");
	getConfigurationByToken(token).done(function (config) {
		console.log("-- Demo libs loaded secussfully--");
		websiteConfig = config;
		websiteConfig.web = base64_decodeProperties(config.web);
		websiteConfig.web.nbaPlaceHolderSelectors = [	websiteConfig.web.nbaPlaceHolderSelector1, 
														websiteConfig.web.nbaPlaceHolderSelector2,
														websiteConfig.web.nbaPlaceHolderSelector3,
														websiteConfig.web.nbaPlaceHolderSelector4
													];
		console.log(websiteConfig);
		prepareWebsite();
	});

});



function prepareWebsite() {
	console.log("Prepare Website for Omni-Channel Demo");

	var startPageURL = getBaseURL() + ".?page=start&token=" + readToken();
	var loginPageURL = getBaseURL() + ".?page=login&token=" + readToken();
	var landingPageURL = getBaseURL() + ".?page=landing&token=" + readToken();
	// manipulate link to start page
	if(websiteConfig.web.startLinkSelector != "") {
		pointElementToLink(websiteConfig.web.startLinkSelector, startPageURL);
	}
	if(websiteConfig.web.loginLinkSelector != "") {
		pointElementToLink(websiteConfig.web.loginLinkSelector, loginPageURL);
	}
	if(websiteConfig.web.loginLinkHtml.trim() != "" && websiteConfig.web.loginLinkSelector.trim() != "") {
		$(websiteConfig.web.loginLinkSelector).html(websiteConfig.web.loginLinkHtml);
	}
	
	// manipulate form action to landing.html
	if(websiteConfig.web.loginFormSelector != "") {
		$(websiteConfig.web.loginFormSelector).attr("action", landingPageURL);
		$(websiteConfig.web.loginFormSelector).attr("onsubmit", "processLoginBtnClick();");
		$(websiteConfig.web.loginFormSelector).on('submit', function () { processLoginBtnClick() });
		//console.log("Form Action set to: ?page=login" );
	}
	// remove validators
	$(websiteConfig.web.loginUserInputSelector).unbind();
	$(websiteConfig.web.loginBtnInputSelector).unbind();
	$(websiteConfig.web.loginFormSelector).unbind();

	// manipulate login btn onclick event;
	if(websiteConfig.web.loginBtnInputSelector != "") {
		$(websiteConfig.web.loginBtnInputSelector).on('click', function () { processLoginBtnClick() });
	}

	// Build Offers 
	if (getCurrentPage() == "landing") {
		buildOfferPage();
	}
}

function pointElementToLink(selector, link) {
	var tagType = $(selector).prop("tagName");

	// if it is an ancher
	if(tagType == "A") {
		$(selector).attr('href', link);
		$(selector).on('click', function () {
			window.location.href = link;
		});
	}

	// if it is an button
	else if(tagType == "BUTTON") {
		$(selector).on('click', function () {
			window.location.href = link;
		});
	} 

	// if it is something else
	else {
		// find next link
		var closestElement = $(selector).closest("a");
		console.log("Alert: Selector (" + selector + ") needs to point to a <a> or <button> element!. Currently it is pointing to an element: " + tagType + ".");
		if(closestElement) {
			console.log(" We found an approporiate element for you: " + closestElement.getPath() );
		}
		

	}

}

function getCurrentPage() {
	return getQueryVariable("page");
}


function getCurrentFileName() {
	if(document.location.href.match(/[^\/]+$/) != null) {
		return document.location.href.match(/[^\/]+$/)[0];
	}

	return indexPageUrl;
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

/**
* 
*
*/
function processLoginBtnClick() {
	console.log("Processing Login Proccess");
	var userid = $(websiteConfig.web.loginUserInputSelector).val();
	if(userid == undefined || userid == "") {
		console.log("Could not get user id. Please check the selector for input field");
		alert("Please enter a valid user identity");
		event.preventDefault();
	}

	console.log("Storing User ID: " + userid + " into local storage");
	window.localStorage.omnichanneldemoWebsiteUser = userid;
	return;
}

/**
* 
*
*/
function buildOfferPage() {
	console.log("Build Offer Page");
	refreshOffers();
}

function refreshOffers() {
	var token = readToken();
	var customerLogin = window.localStorage.omnichanneldemoWebsiteUser;
	var maxOffers = websiteConfig.web.nbaPlaceHolderSelectors.length;
	// request offers from API
	getOffersForCustomer(token, customerLogin, "Website", maxOffers).done(function (offers) {
		websiteConfig.currentOffers = offers;
		displayOffers(offers);
	});
}


function displayOffers(offers) {
	var countOffers = offers.length;
	var countPlaceholder = websiteConfig.web.nbaPlaceHolderSelectors.length;

	for ( var i = 0; i < countPlaceholder; i ++ ) {

		if(i < countOffers) {
			var templateContent = [];
			var templateVariable = {};
			var offerObj = offers[i];
			offerObj.offerdetails = getOfferByCode(offerObj.offer, websiteConfig.nba);
			offerObj.customerdetails = getCustomerByLogin(offerObj.customer, websiteConfig.customers);
			offerObj.index = i+1;

			/*
				count: null
				customer: "1234"
				display_limit: "3"
				entrytype: null
				offer: "oc02"
				responded: "0"
				score: "66.000"
				token: "Wh5JRj88"
			*/

			templateContent.push({"name": "CustomerLogin", 	"value": 	offerObj.customer});
			templateContent.push({"name": "OfferIndex", 	"value": 	offerObj.index});
			templateContent.push({"name": "OfferCode", 		"value": 	offerObj.offer });
			templateContent.push({"name": "OfferName", 		"value": 	offerObj.offerdetails.offerName });
			templateContent.push({"name": "OfferDesc", 		"value": 	offerObj.offerdetails.offerDesc });
			templateContent.push({"name": "OfferImage", 	"value": 	offerObj.offerdetails.offerImg });

			templateContent.push({"name": "CustomerId", 	"value": 	offerObj.customer });
			templateContent.push({"name": "Firstname",		"value": 	offerObj.customerdetails.customerFirstname });
			templateContent.push({"name": "Lastname",		"value": 	offerObj.customerdetails.customerLastname });
			templateContent.push({"name": "CustomerPicture","value": 	offerObj.customerdetails.pictureUrl });
			templateContent.push({"name": "CustomerSegment","value": 	offerObj.customerdetails.lifeStageSegment });
			templateContent.push({"name": "TrackAsAccept", 	"value": 	renderTrackingElement(offerObj.customer, offerObj.offer, "Accept")});
			templateContent.push({"name": "TrackAsReject", 	"value": 	renderTrackingElement(offerObj.customer, offerObj.offer, "Reject")});
			templateContent.push({"name": "TrackAsInterest","value": 	renderTrackingElement(offerObj.customer, offerObj.offer, "Show Interest")});
		
			var renderedHtml = renderHtmlTemplate(websiteConfig.web.nbaHtmlTemplate, templateContent);
			$(websiteConfig.web.nbaPlaceHolderSelectors[i]).html(renderedHtml);
		} else {
			$(websiteConfig.web.nbaPlaceHolderSelectors[i]).remove();
		}

		
	}
}


/**
* 
*	templateContent = ["offerCd": "TR001", "offerNm", "My Personal Offer"]
*/
function renderHtmlTemplate(htmlTemplate, templateContent) {
	// for each value, search an replace in htmlTemplate like
	// value: offerCd -> template %UPCASE(offerCd)% -> %OFFERCD%
	var renderedHtml = templateContent.reduce(function(previousValue, currentValue, index, array) {
		var find = "%" + currentValue["name"] + "%";
		var replaceWith = currentValue["value"];
		return replaceAll(find, replaceWith, previousValue);
	}, htmlTemplate);

	//console.log("Finishing renderHtmlTemplate");
	//console.log(renderedHtml);
	return renderedHtml;
}


function trackResponse(customer, offerCd, responseCd) {
	var token = readToken();
	respondToOffer(token, customer, offerCd, responseCd, "Website", "").done(function () {
		refreshOffers();
	});
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function renderTrackingElement(customer, offerCd, responseCd) {
	return " onClick=\"trackResponse('" + customer + "', '" + offerCd + "', '" + responseCd + "');\"";
}


jQuery.fn.getPath = function () {
    if (this.length != 1) throw 'Requires one element.';

    var path, node = this;
    while (node.length) {
        var realNode = node[0], name = realNode.localName;
        if (!name) break;
        name = name.toLowerCase();

        var parent = node.parent();

        var siblings = parent.children(name);
        if (siblings.length > 1) { 
            name += ':nth-child(' + siblings.index(realNode) + ')';
        }

        path = name + (path ? ' > ' + path : '');
        node = parent;
    }

    return path;
};