$(function(){
	$('.btn-create-venue').live('click', show_venue_dialog)
	$('#btn-save-venue').live('click', save_venue)
	$('#btn-create-pitch').live('click', show_pitch_dialog)
	$('#btn-save-pitch').live('click', save_pitch)
	$('#update-location-venue').live('click', update_location_venue)
	$('#cancel-location-venue').live('click', close_location)
	$('#btn-edit-location-venue').live('click', show_dialog_location_venue)
    $('#btn-edit-venue').live('click', show_dialog_edit_venue)
    $('#create-venue-modal').on('hidden',reload_my_venue)
    $('#find-gmap').live('click', find_address)
    $("#my-location").live("click", get_my_location)
    $("#my-location-all").live("click", get_my_location)
    $("#btn-add-favourite, #btn-remove-favourite").live('click', toggle_favourite)
    $('#edit-location-modal').on('hidden',reload_my_venue)
    $("#btn-edit-pitch").live("click", show_dialog_edit_pitch)
    $('[edit-image-venue = true]').live('click',show_upload_image)
    $("#btn-upload").live('click', upload_avatar),
    $("#upload-form img").live("click", up)
    $('.btn-delete-venue').live('click', delete_venue)
    $('.btn-delete-pitch').live('click', delete_pitch)
    $("#sport_selector .btn-sport").live('click', select_sport)
    $('#btn-filter-sports').live('click', show_filter_sport);
    $("#filter_sport .btn-sport").live('click', select_filter_sport);
    $('#filtered-sports').live('click', set_filter_sport)

    var hash = window.location.hash;
    if(hash == "#create-venue"){
        window.HASH_VENUE = true;
        show_venue_dialog();
    }
})

window.SAVED = false;

function show_venue_dialog()
{
    window.EDIT_VENUE = false;
    if (window.HASH_VENUE == true){
        window.EDIT_VENUE = true;
    }
	$("#create-venue").load('/venue/get_form_venue/', function() {
    	$('#create-venue-modal').modal('show')
	})
}

function save_venue()
{
	var btn = $(this),
	    data = $('#venue-form').serialize(),
        hidden_id = $('#venue-form').children('#id_hidden_id').val();

    if (hidden_id == '') {
        var sports = [];
        $(".btn-sport.active").each(function(i, sport) {
            sports.push($(this).attr('sport-id'));
        })
        data += '&sports=' + sports;
    }

	$.ajax({
        type: "POST",
        url: "/venue/save_venue/",
        data: data,
        success: function(msg) {
            if (window.HASH_VENUE) {
                window.HASH_VENUE = false;
            }

            var str = "form";
            if (msg.indexOf(str) == -1) {
                window.SAVED = true;
                if (hidden_id == '' && Number(msg)) {
                    window.location.href = msg + '#';
                } else {
                    $('#create-venue').html(msg);
                }
            } else {
                $('#create-venue').html(msg);
            }
            check_success(btn, msg)
        }
    })
}

function delete_venue(){
    var venue_id = $(this).attr('venue-id'),
        dialog_text = gettext('Are you sure to delete this venue? If you delete this, all wall messages and pitches of this venue will be deleted !'),
        deleted_text = gettext('Your venue and its all belongings are deleted !'),
        dialogue = confirm(dialog_text);

    if (dialogue == true){
        $.ajax({
            type: "POST",
            url: '/venue/delete_venue/',
            data: {"venue_id": venue_id},
            success: function(response){
                if(response == window.RET_CODE._SUCCESS) {
                    $("#main-content").load('/venue/get_my_venues/');
                    alert(deleted_text);
                } else {
                    alert(response);
                }
            }
        })
    }
}

function reload_my_venue()
{
    if (window.HASH_VENUE == true) return;

    if (window.EDIT_VENUE == false || window.SAVED == true && window.HASH_VENUE == false) {
        $("#main-content").load("/venue/get_my_venues/")
    }
    else {
        if(window.SAVED == true){
            document.location.reload();
        }
    }
}

function show_pitch_dialog()
{
	var venue_id = $(this).attr("venue"),
        with_sport=$(this).attr("with-sport");
	$("#create-pitch").load('/venue/get_form_pitch/', function() {
		$("#btn-save-pitch").attr("venue", venue_id)
    	$('#create-pitch-modal').modal('show')
	})
}

function save_pitch()
{
    var btn = $(this),
        venue_id = btn.attr("venue")

    if (typeof(venue_id) == "undefined") {
        venue_id = $("#id_hidden_venue_id").val();
    }

	var data = $('#pitch-form').serializeArray()
	data.push({name :"venue",  value : venue_id})

	$.ajax({
        type: "POST",
        url: "/venue/save_pitch/",
        data: data,
        success: function(msg) {
            check_success(btn, msg)
            $('#create-pitch').html(msg)
            $("#main-content").load("/venue/get_venues_pitches/" + venue_id)
        }
    })
}

function show_dialog_edit_pitch()
{
    var pitch_id = $(this).attr("pitch-id"),
        venue_id = $(this).attr("venue")

    if (typeof venue_id == "undefined") {
        venue_id = $("#id_hidden_venue_id").val()
    }

    $.ajax({
        type: 'POST',
        url: "/venue/get_form_pitch/",
        data: {"pitch_id": pitch_id, "venue": venue_id},
        success: function(response){
            $("#create-pitch").html(response)
            $("#create-pitch-modal .model-header h3").html("Edit pitch")
            $('#btn-save-pitch').show()
            $("#create-pitch-modal").modal("show")
        }

    })
}

function delete_pitch(){
    var pitch_id = $(this).attr("pitch-id"),
        venue_id= $(this).attr("venue-id"),
        dialog_text = $(this).attr('dialog-text'),
        select_text = $(this).attr('select-text');

    if(typeof pitch_id == "undefined"){
        alert(select_text);
    }
    var dialogue = confirm(dialog_text);
    if (dialogue == true){
        $.ajax({
            type: 'POST',
            url: '/venue/delete_pitch/',
            data: {'venue_id': venue_id, 'pitch_id': pitch_id },
            success: function(response){
                
                if(response.indexOf('success') > -1) {
                    $("#main-content").load("/venue/get_venues_pitches/" + venue_id)
                }
                else{
                    alert(response);
                }
            }
        });
    }
}

function show_dialog_edit_venue()
{
    window.EDIT_VENUE = true;
    var venue_id = $(this).attr("venue")
    $.ajax({
        type: "POST",
        url: "/venue/get_form_venue/",
        data: {"venue_id" : venue_id},
        success: function(response) {
            $("#create-venue").html(response)
            $('#create-venue-modal .modal-header h3').html("Edit venue")
            $('#create-venue-modal').modal('show')
        }
    })
}


/*---------------Gmap-----------------------------*/
$('#edit-location-modal').on('shown', function () {
    initialize();
})

function show_dialog_location_venue()
{
	var venue_id = $(this).attr("venue");
	$("#edit-location-venue").load('/venue/get_location_venue/' + venue_id);
    	$('#edit-location-modal').modal('show');
}

function update_location_venue()
{
	var lat = $(this).attr("lat"),
        lng = $(this).attr("lng"),
        name = $(this).attr("name"),
        venue_id = $(this).attr("venue");

	$.ajax({
        type:'POST',
        url: '/venue/change_location_venue/',
        data: {"lat":lat, "lng": lng, "name" : name, "venue_id" : venue_id},
        success: function(response) {
        	alert(gettext('Updated location successfully'));
            window.EDIT_VENUE = true;
            window.SAVED = true;
        }
    });
}


function toggle_favourite()
{
    var venue_id        = $(this).attr("venue"),
        player_id       = $(this).attr("player-id"),
        is_favourite    = $(this).attr('is-favourite')

        if (! confirm($(this).attr('dialog-text') + "?")) {
            return
        }

        $.ajax({
        type:'POST',
        url: '/venue/toggle_favourite/',
        data: {"venue_id" : venue_id, "player_id": player_id, "is_favourite": is_favourite},
        success: function(response) {
            alert(response);
                $('#btn-add-favourite').toggle();
                $('#btn-remove-favourite').toggle();
            }
        });
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

function show_upload_image()
{
    var venue_id = $(this).attr("venue_id");
    $("#edit-image-venue").load('/venue/get_image_upload_form/' + venue_id, function() {
        $('#edit-image-venue-modal').modal('show')
    })
}

function up()
{
   $('input[type=file]').click();
}

function select_sport()
{
    var form = $(this).closest('form'),
        sport_select = $(form).find("#id_sport");
    if (sport_select.length) {
        $(".btn-sport").removeClass('active');
        var sport_id = $(this).attr('sport-id'),
            task = $(this).hasClass('active') ? 'active' : 'delete';
        $("#id_sport option[value="+sport_id+"]").prop('selected', task != 'active');
    }
    $(this).toggleClass('active');
    return false;
}