
function startConfigurator() {
	console.log("startConfigurator 1");
	var dataProviderUrl = "api/config.json";



	var jsonPromise = $.ajax({url: "api/config.json", dataType: 'text',
  		success: function (data) {
  			var myObj = {data};
  			console.log(myObj);
  		}
	});

	console.log("end startConfigurator");
	return jsonPromise;
}



/**
*	Init configuration ui
*
*/
function initConfigurator() {
	//refreshConfigurator(demoScenario);
	$('#raceServerName').val('started!');
}

