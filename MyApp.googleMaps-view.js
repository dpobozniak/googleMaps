/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */


;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = 'googleMaps',
        defaults = {
            propertyName: "value"
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    }

    Plugin.prototype.init = function () {
        var $element = $(this.element),
            mapData = ($element.data('mapdata')),
            mapOptions = {
                zoom: mapData.zoom,
                center: new google.maps.LatLng(mapData.center.lat, mapData.center.lng),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            map = new google.maps.Map(this.element, mapOptions);
            
        function setMarkers(map, location) {
            for (var i = 0; i < location.length; i += 1) {
                var place = location[i],
                    latLng = new google.maps.LatLng(place.lat, place.lng),
                    marker = new google.maps.Marker({
                        map: map,
                        position: latLng,
                        title: place.title
                    });
                    
                google.maps.event.addListener(marker, 'click', function () {
                    console.log(marker.__gm_id);
                });
            }
            
            
        }
        
        function onMarkerClick() {
            console.log(this);
        }

        setMarkers(map, mapData.markers);
        
        
    };

    // A really lightweight plugin wrapper around the constructor, 
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };

})(jQuery, window);