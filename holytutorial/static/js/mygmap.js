var map = false;
var zoom = 11;
var infowindow = new google.maps.InfoWindow();
var clickmarker;
var old_marker;
var update = 0;
var marker_placed = false;
var geocoder = new google.maps.Geocoder();
var my_venue = true;
var venue_id = 0;
var all_venue = false;
var all_event = false;
var min_lat = 0;
var max_lat = 0;
var min_lng = 0;
var max_lng = 0;
var check_init = true;
var sports;
function initialize() {
    var myOptions =
    {
        zoom: zoom,
        minZoom: 9,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    clickmarker = new google.maps.Marker(
        {
                position: myLatlng,
                map: map,
                draggable: my_venue
        });
    if (has_location == true){
        infowindow = new google.maps.InfoWindow({
            content: ''//html
        });
        infowindow.open(map, clickmarker);
    }

    google.maps.event.addListener(clickmarker, 'click', function() {
        infowindow.content = html;
        infowindow.open(map, clickmarker);
    });

    if (my_venue == true) {

             google.maps.event.addListener(clickmarker, 'dragstart', function() {
                infowindow.close();
             });

             google.maps.event.addListener(clickmarker, 'dragend', function(event) {
                if(marker_placed) Cancel();
                placeMarker(event.latLng, 0);
             });
    }
    if ((all_venue == true && venues) || (all_event == true && events)){
        var is_venue = (all_venue)? venues: events;
        google.maps.event.addListener(map, 'dragend', function(event) {
            get_bound();
            get_page(all_venue);
            setMarkers(map, is_venue);
        });
        google.maps.event.addListener(map, 'zoom_changed', function(event) {
            get_bound();
            get_page(all_venue);
            setMarkers(map, is_venue);
        });

        google.maps.event.addListener(map, 'idle', function(event) {
            get_bound();
            if(check_init == true){
                get_page(all_venue);
                setMarkers(map, is_venue);
            }
            check_init = false;
        });

    }
}

function get_page(venue){
    if(venue){
        return get_venues();
    }
    return get_events();
}

function get_bound(){
    bounds = map.getBounds();
    min_lat = bounds.getSouthWest().lat();
    max_lat = bounds.getNorthEast().lat();
    min_lng = bounds.getSouthWest().lng();
    max_lng = bounds.getNorthEast().lng();
}

var venues = [];
function get_venues(){
    var btn = $("#list-venue-map"),
        sports = null,
        sports_str = '';

    if(window.FILTERED_SPORTS != undefined){
        sports = window.FILTERED_SPORTS;
        sports_str = sports.toString();
    }

    if(venues != []){ //reset venues
        venues=[]
    }

    loading(btn);

    $.ajax({
        type:'POST',
        url: '/venue/get_venues_by_view_map/',
        data: {"min_lat":min_lat, "max_lat": max_lat, "min_lng" : min_lng, "max_lng": max_lng, "filtered_sports": sports_str},
        success: function(response) {
            loading(btn);
            $("#list-venue-map").html(response);

                $(".one-row").each(function(){
                    var venue_name = $(this).attr("venue-name"),
                        location_name = $(this).attr("location-name"),
                        latitude = $(this).attr("latitude"),
                        longitude = $(this).attr("longitude"),
                        url = $(this).attr("url"),
                        image = $(this).attr("image"),
                        html_image = "",
                        arr_sport_icon = image.split(",");
                        for (var i = 0; i < arr_sport_icon.length; i++) {
                            var str =  "<img src="+ '"' + arr_sport_icon[i] + '" class="tooltip-sport-icon"/>';
                            if(html_image.indexOf(str) == -1){
                                html_image += str;
                            }

                        }
                        var tooltip = '<div><a href="'+ url + '" ><p><b>' + venue_name +"</b></p><p>"+ location_name + "</p><p>"+ html_image +"</p></a></div>";

                    venues.push([tooltip, latitude, longitude, image]);
                });

            if(window.RE_DRAW_MAP == true){
                if (marker_array) {
                    for (i in marker_array) {
                        marker_array[i].setMap(null);
                    }
                }
            }
            setMarkers(map, venues);

        }
    });
}

var events = [];
function get_events(){
    var btn = $("#list-event-map"),
        arr = [],
        arr_temp = [],
        sports = null,
        sports_str = '';

    if(window.FILTERED_SPORTS != undefined){
        sports = window.FILTERED_SPORTS;
        sports_str = sports.toString();
    }

    if(events != []){
        events=[]
    }
    loading(btn);
    $.ajax({
        type:'POST',
        url: '/event/get_events_by_view_map/',
        data: {"min_lat":min_lat, "max_lat": max_lat, "min_lng" : min_lng, "max_lng": max_lng, "filtered_sports": sports_str},
        success: function(response) {
            loading(btn);
            $("#list-event-map").html(response);

                $(".one-row").each(function(){
                    var event_name = $(this).attr("event-name"),
                        location_name = $(this).attr("location-name"),
                        latitude = $(this).attr("latitude"),
                        longitude = $(this).attr("longitude"),
                        url = $(this).attr("url"),
                        url_to_venue = $(this).attr("url-to-venue"),
                        venue_name = $(this).attr("venue-name"),
                        image = $(this).attr("image");
                    one_event = [location_name, latitude, longitude, url, image, event_name,url_to_venue, venue_name]
                    if ($.inArray(location_name, arr) == -1){
                        arr.push(location_name)
                    }
                    arr_temp.push(one_event)
                });

                for (var i = 0; i < arr.length; i++) {
                    var event_push,
                    html_tooltip = "";
                    for(var j = 0; j < arr_temp.length; j++){
                        var div_event =  '<div class="event-tooltip-icon"><a href="'+ arr_temp[j][3] + '"><img src="' + arr_temp[j][4] + '"' + ' class="tooltip-sport-icon"/>' + arr_temp[j][5] +"</a></div>";
                        if(arr_temp[j][0] == arr[i]){
                            html_tooltip += div_event;
                            event_push = [
                                '<p><b>' + arr_temp[j][7] + ' </b></p>'
                                    + '<p><a href="' + arr_temp[j][6] + '">' + arr_temp[j][0] + "</a></p>" + html_tooltip
                                , arr_temp[j][1]
                                , arr_temp[j][2]
                                , arr_temp[j][4]]
                        }
                    }
                    events.push(event_push)
                }

            //clean all markers before adding new ones
            if(window.RE_DRAW_MAP == true){
                if (marker_array) {
                    for (i in marker_array) {
                        marker_array[i].setMap(null);
                    }
                }
            }
            setMarkers(map, events);
        }
    });
}

var marker_array=[];
function setMarkers(map, locations) {
    var image = {
        url: '/assets/icons/map-marker.png',
        size: new google.maps.Size(50, 62),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(0, 32)
    };


    for (var i = 0; i < locations.length; i++) {
        var venues = locations[i];

        var myLatLng = new google.maps.LatLng(venues[1], venues[2]);
        var name = "clickmarker" + i;
        var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            icon: image,
            divcontent : venues[0],
            zIndex: parseInt(venues[2])
        });

        marker_array.push(marker);

        google.maps.event.addListener(marker, 'click', function() {
            if (infowindow) infowindow.close();
            infowindow = new google.maps.InfoWindow({
                    content: this.divcontent
             });
            infowindow.open(map, this);
        });

    }
    window.RE_DRAW_MAP = false;
}

function find_address(e){
     var location = $('#address-find').val();
     var venue = $('#address-find').attr("venue");
     getLocation(location, venue);
     e.preventDefault();
}

function placeMarker(location, upd){
    update      = upd;
    marker_placed = true;
    codeLatLng(location.lat(), location.lng());
    google.maps.event.addListener(infowindow, 'closeclick', function(){
        if(update == 0) clickmarker.setVisible(false);
        clickable = true;
        if(old_marker != undefined) clickmarker = old_marker;
    });

    google.maps.event.addListener(clickmarker, 'click', function(){
        infowindow.open(map, clickmarker);
        update = 1;
    });
}

function Cancel(){
    clickmarker.setVisible(false);
    infowindow.close();
    marker_placed = false;
    if(old_marker != undefined) old_marker.setVisible(true);
}

function get_my_location()
{
    check_init = true;
    navigator.geolocation.getCurrentPosition(success, error);
    return false;
}

function close_location()
{
    Cancel();

}

function codeLatLng(lat, lng) {
    var lat = lat;
    var lng = lng;
    var latlng = new google.maps.LatLng(lat, lng);
        map.setCenter(latlng);
        if(clickmarker) clickmarker.setVisible(false);
        if(infowindow) infowindow.close();
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0])
                {
                    map.setZoom(map.getZoom());
                    clickmarker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        draggable:true
                    });
                    var str = "";
                    if (venue_id != 0) {
                        str = "</p>" + '<p><input type="button" ' + ' venue = "'+ venue_id + '" name="'+ results[0].formatted_address +'" lng="' + lng + '" lat="'+ lat + '" id="update-location-venue" class="btn btn-orange" value="' + gettext('Use this location') + '"/>&nbsp;' +
                                  '<input id="cancel-location-venue" type="button" class="btn btn-green" value="' + gettext('Clear') + '" /></p>';
                    }
                    else if(all_venue == false && all_event == false) {
                        str =  "</p>" + '<p><input type="button" name="'+ results[0].formatted_address +'" lng="' + lng + '" lat="'+ lat + '" id="update-location" class="btn btn-orange" value="' + gettext('Update') + '"/>&nbsp;' +
                               '<input id="cancel-location" type="button" class="btn btn-green" value="' + gettext('Clear') + '" /></p>'
                    }

                    infowindow.setContent("<p>" + results[0].formatted_address + str);
                    infowindow.open(map, clickmarker);
                    google.maps.event.addListener(clickmarker, 'dragstart', function() {
                        infowindow.close();
                    });
                    google.maps.event.addListener(clickmarker, 'dragend', function(event) {
                        if(marker_placed) Cancel();
                        placeMarker(event.latLng, 0);
                    });


                }
                else
                {
                    alert('No results found');
                }
            }
             else {
                alert('Geocoder failed due to: ' + status);
            }
        });
}

function getLocation(location, venue) {
    var venue = venue;
    if(!geocoder) {
       geocoder = new google.maps.Geocoder();
    }

    var geocoderRequest = {
       address: location
    }
    geocoder.geocode(geocoderRequest, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            if (clickmarker) clickmarker.setVisible(false);
            if (infowindow) infowindow.close();
            clickmarker = new google.maps.Marker({
               map: map,
               draggable:true
            })
            lng = results[0].geometry.location.lng();
            lat = results[0].geometry.location.lat();
            clickmarker.setPosition(results[0].geometry.location);
            infowindow = new google.maps.InfoWindow();
            var str = "";
            if (venue){
                str = '<p><input type="button" venue="'+ venue +'" name="'+ results[0].formatted_address +'" lng="' + lng + '" lat="'+ lat + '" id="update-location-venue" class="btn btn-orange" value="' + gettext('Use this location') + '"/>&nbsp;' +
                           '<input id="cancel-location-venue" type="button" class="btn btn-green" value="' + gettext('Clear') + '" /></p>';
            }
            else if(all_venue == false && all_event == false){
                str = '<p><input type="button" name="'+ results[0].formatted_address +'" lng="' + lng + '" lat="'+ lat + '" id="update-location" class="btn btn-orange" value="' + gettext('Update') + '"/>&nbsp;' +
                           '<input id="cancel-location" type="button" class="btn btn-green" value="' + gettext('Clear') + '" /></p>';
            }
            get_bound();
            if(all_venue){
                get_venues();
            }
            else{
                get_events();
            }

            var content = "<p>" + results[0].formatted_address + "</p>" + str;
            infowindow.setContent(content);
            infowindow.open(map, clickmarker);
            google.maps.event.addListener(clickmarker, 'dragstart', function() {
                infowindow.close();
            });
            google.maps.event.addListener(clickmarker, 'dragend', function(event) {
                if(marker_placed) Cancel();
                placeMarker(event.latLng, 0);
            });
        }
    });
}

function success(position){
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    codeLatLng(lat, lng);

}

function error(){
    alert("Can not get your location!");
}

/*---filter sports ----*/
function show_filter_sport(){
    var sport_modal = $('#filter-sport-modal');

    $("#filter-sport").load('/account/filter_sport/', function() {
        sport_modal.modal('show');
    })

    sport_modal.on('shown', memorized_sports)
}

function memorized_sports()
{
     if(window.FILTERED_SPORTS != undefined){
        var sport_ids = window.FILTERED_SPORTS;

        for(var i = 0; i < sport_ids.length; i++){
            $('.btn-sport').filter('[sport-id='+sport_ids[i]+']').addClass('active')
        }
    }
}

function select_filter_sport()
{
    $(this).toggleClass('active')
}

function set_filter_sport()
{
    var sport_ids = []
    
    $('.btn-sport.active').each(function() {
        sport_ids.push($(this).attr('sport-id'))
    })

    window.FILTERED_SPORTS  =   sport_ids
    window.RE_DRAW_MAP      =   true

    if (venues != '') {
        get_venues()
    } else if (events != '') {
        get_events()
    }
}
