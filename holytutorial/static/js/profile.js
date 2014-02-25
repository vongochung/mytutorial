$(function(){
	$('#profile-img').live('click',  show_upload_profile_image);
	$("#btn-upload").live('click', upload_avatar)
	$('.profile-link').click(show_profile_dialog)
    $("#upload-form img").live("click", up)

	$('#btn-save-profile').live('click', save_profile)
	$('#btn-cancel-profile').live('click', hide_profile_dialog)
	$('#btn-change-pass').live('click', show_change_pass_form)
	$('#btn-change-old-pass').live('click', change_password)

	$('.sport-link').live('click', show_dialog_sport)
	$('.location-link').live('click', show_dialog_location)
	$("#user_sport .btn-sport").live('click', set_sport)
	$("[role = btn-role]").live('click',set_role)
	$('#edit-team-btn').live('click', show_dialog_team)
	$('#edit-profile-modal').on('hidden',hide_profile_dialog)
	$('#add-friend').click(add_friend)
    $('#edit-sport-modal').on('hidden',hide_sport_dialog)
    $('.confirm-friend').live('click', add_friend)
    $('.btn-no-friend').live('click', add_friend)

    $('#confirm-join-event').live('click', join_team)
    $('.cancel-popover').live('click', cancel_popover)
    $('.btn-no-join').live('click', join_event)

    $('.menu .home').live('click', update_notification)
    $('#left-menu-dashboard').live('click', update_notification)
    $('#home-link').live('click', update_notification)

})

function set_sport()
{
	var sport_icon = this,
        sport_id = $(sport_icon).attr('sport-id'),
		task = $(sport_icon).hasClass('active') ?  'delete' : 'active';
	$.ajax({
        type: "POST",
        url: "/account/set_sport/",
        data: {'sport_id' : sport_id, 'task' : task}
    }).done(function(msg) {
        //if (msg == '') {
            $(sport_icon).toggleClass('active');
            window.CHANGE_SPORT_SUCCESS = 1;
        //}
    })
}

function get_role(sport_id)
{
	$.ajax({
        type: "POST",
        url: "/account/get_role/",
        data: {'sport_id' : sport_id}
    }).done(function(msg) {
        $('#edit-sport').html(msg)
    })

}

function set_role()
{
    var role_id = $(this).attr('id');
	$.ajax({
        type: "POST",
        url: "/account/set_role/",
        data: {'role_id' : role_id}
    }).done(function(msg) {
    	 $('#edit-sport').html(msg)
    })
}

function upload_avatar() {
    event.preventDefault();
    var image_type = $("#id_file").val();

    if(image_type === '') {
        $('#error').html('File empty!');
        $('#error').removeClass('close');
    } else {
        $("#upload-form").submit();
    }
}

function show_upload_profile_image()
{
	$("#edit-image-profile").load('/account/get_upload_form/', function() {
    	$('#edit-image-profile-modal').modal('show')
	})
}

function show_profile_dialog()
{
	$("#edit-profile").load('/account/get_form_profile/', function() {
    	$('#edit-profile-modal').modal('show')
    	window.CHANGE_PROFILE_SUCCESS = 0
	})
}

function hide_profile_dialog()
{
	if (window.CHANGE_PROFILE_SUCCESS == "1") {
		document.location.reload();
	}
}

function hide_sport_dialog()
{
    if (window.CHANGE_SPORT_SUCCESS == "1") {
        document.location.reload();
    }
}

function show_dialog_location()
{
	$("#edit-location").load('/account/get_location/', function() {
    	$('#edit-location-modal').modal('show');
        window.CHANGE_SPORT_SUCCESS = 0;
	})
}

function save_profile()
{
	var data = $('#profile-form').serialize(),
        btn = $(this);
    loading(btn);

	$.ajax({
        type: "POST",
        url: "/account/save_profile/",
        data: data,
        success: function(msg) {
            $('#edit-profile').html(msg)
            var str = "form";
            if(msg.indexOf(str) == -1){
                window.CHANGE_PROFILE_SUCCESS = 1
            }
            loading(btn);
        }
    })
}

function show_dialog_sport()
{
	$("#edit-sport").load('/account/get_sport/', function() {
    	$('#edit-sport-modal').modal('show')
	})
}

function show_dialog_team()
{
    $('#edit-team-modal').modal('show')
}

function add_friend()
{
    var friend = $(this).attr('friend'),
        text = $(this).attr('dialog-text'),
        task = $(this).attr('task'),
        dialogue = true,
        follow_text = $(this).attr('follow-text'),
        unfollow_text = $(this).attr('unfollow-text'),
        btn=$(this);

    if (task=="1" && text) {
         dialogue = confirm(text)
    }

    var call_back = function(response) {
        loading(btn)
        if(response=="0"){
            $('#add-friend').text(unfollow_text)
            $('#add-friend').attr('task', '0')
        }
        else if(response=="1"){
            $('#add-friend').text(follow_text)
            $('#add-friend').attr('task', '1')
        }
    }

    if (dialogue) {
        loading(btn)
    	 _add_friend(friend, task, call_back)
    }
}

function _add_friend(friend, task, call_back)
{
	$.ajax({
        type:'POST',
        url: '/account/set_friend/',
        data: {'friend': friend, 'task': task},
        success: function(response) {
            if (call_back) {
                call_back(response);
                if (task == "11") {
                    alert(response)
                    cancel_popover('destroy')
                    // window.location.href = '/account/dashboard/'
                }
                update_notification();
            }
        }
    });
}

function show_change_pass_form()
{
	$("#change-pass").load('/account/change_pass/', function() {
    	$('#change-pass-modal').modal('show')
    	hide_profile_dialog()
	})
}

function change_password()
{
	var data = $('#change-pass-form').serialize()
	$.ajax({
        type:'POST',
        url: '/account/change_pass/',
        data: data,
        success: function(response) {
        	$("#change-pass").html(response);
        }
    });
}

/*---------------Gmap-----------------------------*/

$('#edit-location-modal').on('shown', function () {
    initialize();
})
$('#update-location').live('click', update_location)
$('#cancel-location').live('click', close_location)
$('#find-gmap').live('click', find_address)
$("#my-location").live("click", get_my_location)

function update_location()
{
	var lat = $(this).attr("lat"),
        lng = $(this).attr("lng"),
        name = $(this).attr("name");
	$.ajax({
        type:'POST',
        url: '/account/change_location/',
        data: {"lat":lat, "lng": lng, "name" : name},
        success: function(response) {
            infowindow.close();
        	alert(gettext('Updated location successfully'));
        }
    });
}

function up()
{
   $('input[type=file]').click();
}



