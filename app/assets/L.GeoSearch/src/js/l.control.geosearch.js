/*
 * L.Control.GeoSearch - search for an address and zoom to it's location
 * https://github.com/smeijer/leaflet.control.geosearch
 */

L.GeoSearch = {};
L.GeoSearch.Provider = {};

// MSIE needs cors support
jQuery.support.cors = true;

L.GeoSearch.Result = function (x, y, label) {
    this.X = x;
    this.Y = y;
    this.Label = label;
};

L.Control.GeoSearch = L.Control.extend({
    options: {
        position: 'topcenter'
    },

    initialize: function (options) {
        this._config = {};
        L.Util.extend(this.options, options);
        this.setConfig(options);
    },

    setConfig: function (options) {
        this._config = {
            'country': options.country || '',
            'provider': options.provider,
            
            'searchLabel': options.searchLabel || 'search for address...',
            'notFoundMessage' : options.notFoundMessage || 'Sorry, that address could not be found.',
            'messageHideDelay': options.messageHideDelay || 3000,
            'zoomLevel': options.zoomLevel || 18,
            'submitButton': options.submitButton || false
        };
    },

    onAdd: function (map) {
        var $controlContainer = $(map._controlContainer);

        if ($controlContainer.children('.leaflet-top.leaflet-center').length == 0) {
            $controlContainer.append('<div class="leaflet-top leaflet-center"></div>');
            map._controlCorners.topcenter = $controlContainer.children('.leaflet-top.leaflet-center').first()[0];
        }

        this._map = map;
        this._container = L.DomUtil.create('div', 'leaflet-control-geosearch');
        this._container.id = 'leaflet-control-geosearch-form';

        var searchbox = document.createElement('input');
        searchbox.id = 'leaflet-control-geosearch-qry';
        searchbox.type = 'text';
        searchbox.placeholder = this._config.searchLabel;
        this._searchbox = searchbox;
        
        var searchbtn = document.createElement('button');
        searchbtn.id = 'leaflet-control-geosearch-submit';
        searchbtn.className = 'btn';
        searchbtn.innerHTML = '<i class="icon-search"></i>';
        this._searchbtn = searchbtn;

        var msgbox = document.createElement('div');
        msgbox.id = 'leaflet-control-geosearch-msg';
        msgbox.className = 'leaflet-control-geosearch-msg';
        this._msgbox = msgbox;

        var resultslist = document.createElement('ul');
        resultslist.id = 'leaflet-control-geosearch-results';
        this._resultslist = resultslist;

        $(this._msgbox).append(this._resultslist);
        $(this._container).append(this._searchbox, this._msgbox);
        if (this._config.submitButton) {
          $(this._container).append(this._searchbtn);
          var that = this;
<<<<<<< HEAD:assets/L.GeoSearch/src/js/l.control.geosearch.js
          $(this._searchbtn).bind('click', function(){
            that.geosearch($('#leaflet-control-geosearch-qry').val());
          });
          $(this._searchbox).bind('change', function(){
            that.geosearch($('#leaflet-control-geosearch-qry').val());
            //alert('a');
            return false;
          });
 
=======
          $btn.bind('click', function(){
<<<<<<< HEAD:assets/L.GeoSearch/src/js/l.control.geosearch.js
            that.geosearch($('#leaflet-control-geosearch-qry').val());
=======
            that._onKeyUp({keyCode: 13});
>>>>>>> c4c79d47b8c9db312ec0d4874de19015c5628840:app/assets/L.GeoSearch/src/js/l.control.geosearch.js
          })
>>>>>>> 66d34141a4e1146eca2a26e6c0eb4fb01aa8fb8e:app/assets/L.GeoSearch/src/js/l.control.geosearch.js
        }

        L.DomEvent
          .addListener(this._container, 'click', L.DomEvent.stop)
          .addListener(this._container, 'keypress', this._onKeyUp, this);

        L.DomEvent.disableClickPropagation(this._container);

        return this._container;
    },
    
    geosearch: function (qry) {
        try {
            var provider = this._config.provider;

            if(typeof provider.GetLocations == 'function') {
                var results = provider.GetLocations(qry, function(results) {
                    this._processResults(results);
                }.bind(this));
            }
            else {
                var url = provider.GetServiceUrl(qry);

                $.getJSON(url, function (data) {
                    try {
                        var results = provider.ParseJSON(data);
                        this._processResults(results);
                    }
                    catch (error) {
                        this._printError(error);
                    }
                }.bind(this));
            }
        }
        catch (error) {
            this._printError(error);
        }
    },

    _processResults: function(results) {
        if (results.length == 0)
            throw this._config.notFoundMessage;

        this._map.fireEvent('geosearch_foundlocations', {Locations: results});
        this._showLocation(results[0]);
    },

    _showLocation: function (location) {
        //if (typeof this._positionMarker === 'undefined')
        //    this._positionMarker = L.marker([location.Y, location.X]).addTo(this._map);
        //else
        //    this._positionMarker.setLatLng([location.Y, location.X]);

        this._map.setView([location.Y, location.X], this._config.zoomLevel, false);
        this._map.fireEvent('geosearch_showlocation', {Location: location});
    },

    _printError: function(message) {
        $(this._resultslist)
            .html('<li>'+message+'</li>')
            .fadeIn('slow').delay(this._config.messageHideDelay).fadeOut('slow',
                    function () { $(this).html(''); });
    },
    
    _onKeyUp: function (e) {
        var escapeKey = 27;
        var enterKey = 13;

        if (e.keyCode === escapeKey) {
            $('#leaflet-control-geosearch-qry').val('');
            $(this._map._container).focus();
        }
        else if (e.keyCode === enterKey) {
            this.geosearch($('#leaflet-control-geosearch-qry').val());
        }
    }
});