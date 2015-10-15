
var configScenario = "";
var custID = "";
var token = "";

var custArrayIndex = -1;
var custScoreValue = "";

if(window.localStorage.omnichanneltoken) {
	token = window.localStorage.omnichanneltoken;
	$('#tokenLoad').val(token);
} 

function onBtnSubmit(element) {
	custID = $('#input_custID').val();
	
	for (i = 0; i < configScenario.customers.length; i++) { 
		if(configScenario.customers[i].customerLogin == custID) {
			custArrayIndex = i;
			if(i == 0) {
				custScoreValue = "customer1Score";
			} else if (i == 1) {
				custScoreValue = "customer2Score";
			}
			console.log("match id: " + custID + ' ' + configScenario.customers[i].customerLogin);
		}
	}

	$('#nav_custDetails').addClass("active");
	$('#nav_overview').removeClass("active");
	$('#tab_custDetails').addClass("active");
	$('#tab_overview').removeClass("active");
	

	$('#customerName').val(configScenario.customers[custArrayIndex].firstName + " " + configScenario.customers[custArrayIndex].lastName);
	$('#mobileNumber').val(configScenario.customers[custArrayIndex].mobileNumber);
	$('#lifeStageSegment').val(configScenario.customers[custArrayIndex].lifeStageSegment);
	$('#age').val(configScenario.customers[custArrayIndex].age);
	$('#email').val(configScenario.customers[custArrayIndex].email);
	$('#pictureUrl').attr('src', configScenario.customers[custArrayIndex].pictureUrl);


	$('#bar_analyticsBar1').css("width",configScenario.customers[custArrayIndex].analyticsBar1Value);
	$('#txt_analyticsBar1').text(configScenario.customers[custArrayIndex].analyticsBar1Value);
	$('#analyticsBar1Label').text(configScenario.labels.analyticsBar1Label);
	console.log("bar value 1: " + configScenario.customers[custArrayIndex].analyticsBar1Value);

	$('#bar_analyticsBar2').css("width",configScenario.customers[custArrayIndex].analyticsBar2Value);
	$('#txt_analyticsBar2').text(configScenario.customers[custArrayIndex].analyticsBar2Value);
	$('#analyticsBar2Label').text(configScenario.labels.analyticsBar2Label);

	$('#bar_analyticsBar3').css("width",configScenario.customers[custArrayIndex].analyticsBar3Value);
	$('#txt_analyticsBar3').text(configScenario.customers[custArrayIndex].analyticsBar3Value);
	$('#analyticsBar3Label').text(configScenario.labels.analyticsBar3Label);

	$('#bar_analyticsBar4').css("width",configScenario.customers[custArrayIndex].analyticsBar4Value);
	$('#txt_analyticsBar4').text(configScenario.customers[custArrayIndex].analyticsBar4Value);
	$('#analyticsBar4Label').text(configScenario.labels.analyticsBar4Label);

	showOffers(configScenario.nba, custID, "Advisor");	
	showHistory();
}

function onBtnLoad(element) {
	token = $('#tokenLoad').val();
	loadConfiguration(token);
	$('#popupLoadToken').modal('hide');
}

function loadConfiguration(token) {
	callApi({action: 'getConfig', token: token}).done(function (jsonData) {
    	//console.log("Loading Data done." + JSON.stringify(jsonData));
    	configScenario = jsonData;

    	/* adding available customers to datalist */
    	$('#dataList_customers').html('');
    	for (i = 0; i < configScenario.customers.length; i++) { 

    		$('#dataList_customers').append('<option value="'+ configScenario.customers[i].customerLogin + '">' 
    			+ configScenario.customers[i].firstName + ' ' + configScenario.customers[i].lastName + '</option>') ;

    		console.log("adding: " + configScenario.customers[i].customerLogin );     		
		}

		$('#btn_SubmitLabel').html(configScenario.advisorApp.submitBtnAdvisor);
    	$('#titleAdvisor').html(configScenario.advisorApp.titleAdvisor);
    	
    });
}

function getOffer(offerCode) {
	for (var k=0; k < configScenario.nba.length; k++) {
		if (offerCode == configScenario.nba[k].offerCode) {
			console.log("getOffer: " + offerCode + " found. image: " + configScenario.nba[k].offerImg);
			var offer = {
				offerName: configScenario.nba[k].offerName, 
				offerDescription: configScenario.nba[k].offerDesc, 
				offerImage: configScenario.nba[k].offerImg, 
				offerCode: configScenario.nba[k].offerCode,
				offerSms: configScenario.nba[k].offerSms 
			};
		}
	}
	return offer;
}

function getOfferByCode(offerCode) {
	var offer = {};

	for (var k=0; k < configScenario.nba.length; k++) {
		if (offerCode == configScenario.nba[k].offerCode) {
			var offer = configScenario.nba[k];
			console.log("getOffer: " + offer.offerCode + " found. image: " + offer.offerImg);
			break;
		}
	}

	return offer;
}


function showOffers(offerArray, customer, channel) {

	var stars = 5;
	$('#nbaTbody').html('');
	
	callApi({action: 'getOffers', token: token, customer: customer, channel: channel}).done(function (offerList) {
    	//console.log("Loading Data done." + JSON.stringify(jsonData));
    	console.log("offerList length: " + offerList.length);

    	for (var i=0; i < offerList.length; i++) {  // eligible offers for customer
    		var offer 			 = getOfferByCode(offerList[i].offer);
    		var starsNumberValue = stars-i;
    		var offerScore 		 = offerList[i]["score"];
			    	
			//var offer = {offerName: offerName, offerDescription: offerDescription, offerImage: offerImage, offerCode: offerCode };
			//currentOfferList.push(offer);
    		//console.log(" " + i + ". offer details: " + offer.offerName + " - " + offer.offerDesc + " - " + offer.offerImg + " - " + offerScore);
    				
    		offerRow = '<tr>'
						+'<td width="20%">'
						+'<a href="#" onclick="showOfferDetails(\''+ offer.offerCode +'\');" data-toggle="modal" data-target=".bs-example-modal-sm">'
					    +'<img src="' + offer.offerImg + '" width="200" class="img-thumbnail"></a>'
					    +'</td>'
					    +'<td width="80%">'
					    +'<h4><b>' + offer.offerName + '</b> <img src="./images/'+ starsNumberValue +'starsborder.png"></h4>'
					    +'<p>' + offer.offerDesc + '</p>'
					    +'</td><td>' + offerScore + '</td>'
					    +'</tr>';
			$('#nbaTbody').append(offerRow);

    	}
    	
    });

}

function showHistory() {
	$('#historyTbody').html('');

	callApi({action: 'getHistory', token: token, customer: custID}).done(function (jsonData) {
    	console.log("Loading Data done." + JSON.stringify(jsonData));
    	historyList = jsonData;

    	for(var i = 0; i < historyList.length; i++) {
    	    console.log("showHistory: " + historyList[i]["offer"]);
	    	if (historyList[i]["offer"] != "") {
		    	var historyDate = historyList[i]["datetime"]; 
		    	var historyAction = historyList[i]["offer"];
		    	var historyChannel = historyList[i]["channel"];
		    	var historyResponse = historyList[i]["responsetype"];

				historyRow = '<tr>'
		                    +'<td>'+historyDate+'</td>'
		                    +'<td>'+historyAction+'</td>'
		                    +'<td>'+historyChannel+'</td>'
		                    +'<td>'+historyResponse+'</td>'
		                    +'</tr>';
				$('#historyTbody').append(historyRow);
			}
	    } 
    });

}

function showOfferDetails(offerCode) {
	var offer = getOfferByCode(offerCode);
	
	$('#offerDetailsLabel').html(offer.offerName);
	$('#offerDetailsDescription').html(offer.offerDesc);
	$('#offerDetailsImage').attr('src', offer.offerImg);

}

function onResponseBtnClick(element, response) {
	var offerCode = $('#offerDetailsOfferCode').val();

	respondToOffer(token, custID, offerCode, response, "Advisor", "").done(function(){
		$('#offerDetailsModal').modal('toggle');  // modal close
		showOffers(configScenario.nba, custID, "Advisor");
		showHistory();
	});
}


