var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

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
        var dist = getDistance(latlngs[i], latlngs[i+increment]);
        
        if (!bounds || bounds.contains(latlng)) {
            var dv = getDangerValue(latlng);
            icons.push({
                icon: {
                    path: 'M 0,-.1 0,.1',
                    strokeOpacity: 1,
                    scale: dist/10000,
                    strokeWeight: dv*2.2,
                    strokeColor: '#' + (Math.floor(dv * 25)).toString(16) + 'a0a0'
                },
                offset: offset.off
            });
        }
        
        offset.off += dist;
    }
    
    return icons;
}

var lastZoom = -1;
var lastResponse = undefined;

window.onresize = function(event) {
    var mapElem = document.getElementById("map-canvas");
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    mapElem.style.height = (h - mapElem.offsetTop - 5) + "px";
};

function initialize() {
    var mapElem = document.getElementById("map-canvas");
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    mapElem.style.height = (h - mapElem.offsetTop - 5) + "px";
    
  directionsDisplay = new google.maps.DirectionsRenderer();
  var chicago = new google.maps.LatLng(41.850033, -87.6500523);
  var mapOptions = {
    zoom:7,
    center: chicago
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);

  google.maps.event.addListener(map, 'bounds_changed', function() {
    if (!lastResponse) {
        return;
    }
    
    var bounds = map.getBounds();
    var zoom = map.getZoom();   

    var icons = [];
    var offset = {off:0};
      
    console.log(lastZoom);
    if (zoom > 8 || lastZoom > 8 || lastZoom < 0) {
        if (zoom > 8) {
            var disp = add(bounds.getNorthEast(), mult(bounds.getCenter(), -1));
            var extendedBounds = new google.maps.LatLngBounds(add(bounds.getCenter(),mult(disp, -1.2)), add(bounds.getCenter(), mult(disp, 1.2)));
            console.log("zoomed!");

            for (var i in lastResponse.routes[0].legs) {
                for (var j in lastResponse.routes[0].legs[i].steps) {
                    icons = icons.concat(defineIcons(lastResponse.routes[0].legs[i].steps[j].lat_lngs, offset, bounds));
                }
            }
        } else if (lastZoom > 8 || lastZoom < 0) {
            icons = defineIcons(lastResponse.routes[0].overview_path, offset);
        }

        //Make sure the offsets are scaled to correctly place the dots
        for (var i in icons) {
            var icon = icons[i];

            icon.offset /= 1.0 * offset.off;
            icon.offset = '' + icon.offset*100 + '%';
        }

        var polyLineOptions = { strokeOpacity: 1,
                               strokeWeight: 1,
                              icons: icons};
        console.log(polyLineOptions);
        directionsDisplay.setOptions({polylineOptions: polyLineOptions, preserveViewport:true});
        directionsDisplay.setDirections(lastResponse);
    }

    lastZoom = zoom;
  });

}

function calcRoute() {
  var start = document.getElementById('start').value;
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
        var icons = [];
        var offset = {off:0};
        /*for (var i in response.routes[0].legs) {
            for (var j in response.routes[0].legs[i].steps) {
                icons = icons.concat(defineIcons(response.routes[0].legs[i].steps[j].lat_lngs, offset));
            }
        }*/
        icons = defineIcons(response.routes[0].overview_path, offset);
        
        for (var i in icons) {
            var icon = icons[i];
            
            icon.offset /= 1.0 * offset.off;
            icon.offset = '' + icon.offset*100 + '%';
        }
        
        var polyLineOptions = { strokeOpacity: 1,
                               strokeWeight: 1,
                              icons: icons};
        console.log(polyLineOptions);
        directionsDisplay.setOptions({polylineOptions: polyLineOptions, preserveViewport:false});
        directionsDisplay.setDirections(response);
    }
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
