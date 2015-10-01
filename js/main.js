function loadDemo(demoScenario) {
	// load scenario...

	// build up configurator ui...
	setupConfiguration();
	
	refreshCustomers(demoScenario.customerList);
	refreshBeacons(demoScenario.beaconList);
	$("#saveBeaconPosition").hide();
}

function setupConfiguration() {
	$("#demoConfigurator").load("./configurator.html", function () {
		console.log("Loading Configurator completed.");
		initConfigurator();
		console.log("Init Configurator completed.");
	});

}

