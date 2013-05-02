// dump(obj) to debug
function dump(obj){var out='';for(var i in obj){out+=i+": "+obj[i]+"\n";}alert(out);}
function logg(obj){var out='';for(var i in obj){out+=" > "+i+": "+obj[i]+"\n";}return out;}

// jQuery.fn.sortElements (minified on 10/31/12)
jQuery.fn.sortElements=(function(){var a=[].sort;return function(b,c){c=c||function(){return this};var d=this.map(function(){var a=c.call(this),b=a.parentNode,d=b.insertBefore(document.createTextNode(""),a.nextSibling);return function(){if(b===this){throw new Error("Descendant sort error.")}b.insertBefore(this,d);b.removeChild(d)}});return a.call(this,b).each(function(a){d[a].call(c.call(this))})}})();

// string repeat for $$ slider
String.prototype.repeat=function(num){return new Array(parseInt(num)+1).join(this);};

// toRad() function for haversine formula
Number.prototype.toRad=function(){return this*Math.PI/180;}

// haversine for converting lat,lng to distance 
function haversine(lat1,lng1,lat2,lng2){
	var R = 6371; // km
	var dLat = (lat2-lat1).toRad();
	var dLng = (lng2-lng1).toRad();
	var lat1 = lat1.toRad();
	var lat2 = lat2.toRad();
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}


;(function( Spreedia, $, undefined ) {

	// current app data
	Spreedia.context = false; // current stores data TODO: one for each datatype?
	Spreedia.dataType = false; // "nearby", "search", "location", or "favorites"
	Spreedia.format = false; // "list", "map", or "activity" // TODO: not using this yet!!

	// helpful globals
	Spreedia.matchingstores = 0;

	// user MAJOR TODO!!!!!!!!!!!!!!!!
	Spreedia.userid = false;
	Spreedia.user = false;

	// User settings // TODO!!!!!!!!!!!!!!!
	Spreedia.settings = {
		"nearThreshhold": 5 // in km
	}

	// store geolocation permissions (so firefox doesn't keep asking)
	Spreedia.askedPermission = false;
	Spreedia.gotPermission = false;

	// distance units/conversion
	Spreedia.metric = false;
	Spreedia.factors = new Array(0.621, 3280);
	Spreedia.units = new Array("miles", "feet");
	Spreedia.metricfactors = new Array(1, 1000);
	Spreedia.metricunits = new Array("km", "m");

	// Runs only once on page load, calls the appropriate data type init
	Spreedia.init = function(){
		// for debugging
		console.log(Spreedia.context);

		// load current user data
		Spreedia.loadUser();

		// get initial datatype
		Spreedia.dataType = $("body").attr("data-datatype");

		switch (Spreedia.dataType){
			case "location":
				Spreedia.initLocation();
				break;
			case "favorites":
				Spreedia.initFavorites();
				break;
		}

		// white gradient at the top when scrolling
		$(window).scroll(function () {
			var offset = Spreedia.getScrollOffset();
			if (offset > 0){
				$("body").addClass("offset");
			}else{
				$("body").removeClass("offset");
			}
		});

		$("#bigredbutton").click(function(){
			// Spreedia.loadFavoritesDataByUserId(Spreedia.userid);
			Spreedia.loadLocationDataById(5);
		});

		// body .click listener
		$("body").on("click", ".click", function(){
			$(this).toggleClass("clicked");

		// these depend on 'clicked' being set first, so they have to go here
		}).on("click", "button.icon", function(){
			Spreedia.updateIcon($(this).attr("data-id"));

		}).on("click", ".heartable", function(){
			Spreedia.syncHeart(this);

		});
	}

	// TODO: overkill to do this via json? Just get from session?
	Spreedia.loadUser = function(){
		// synchronous json
		$.ajax({
			url: '/users/view/' + Spreedia.userid + '.json',
			dataType: 'json',
			async: false,
			// data: myData,
			success: function(data) {
				Spreedia.user = data;
			}
		});
		console.log(Spreedia.user);
	}

	Spreedia.changeDataType = function(){
		// call the appropriate data type init TODO: or just call data load?
	}

	// Called by datatype init or when user changes format
	Spreedia.setFormat = function(format){
		console.log("format: " + format);

		// hide current content view
		$(".content_view").hide();

		// get new format
		switch (format){

			case "list":
				$("body").removeClass("map").addClass("list").attr("data-format", "list");
				$("#list").show();
				// TODO: only load storelist if it hasn't been loaded, or always load it?
				break;

			case "map":
				$("body").removeClass("list").addClass("map").attr("data-format", "map");
				$("#map").show();
				if (!Spreedia.map) Spreedia.initializeMap();
				Spreedia.repositionMap();
				break;
		}

		// TODO: if this is only being used by #format li, simplify?
		console.log(" > activating...");
		$(".format").removeClass("active").filter("[data-activate='" + $("body").attr("data-format") + "']").addClass("active");
	
		console.log("// end format");
	}

	/*********************************************************** 
	 * DATATYPE INITS
	 * These should be called after Spreedia.context has been set/changed
	 *   (either by page init() or by user action)
	 * They load the appropriate templates, add listeners, and set format
	 ***********************************************************/

	Spreedia.initLocation = function(){
		console.log("initLocation:");
		console.time('initLocation');

		// prepare location data for templates
		Spreedia.prepareLocationData();

		// load templates
		Spreedia.loadTop();  // TODO: remove, move, or do conditionally
		Spreedia.loadStoreList(); // TODO: move function here, or rename to loadLocation, or reuse it in initFavorites
		
		$("body").removeClass("icons-selected");
		Spreedia.loadPanel();  // TODO: remove, move, or do conditionally

		// add general listeners to loaded templates
		Spreedia.afterTemplates();

		console.timeEnd('initLocation');
	}

	Spreedia.initFavorites = function(){
		console.log("initFavorites:");
		console.time('initFavorites');

		// prepare favorites data for templates
		Spreedia.prepareFavoritesData();

		// load templates
		Spreedia.loadTop();  // TODO: remove, move, or do conditionally
		Spreedia.loadStoreList();

		$("body").removeClass("icons-selected");
		Spreedia.loadPanel();  // TODO: remove, move, or do conditionally

		Spreedia.afterTemplates();

		console.timeEnd('initFavorites');
	}

	/*********************************************************** 
	 * AJAX DATA LOADS
	 * These fetch json data, set Spreedia.context, and call a Data Load
	 ***********************************************************/

	Spreedia.loadLocationDataById = function(id){
		$.getJSON('/locations/view/' + id + '.json', function(result) {
			Spreedia.context = result;
			Spreedia.initLocation();
		});
	}

	Spreedia.loadFavoritesDataByUserId = function(id){
		$.getJSON('/users/favorites/' + id + '.json', function(result) {
			Spreedia.context = result;
			Spreedia.initFavorites();
		});
	}

	/*********************************************************** 
	 * TEMPLATE LOADS
	 * These load a handlebars template and add appropriate listeners
	 ***********************************************************/

	// Called by loadStoreinstanceData()
	Spreedia.loadStore = function(){
		// ... 

	}

	// Called by initLocation() AFTER loadStoreList()
	// TODO: right now this is in a weird tweener place, because we aren't actually changing anything about
	// the panel based on location's json, so we don't need to load it with new location data, we can just
	// load it once... if we decide to do all icon<->store processing in js, for example, then we should
	// get rid of loadPanel or at least not call it every single time we do a new data load
	Spreedia.loadPanel = function(){
		// handlebars template
		Spreedia.handle("panel");
		
		// pricerange filter slider
		var range = $("#slider-pricerange");
		function slidefunc(event, ui){Spreedia.updatePrice(ui.values[0], ui.values[1]);}
		range.slider({range: true, min: 1, max: 4, values: [ 1, 4 ], slide: slidefunc});
		Spreedia.updatePrice(range.slider("values",0), range.slider("values",1));

		// sorting
		console.log(" > sorting...");
		Spreedia.sortStores();
		$("#sortby").change(function(){
			Spreedia.sortStores();
		});

		// icons
		console.log(" > checking icons...");
		$("#iconspanel").find("button.icon").each(function(){
			var $this = $(this);
			var count = $(".store.icon-" + $this.attr("data-id")).length; // TODO: save as globals?
			if (count == 0){
				$this.attr('title', $this.attr('title') + ' (no matching stores)');
				$this.addClass("inactive");
			}
		});
	}

	// Called by initLocation()
	Spreedia.loadTop = function(){
		// handlebars template
		Spreedia.handle("top");

		// page format
		$("#format").on("click", "li", function(){
			Spreedia.setFormat($(this).attr("data-activate"));
		});
	}

	// Called by initLocation()
	Spreedia.loadStoreList = function(){

		// handlebars template
		// TODO: should we put this off if currently in map format?
		Spreedia.handle("storelist");

		// expanding TODO: are we still doing this?
		// TODO: do this only for lists?
		$(".expandable-for-verysmall").click(function(){
			$(this).toggleClass("expanded");
		});

		// user preferences
		// TODO: somehow get just user prefs related to this one location? b/c otherwise this is going ot get SLOW!!! (i think?)
		// TODO: this stuff is applicable to more than just location, so, move it?
		// TODO: shortcut if we're in favorites view, since they're all hearted!!
		if (Spreedia.user){

			// show existing hearts
			var savedstores = Spreedia.user['Savedstore'];
			for (x in savedstores){
				var id = savedstores[x]['id'];
				var storename = savedstores[x]['storename_id'];
				$("[data-storename='" + storename + "']").find(".heartable").addClass("clicked").attr('data-ssid', id);
			}
		}

		// update user location
		// Spreedia.updateDistances();
	}

	Spreedia.handle = function(name){
		console.log(" > loading '" + name + "' template...");
		var template = Handlebars.compile($("#" + name + "-template").html());
		var html = template(Spreedia.context);
		$("#hb_" + name).html(html);
	}

	/*********************************************************** 
	 * MISCELLANY / HELPERS / ONE-OFFS
	 ***********************************************************/
 
	// Called by initLocation() and initFavorites() after templates have been loaded
	Spreedia.afterTemplates = function(){
		console.log("afterTemplates:");
		console.log(" > adding listeners to loaded templates...");

		// anything with .hover class gets .over class on hover
		// TODO: make sure this isn't being added multiple times to the same elements
		$(".hover").hover(function(){
			$(this).addClass("over");
		},function(){
			$(this).removeClass("over");
		});

		// click panel tabs to toggle on/off
		// TODO: probably getting rid of this, but if not, only needs to be called once in init()
		// TODO: also click should be delegated
		$("#paneltabs dd a").click(function(){
			$("#" + $(this).attr("data-panel") + "panel").toggleClass("on");
		});

		// determine and activate format
		// TODO: is this the best place for this? after everything else?
		Spreedia.setFormat($("body").attr("data-format"));

		// determine and activate datatype?
		// TODO: is this in the right place here?

	}

	Spreedia.prepareLocationData = function(){
		// each storename gets a Localinstance array with info about local store instances
		var data = Spreedia.context;
		for(x in data.stores){
			var storename = data.stores[x];
			storename.Localinstance = new Array();
			for (y in storename.Storeinstance){
				var instance = storename.Storeinstance[y];
				var loc_id = instance['location_id'];
				if (loc_id == data.location.id){
					// store instance is in our location
					instance.locationName = data.location.name;
					storename.Localinstance.push(instance);
				}else if (loc_id in data.children){
					// store instance is in a child location
					instance.locationName = data.children[loc_id].name;
					storename.Localinstance.push(instance);
				}
			}
		}
	}

	Spreedia.prepareFavoritesData = function(){
		var thresh = Spreedia.settings.nearThreshhold;

		// each storename gets a Localinstance array with info about nearest store instances
		var data = Spreedia.context;
		for(x in data.stores){
			var savedstore = data.stores[x];

			// make favorites store data look like location store data
			var things = ["Icon", "Image", "Activestorename", "Pricerange", "Storeinstance"];
			for(x in things){
				t = things[x];
				savedstore[t] = savedstore.Storename[t]; delete savedstore.Storename[t];
			}
			
			savedstore.Localinstance = new Array();
			for (y in savedstore.Storeinstance){
				var instance = savedstore.Storeinstance[y];
				var loc_id = instance['location_id'];

				// all instances considered "local"
				// TODO: rename these vars?
				var loc = instance.Location;
				instance.locationName = loc.City.name + ", " + loc.City.state;
				if (loc.City.id != loc.id){
					instance.locationName += " (" + loc.name + ")";
				}
				savedstore.Localinstance.push(instance);

			}
		}
	}

	Spreedia.syncHeart = function(heartable){

		// TODO: update Spreedia.user!!!!
		// TODO: maybe even just update Spreedia.user and then call something like syncUser()
		// TODO: alternatively, just reload user data via json <--- I like this idea!!!!

		if (!Spreedia.user){
			console.log("TODO: force user registration");
			return false;
		}

		// TODO: add or remove ss-id to/from the .heartable
		// NOTE: this depends on clicked already being updated!
		var action = $(heartable).hasClass("clicked") ? "add" : "delete"; 
		var model = "savedstore";

		switch (action){
			case "add":
				var user_id = Spreedia.user['User']['id']; // TODO: make sure this is calculated at time of click
				var storename_id = $(heartable).parents(".store").attr("data-storename");
				var post_data = {"user_id" : user_id, "storename_id" : storename_id};
				var callback = function(data){
					console.log("added " + model + " with id " + data);
					$(heartable).attr("data-ssid", data);
					// success callback TODO: indicate sync
				};
				break;

			case "delete":
				var ss_id = $(heartable).attr('data-ssid');
				var post_data = {"id" : ss_id};
				var callback = function(data){
					console.log("deleted " + model + " with id " + data);
					$(heartable).attr("data-ssid", "");
					// success callback TODO: indicate sync
				};
				break;
		}
		
		var url = "/" + model + "s/" + action + ".json";
		$.post(url, post_data, callback);
	}

	// TODO: I think this is for use with history.js stuff...
	Spreedia.address = function(){
        var loc = String(document.location);
        var idx = loc.indexOf('#');
        return -1 == idx ? "" : loc.substring(idx + 1);
	}

	Spreedia.humanReadableDistance = function(d_km){
		// console.log("converting " + d_km + " km...")
		var d_factors = Spreedia.metric ? Spreedia.metricfactors : Spreedia.factors;
		var d_units = Spreedia.metric ? Spreedia.metricunits : Spreedia.units;
		var d = d_km * d_factors[0]; 
		var d_unit, d_rounded;
		if (d < 0.22){
			d = d_km * d_factors[1];
			d_unit = d_units[1];
			if (d > 100) d_rounded = Math.round(d/100)*100; // nearest hundred
			else d_rounded = Math.round(d/10)*10; // nearest ten
		}else{
			if (d < 0.28){
				d_rounded = "1/4";
				d_unit = "mile";
			}else{
				d_rounded = Math.round(d*2)/2; // nearest 0.5
				d_unit = d_units[0];
				if (d_rounded == 0.5) d_rounded = "1/2";
				if ((d_rounded == 1 || d_rounded == "1/2") && d_unit == "miles") d_unit = "mile";
			}
		}
		return "About " + d_rounded + " " + d_unit;
	}

	// Called by updateDistances() only if position is supported by browser
	Spreedia.setDistancesFromPos = function(position){
		console.log("setDistancesFromPos:");
		
		// are we getting geolocation permission for the first time?
		if (Spreedia.gotPermission == false){
			console.log(" > GEOLOCATION SUCCESS!");
			console.log(" > accuracy: " + position.coords.accuracy);
			console.log(" > heading: " + position.coords.heading);
			console.log(" > speed: " + position.coords.speed);
			Spreedia.gotPermission = true;
			console.log(" > enabling location-based sorting...");
			$("#sortby option[value='location']").prop('disabled', false);
		}

		// user's current position
		var lat = position.coords.latitude, lng = position.coords.longitude;
		
		// determine if position has changed
		var previouslat = $("body").attr("lat"), previouslng = $("body").attr("lng");
		if (lat != previouslat || lng != previouslng){

			// position has changed, or we're getting it for the first time
			console.log(" > user coordinates are: " + lat + ", " + lng);
			$("body").attr("lat", lat).attr("lng", lng);
			
			// update store distances
			console.log(" > updating store distances from user's position...")
			//// $(".store").each(function(){
			for (x in Spreedia.context.stores){

				//// new
				var store = Spreedia.context.stores[x];

				// arbitrary high starting number
				var min_distance = 10000;

				// find distance to nearest storeinstance
				//// $(this).find(".storeinstance").each(function(){
				for (y in store.Storeinstance){

					//// new
					var instance = store.Storeinstance[y];

					//// var storelat = parseFloat($(this).attr("data-lat"));
					//// var storelng = parseFloat($(this).attr("data-lng"));
					var storelat = parseFloat(instance.lat);
					var storelng = parseFloat(instance.lng);

					var d_km = haversine(lat,lng,storelat,storelng);

					//// $(this).attr("data-distance", d_km); // TODO: unnecessary?
					instance.distance = d_km;

					if (d_km < min_distance){
						// TODO: give info about nearest instance
						min_distance = d_km;
					}

					var thisfar = Spreedia.humanReadableDistance(d_km);
					//// $(this).find(".distance").html(thisfar + " from your location");
					$("#instance" + instance.id).find(".distance").html(thisfar + " from your location");

				//// });
				}

				//// $(this).attr("data-distance", min_distance);
				store.distance = min_distance;
				$("#store" + store.id).attr("data-distance", min_distance);

			//// });
			}

		}else{
			// position has not changed
			console.log(" > user position has not changed (" + lat + ", " + lng + ")");
		}

		console.log("// end setDistancesFromPos");
	}

	Spreedia.getScrollOffset = function(){
	    // var x = 0, y = 0;
	    var y = 0;
	    if( typeof( window.pageYOffset ) == 'number' ) {
	        // Netscape // x = window.pageXOffset;
	        y = window.pageYOffset;
	    } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
	        // DOM // x = document.body.scrollLeft;
	        y = document.body.scrollTop;
	    } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
	        // IE6 standards compliant mode // x = document.documentElement.scrollLeft;
	        y = document.documentElement.scrollTop;
	    }
	    // return [x, y];
	    return y;
	}	

	// Called by sortStores()
	Spreedia.updateDistances = function(){
		console.log("updateDistances:");

		// error handling callback for geolocation call
		function showError(error){
			var msg;
			switch(error.code){
			case error.PERMISSION_DENIED:
				msg = "User denied the request for Geolocation.";
				break;
			case error.POSITION_UNAVAILABLE:
				msg = "Location information is unavailable.";
				break;
			case error.TIMEOUT:
				msg = "The request to get user location timed out."
				break;
			case error.UNKNOWN_ERROR:
				msg = "An unknown error occurred."
				break;
			}
			console.log("GEOLOCATION ERROR: " + msg);
			console.log(" > disabling location-based sorting...");
			$("#sortby option[value='location']").prop('disabled', true);
			Spreedia.gotPermission = false;
		}

		var do_geolocation = false;
		if (!Spreedia.askedPermission && navigator.geolocation){
			// we haven't even tried yet
			do_geolocation = true;

		}else{
			// we already tried, so what happened?
			if (Spreedia.gotPermission){
				// great! do we need to update the info? TODO: only if mobile? + better console msgs
				var firefox = !!(navigator.userAgent.indexOf("Firefox")>0);
				if (!firefox){
					var how_long_since_we_asked = new Date().getTime() - Spreedia.askedPermission.getTime();
					console.log(" > we asked " + Math.round(how_long_since_we_asked/1000) + " seconds ago...");
					if (how_long_since_we_asked > 60000){
						do_geolocation = true;
					}else{
						console.log(" > no need to update user location (since we just asked)");
					}
									
				}else{
					console.log(" > can't update user location (in order to be polite on firefox)");
				}	

			}else{
				// no permission or no geolocation // TODO: which? might matter...
				console.log(" > geolocation information is unavailable or has been denied");
				$("#sortby option[value='location']").prop('disabled', true);
				$(".store").attr("data-distance", 0);
				$(".storeinstance").attr("data-distance", 0);
			}
		}

		if (do_geolocation){
			// geolocation
			console.log(" > asking geolocation permission...");
			navigator.geolocation.getCurrentPosition(Spreedia.setDistancesFromPos, showError);
			Spreedia.askedPermission = new Date();
		}

		console.log("// end updateDistances");
	}

	Spreedia.updatePrice = function(from, to){
		console.log("updatePrice: ");

		// update display
		var display = $(".dolladisplay"), dolla = "$";
		if (from === to) display.html(dolla.repeat(to));
		else display.html(dolla.repeat(from) + " - " + dolla.repeat(to));

		// price match
		var pricechart = {"1": [1, 5, 6, 7], "2": [2, 5, 6, 7, 8, 9], "3": [3, 6, 7, 8, 9, 10], "4": [4, 7, 9, 10]};
		var pricematch = new Array();
		for (i=from;i<=to;i++){pricematch = pricematch.concat(pricechart[i.toString()]);}
		pricematch = $.grep(pricematch,function(v,k){return $.inArray(v,pricematch)===k;});
		console.log(" > pricematch: " + pricematch);

		// blank slate
		console.log(" > removing all pricematches...");
		$(".store").removeClass("pricematch");

		for (i in pricematch){
			// console.log(" > adding pricematch to pricerange " + pricematch[i] + "...");
			$(".store").filter("[data-pricerange='" + pricematch[i] + "']").addClass("pricematch");
		}

		// show message if no stores are visible
		var visiblestores = Spreedia.getVisibleStores();
		if (visiblestores.length == 0){
			console.log(" > no stores are visible, showing message...");
			$("#nomatches").show();
		}else{
			$("#nomatches").hide();
		}

		console.log("// end updatePrice");
	}

	// Called by icon button click, set in afterTemplates()
	Spreedia.updateIcon = function(id_to_update){
		console.time('updateIcon and sortStores');
		console.log("updateIcon: " + id_to_update);

		// update icon matches (TODO: is toggling rigorous enough?)
		// TODO: might be good to make this reset and add matching for the sake of .pricematch.matching stuff...
		$(".match").filter("[data-icon='" + id_to_update + "']").toggleClass("matching");

		// clean slate
		console.log(" > removing all existing inherited matches...");
		$(".inherit-match").removeClass("matching").attr("data-matchcount", "0").find(".matchtext").html("");

		// determine if there are now any icons selected at all
		$("body").removeClass("icons-selected");
		var icons_clicked = $("button.icon.clicked");
		if(icons_clicked.length>0){

			// there are some icons selected
			console.log(" > " + icons_clicked.length + " total icon(s) selected...");
			$("body").addClass("icons-selected");

			// update panel tab text TODO: there's gotta be a better/faster way
			var icons_html = "";
			icons_clicked.each(function(){icons_html += $(this).html();});
			if (icons_html.length > 4) icons_html = icons_html.substring(0,3) + "...";
			// TODO: make sure "..." shows up in all browsers or is part of the spreedia font
			$("#iconstab a").addClass("icon").html(icons_html);

			// inherit matches
			var matchcount = $(".inherit-match").filter(":has(.matching)").addClass("matching").length;
			console.log(" > " + matchcount + " matches found...");

			// update .matchtext
			console.log(" > updating store matches...");
			$(".inherit-match").each(function(){ // TODO: native to improve speed?
				var matchcount // , matchtext;
				if (matchcount = $(this).find(".icon.matching").length){
					$(this).attr("data-matchcount", matchcount);
					var percent = Math.round(100 * matchcount / icons_clicked.length);
					// matchtext = percent + "% Match";
				}else{
					$(this).attr("data-matchcount", "0");
					// matchtext = "";
				}
				// $(this).find(".matchtext").html(matchtext);
			});

		}else{
			// there are no icons selected
			console.log(" > no icons selected, removing all icon matches...");
			$(".match").removeClass("matching");
			$("#iconstab a").removeClass("icon").html("Categories");

		}

		Spreedia.sortStores();
		
		console.log("// end updateIcon");
		console.timeEnd('updateIcon and sortStores');
	}

	// Called by sortStores() and by updatePrice()
	Spreedia.getVisibleStores = function(){
		// TODO: store as a global/dom thang, updated after price range or icon changes
		var num_icons_clicked = $("button.icon.clicked").length;
		if (num_icons_clicked == 0){
			// .matching doesn't matter, just count stores that match price
			var visiblestores = $(".store").filter(".pricematch");
		}else{
			// count stores that match icons and price
			var visiblestores = $(".store").filter(".matching.pricematch");
		}
		return visiblestores;
	}

	// Called by loadPanel() and by updateIcon()
	Spreedia.sortStores = function(){
		console.log("sortStores:");
		// var pricerank = [1, 5, 8, 10, 2, 3, 4, 6, 7, 9]; // lowest low end, e.g. $-$$$$ comes before $$
		// var pricerank = [1, 3, 7, 10, 2, 4, 6, 5, 8, 9]; // average, then less variable, e.g. $$ comes before $-$$$
		// var pricerank = [1, 4, 8, 10, 2, 3, 5, 6, 7, 9]; // average, then lowest low end, e.g. $-$$$ comes before $$
		var pricerank = [1, 4, 8, 10, 2, 3, 5, 6, 7, 9];

		// check for visible stores to sort
		console.log(" > checking for stores to sort...");
		var visiblestores = Spreedia.getVisibleStores();

		if (visiblestores.length > 0){
			// there are visible stores to sort
			$("#nomatches").hide();

			// how are we sorting?
			var sortby = $("#sortby").val();
			var tabtext;
			console.log(" > sorting " + visiblestores.length + " stores by " + sortby + "...");

			// update distances
			Spreedia.updateDistances();

			// sort visible stores
			visiblestores.sortElements(function(a, b){

				// perform sort comparison
				switch (sortby){

					case "icon":
						tabtext = "Best Match";
						var am = parseInt($(a).attr("data-matchcount")); // TODO: convert to native DOM for speed?
						var bm = parseInt($(b).attr("data-matchcount")); // ...
						var at = parseInt($(a).attr("data-iconcount")); // ...
						var bt = parseInt($(b).attr("data-iconcount")); // ...
						var result = am < bm ? 
									// more matches
									1 : 
								am == bm ? 
									// same number of matches
									(at == bt || am == 0) ? 
										// same % of matches, make it r-r-r-random
										(Math.floor(Math.random()*2)*2)-1 :
				 					at > bt ? 
				 						// greater % of matches
				 						1 : 
				 						// smaller % of matches
					 					-1 : 
					 				// fewer matches
					 				-1;
					 	break;

					case "price-low-hi":
						tabtext = "Price Low->Hi";
						var ranka = pricerank[$(a).attr("data-pricerange") - 1];
						var rankb = pricerank[$(b).attr("data-pricerange") - 1];
						var result = ranka > rankb ? 1 : ranka == rankb ? (Math.floor(Math.random()*2)*2)-1 : -1;
						break;

					case "price-hi-low":
						tabtext = "Price Hi->Low";
						var ranka = pricerank[$(a).attr("data-pricerange") - 1];
						var rankb = pricerank[$(b).attr("data-pricerange") - 1];
						var result = ranka < rankb ? 1 : ranka == rankb ? (Math.floor(Math.random()*2)*2)-1 : -1;
						break;

					case "alphabetical":
						tabtext = "Alphabetical";
						var ranka = $(a).attr("data-alphasort");
						var rankb = $(b).attr("data-alphasort");
						var result = ranka > rankb ? 1 : ranka == rankb ? (Math.floor(Math.random()*2)*2)-1 : -1;
						break;

					case "random":
						tabtext = "Random";
						var result = (Math.floor(Math.random()*2)*2)-1;
						break;

					case "location":
						tabtext = "Closest to Me";
						var ranka = $(a).attr("data-distance");
						var rankb = $(b).attr("data-distance");
						var result = ranka > rankb ? 1 : ranka == rankb ? (Math.floor(Math.random()*2)*2)-1 : -1;
						break;

				}

				return result;
			});

			$("#sortbytab a").html("Sort by: " + tabtext);


		}else{
			// no stores to sort
			console.log(" > no stores to sort...");
			$("#nomatches").show();
		}

		console.log("// end sortStores");
	}

	

}( window.Spreedia = window.Spreedia || {}, jQuery ));