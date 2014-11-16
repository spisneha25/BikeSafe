var directionsDisplays;
var directionsService = new google.maps.DirectionsService();
var map;

var highlightedRoute;
var iconSets;

var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};

function add(p1, p2) {
    var lat = (p1.lat() + p2.lat()) % 180;
    if (lat > 90) {
        lat = lat - 180;
    }
    var lng = (p1.lng() + p2.lng()) % 360;
    if (lng > 180) {
        lat = lat - 360;
    }
    
    return new google.maps.LatLng(lat, lng);
}
        
function mult(p, scl) {
    var lat = (p.lat() * scl) % 180;
    if (lat > 90) {
        lat = lat - 180;
    }
    var lng = (p.lng() * scl) % 360;
    if (lng > 180) {
        lat = lat - 360;
    }
    
    return new google.maps.LatLng(lat, lng);
}     
        
function getDangerValue(latlng) {
    return Math.random() * 10;
}

function defineIcons(latlngs, offset, bounds) {
    var icons = [];
    var increment = !bounds ? 1 : Math.floor(10/(map.getZoom() - 7));
    for (var i = 0; i < latlngs.length-increment; i+=increment) {
        var latlng = latlngs[i];
        var dist = 0;
        for (var j = 0; j < increment; j++) {
            dist += getDistance(latlngs[i+j], latlngs[i+j+1]);
        }
        
        if (!bounds || bounds.contains(latlng)) {
            var dv = getDangerValue(latlng);
            icons.push({
                icon: {
                    path: 'M 0,-.1 0,.1',
                    strokeOpacity: .5,
                    scale: dist/10000,
                    strokeWeight: dv*2.2,
                    strokeColor: '#' + (Math.floor(dv * 25)).toString(16) + 'a0a0'
                },
                offset: offset.off
            });
            offset.dv += dv;
            offset.ct += 1;
        }
        
        offset.off += dist;
    }
    
    return icons;
}

var lastZoom = -1;
var lastResponse = undefined;

/*window.onresize = function(event) {
    var mapElem = document.getElementById("map-canvas");
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    mapElem.style.height = (h - mapElem.offsetTop - 5) + "px";
};*/

function initialize() {
  /*  var mapElem = document.getElementById("map-canvas");
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    mapElem.style.height = (h - mapElem.offsetTop - 5) + "px";
    */
  directionsDisplays = [];
  var chicago = new google.maps.LatLng(41.850033, -87.6500523);
  var mapOptions = {
    zoom:7,
    center: chicago
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  google.maps.event.addListener(map, 'bounds_changed', setUpMap);

}

function setUpMap(newRoutes) {
    if (!lastResponse) {
        return;
    }
    
    iconSets = []

    var bounds = map.getBounds();
    var zoom = map.getZoom();   

    console.log(lastZoom);
    if (zoom > 8 || lastZoom > 8 || lastZoom < 0) {
        var difficulties = [];
        for (var routeNum = 0; routeNum < lastResponse.routes.length; routeNum++) {
            var icons = [];
            var offset = {off:0,ct:0,dv:0};

            if (zoom > 8) {
    //            var disp = add(bounds.getNorthEast(), mult(bounds.getCenter(), -1));
    //            var extendedBounds = new google.maps.LatLngBounds(add(bounds.getCenter(),mult(disp, -1.2)), add(bounds.getCenter(), mult(disp, 1.2)));

                for (var i in lastResponse.routes[routeNum].legs) {
                    for (var j in lastResponse.routes[routeNum].legs[i].steps) {
                        icons = icons.concat(defineIcons(lastResponse.routes[routeNum].legs[i].steps[j].lat_lngs, offset, bounds));
                    }
                }
            } else if (lastZoom > 8 || lastZoom < 0) {
                icons = defineIcons(lastResponse.routes[routeNum].overview_path, offset);
            }

            //Make sure the offsets are scaled to correctly place the dots
            for (var i in icons) {
                var icon = icons[i];

                icon.offset /= 1.0 * offset.off;
                icon.offset = '' + icon.offset*100 + '%';
            }
            
            iconSets.push(icons);

            var polyLineOptions = { strokeOpacity: .7,
                                   strokeWeight: 1,
                                  icons: icons};
            console.log(polyLineOptions);
            directionsDisplays[routeNum].setOptions({polylineOptions: polyLineOptions, preserveViewport:(!newRoutes ? true : false)});
            directionsDisplays[routeNum].setDirections(lastResponse);
            directionsDisplays[routeNum].setRouteIndex(routeNum);
            (function (){
                google.maps.event.addListener(directionsDisplays[routeNum], 'click', function() {
                    alert("erewrw "+routeNum);
                });
                })();

            
            difficulties.push(offset.dv/offset.ct);
        }
        
        if (newRoutes) {
            
            var min = difficulties[0];
            var minIndex = 0;

            for (var i = 1; i < difficulties.length; i++) {
                if (difficulties[i] < min) {
                    minIndex = i;
                    min = difficulties[i];
                }
            }
            
            highlight(minIndex);
        } else {
            highlight(highlightedRoute);
        }
    }
    lastZoom = zoom;
}

function highlight(newHRoute) {
    highlightedRoute = newHRoute;
            
    var icons = iconSets[highlightedRoute];

    /*for (var i = 0; i < icons.length; i++) {
        icons[i].strokeOpacity = 1;
    }*/

//    console.log("highlighted: "+highlightedRoute);

    directionsDisplays[highlightedRoute].setOptions({polylineOptions: {strokeOpacity: 1, strokeWeight: 3, icons: icons}, preserveViewport: true});
    directionsDisplays[highlightedRoute].setDirections(lastResponse);
    directionsDisplays[highlightedRoute].setRouteIndex(highlightedRoute);
}

function calcRoute() {
    try {
      var start = document.getElementById('start').value;
        console.log(start);
      var end = document.getElementById('end').value;
      var request = {
          origin:start,
          destination:end,
          travelMode: google.maps.TravelMode.BICYCLING,
          provideRouteAlternatives: true
      };
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            lastResponse = response;
            for (var i = 0; i < directionsDisplays.length; i++) {
                directionsDisplays[i].setMap(null);
            }
            directionsDisplays = [];
            for (var i = 0; i < lastResponse.routes.length; i++) {
                directionsDisplays.push(new google.maps.DirectionsRenderer());
                directionsDisplays[i].setMap(map);
            }
            setUpMap(true);
        }
      });
    } catch(e) {
    console.log(e);}
    
  return false;
}

google.maps.event.addDomListener(window, 'load', initialize);
