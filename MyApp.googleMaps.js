/*!
 * author: Darek Pobożniak
 * author uri: http://pobozniak.pl
 */

var MyApp = MyApp === undefined ? {} : MyApp;

MyApp.googleMaps = (function ($, window, document, undefined) {
    'use strict';

    var mapOptions = {
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            noGeoZoom: 6,
            noGeoLat: '52.173931692568',
            noGeoLng: '18.8525390625'
        },
        map = new google.maps.Map(document.getElementById('map'), mapOptions),
        autocomplete = new google.maps.places.Autocomplete(document.getElementById('searchTextField')),
        initialLocation = null,
        infoWindow,
        infoWindowClass = '.info-window',
        markersArray = [],
        dataToSave = {},
        contentString = "<div class='info-window'>\
        <p><label for='iw-title'>Nazwa:</label> <input type='text' id='iw-title'></p>\
        <p><label for='iw-content'>Opis:</label> <textarea id='iw-content' cols='20' rows='5'></textarea></p>\
        <p><button class='btn primary save-marker'>zapisz</button> <button class='btn delete-marker'>usuń</button></p></div>";

    function placeMarker(position, map) {
        var marker = new google.maps.Marker({
                position: position,
                map: map,
                draggable: true
            }),
            latLng = marker.getPosition();

        markersArray.push({
            id: marker.__gm_id,
            marker: marker
        });
        dataToSave.markers.push({
            id: marker.__gm_id,
            lat: latLng.lat(),
            lng: latLng.lng(),
            title: '',
            description: ''
        });
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open(map, this);
            var $infoWindow = $(infoWindowClass).data('markerid', marker.__gm_id),
                idik = marker.__gm_id,
                i = 0,
                el = null;
            for (i = 0; i < dataToSave.markers.length; i += 1) {
                el = dataToSave.markers[i];
                if (el.id === idik) {
                    $infoWindow.find('input').val(el.title);
                    $infoWindow.find('textarea').val(el.description);
                }
            }
        });
        return marker;
	}

    function handleGeolocationQuery(position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(initialLocation);
        infoWindow = new google.maps.InfoWindow({
            content: contentString
        });

        dataToSave = {
            center: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            },
            mapTypeId: mapOptions.mapTypeId,
            zoom: mapOptions.zoom,
            markers: []
        };

        placeMarker(initialLocation, map);
    }

    function handleNoGeolocation() {
        var position = {
            coords: {
                latitude: mapOptions.noGeoLat,
                longitude: mapOptions.noGeoLng
            }
        };
        map.setZoom(6);
        handleGeolocationQuery(position);
    }

    function handleErrors(error) {
        switch (error.code) {
        // user did not share geolocation data
        case error.PERMISSION_DENIED: handleNoGeolocation();
            break;

        // could not detect current position
        case error.POSITION_UNAVAILABLE: handleNoGeolocation();
            break;

        // retrieving position timed out
        case error.TIMEOUT: alert("retrieving position timed out");
            break;

        default: alert("unknown error");
            break;
        }
    }

    function init() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(handleGeolocationQuery, handleErrors);
        } else {
            alert("I'm sorry, but geolocation services are not supported by your browser.");
        }
    }

    google.maps.event.addListener(map, 'zoom_changed', function () {
        document.getElementById('dt-zoom').innerHTML = map.getZoom();
        dataToSave.zoom = map.getZoom();
    });

    google.maps.event.addListener(map, 'maptypeid_changed', function () {
        document.getElementById('dt-maptype').innerHTML = map.getMapTypeId();
        dataToSave.mapTypeId = map.getMapTypeId();
    });

    google.maps.event.addListener(map, 'click', function (e) {
        placeMarker(e.latLng, map);
    });

    function autoCenter() {
        //  Create a new viewpoint bound
        var bounds = new google.maps.LatLngBounds();
        //  Go through each...
        $.each(markersArray, function (index, markersArr) {
            bounds.extend(markersArr.marker.position);
        });
        infoWindow.close();
        //  Fit these bounds to the map
        map.fitBounds(bounds);
    }

    $('#setCenter').click(function (e) {
        e.preventDefault();
        autoCenter();
    });

    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        //infowindow.close();
        var place = autocomplete.getPlace();
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }

        placeMarker(place.geometry.location, map);
    });

    $('body').delegate('.delete-marker', 'click', function (e) {
        e.preventDefault();
        var idik = $(this).parents(infoWindowClass).data('markerid'),
            i = 0,
            el = null;
        for (i = 0; i <  markersArray.length; i += 1) {
            el = markersArray[i];
            if (el.id === idik) {
                el.marker.setMap(null);
                markersArray.splice(i, 1);
            }
        }
        for (i = 0; i < dataToSave.markers.length; i += 1) {
            el = dataToSave.markers[i];
            if (el.id === idik) {
                dataToSave.markers.splice(i, 1);
            }
        }
    });

    $('body').delegate('.save-marker', 'click', function (e) {
        e.preventDefault();
        var $parent = $(this).parents(infoWindowClass),
            idik = $parent.data('markerid'),
            $title = $parent.find('input'),
            $description = $parent.find('textarea'),
            el = null;
        for (var i = 0; i < dataToSave.markers.length; i += 1) {
            el = dataToSave.markers[i];
            if (el.id === idik) {
                el.title = $title.val();
                el.description = $description.val();
            }
        }
      
        console.log(dataToSave);
    });

    $('#saveMap').click(function (e) {
        e.preventDefault();
        console.log('Zapisano: ' + JSON.stringify(dataToSave));
    });

    return {
        init: init
    };
}(jQuery, window, document));

google.maps.event.addDomListener(window, 'load', MyApp.googleMaps.init());