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
		console.log(websiteConfig);
		prepareWebsite();
	});

});



function prepareWebsite() {
	console.log("Prepare Website for Omni-Channel Demo");
	// manipulate link to start page
	if(websiteConfig.web.startLinkSelektor != "") {
		$(websiteConfig.web.startLinkSelektor).attr("href", getBaseURL() + ".?page=start&token=" + readToken() );
	}
	if(websiteConfig.web.loginLinkSelector != "") {
		$(websiteConfig.web.loginLinkSelector).attr("href", getBaseURL() + ".?page=login&token=" + readToken() );
	}
	if(websiteConfig.web.loginLinkHtml.trim() != "" && websiteConfig.web.loginLinkSelector.trim() != "") {
		$(websiteConfig.web.loginLinkSelector).html(websiteConfig.web.loginLinkHtml);
	}
	
	// manipulate form action to landing.html
	if(websiteConfig.web.loginFormSelector != "") {
		$(websiteConfig.web.loginFormSelector).attr("action", getBaseURL() + ".?page=landing&token=" + readToken());
		$(websiteConfig.web.loginFormSelector).attr("onsubmit", "processLoginBtnClick();");
		$(websiteConfig.web.loginFormSelector).on('submit', function () { processLoginBtnClick() });
		console.log("Form Action set to: ?page=login" );
	}
	// remove validators
	$(websiteConfig.web.loginUserInputSelector).unbind();
	$(websiteConfig.web.loginBtnInputSelector).unbind();
	$(websiteConfig.web.loginFormSelector).unbind();

	// manipulate login btn onclick event;
	if(websiteConfig.web.loginBtnInputSelector != "") {
		$(loginBtnInputSelector).on('click', function () { processLoginBtnClick() });
	}

	// Build Offers 
	if (getCurrentPage() == "landing") {
		buildOfferPage();
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
	// read user id
	var customerLogin = window.localStorage.omnichanneldemoWebsiteUser;
	var maxOffers = websiteConfig.web.nbaPlaceHolderSelectors.length;
	// request offers from API
	getOffersForCustomer(readToken(), customerLogin, "Website", maxOffers).done(function (offers) {
		websiteConfig.currentOffers = offers;
		displayOffers(offers);
	});
}


function displayOffers(offers) {
	var countOffers = offers.length;
	var countPlaceholder = websiteConfig.web.nbaPlaceHolderSelectors.length;

	for ( var i = 0; i < countOffers && i < countPlaceholder; i ++ ) {
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

		templateContent.push({"name": "customerLogin", 	"value": 	offerObj.customer});
		templateContent.push({"name": "offerIndex", 	"value": 	offerObj.index});
		templateContent.push({"name": "offerCode", 		"value": 	offerObj.offer });
		templateContent.push({"name": "offerName", 		"value": 	offerObj.offerdetails.offerName });
		templateContent.push({"name": "offerDesc", 		"value": 	offerObj.offerdetails.offerDesc });
		templateContent.push({"name": "offerImage", 	"value": 	offerObj.offerdetails.offerImage });

		templateContent.push({"name": "customerId", 	"value": 	offerObj.customer });
		templateContent.push({"name": "Firstname",		"value": 	offerObj.customerdetails.customerFirstname });
		templateContent.push({"name": "Lastname",		"value": 	offerObj.customerdetails.customerLastname });
		templateContent.push({"name": "CustomerPicture","value": 	offerObj.customerdetails.pictureUrl });
		templateContent.push({"name": "CustomerSegment","value": 	offerObj.customerdetails.lifeStageSegment });

		templateContent.push({"name": "acceptOffer", 	"value": 	renderAcceptButton(offerObj, 	true)});
		templateContent.push({"name": "rejectOffer", 	"value": 	renderRejectButton(offerObj, 	true)});
		templateContent.push({"name": "interestOffer", 	"value": 	renderInterestButton(offerObj, 	true)});
	
		var renderedHtml = renderHtmlTemplate(websiteConfig.web.nbaHtmlTemplate, templateContent);

		$(websiteConfig.web.nbaPlaceHolderSelectors[i]).html(renderedHtml);
	}
}

/**
*
*/
function processRtdmOffers(rtdmResponse){
	// for each offer cd line, create template Content: ["offerCd": "TR001", "offerNm", "My Personal Offer"]
	var countOffers = rtdmResponse.outputs["Offer_CDS"].length;
	var countPlaceholder = nbaPlaceHolderSelectors.length;
	for ( var i = 0; i < countOffers && i < countPlaceholder; i ++ ) {
		var templateContent = [];
		var templateVariable = {};
		var offerObj = {};
		offerObj.userid = rtdmResponse.outputs["Customer_ID"];
		offerObj.index = i+1;
		offerObj.code = rtdmResponse.outputs["Offer_CDS"][i];
		offerObj.name = rtdmResponse.outputs["Offer_Names"][i];
		offerObj.score = rtdmResponse.outputs["Offer_Scores"][i];
		offerObj.trackingCd = "912312";

		templateContent.push({"name": "userId", 	"value": 	offerObj.userid});
		templateContent.push({"name": "offerIndex", "value": 	i});
		templateContent.push({"name": "offerCode", 	"value": 	offerObj.code });
		templateContent.push({"name": "offerName", 	"value": 	offerObj.name });
		templateContent.push({"name": "offerScore", "value": 	offerObj.score });
		templateContent.push({"name": "acceptOffer", "value": 	renderAcceptButton(offerObj, true) });
		templateContent.push({"name": "rejectOffer", "value": 	renderRejectButton(offerObj, true) });
		templateContent.push({"name": "interestOffer", "value": renderInterestButton(offerObj, true)});

	//	console.log("Calling renderHtmlTemplate");
	//	console.log(templateContent);

		var renderedHtml = renderHtmlTemplate(nbaHtmlTemplate, templateContent);

		$(nbaPlaceHolderSelectors[i]).html(renderedHtml);
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
		var find = "%" + currentValue["name"].toUpperCase() + "%";
		var replaceWith = currentValue["value"];
		return replaceAll(find, replaceWith, previousValue);
	}, htmlTemplate);

	//console.log("Finishing renderHtmlTemplate");
	//console.log(renderedHtml);
	return renderedHtml;
}



function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function displayMoreDetails(elem) {
	$(elem).append();
}


function renderAcceptButton(offerObj, reloadPage) {
	return " onclick=\"rdmSendResponse('" + offerObj.userid + "','" + offerObj.index + "','" + offerObj.trackingCd +  "','" + offerObj.code + "','" + offerObj.name + "','accepted'," + reloadPage + ");\"";
}

function renderRejectButton(offerObj, reloadPage) {
	return " onclick=\"rdmSendResponse('" + offerObj.userid + "','" + offerObj.index + "','" + offerObj.trackingCd +  "','" + offerObj.code + "','" + offerObj.name + "','rejected'," + reloadPage + ");\"";
}

function renderInterestButton(offerObj, reloadPage) {
	return " onclick=\"rdmSendResponse('" + offerObj.userid + "','" + offerObj.index + "','" + offerObj.trackingCd +  "','Click','" + offerObj.name + "','Banner Click'," + reloadPage + ");\"";
}


function rdmSendResponse(custid, teaser_code, ttc, offer_code, offer_name, response, reloadPage) {
	console.log("rdmSendResponse - TTC: " + ttc + " teaser_code: " + teaser_code + " response: " + response + " custid: " + custid + " offerCode: " + offer_code + " offerName: " + offer_name);

	var rtdmRequestUrl = "http://" + rtdmHost + "/RTDM/rest/runtime/decisions/" + rtdmResponseEventName + "/";
	var contentType = 'application/vnd.sas.decision.request+json';
	var rtdmRequest = {"version" : 1, "clientTimeZone" : "EST", "inputs":{}};

	rtdmRequest.inputs.CUSTOMERID = parseInt(custid);
	rtdmRequest.inputs.CHANNEL_CD = "Web";
	rtdmRequest.inputs.OFFER_CD = offer_code;
	rtdmRequest.inputs.TEASER_CD = teaser_code;
	rtdmRequest.inputs.OFFER_TRACKING_CD = ttc;
	rtdmRequest.inputs.RESPONSE_CD = response;
	rtdmRequest.inputs.OFFER_MEDIUM = offer_name;


	$.ajax({
		method: "POST",
		contentType: contentType,
		url: rtdmRequestUrl,
		data: JSON.stringify(rtdmRequest)
	}).done(function(rtdmResponse) { 
		// render templates
		//processRtdmOffers(rtdmResponse)
		if(reloadPage)
			buildOfferPage();
	});
}
