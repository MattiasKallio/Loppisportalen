var last_fetch_from = -99;
var ad_platform_type = "";
var maptype = "closest";
var ajurl = "http://loppisportalen.se/app/";

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
		/*
		 * var parentElement = document.getElementById(id); var listeningElement =
		 * parentElement.querySelector('.listening'); var receivedElement =
		 * parentElement.querySelector('.received');
		 * 
		 * listeningElement.setAttribute('style', 'display:none;');
		 * receivedElement.setAttribute('style', 'display:block;');
		 */
		console.log('Received Event: ' + id);

		// alert("Device platform: "+device.platform);
		ad_platform_type = device.platform != "undefined" ? device.platform : ad_platform_type;
		/*
		 * switch (ad_platform_type) { case "Android": $(".admob").html('<html><body
		 * style="margin:0;padding:0;"><script type="text/javascript"
		 * src="http://ad.leadboltads.net/show_app_ad.js?section_id=137183462"></script></body></html>');
		 * break; case "iOS": $(".admob").html('<html><body
		 * style="margin:0;padding:0;"><script type="text/javascript"
		 * src="http://ad.leadboltads.net/show_app_ad.js?section_id=164023920"></script></body></html>');
		 * break; default: $(".admob").html("<a href='http://www.webbigt.se'><b>Webbigt.se</b> -
		 * it's only one single guy, but he is one darn good web developer. And
		 * yes ladies, he is single.</a>"); break; }
		 */

	}
};

$(function() {
	$(document).ready(function() {
		app.initialize();
		
		getLocation();

		$("#firstpanel").on("click", ".menu_button", function() {
			var ths = $(this).attr("id").split("_");
			if(ths.length==1){
				getList(ths[0], 10);
			}
			else{
				getList(ths[0], ths[1]);
			}
		});

		$("#listbox").on("click", "a", function(e) {
			e.preventDefault();
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
	});

	if (navigator.geolocation) {
		var map;
		var markers = [];
		var latlngbounds = new google.maps.LatLngBounds();
		navigator.geolocation.getCurrentPosition(showPosition);
	} else {
		$("#listbox").slideUp("slow");
	}

	function showPosition(position) {
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
				//$("#listbox").html(data);
				var response = JSON.parse(data);
				if (response.result == "ok") {
					$("#listbox").html(response.list);
					$("#firstpanel").panel("close");
					$("#listbox").fadeIn("fast");
				} else {
					alertK(response.msg);
				}
			}
		});
	}

	function addMarker(latlng, id, myTitle) {
		var image = '../images/map_pin_mobile.png';
		var tempmarker = new google.maps.Marker({
			position : latlng,
			map : map,
			title : myTitle,
			icon : image
		});
		google.maps.event.addListener(tempmarker, 'click', function() {
			window.location = "loppis.php?mid=" + id;
		});

		markers.push(tempmarker);
	}

	function getList(type, value) {
		var dataarr;
		var fetch = false;
		$("#listbox").fadeOut("fast");
		switch (type) {
			case "kommun":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"kommun" : value
				};
			break;
			case "typ":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"typ" : value
				};
			break;
			case "latest":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"from" : value
				};
			break;
			case "weeks":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"from" : value
				};
			break;
			case "omrade":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"from" : value
				};
			break;	
			case "keywords":
				fetch = true;
				dataarr = {
					"mega_secret_code" : "0ed75fcaffd55c3326efccf12f3ae737",
					"action" : type + "_list",
					"from" : value
				};
			break;				
			case "closest":
				fetch = false;
				if (navigator.geolocation) {
					var map;
					var markers = [];
					var latlngbounds = new google.maps.LatLngBounds();
					navigator.geolocation.getCurrentPosition(showPosition);
				} else {
					$("#listbox").slideUp("slow");
				}
			break;
		}

		if (fetch) {
			$.ajax({
				type : "POST",
				url : ajurl + "getcontent.php",
				data : dataarr,
				cache : false,
				success : function(data) {
					var response = JSON.parse(data);
					if (response.result == "ok") {
						$("#listbox").html(response.html);
						$("#firstpanel").panel("close");
						$("#listbox").fadeIn("fast");
					} else {
						console.log(response.msg);
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
