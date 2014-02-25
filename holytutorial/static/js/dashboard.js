$(function() {

    $('[btn = view-profile]').live('click', view_profile);
	$('[btn = add-friend]').live('click', add_fb_friend);
	$('[btn = invite]').live('click',invite_fb_friend);
    $('#btn-more-friend').live('click', view_more_friend);
    $(document).live("scroll", get_more_friend);

    window.MESSAGE_TOOLTIP = []
    get_message_tooltip($('#messages [message-type="1"]'), window.MESSAGE_TOOLTIP_URL, window.MESSAGE_TOOLTIP)

    window.EVENT_TOOLTIP = []
    get_message_tooltip($('#messages [message-type="2"]'), window.EVENT_TOOLTIP_URL, window.EVENT_TOOLTIP)
});


function view_profile() {
    var url = $(this).attr('data-url');
    var facebook_id = $(this).attr('facebook-id');

    if(url) {
    	window.location.href = url;
    }

    if(facebook_id){
        $.ajax({
            type:'POST',
            url: '/account/get_id_form_fb_id/',
            data: {'facebook_id': facebook_id},
            success: function(response) {
                window.location.href = "/account/dashboard/" + response
            }
        });
    }
}

function add_fb_friend()
{
    var facebook_id = $(this).attr('facebook-id'),
        task = $(this).attr('task'),
        btn = $(this),
        dialog_text = $(this).attr('dialog-text'),
        dialogue = confirm(dialog_text);

    loading(btn)

	if (dialogue == true) {
		$.ajax({
	        type:'POST',
	        url: '/account/set_friend_face/',
	        data: {'facebook_id': facebook_id, 'task': task},
	        success: function(response) {
    	        loading(btn)
    	        $("#" + facebook_id).addClass("hide");
	        	$("#" + facebook_id).prev().removeClass("hide");
	        }
	    });
    }
}

/*
function send_request_to_recipients(friend_id, friend_name, callback) {

	var friend = friend_id;
	var friend_name = friend_name;
	var path = '/me/feed';
	var publish = {
        method: 'stream.publish',
        message: 'Connect to WidooSport...',
        picture : 'http://widoo.uniweb.vn/assets/images/logo.png',
        link : 'http://widoo.uniweb.vn/',
        name: 'WidooSport!',
        caption: '',
        description: 'Welcome to WidooSport!!',
        actions : { name : 'Use me!', link : 'http://widoo.uniweb.vn/'}
    };
	FB.api(path, 'POST', publish, function(response) {
	    invite_fb_friend(friend, friend_name);
   });

}
*/

function invite_fb_friend() {
    var dialog_text = $(this).attr('dialog-text'),
        dialog = confirm(dialog_text);
	if (dialog == true) {
        var facebook_id = $(this).attr('facebook-id'),
        	friend_name = $(this).attr('friend-name'),
        	btn = $(this),
        	loading_btn = function() {
                loading(btn)
            }

        loading_btn()
        $(this).parents('.view').addClass('active')

        $.ajax({
            type:'POST',
            url: '/account/invite/',
            data: {'facebook_id': facebook_id, 'friend_name': friend_name},
            success: function(response) {
               console.log(response)
               loading_btn();
               $("[invite = " + facebook_id + "]").addClass("hide");
               $("[invite = " + facebook_id + "]").prev().removeClass("hide");
                var url= $("[facebook-id = " + facebook_id + "]").attr("data-url") + response;
               $("[facebook-id = " + facebook_id + "]").attr("data-url", url);


            }
        });
    }
}

function view_more_friend() {

    var player_id   =  $('#btn-more-friend').attr('player-id'),
        fb   =  $('#btn-more-friend').attr('fb'),
        event_id = $('#btn-more-friend').attr('event-id'),
        btn = $('#load-see-more')

    if (! player_id && !fb) {
        return
    }

    if (player_id || fb) {

        var urls = '/event/get_more_friend/',
            page = '/event/check_more_friend/',
            arr = [],
            callback = true

        if (fb && fb == "True") {
            urls = '/account/get_more_friend_facebook/'
            page = '/account/check_more_friend_facebook/'
        } else if (fb && fb == "False") {
            urls = '/account/get_more_friend/'
            page = '/account/check_more_friend/'
        }

        $(".one-friend" ).each(function(){
            var id =  $(this).attr("friend-id")
            if ($.inArray(id, arr) == -1) {
                arr.push(id)
            }

        })

        loading(btn)
        window.FACEBOOK_SUCCESS = false

        $.ajax({
            type:'POST',
            url: urls,
            data: {'player_id': player_id, 'arr_id' : arr, 'event_id': event_id },
            success: function(response) {
                loading(btn)
                $(".friends").append(response)
                window.FACEBOOK_SUCCESS = true
                check_more_friend(page, player_id, arr.length + parseInt(window.PAGE_SIZE_FRIEND), event_id)
            }
        })
    }
}

function check_more_friend( page, player_id, count, event_id){
    $.ajax({
        type:'POST',
        url:  page ,
        data: {'player_id': player_id, 'count' : count, 'event_id': event_id},
        success: function(response) {
            if (response == "False") {
                $('#btn-more-friend').hide()
            }
        }
    });
}

window.FACEBOOK_SUCCESS = true;

function get_more_friend(){
    var scrollAmount = $(window).scrollTop();
    var documentHeight = $(document).height();
    var content = $(window).height();
    if(scrollAmount == (documentHeight - content)) {
        if( window.FACEBOOK_SUCCESS == true){
            view_more_friend();
        }
    }
}

function get_message_tooltip(selector, url, cache)
{
    selector.live('click', function() {
        var message = $(this),
            message_id = message.parents('.msg').attr('message-id'),
            trigger ='click',
            placement='left';

        loading_popover($(this), placement, trigger)

        if (cache[message_id]) {
            var response = cache[message_id]
            display_tooltip(message, response, trigger, placement)
        } else {
            $.ajax({
                url: url,
                type:'GET',
                data: { message_id: message_id},
                success: function(response) {
                    cache[message_id] = response;
                    display_tooltip(message, response, trigger, placement)
                }
            });
        }
    });
}

function update_notification() {
    $.ajax({
        type: 'POST',
        url: '/api/update_notification/',
        data: {},
        success: function(response){
            var unreads = response.unreads;
                invites = response.event_invites,
                friends = response.friend_requests,
                inv = $('#event-invites'),
                frnd = $('#friend-requests');

            $('#unread-messages').html(unreads);

            if(invites == '0'){
                inv.remove();
            }else{
                inv.html(invites);
            }

            if(friends == '0'){
                frnd.remove();
            }else{
                frnd.html(friends);
            }
        }
    })
 }