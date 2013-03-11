// dump(obj) to debug
function dump(obj){var out='';for(var i in obj){out+=i+": "+obj[i]+"\n";}alert(out);}

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

	// store geolocation permissions (so firefox doesn't keep asking)
	Spreedia.askedPermission = false;
	Spreedia.gotPermission = false;

	// distance units/conversion
	Spreedia.metric = false;
	Spreedia.factors = new Array(0.621, 3280);
	Spreedia.units = new Array("miles", "feet");
	Spreedia.metricfactors = new Array(1, 1000);
	Spreedia.metricunits = new Array("km", "m");

	// runs on page load, once templates have been loaded
	Spreedia.init = function(){
		console.log("initializing listeners...");
		// TODO: move these event listeners to another function that can be called after ajax loads?

		// activate (add .active class) according to page format
		$(".format").filter("[data-activate='" + $("body").data("format") + "']").addClass("active");

		// anything with .click class
		$(".click").click(function(){
			$(this).toggleClass("clicked");
			if ($(this).is("button.icon")) Spreedia.updateIcon($(this).attr("data-id"));
			// else if ($(this).is("button.price")) Spreedia.updatePrice($(this).attr("data-id"));
		});

		// anything with .hover class gets .over class on hover
		$(".hover").hover(function(){
			$(this).addClass("over");
		},function(){
			$(this).removeClass("over");
		});

	}

	// additional init stuff for stores pages (e.g. list, map, search results)
	Spreedia.stores_init = function(){
		console.log("initializing list/map stuff...");

		// pricerange slider
		var range = $("#slider-pricerange");
		function slidefunc(event, ui){Spreedia.updatePrice(ui.values[0], ui.values[1]);}
		range.slider({range: true, min: 1, max: 4, values: [ 1, 4 ], slide: slidefunc});
		Spreedia.updatePrice(range.slider("values",0), range.slider("values",1));

		// user location
		Spreedia.updateDistances();

		// "list" format pages only
		if ($("body").attr("data-format") == "list"){

			// sorting
			$("#sortby").change(function(){
				Spreedia.sortStores();
			});

			// white gradient at the top
			$(window).scroll(function () {
				var offset = Spreedia.getScrollOffset();
				if (offset > 0){
					$("body").addClass("offset");
				}else{
					$("body").removeClass("offset");
				}
			});
		}

		// "map" format pages only
		if ($("body").attr("data-format") == "map"){
			Spreedia.initializeMap(stores);
		}

	}

	Spreedia.handle = function(name, context){
		var template = Handlebars.compile($("#" + name + "-template").html());
		var html = template(context);
		$("#hb_" + name).html(html);
	}

	Spreedia.humanReadableDistance = function(d_km){
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

	// only called from updateDistances if position is supported by browser
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
			$(".store").each(function(){

				// arbitrary high starting number
				var min_distance = 10000;

				// find distance to nearest storeinstance
				$(this).find(".storeinstance").each(function(){

					// get lat/lng hypotenuse TODO: just use haversine?!?!?!
					var storelat = parseFloat($(this).attr("data-lat"));
					var storelng = parseFloat($(this).attr("data-lng"));
					/* var latsqdif = Math.pow(storelat - lat, 2);
					var lngsqdif = Math.pow(storelng - lng, 2);
					var distance = Math.sqrt(latsqdif + lngsqdif); */

					var d_km = haversine(lat,lng,storelat,storelng);

					$(this).attr("data-distance", d_km); // TODO: unnecessary?

					if (d_km < min_distance){
						// TODO: give info about nearest instance
						min_distance = d_km;
					}

					var thisfar = Spreedia.humanReadableDistance(d_km);
					$(this).find(".distance").html(thisfar + " from your location");

				});

				$(this).attr("data-distance", min_distance);

			});

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
	        // Netscape
	        // x = window.pageXOffset;
	        y = window.pageYOffset;
	    } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
	        // DOM
	        // x = document.body.scrollLeft;
	        y = document.body.scrollTop;
	    } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
	        // IE6 standards compliant mode
	        // x = document.documentElement.scrollLeft;
	        y = document.documentElement.scrollTop;
	    }
	    // return [x, y];
	    return y;
	}	

	// returns true/false to indicate if position is supported
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
			console.log(" > GEOLOCATION ERROR: " + msg);
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
				console.log(" > Geolocation information is unavailable or has been denied");
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
		var display = $("#amount"), dolla = "$";
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
		var visiblestores = $(".store").filter(":visible");
		if (visiblestores.length == 0){
			console.log(" > no stores are visible, showing message...");
			$("#nomatches").show();
		}else{
			$("#nomatches").hide();
		}

		console.log("// end updatePrice");
	}

	Spreedia.updateIcon = function(id_to_update){
		console.log("updateIcon: " + id_to_update);

		// update icon matches (TODO: is toggling rigorous enough?)
		$(".match").filter("[data-icon='" + id_to_update + "']").toggleClass("matching");

		// clean slate
		console.log(" > removing all existing inherited matches...");
		$(".inherit-match").removeClass("matching").attr("data-matchcount", "0").find(".matchtext").html("");

		// determine if there are now any icons selected at all
		$("body").removeClass("icons-selected");
		var icons_clicked = $("button.icon.clicked").length;
		if(icons_clicked>0){

			// there are some icons selected
			console.log(" > " + icons_clicked + " total icon(s) selected...");
			$("body").addClass("icons-selected");

				// inherit matches
				var matchcount = $(".inherit-match").filter(":has(.matching)").addClass("matching").length;
				console.log(" > " + matchcount + " matches found...");

				// update .matchtext
				console.log(" > updating store matches...");
				$(".inherit-match").each(function(){ // TODO: native to improve speed?
					var matchcount, matchtext;
					if (matchcount = $(this).find(".icon.matching").length){
						$(this).attr("data-matchcount", matchcount);
						var percent = Math.round(100 * matchcount / icons_clicked);
						matchtext = percent + "% Match";
					}else{
						$(this).attr("data-matchcount", "0");
						matchtext = "";
					}
					$(this).find(".matchtext").html(matchtext);
				});

		}else{
			// there are no icons selected
			console.log(" > no icons selected, removing all icon matches...");
			$(".match").removeClass("matching");

		}

		Spreedia.sortStores();

		console.log("// end updateIcon");
	}

	Spreedia.sortStores = function(){
		console.log("sortStores:");
		// var pricerank = [1, 5, 8, 10, 2, 3, 4, 6, 7, 9]; // lowest low end, e.g. $-$$$$ comes before $$
		// var pricerank = [1, 3, 7, 10, 2, 4, 6, 5, 8, 9]; // average, then less variable, e.g. $$ comes before $-$$$
		// var pricerank = [1, 4, 8, 10, 2, 3, 5, 6, 7, 9]; // average, then lowest low end, e.g. $-$$$ comes before $$
		var pricerank = [1, 4, 8, 10, 2, 3, 5, 6, 7, 9];

		// check for visible stores to sort
		console.log(" > checking for stores to sort...");
		var visiblestores = $(".store").filter(":visible");
		if (visiblestores.length > 0){
			// there are visible stores to sort
			$("#nomatches").hide();

			// how are we sorting?
			var sortby = $("#sortby").val();
			console.log(" > sorting " + visiblestores.length + " stores by " + sortby + "...");

			// update distances
			Spreedia.updateDistances();

			// sort visible stores
			visiblestores.sortElements(function(a, b){

				// perform sort comparison
				switch (sortby){

					case "icon":
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
						var ranka = pricerank[$(a).attr("data-pricerange") - 1];
						var rankb = pricerank[$(b).attr("data-pricerange") - 1];
						var result = ranka > rankb ? 1 : ranka == rankb ? (Math.floor(Math.random()*2)*2)-1 : -1;
						break;

					case "price-hi-low":
						var ranka = pricerank[$(a).attr("data-pricerange") - 1];
						var rankb = pricerank[$(b).attr("data-pricerange") - 1];
						var result = ranka < rankb ? 1 : ranka == rankb ? (Math.floor(Math.random()*2)*2)-1 : -1;
						break;

					case "alphabetical":
						var ranka = $(a).attr("data-alphasort");
						var rankb = $(b).attr("data-alphasort");
						var result = ranka > rankb ? 1 : ranka == rankb ? (Math.floor(Math.random()*2)*2)-1 : -1;
						break;

					case "random":
						var result = (Math.floor(Math.random()*2)*2)-1;
						break;

					case "location":
						var ranka = $(a).attr("data-distance");
						var rankb = $(b).attr("data-distance");
						var result = ranka > rankb ? 1 : ranka == rankb ? (Math.floor(Math.random()*2)*2)-1 : -1;
						break;

				}

				return result;
			});


		}else{
			// no stores to sort
			console.log(" > no stores to sort...");
			$("#nomatches").show();
		}

		console.log("// end sortStores");

	}

}( window.Spreedia = window.Spreedia || {}, jQuery ));