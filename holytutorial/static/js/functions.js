$(window).load(function() {
    window.WALL_TYPE = {_FRIEND_CHAT : 1, _FRIEND_WALL : 2, _EVENT_WALL : 3, _VENUE_WALL : 4};
    window.RET_CODE = {_SUCCESS : 1, _FAIL : 2, _SYSTEM_ERROR : 3, _HAS_MESSAGE: 4};
    FB.init({appId: APPID, oauth : true , status: true, cookie: true, frictionlessRequests: true});
    $('#left-menu li').click(load_content_left_menu);
    $('.animated.on-load').show();
    $('.profile-mask').live('click', link_to_profile)

    init_search()
    get_profile_tooltip()
    if(typeof(update_notification) != 'undefined') {
        update_notification();
    }
});


function post_to_feed(data, callback) {
    var name        = data.name,
        caption     = data.caption,
        desc        = data.description,
        link        = data.link,
        picture     = data.picture,
        facebook_id = data.facebook_id;

    FB.ui({
        method: 'feed',
        description: (desc),
        name: name,
        caption: caption,
        link: link,
        picture: picture,
        to: facebook_id
    },function(response) {
        var success = response && response.post_id;
        callback({
            success: success != null
        })
    })
}

$(".post-face").live("click", function(){
      data = {
        name: 'hacker',
        caption: gettext('Your wall is hacked'),
        description: gettext('You are a dog!'),
        link: 'http://sexygirl.com',
        picture: 'http://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Ball_python_lucy.JPG/701px-Ball_python_lucy.JPG',
        facebook_id:'100005226661281'
    }

    post_to_feed(data, function (res) {
        if (! res.success) {
            alert("no post");
            return
        }
        else{
            alert("posted");
            return
        }
    });
});




$.ajaxSetup({
     beforeSend: function(xhr, settings) {
         function getCookie(name) {
             var cookieValue = null;
             if (document.cookie && document.cookie != '') {
                 var cookies = document.cookie.split(';');
                 for (var i = 0; i < cookies.length; i++) {
                     var cookie = jQuery.trim(cookies[i]);
                     // Does this cookie string begin with the name we want?
                 if (cookie.substring(0, name.length + 1) == (name + '=')) {
                     cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                     break;
                 }
             }
         }
         return cookieValue;
         }
         if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
             // Only send the token to relative URLs i.e. locally.
             xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
         }
     }
});

function loading(btn)
{
    var loading = btn.find('.loading').length
    if (loading) {
        btn
            .html(btn.find('.hide').html())
            .prop('disabled', false);
    } else {
        btn
            .html('<span class="hide">'+ btn.html() + '</span>')
            .prop('disabled', true)
            .append($('.loading:first').clone())
    }
}

function check_success(btn, msg)
{
    var msg_tag = $(msg)
    if (msg_tag.hasClass('profile-success') || msg.search('successfully') > 0) {
        btn.hide()
    }
}

function load_content_left_menu() {

    var url = $(this).attr('data-url'),
        loading = $('.loading:first'),
        link = $(this),
        icon = link.find('i'),
        content = $('#main-content'),
        callback = $(this).attr('data-callback')

    if (url) {
        content.animate({'top': 2000}, function() {
            $(this).toggle()
        })

        $('#left-menu li a').removeClass('active')
        link.children('a').addClass('active')

        icon
            .html(loading.clone())
            .attr('data-background-image', icon.css('background-image'))
            .css('background-image', 'none')

        $.ajax({
            type:'GET',
            url:url,
            success: function(response) {
                setTimeout(function() {

                    icon
                        .css('background-image', icon.attr('data-background-image'))
                        .find('.loading').remove()

                    content
                        .html(response)
                        .css('top', 0)
                        .toggle()

                       callback = eval(callback)
                       if (typeof(callback) == "function") {
                            callback()
                       }


                }, 1500)
            }
        });
    }
}

function link_to_profile() {
    var url = $(this).attr('data-profile-url');
    if(url) {
        window.location.href = url;
    }
}

function move_search()
{
    var input = $('#txt-search')
    if (input.val() == "") {
        input.removeClass('displayed')
    } else {
        input.addClass('displayed')
    }
}

/* -------------- instant search in dashboard --*/

function init_search()
{
    var input = $("#txt-search")

    if (! input.length) {
        return
    }

    $('.search')
        .mouseout(move_search)
        .bind('mouseenter click', function() {
            $("#txt-search").focus()
        })
    $('#txt-search').blur(move_search)

    // Custom UI autocomplete
    $.widget( "custom.catcomplete", $.ui.autocomplete, {
        _renderMenu: function( ul, items ) {
            var that = this,
            currentCategory = "",
            icon = ""

            $.each( items, function( index, item ) {
                if ( item.category != currentCategory ) {
                    icon =  '<i class="icon-user"></i>'
                    ul.append('<li class="ui-autocomplete-category">'+ icon + item.category + '</li>' );
                    currentCategory = item.category;
                }
                that._renderItemData( ul, item );
            });
        }
    });

    // Apply autocomplete on search input
    input.catcomplete({
        source: function(request, response) {
            $.ajax({
                url: window.INSTANT_SEARCH_URL,
                dataType: "jsonp",
                data: {
                    key: request.term
                },
                success: function(data) {
                    response($.map(data, function(item) {
                        return {
                            label: item.name,
                            value: item.name,
                            item_url: item.url,
                            icon: item.image,
                            category: item.category
                        };
                    }));
                }
            });
        },
        minLength: 2,
        select: function(event, ui) {
            window.location.replace(ui.item.item_url);
        }
    }).data("custom-catcomplete")._renderItem = function (ul, item) {
        return $("<li></li>")
            .data("item.autocomplete", item)
            .append('<a><img class="profile-img small" src="'+ item.icon + '" />'+ item.label + '<div class="profile-mask white"></div></a>')
            .appendTo(ul);
    };

}

/*-------tooltip for profile player--------*/
function get_profile_tooltip()  {
    $('.tooltip-user').live('mouseout', function() {
        $(this).popover('hide');
    })

    $('.tooltip-user').live('mouseover', function() {
        var profile = $(this),
            user_id = $(this).attr('message-user-id'),
            url_string = window.PLAYER_TOOLTIP,
            trigger = 'hover',
            placement='right'

        loading_popover($(this), placement, trigger);

        if (window.PROFILE_TOOLTIP && window.PROFILE_TOOLTIP[user_id]) {
            var data = window.PROFILE_TOOLTIP[user_id];
            display_tooltip(profile, data, trigger, placement);
        } else {
            $.ajax({
                url: url_string,
                type:'GET',
                data: { player_id: user_id},
                success: function(data) {
                    if (! window.PROFILE_TOOLTIP) {
                        window.PROFILE_TOOLTIP = [];
                    }

                    window.PROFILE_TOOLTIP[user_id] = data;
                    display_tooltip(profile, data, trigger, placement);
                }
            });
        }
    });
}

function loading_popover(selector, placement, trigger)
{
    selector.popover({
        html:"true",
        title: 'Loading...',
        placement: placement,
        trigger: trigger
    }).popover('show')
}

function hide_tooltip(selector)
{
    selector.find('[message-type]').popover('hide')
    selector
        .addClass('pop-hidden')
        .removeClass('pop-active')
}

function display_tooltip(selector, content, trigger, placement)
{

    if (content == '' || ! $(selector).is(':hover')) {
        return;
    }

    var msg = selector.parents('.msg'),
        popover = $(selector).data('popover')

    if (popover.options.content != '' && popover && ! msg.hasClass('pop-hidden')) {
        hide_tooltip(msg)
        return
    }

    var c = $(content)
        title_tag = c.find('h1'),
        title = title_tag.html(),
        title_class = title_tag.attr('class')

    if (popover) {
        popover.options.content = content
        popover.options.title = title
    } else {
        selector.popover({
            html: "true",
            title: title,
            placement: placement,
            trigger: trigger,
            content: content
        })
    }

    selector.popover('show')

    if (trigger == 'click') {
        hide_tooltip($('.pop-active'))
        msg.removeClass('pop-hidden').addClass('pop-active')
        if (title_class) {
            $('.pop-active .popover-title').addClass(title_class)
        }
    }
}

function cancel_popover(action)
{
    var msg = $('.pop-active')

    if (action == 'destroy') {
        //msg.removeClass('message-type-1 message-type-2')
    }

    hide_tooltip(msg)
}

function load_map(longitude, latitude, zoom, html, elm)
{
    var map         = false,
        zoom        = zoom,
        infowindow  = new google.maps.InfoWindow(),
        clickmarker,
        myLatlng    = new google.maps.LatLng(latitude, longitude),
        myOptions   = {
            zoom: zoom,
            minZoom: 9,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

    map = new google.maps.Map(document.getElementById(elm), myOptions);
    clickmarker = new google.maps.Marker ({
            position: myLatlng,
            map: map
    });

    infowindow = new google.maps.InfoWindow({
        content: html
    });
    infowindow.open(map, clickmarker);

    google.maps.event.addListener( clickmarker, 'click', function() {
        infowindow.content = html;
        infowindow.open(map, clickmarker);
    });
}
