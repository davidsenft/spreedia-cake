(function( Spreedia, $, undefined ) {

	// minified mercator projection functions for converting latlng to x,y
	var TILE_SIZE=256;function bound(value,opt_min,opt_max){if(opt_min!=null)value=Math.max(value,opt_min);if(opt_max!=null)value=Math.min(value,opt_max);return value}function degreesToRadians(deg){return deg*(Math.PI/180)}function radiansToDegrees(rad){return rad/(Math.PI/180)}function MercatorProjection(){this.pixelOrigin_=new google.maps.Point(TILE_SIZE/2,TILE_SIZE/2);this.pixelsPerLonDegree_=TILE_SIZE/360;this.pixelsPerLonRadian_=TILE_SIZE/(2*Math.PI)}MercatorProjection.prototype.fromLatLngToPoint=function(latLng,opt_point){var me=this;var point=opt_point||new google.maps.Point(0,0);var origin=me.pixelOrigin_;point.x=origin.x+latLng.lng()*me.pixelsPerLonDegree_;var siny=bound(Math.sin(degreesToRadians(latLng.lat())),-0.9999,0.9999);point.y=origin.y+0.5*Math.log((1+siny)/(1-siny))*-me.pixelsPerLonRadian_;return point};MercatorProjection.prototype.fromPointToLatLng=function(point){var me=this;var origin=me.pixelOrigin_;var lng=(point.x-origin.x)/me.pixelsPerLonDegree_;var latRadians=(point.y-origin.y)/-me.pixelsPerLonRadian_;var lat=radiansToDegrees(2*Math.atan(Math.exp(latRadians))-Math.PI/2);return new google.maps.LatLng(lat,lng)};

	Spreedia.initializeMap = function(){
		console.log(" > initializing the map...");

		/* TODO: don't allow map if there's no internet connection? */

		// TODO: throw exception if this hasn't been set?
		var stores = Spreedia.context["stores"];

		// map style
		var spreediaStyle = [
			{featureType: "all", stylers: [{saturation: -60}]},
			{featureType: "administrative.neighborhood",stylers: [{visibility: 'off'}]},
			{elementType: "labels",stylers: [{visibility: 'off'}]}
		];
		
		// map options
		var mapOptions = {
			center: new google.maps.LatLng(42.36, -71.06),
			zoom: 15,
			mapTypeControl: false,
			scrollwheel: false, 
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: spreediaStyle,
			streetViewControl: false
		};

		// create the map
		Spreedia.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

		// create the info window
		Spreedia.infowindow = new google.maps.InfoWindow({pixelOffset: new google.maps.Size(2, 8),disableAutoPan: true});

		// neighborhood overlays
		var bostonBounds = new google.maps.LatLngBounds(
		    new google.maps.LatLng(42.33,-71.148),
		    new google.maps.LatLng(42.408,-71.0175));
		var bostonoverlay = new google.maps.GroundOverlay(
		    "/images/mapimages/boston-overlay-black.png",
		    bostonBounds);
		var cambridgeoverlay = new google.maps.GroundOverlay(
		    "/images/mapimages/cambridge-overlay-black.png",
		    bostonBounds);
		bostonoverlay.setMap(Spreedia.map);

		// old icons
		/* var storeicon = new google.maps.MarkerImage("http://guide.spreedia.com/mapimages/marker-selected.png");
		var icon = new google.maps.MarkerImage("http://guide.spreedia.com/mapimages/marker-start.png");
		var smstoreicon = new google.maps.MarkerImage("http://guide.spreedia.com/mapimages/marker-s.png");
		var ghosticon = new google.maps.MarkerImage("http://guide.spreedia.com/mapimages/marker-ghost.png");
		var saleicon = new google.maps.MarkerImage("http://guide.spreedia.com/mapimages/marker-sale.png");
		var eventicon = new google.maps.MarkerImage("http://guide.spreedia.com/mapimages/marker-event.png"); */
		var shadow = new google.maps.MarkerImage("http://guide.spreedia.com/mapimages/shadow-marker.png", null, null, new google.maps.Point(10, 34));
		var ghostshadow = new google.maps.MarkerImage("http://guide.spreedia.com/mapimages/shadow-marker-ghost.png", null, null, new google.maps.Point(10, 34));

		// retina-ready icons
		var retina = window.devicePixelRatio > 1 ? true : false;
		var sized = new google.maps.Size(20, 34);
		var white = retina ? 
			new google.maps.MarkerImage("/images/mapimages/white.png", null, null, null, sized) :
			new google.maps.MarkerImage("/images/mapimages/marker-white.png");
		var ghost = retina ? 
			new google.maps.MarkerImage("/images/mapimages/ghost.png", null, null, null, sized) :
			new google.maps.MarkerImage("/images/mapimages/marker-white.png"); // FIX
		var top = retina ? 
			new google.maps.MarkerImage("/images/mapimages/top.png", null, null, null, sized) :
			new google.maps.MarkerImage("/images/mapimages/marker-white.png"); // FIX
		var over = retina ? 
			new google.maps.MarkerImage("/images/mapimages/over.png", null, null, null, sized) :
			new google.maps.MarkerImage("/images/mapimages/marker-white.png"); // FIX
		var green = retina ? 
			new google.maps.MarkerImage("/images/mapimages/green.png", null, null, null, sized) :
			new google.maps.MarkerImage("/images/mapimages/marker-white.png"); // FIX

		// private vars for store loop
		Spreedia.bounds = new google.maps.LatLngBounds();
		var storelatlngs = new Array();
		var storepins = new Array();
		var ghostpins = new Array();
		
		// public vars for store loop
		Spreedia.pins = new Array();
		Spreedia.infocontent = new Array();

		// store loop!
		for (var i in stores){

			// bigstore = store name / chain (e.g. "gap")
			var bigstore = stores[i];
			for (var j in bigstore.Localinstance){

				// store = store instance (e.g. the gap on newbury street)
				var store = bigstore.Localinstance[j];
				if (store.statusID == '1' && !!store.lat && !!store.lng){

					// info about this store
					var pos = new google.maps.LatLng(store.lat, store.lng);
					var name = bigstore.Storename.name;

					// store this lat/lng and extend the map bounds
					storelatlngs.push(pos);
					Spreedia.bounds.extend(pos);

					// place topmost pin with store id for clicking and hovering
					Spreedia.pins[store.id] = new google.maps.Marker({
						position: pos, icon: top, map: Spreedia.map, title: name, zIndex: 10
					});

					// clicking (module pattern to pass correct ids to listeners)
					(function(id){ 
						google.maps.event.addListener(Spreedia.pins[id],'click',function() {
				  			Spreedia.openTheInfoWindow(id);
						});
					})(store.id);

					// hovering
					google.maps.event.addListener(Spreedia.pins[store.id],'mouseover',function(){
						this.setIcon(green);
						this.setZIndex(11);
					});
					google.maps.event.addListener(Spreedia.pins[store.id],'mouseout',function(){
						this.setIcon(top);
						this.setZIndex(10);
					});

					// info window content
					Spreedia.infocontent[store.id] = "Info Window for " + name;

				}
			}
		}

		Spreedia.map.fitBounds(Spreedia.bounds);

		// visual store markers, id-blind
		storelatlngs.sort(function(a, b){return b.lat() - a.lat();}); // experiment
		for (var k in storelatlngs){
			storepins.push(new google.maps.Marker({
				position: storelatlngs[k], icon: white, shadow: shadow, map: Spreedia.map, zIndex: 8
			}));
			ghostpins.push(new google.maps.Marker({
				position: storelatlngs[k], icon: ghost, map: Spreedia.map, zIndex: 9
			}));
		}

		// resize map to fit browser window
		$(window).resize(function(){
			if ($("#map").is(":visible")){
				Spreedia.repositionMap();
			}
		});

	};

	Spreedia.repositionMap = function(){
		console.log(" > repositioning the map...");
		google.maps.event.trigger(Spreedia.map, 'resize');
		Spreedia.map.fitBounds(Spreedia.bounds);
	};

	Spreedia.openTheInfoWindow = function(id_to_open){
		console.log(" > opening the info window...");
		if (Spreedia.pins[id_to_open]){

			// populate and open the info window
			Spreedia.infowindow.setContent(Spreedia.infocontent[id_to_open]);
			Spreedia.infowindow.open(Spreedia.map,Spreedia.pins[id_to_open]);

			/* reattach infowindow click listener
	 		$(".infobubble a.modal").click(function(){
	  			var text = $(this).parent().html();
	  			var store = $(this).parent().parent().find(".listonly").html();
	  			if ($(this).parent().hasClass("infobubblesale")){
					$.colorbox({html:"<div class='salepopup'><h1>"+store+"</h1>"+text+"</div>"});
				}else{
					$.colorbox({html:"<div class='eventpopup'><h1>"+store+"</h1>"+text+"</div>"});
				}
				return false;
			}); */
			
			/* GHOST PINS
			storepins[id_to_open].setMap(Spreedia.map); */
			
			/* RELOCATION
			var pinposition = ghostpins[id_to_open].getPosition();
	  		var mapcenter = Spreedia.map.getCenter();
	  		relocate(Spreedia.map,pinposition,mapcenter); */
		}

		/* TRACKING
		var track_id = "<?php echo md5(session_id()); ?>";
		var speshloc = "<?php echo $spesh->loc; ?>";
		$.post("/tracker.php", {page: "loc", id: speshloc, type: "info", click: id_to_open, trackid: track_id}); */
	};

}( window.Spreedia = window.Spreedia || {}, jQuery ));