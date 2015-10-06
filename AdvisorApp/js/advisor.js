
var configScenario = "";
var custArrayIndex = 99;

function onBtnSubmit(element) {
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

	showOffers(configScenario.nba);	
}

function onBtnLoad(element) {
	var token = $('#tokenLoad').val();
	loadConfiguration(token);
	$('#popupLoadToken').modal('hide');
}

function loadConfiguration(token) {
	callApi({action: 'getConfig', token: token}).done(function (jsonData) {
    	//console.log("Loading Data done." + JSON.stringify(jsonData));
    	configScenario = jsonData;

    	/* adding available customers to drop down list */
    	$('#ul_custDropDown').html('');
    	for (i = 0; i < configScenario.customers.length; i++) {    	
    		$('#ul_custDropDown').append('<li><a href="#" onclick="selectCustomer(\'' 
    			+ configScenario.customers[i].customerLogin +'\',\'' + i +'\');">' + configScenario.customers[i].customerLogin + ' - ' 
    			+ configScenario.customers[i].firstName + ' ' + configScenario.customers[i].lastName
    			+ '</a></li>');

    		$('#btn_SubmitLabel').html(configScenario.advisorApp.submitBtnAdvisor);
    		$('#titleAdvisor').html(configScenario.advisorApp.titleAdvisor);
    		console.log("adding: " + configScenario.customers[i].customerLogin );    
    		
		}
    	
    });
}

function showOffers(offerArray) {
	var stars = 5;
	for(var i = 0; i < offerArray.length; i++) { 
			var starsNumberValue = stars-i;
        	var offerName = offerArray[i]["offerName"]; 
        	var offerDescription = offerArray[i]["offerDesc"];
        	var offerImage = offerArray[i]["offerImg"];
			offerRow = '<tr>'
				+'<td width="20%">'
				+'<a href="#" onclick="showOfferDetails('+ i +');" data-toggle="modal" data-target=".bs-example-modal-sm">'
			    +'<img src="' + offerImage + '" width="200" class="img-thumbnail"></a>'
			    +'</td>'
			    +'<td width="80%">'
			    +'<h4><b>' + offerName + '</b> <img src="./images/'+ starsNumberValue +'starsborder.png"></h4>'
			    +'<p>' + offerDescription + '</p>'
			    +'</td>'
			    +'</tr>';
			$('#nbaTbody').append(offerRow);
    	} 
}

function showOfferDetails(offerIndex) {
	console.log("offer object: " + offerIndex);
	$('#offerDetailsLabel').html(configScenario.nba[offerIndex].offerName);
	$('#offerDetailsDescription').html(configScenario.nba[offerIndex].offerDesc);
	$('#offerDetailsImage').attr('src', configScenario.nba[offerIndex].offerImg);
}


function selectCustomer(custID, index) {
	$('#input_custID').val(custID);
	custArrayIndex = index;
}

function callApi(parameters) {
	return $.ajax("../api/", {
        type: 'POST',
        data: parameters
    } );
}



