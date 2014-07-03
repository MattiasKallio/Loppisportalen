var last_fetch_from = -99;
var prev_type = "closest";
var prev_value = "closest";
var wannago = false;
var ad_platform_type = "";
var maptype = "closest";
var onlyopen = false;
var ajurl = "http://loppisportalen.se/app/";
//var ajurl = "http://localhost/loppisportalen/app/";

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
		document.addEventListener("backbutton", backbuttonHandler, false);
		document.addEventListener("menubutton", menubuttonHandler, false);
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
		
		$("#firstpanel, #listbox").on("click", ".menu_button", function() {
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
		
		app.initialize();
		
	});
	
});

function showPosition(position) {
	var prev_page = "closest";
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
	
	var data_send = {
			"action" : "get_info",
			"maptype" : maptype,
			"lon" : position.coords.longitude,
			"lat" : position.coords.latitude,
			"dist" : 50,
			"onlyopen" : onlyopen
		}

	$.ajax({
		type : "POST",
		url : ajurl + "map_handler.php",
		data : data_send,
		cache : false,
		success : function(data) {
			//$("#listbox").html(data);
			//console.log(data);
			var response = JSON.parse(data);
			if (response.result == "ok") {
				$("#marketcontainer").hide();
				var liststr = response.list == "" ? "Du är verkligen ute i terrängen, det finns inga loppisar i närheten av dig är jag rädd. Det kan bero på att du har GPS avstängt, eller att du är utom räckhåll för signalerna också." : response.list;
				$("#listbox").html(liststr);
				$("#firstpanel").panel("close");
				$("#listbox").show();
				$(".thinking_spinner").slideUp();
			} else {
				$("#listbox").html(response.msg);
			}
		},
		error : function(data, status, e) {
			/*for (i in data)
				alert(data[i]);*/
			$("#listbox").html("Det gick inte hämta geolocation information");
			
		}
	});
}

function onError(error) {
	$("#listbox").html('Felkod: ' + error.code + ' ' + error.message + '\n Vilket betyder att du behöver klicka i något för att GPS:en ska kunna hitta Loppisar i närheten eller att du helt enkelt inte har någon mottagning på GPS:en...');
	$(".thinking_spinner").slideUp();
	$("#listbox").show();
}

function getList(type, value) {
	prev_type = type;
	prev_value = value;
	var dataarr;
	var fetch = false;
	$("#listbox").hide();
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
			var nametype = $("#typ_"+value).html();
			fetch_info = "<h4>Loppisar av typen: "+ nametype+"</h4>";
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
			onlyopen = false;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(showPosition, onError, {
					maximumAge : 3000,
					timeout : 30000,
					enableHighAccuracy : true
				});
			} else {
				$("#listbox").hide();
			}
			fetch_info = "<h4>Hämtar loppisar in närheten</h4>Här används Geolocation för att försöka se vilka loppisar som finns in närheten av dig.";
		break;
		case "surfin":
			fetch = false;
			onlyopen = true;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(showPosition, onError, {
					maximumAge : 3000,
					timeout : 30000,
					enableHighAccuracy : true
				});
			} else {
				$("#listbox").hide();
			}
			fetch_info = "<h4>Hämtar info för loppis-surfande</h4>Information hämtas om loppisar i din närhet som har öppet just nu.";
		break;	
		case "firstpage":
			fetch = false;
			onlyopen = true;
			$("#listbox").html("<div class='splash_buttons'><div class='menu_button' id='surfin'><h4>Surfa</h4>Använder GPS för att hitta loppisar i närheten av där du är som är öppna idag</div><div class='menu_button' id='weeks'><h4>Veckans annonser</h4>Loppisar med aktuella erbjudanden eller annat intressant den här veckan</div><div class='menu_button' id='omrade'><h4>Område</h4>Hitta loppisar i ett visst område</div><div class='menu_button' id='latest'><h4>Senaste</h4>De senast tillagda loppisarna här på loppisportalen</div><div class='menu_button' id='exit'><h4>Stäng</h4>Stänger appen och gör något annat spännande</div></div>");
			$("#listbox").show();
			fetch_info = "<h4>Hämtar Startsidan</h4>Hämtar förstasidan.";
		break;		
		
		case "exit":
			fetch = false;
			navigator.app.exitApp();
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
	
	$("#marketcontainer").hide();
	$(".thinking_spinner").slideUp();
	$("#firstpanel").panel("close");

	if (fetch) {
		$.ajax({
			type : "POST",
			url : ajurl + "getcontent.php",
			data : dataarr,
			cache : false,
			success : function(data) {
				console.log(data);
				var response = JSON.parse(data);
				if (response.result == "ok") {
					$("#listbox").html(response.html);
					$("#firstpanel").panel("close");
					$("#listbox").show();
				} else {
					alert(response.msg);
				}
			},
			error : function(data, status, e) {
				/*for (i in data)
					alert(data[i]);*/
				$("#listbox").html("Det gick inte hämta information");
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
				$("#marketcontainer").show();
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

showAlert = function(message, title) {
	if (navigator.notification) {
		navigator.notification.alert(message, null, title, 'OK');
	} else {
		alert(title ? (title + ": " + message) : message);
	}
}

function menubuttonHandler(){
	$("#firstpanel").panel("open");
}

function backbuttonHandler(){
	if(!wannago){
		getList(prev_type, prev_value);
		wannago = true;
	}
	else{
		wannago=false;
		//$("#listbox").html("<div class='splash_buttons'><div class='menu_button' id='closest'>I närheten</div><div class='menu_button' id='weeks'>Veckans annonser</div><div class='menu_button' id='omrade'>Område</div><div class='menu_button' id='latest'>Senaste</div></div>");
		$("#listbox").html("<div class='splash_buttons'><div class='menu_button' id='surfin'><h4>Surfa</h4>Använder GPS för att hitta loppisar i närheten av där du är som är öppna idag</div><div class='menu_button' id='weeks'><h4>Veckans annonser</h4>Loppisar med aktuella erbjudanden eller annat intressant den här veckan</div><div class='menu_button' id='omrade'><h4>Område</h4>Hitta loppisar i ett visst område</div><div class='menu_button' id='latest'><h4>Senaste</h4>De senast tillagda loppisarna här på loppisportalen</div><div class='menu_button' id='exit'><h4>Stäng</h4>Stänger appen och gör något annat spännande</div></div>");
	}
}
