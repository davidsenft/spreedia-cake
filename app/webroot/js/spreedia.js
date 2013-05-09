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

	// helpful jquery body object
	Spreedia.jbody = $("body");

	// current app data
	// TODO: can we get some of these from the body data attrs? or might they not have loaded?
	Spreedia.context = false; // current stores data TODO: one for each datatype?
	Spreedia.dataType = Spreedia.jbody.attr("data-datatype"); // "nearby", "search", "location", or "favorites"
	Spreedia.format = Spreedia.jbody.attr("data-format"); // "list", "map", or "activity" // TODO: not using this yet!!
	Spreedia.title = Spreedia.jbody.attr("data-title"); // page title
	Spreedia.storeinstance = false;

	// helpful globals
	Spreedia.matchingstores = 0;

	// setTimeout() timer
	Spreedia.timer = 0;

	// user MAJOR TODO!!!!!!!!!!!!!!!!
	Spreedia.userid = false;
	Spreedia.user = false;
	Spreedia.position = false;

	// User settings // TODO!!!!!!!!!!!!!!!
	Spreedia.settings = {
		"nearThreshhold": 5 // in km
	}

	// geolocation permission (so firefox doesn't keep asking)
	Spreedia.askedPermission = false;

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
		console.log(Spreedia.storeinstance);

		// load current user data
		Spreedia.loadUser();

		switch (Spreedia.dataType){
			case "location":
				Spreedia.initLocation();
				break;
			case "favorites":
				Spreedia.initFavorites();
				break;
			case "storeinstance":
				Spreedia.initStoreInstance();
				break;
		}

		// white gradient at the top when scrolling
		$(window).scroll(function () {
			var offset = Spreedia.getScrollOffset();
			if (offset > 0){
				Spreedia.jbody.addClass("offset");
			}else{
				Spreedia.jbody.removeClass("offset");
			}
		});

		$("#bigredbutton").click(function(){
			// Spreedia.loadFavoritesDataByUserId(Spreedia.userid);
			Spreedia.loadLocationDataById(5);
		});

		// body .click listener
		Spreedia.jbody.on("click", ".click", function(){
			$(this).toggleClass("clicked");

		// these depend on 'clicked' being set first, so they have to go here
		}).on("click", "button.icon", function(){
			Spreedia.updateIcon($(this).attr("data-id"));

		}).on("click", ".heartable", function(){
			Spreedia.syncHeart(this);

		}).on("click", ".store h3", function(){
			var id_to_load = $(this).attr('data-load-location');
			Spreedia.loadLocationDataById(id_to_load);

		}).on("click", ".modal-open", function(){
			var modal_id = $(this).attr('data-modal');
			console.log("opening " + modal_id + " modal...");
			$("#" + modal_id).addClass("on");
			Spreedia.jbody.addClass("modal-on");

		});

		// close modal window
		$("#modal-back").click(function(){
			console.log("closing modal...");
			$(".modal-on").removeClass("modal-on");
			$(".modal").removeClass("on");
		});

		// resize page header
		Spreedia.checkTitle(false);
		Spreedia.checkTitle(true); // fixes weird behavior in chrome
		$(window).resize(function(){
			Spreedia.checkTitle(true);
		});
		
	}

	Spreedia.checkTitle = function(allow_lengthening){
		// console.log("checkTitle:");
		var jtitle = $("#pagetitle");
		var current_title = jtitle.text();
		var height = $("h1").height();

		if (height > 60){
			// console.log("h1 title is too long");
			var words = current_title.split(" ");
			words.pop();
			var shorter_title = words.join(" ") + "...";
			shorter_title = shorter_title.replace(",...","...");
			// console.log(" > shortening to '" + shorter_title + "'");
			jtitle.text(shorter_title);
			Spreedia.checkTitle(false);

		}else if ((current_title != Spreedia.title) && allow_lengthening){
			// can we undo overflow?
			clearTimeout(Spreedia.timer);
			Spreedia.timer = setTimeout(function(){
				// console.log(" > attempting to put the title back...");
				jtitle.text(Spreedia.title);
				Spreedia.checkTitle(false);
			},300);
		}

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
				// TODO: maybe run updatePosition() here?
			}
		});
		console.log(Spreedia.user);
	}

	// Called by datatype init or when user changes format
	Spreedia.setFormat = function(format){
		console.log("format: " + format);

		// hide current content view
		$(".content_view").hide();

		// get new format
		switch (format){

			case "list":
				Spreedia.jbody.removeClass("map").addClass("list").attr("data-format", "list");
				$("#list").show();
				// TODO: only load storelist if it hasn't been loaded, or always load it?
				break;

			case "map":
				/* TODO: don't go to map if no internet connection */
				Spreedia.jbody.removeClass("list").addClass("map").attr("data-format", "map");
				$("#map").show();
				if (!Spreedia.map) Spreedia.initializeMap();
				Spreedia.repositionMap();
				break;
		}

		// TODO: if this is only being used by #format li, simplify?
		console.log(" > activating...");
		$(".format").removeClass("active").filter("[data-activate='" + Spreedia.jbody.attr("data-format") + "']").addClass("active");
	
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
		Spreedia.loadBreadcrumbs();
		Spreedia.loadStoreList(); // TODO: move function here, or rename to loadLocation, or reuse it in initFavorites
		
		Spreedia.jbody.removeClass("icons-selected");
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

		Spreedia.jbody.removeClass("icons-selected");
		Spreedia.loadPanel();  // TODO: remove, move, or do conditionally

		Spreedia.afterTemplates();

		console.timeEnd('initFavorites');
	}

	Spreedia.initStoreInstance = function(){
		console.log("initStoreInstance:");
		console.time('initStoreInstance');

		// if we already have context, keep it, but if not, the store is our context
		// TODO: questionable. fetch top store context with Ajax? Get it in the first place?
		if (!Spreedia.context) Spreedia.context = Spreedia.storeinstance;

		Spreedia.loadTop();
		Spreedia.loadStoreinstance();

		Spreedia.afterTemplates();

		// TODO: could move this to afterTemplates()
		Spreedia.initStoreSlider();

		console.timeEnd('initStoreInstance');
	}

	/*********************************************************** 
	 * AJAX DATA LOADS
	 * These fetch json data, set Spreedia.context, and call a Data Load
	 ***********************************************************/

	// loads a location and stores resulting data in context
	Spreedia.loadLocationDataById = function(id){

		// TODO: all location just load their top(ish?) location, and then here, we first check if
		// TODO: location is in the current chain, and if so just apply a show/hide filter!!
		// TODO: maybe just like each loc has a city, each loc has a 'load' location to actually load?

		Spreedia.logHeader("loadLocationDataById: " + id);
		$.getJSON('/locations/view/' + id + '.json', function(result) {
			Spreedia.context = result;
			Spreedia.setDataType("location");
			Spreedia.initLocation();
		});
	}

	// loads a favorites list and stores resulting data in context
	Spreedia.loadFavoritesDataByUserId = function(id){
		Spreedia.logHeader("loadFavoritesDataByUserId: " + id);
		$.getJSON('/users/favorites/' + id + '.json', function(result) {
			Spreedia.context = result;
			Spreedia.setDataType("favorites");
			Spreedia.initFavorites();
		});
	}

	Spreedia.loadStoreinstanceDataById = function(id){
		Spreedia.logHeader("loadStoreinstanceDataById: " + id);
		// TODO
	}

	// called by Ajax Data Loads
	Spreedia.setDataType = function(datatype){
		Spreedia.dataType = datatype;
		Spreedia.jbody.attr("data-datatype", datatype);
	}

	// called by Ajax Data Loads
	Spreedia.logHeader = function(msg){
		console.log("------------------------------------");
		console.log(msg);
		console.log("------------------------------------");
	}

	/*********************************************************** 
	 * TEMPLATE LOADS
	 * These load a handlebars template and add appropriate listeners
	 ***********************************************************/

	// TODO
	Spreedia.loadStoreinstance = function(){
		// handlebars template
		Spreedia.handle("storeinstance","storeinstance");

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
		Spreedia.updatePosition(true);
		$("#sortby").change(function(){
			Spreedia.sortStores(false);
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
	};

	// Called by initLocation()
	Spreedia.loadTop = function(){
		// handlebars template
		Spreedia.handle("top");

		// page format
		$("#format").on("click", "li", function(){
			Spreedia.setFormat($(this).attr("data-activate"));
		});
	};

	Spreedia.loadBreadcrumbs = function(){
		// handlebars template
		Spreedia.handle("breadcrumbs");
	};

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

		// update user location
		// Spreedia.updatePosition();
	};

	// handle template 'name' with context 'context' (Spreedia.context by default)
	// 'context' here is a string representing a Spreedia property, not the object itself
	// TODO: see if Spreedia has a property that matches name, and if so, use that for the context
	Spreedia.handle = function(name, context){
		if (!context || !Spreedia.hasOwnProperty(context)) context = "context";
		console.log(" > loading '" + name + "' template...");
		var template = Handlebars.compile($("#" + name + "-template").html());
		var html = template(Spreedia[context]);
		$("#hb_" + name).html(html);
	};

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
		}); */

		if (Spreedia.user){

			// show existing hearts
			var savedstores = Spreedia.user['Savedstore'];
			for (x in savedstores){
				var savedstore_id = savedstores[x]['id'];
				var storename_id = savedstores[x]['storename_id'];
				$(".heartable[data-storename='" + storename_id + "']").addClass("clicked")
					.attr('data-ssid', savedstore_id)
					.attr('title', "This is one of your favorite stores");
			}
		}

		// determine and activate format
		// TODO: is this the best place for this? after everything else?
		Spreedia.setFormat(Spreedia.jbody.attr("data-format"));

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
					// TODO: just give it the whole friggin location
					instance.locationName = data.location.name;
					instance.City = data.city ? data.city : data.location;
					storename.Localinstance.push(instance);

				}else if (loc_id in data.children){

					// store instance is in a child location
					instance.locationName = data.children[loc_id].name;
					var city_id = data.children[loc_id].city
					if (city_id in data.children){
						instance.City = data.children[city_id];
					}else{
						// TODO: only do this once, and store City in context!
						// TODO: or just fucking do shit the easy way
						instance.City = data.city ? data.city : data.location;
					}
					storename.Localinstance.push(instance);
				}
			}
		}

		// breadcrumbs
		// TODO: shouldn't have to push location and parent chain separately... this is dumb.
		// Just make fucking JSON return everything (location, parent, city, children) in
		// one nice context!!!!
		Spreedia.context.breadcrumbs = [];
		// TODO: somehow use one global/helper function for this and the H1?
		function locationName(location){
			if (location.isCity) return location.name + ", " + location.state;
			else return location.name;
		}
		function pushLocationCrumb(location){
			var url = "/locations/view/" + location.id;
			var locname = locationName(location);
			var crumb = {name: locname, url: url};
			Spreedia.context.breadcrumbs.push(crumb);
			if (location.parent) pushLocationCrumb(location.Parent);
		}
		Spreedia.context.breadcrumbs.push({name: locationName(Spreedia.context.location), url: false});	
		if (Spreedia.context.parent) pushLocationCrumb(Spreedia.context.parent);
		Spreedia.context.breadcrumbs.push({name: "Search by Location", url: "/locations"});
		Spreedia.context.breadcrumbs.reverse();			

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
				// instance.city = loc.City.name;
				// instance.state = loc.City.state;
				instance.City = loc.City; // TODO: just keep this as is with Location.City?
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

		// NOTE: this depends on clicked already being updated!
		var jheartable = $(heartable);
		var action = jheartable.hasClass("clicked") ? "add" : "delete"; 
		var model = "savedstore";

		switch (action){
			case "add":
				var user_id = Spreedia.user['User']['id']; // TODO: make sure this is calculated at time of click
				var storename_id = jheartable.attr("data-storename");
				var post_data = {"user_id" : user_id, "storename_id" : storename_id};
				var callback = function(data){
					console.log("added " + model + " with id " + data);
					jheartable.attr("data-ssid", data).attr("title", "This is one of your favorite stores");
					// success callback TODO: indicate sync
				};
				break;

			case "delete":
				var ss_id = jheartable.attr('data-ssid');
				var post_data = {"id" : ss_id};
				var callback = function(data){
					console.log("deleted " + model + " with id " + data);
					jheartable.attr("data-ssid", "").attr("title", "Add to your favorite stores");
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
		return "About <strong>" + d_rounded + " " + d_unit + "</strong>";
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

	// Called by UpdatePosition()
	Spreedia.setDistancesFromPosition = function(){
		// TODO: check to see if distances are already set correctly
		// update store distances
		console.log(" > > setting store distances from user's position...");
		var lat = Spreedia.position.coords.latitude, 
			lng = Spreedia.position.coords.longitude;
		for (x in Spreedia.context.stores){
			var store = Spreedia.context.stores[x];

			// arbitrary high starting number
			var min_distance = 10000;
			var closest_instance;

			// find distance to nearest storeinstance
			for (y in store.Storeinstance){
				var instance = store.Storeinstance[y];
				var storelat = parseFloat(instance.lat);
				var storelng = parseFloat(instance.lng);
				var d_km = haversine(lat,lng,storelat,storelng);
				instance.distance = d_km;
				if (d_km < min_distance){
					// TODO: give info about nearest instance
					min_distance = d_km;
					closest_instance = instance.id;
				}
				var thisfar = Spreedia.humanReadableDistance(d_km);
				$("#instance" + instance.id).find(".distance").html(thisfar + " from your location");
			}
			store.distance = min_distance;

			// use the distance of the closest instance
			var jstore = $("#store" + store.Storename.id);
			jstore.attr("data-distance", min_distance);

			if (store.Storeinstance.length > 1){
				// list closest store instance first
				jstore.find(".storelocations").prepend($("#instance" + closest_instance));
			}

		}
	}

	// Called by sortStores(false) and calls sortStores(true)
	Spreedia.updatePosition = function(sort_after){
		console.log("updatePosition:");

		function geoSuccess(position){
			console.log(" > GEOLOCATION SUCCESS:");

			var lat = position.coords.latitude, 
				lng = position.coords.longitude;

			$("#sortby option[value='location']").prop('disabled', false);
			Spreedia.position = position;
			Spreedia.setDistancesFromPosition();

			console.log(" > > user coordinates are: " + lat + ", " + lng);

			// update sort now if we're sorting by distance
			if (sort_after) Spreedia.sortStores(true);

			console.log(" > // end geoSuccess");
		}

		function geoError(error){
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
			console.log(" > GEOLOCATION ERROR: " + msg);
			console.log(" > > disabling location-based sorting...");
			$("#sortby option[value='location']").prop('disabled', true);
			Spreedia.position = false;
			// TODO: error message of some kind?
		}

		var do_geolocation = false;
		var do_sort = false;
		if (!Spreedia.askedPermission && navigator.geolocation){
			// we haven't even tried yet
			do_geolocation = true;

		}else{
			// we already tried, so what happened?
			if (Spreedia.position){
				// great! do we need to update the info? TODO: only if mobile? + better console msgs
				var firefox = !!(navigator.userAgent.indexOf("Firefox")>0);
				if (!firefox){
					var how_long_since_we_asked = new Date().getTime() - Spreedia.askedPermission.getTime();
					console.log(" > we asked " + Math.round(how_long_since_we_asked/1000) + " seconds ago...");
					if (how_long_since_we_asked > 60000){
						do_geolocation = true;
					}else{
						console.log(" > no need to update user location (since we just asked)");
						do_sort = true;
					}
									
				}else{
					console.log(" > can't update user location (in order to be polite on firefox)");
					do_sort = true;
				}	

			}else{
				// no permission or no geolocation // TODO: which? might matter...
				console.log(" > geolocation information is unavailable or has been denied");
				console.log(" > disabling location-based sorting...");
				$("#sortby option[value='location']").prop('disabled', true);
				// TODO: if distance is selected, change to something else?
				$(".store").attr("data-distance", 0);
				$(".storeinstance").attr("data-distance", 0);
			}
		}

		if (do_geolocation){
			// geolocation
			console.log(" > asking geolocation permission...");
			// TODO: set time limit for response, if it doesn't happen, go "offline!"
			navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
			Spreedia.askedPermission = new Date();

		}else if (sort_after && do_sort){
			// update sort
			Spreedia.setDistancesFromPosition();
			Spreedia.sortStores(true);
		}

		console.log("// end updatePosition");
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
		Spreedia.jbody.removeClass("icons-selected");
		var icons_clicked = $("button.icon.clicked");
		if(icons_clicked.length>0){

			// there are some icons selected
			console.log(" > " + icons_clicked.length + " total icon(s) selected...");
			Spreedia.jbody.addClass("icons-selected");

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

		Spreedia.sortStores(false);
		
		console.log("// end updateIcon");
		console.timeEnd('updateIcon and sortStores');
	}

	// Called by sortStores() and by updatePrice()
	Spreedia.getVisibleStores = function(){
		// TODO: definitely store as a global/dom thang, updated after price range or icon changes
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

	// Called by updateIcon() and by updatePosition()
	Spreedia.sortStores = function(distances_are_good){
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

			// if set to default, choose sorting method
			if (sortby == "default"){
				console.log(" > determining default sorting method...");
				// TODO: we should store num icons clicked and geo success as global
				if ($("button.icon.clicked").length == 0 && Spreedia.position){
					sortby = "location";
				}else{
					sortby = "icon";
				}
			}

			console.log(" > checking if we're ready to sort by " + sortby + "...");

			if (sortby == "location"){
				if (!distances_are_good){
					console.log(" > not ready to sort by location yet");
					console.log(" > updating distances...");
					// this will sort with correct distances when it's done
					Spreedia.updatePosition(true);
					console.log("// end sortStores");
					return false;
				}else{
					console.log(" > we're ready to sort by location");
				}
			}else{
				if (distances_are_good){
					// TODO: remove?
					// this is happening because panel is reloading and resetting distance to disabled
					console.log(" > hmmmmm, looks like we already sorted");
					console.log(" > THIS SHOULD NEVER HAPPEN NOW! REMOVE?");
					console.log("// end sortStores");
					return false;
				}else{
					console.log(" > updating distances just for fun...");
					Spreedia.updatePosition(false);
				}
			}

			console.log(" > sorting " + visiblestores.length + " stores...");

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

					/* case "favorites":
						tabtext = "Favorites";
						var ranka = $(a).find(".heartable").hasClass("clicked") ? 1 : 0;
						var rankb = $(b).find(".heartable").hasClass("clicked") ? 1 : 0;
						var result = rankb - ranka;
						break; */

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

					/* case "random":
						tabtext = "Random";
						var result = (Math.floor(Math.random()*2)*2)-1;
						break; */

					case "location":
						tabtext = "Closest to Me";
						var ranka = $(a).attr("data-distance");
						var rankb = $(b).attr("data-distance");
						var result = ranka > rankb ? 1 : ranka == rankb ? (Math.floor(Math.random()*2)*2)-1 : -1;
						break;

				}

				// console.log("sort comparison: " + result);
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

	Spreedia.initStoreSlider = function(){
		var navbuttons = $('#slidenav button');

		$('.iosSlider').iosSlider({
			autoSlide: true,
			snapToChildren: true,
			desktopClickDrag: true,
			navSlideSelector: navbuttons,
			scrollbar: true,
			// scrollbarHide: false
			scrollbarLocation: 'bottom',
			// scrollbarHeight: '6px',
			// scrollbarBackground: 'url(_img/some-img.png) repeat 0 0',
			// scrollbarBorder: '1px solid #000',
			// scrollbarMargin: '0 30px 16px 30px',
			// scrollbarOpacity: '0.75',
			onSlideChange: Spreedia.changeSlideIdentifier
		});

		navbuttons.first().addClass("selected");
	}

	// iosSlider callback for slide identifiers
	Spreedia.changeSlideIdentifier = function(args){
		args.settings.navSlideSelector.removeClass("selected")
			.eq(args.currentSlideNumber - 1).addClass("selected");
	}

	

}( window.Spreedia = window.Spreedia || {}, jQuery ));