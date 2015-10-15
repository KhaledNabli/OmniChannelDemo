function respondToOffer(token, customer, offerCd, responseCd, channelCd, details) {
	console.log("respondToOffer will send following paramters: "+token+" "+customer+" "+offerCd+" "+responseCd+" "+channelCd+" "+details);
	return callApi({action: 'respondToOffer', 
			token: token, 
			customer: customer, 
			offer: offerCd, 
			response: responseCd, 
			channel: channelCd, 
			details: details
		});
}

function callApi(parameters) {
	return $.ajax("../api/", {
        type: 'POST',
        data: parameters
    } );
}
