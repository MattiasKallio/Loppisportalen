var last_fetch_from = -99;
var ad_platform_type = "";
var maptype = "closest";
var ajurl = "http://loppisportalen.se/app/";
//var watchID = null;

var app = {
	// Application Constructor
	initialize : function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	onDeviceReady : function() {
		app.receivedEvent('deviceready');
	},
	// Update DOM on a Received Event
	receivedEvent : function(id) {
		console.log('Received Event: ' + id);

		// alert("Device platform: "+device.platform);
		ad_platform_type = device.platform != "undefined" ? device.platform : ad_platform_type;
	}
};

$(function() {
	$(document).ready(function() {
		app.initialize();

		$("#firstpanel").on("click", ".menu_button", function() {
			var ths = $(this).attr("id").split("_");
			/*if(watchID == null)
				navigator.geolocation.clearWatch(watchID);*/
			if (ths.length == 1) {
				getList(ths[0], 10);
			} else {
				getList(ths[0], ths[1]);
			}
			
		});
		
		$( "#firstpanel" ).on( "panelbeforeopen", function() {
			$("html, body").animate({
				scrollTop : 0
			}, "slow");
		});

		$("#listbox").on("click", "a", function(e) {
			e.preventDefault();
			/*if(watchID == null)
				navigator.geolocation.clearWatch(watchID);*/
			var rl = $(this).attr("href");
			var a_cut = rl.split("?")[1];
			var a_type = a_cut.split("=");
			var a_key = a_type[0];
			var a_value = a_type[1];
			switch (a_key) {
				case "mid":
					getMarket(a_value);
				break;
				case "kommun":
					getList(a_key, a_value);
				break;
				case "typ":
					getList(a_key, a_value);
				break;
			}
		});
		
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition, onError, {
				maximumAge : 3000,
				timeout : 30000,
				enableHighAccuracy : true
			});
			//watchID = navigator.geolocation.watchPosition(showPosition, onError, 3000);
		} else {
			$("#listbox").slideUp("slow");
		}
		
	});


	function showPosition(position) {

		/*
		 			alert('Latitude: '          + position.coords.latitude          + '\n' +
		          'Longitude: '         + position.coords.longitude         + '\n' +
		          'Altitude: '          + position.coords.altitude          + '\n' +
		          'Accuracy: '          + position.coords.accuracy          + '\n' +
		          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
		          'Heading: '           + position.coords.heading           + '\n' +
		          'Speed: '             + position.coords.speed             + '\n' +
		          'Timestamp: '         + new Date(position.timestamp)      + '\n');
		 */

		$.ajax({
			type : "POST",
			url : ajurl + "map_handler.php",
			data : {
				"action" : "get_info",
				"maptype" : maptype,
				"lon" : position.coords.longitude,
				"lat" : position.coords.latitude,
				"dist" : 50
			},
			cache : false,
			success : function(data) {
				$("#listbox").html(data);
				var response = JSON.parse(data);
				if (response.result == "ok") {
					$("#marketcontainer").slideUp("fast");
					$("#listbox").html(response.list);
					$("#firstpanel").panel("close");
					$("#listbox").fadeIn("fast");
					$(".thinking_spinner").slideUp();
				} else {
					alertK(response.msg);
				}
			},
			error : function(data, status, e) {
				for (i in data)
					alert(data[i]);
			}
		});
	}

	function onError(error) {
		//alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
		$("#listbox").html('Felkod: ' + error.code + ' ' + error.message + '\n Vilket betyder att du behöver klicka i något för att GPS:en ska kunna hitta Loppisar i närheten...');
		$(".thinking_spinner").slideUp();
		$("#listbox").fadeIn("fast");
	}

	function getList(type, value) {
		var dataarr;
		var fetch = false;
		$("#listbox").fadeOut("fast");
		var fetch_info = "Hämtar innehåll";
		switch (type) {
			case "kommun":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"kommun" : value
				};
				fetch_info = "<h4>Loppisar i området " + value+"</h4>";
			break;
			case "typ":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"typ" : value
				};
				fetch_info = "<h4>Loppisar av typen: "+ value+"</h4>";
			break;
			case "latest":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"from" : value
				};
				fetch_info = "<h4>De senaste loppisarna</h4>";
			break;
			case "weeks":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"from" : value
				};
				fetch_info = "<h4>Veckans annonser</h4>";
			break;
			case "omrade":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"from" : value
				};
				fetch_info = "<h4>Loppisar efter område</h4>";
			break;
			case "keywords":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"from" : value
				};
				fetch_info = "<h4>Loppisar efter nyckelord</h4>";
			break;
			case "closest":
				fetch = false;
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(showPosition, onError, {
						maximumAge : 3000,
						timeout : 30000,
						enableHighAccuracy : true
					});
				} else {
					$("#listbox").slideUp("slow");
				}
				fetch_info = "<h4>Hämtar loppisar in närheten</h4>Här används Geolocation för att försöka se vilka loppisar som finns in närheten av dig.";
			break;
		}
		
		$(".thinking_spinner").slideDown();
		$("#thinking_text").html(fetch_info);

		/*if (!fetch) {
			watchID = navigator.geolocation.watchPosition(showPosition, onError, 6000);
		}
		else{
			if(watchID == null)
			navigator.geolocation.clearWatch(watchID);
		}*/
		
		$("#firstpanel").panel("close");

		if (fetch) {
			$.ajax({
				type : "POST",
				url : ajurl + "getcontent.php",
				data : dataarr,
				cache : false,
				success : function(data) {
					var response = JSON.parse(data);
					if (response.result == "ok") {
						$("#marketcontainer").slideUp("fast");
						$("#listbox").html(response.html);
						$("#firstpanel").panel("close");
						$(".thinking_spinner").slideUp();
						$("#listbox").fadeIn("fast");
					} else {
						alert(response.msg);
					}
				}
			});
		}
	}

	function getMarket(id) {

		var data = {
			mega_secret_code : "0ed75fcaffd55c3326efccf12f3ae737",
			action : "market_box",
			id : id,
			screen_w : window.innerWidth
		};

		$.ajax({
			type : "POST",
			url : ajurl + "getcontent.php",
			data : data,
			cache : false,
			success : function(data) {
				// $("#marketcontainer").html(data);
				var response = JSON.parse(data);
				if (response.result == "ok") {
					$("#marketcontainer").fadeIn("fast");
					$("#marketcontainer").html(response.html);
					$("html, body").animate({
						scrollTop : 0
					}, "slow");
				} else {
					$("#marketcontainer").html(data);
				}
			}
		});
	}

});

showAlert = function(message, title) {
	if (navigator.notification) {
		navigator.notification.alert(message, null, title, 'OK');
	} else {
		alert(title ? (title + ": " + message) : message);
	}
}
