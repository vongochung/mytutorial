$(function(){
    $('.btn-create-event').live('click', show_event_dialog);
    $('#btn-edit-event').live('click', show_event_edit_dialog);
    $('#btn-save-event').live('click', save_event);
    $('.btn-delete-event').live('click', delete_event);
    $('#create-event-modal').on('hidden', reload_my_event);
    $('#find-gmap').live('click', find_address);
    $("#my-location").live("click", get_my_location);
    $("#my-location-all").live("click", get_my_location);
    $("[btn = view-profile]").live("click", view_profile);
    $("#btn-join-event").live("click", join_event);
    $('[event = invite]').live('click', invite_fb_to_event);
    $('[edit-image-event = true]').live('click',show_upload_image)
    $("#btn-upload").live('click', upload_avatar),
    $("#upload-form img").live("click", up);
    $("#left-menu-create-event").live('click', show_event_dialog)
    $(".btn-part-delete").live("click", delete_participant)
    $('.btn-add-team').live('click', show_add_team_dialog);
    $('#btn-save-team').live('click', save_team);
    $('.btn-add-team-score').live('click', show_team_score_dialog);
    $('#btn-save-team-score').live('click', save_team_score);
    $('.btn-part-escape').live('click', mark_escape_player);
    $('.btn-delete-team').live('click', remove_team);
    $('.btn-join-team').live('click', join_team);
    $('#btn-filter-sports').live('click', show_filter_sport);
    $("#sport_selector .btn-sport").live('click', select_sport);
    $('#btn-next-event').live('click', event_dialog_change_step);
    $("#filter_sport .btn-sport").live('click', select_filter_sport);
    $('#filtered-sports').live('click', set_filter_sport)
    $('.btn-create-pitch').live('click', quick_add_pitch)
    $('#id_pitch').live('change', function() {
        if($(this).val() == '0') {
            $('#id_pitch').hide();
            $('#pitch-name').val('');
            $('#new-pitch-control').show();
        }
    })

    var hash = window.location.hash;
    if(hash == "#create-event"){
        show_event_dialog();
    }
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

function delete_participant(){
    var participant_id = $(this).attr("delete-participant"),
        event_id = $(this).attr("event-id"),
        team_id  = $(this).attr("team_id"),
        dialogue = confirm(gettext("Are you sure to delete this participant?"));
    if(dialogue){
        $.ajax({
            type:'POST',
            url: '/event/delete_participant/',
            data: {'participant_id': participant_id, "event_id" : event_id, "team_id" : team_id},
            success: function(response) {
                if (response == window.RET_CODE._SUCCESS) {
                    $("#main-content").load("/event/get_event_participants/"+event_id);
                } else {
                    alert(response);
                }
            }
        });

    }

}

function show_event_dialog(event_id) {
    window.SAVED_EVENT = false;
    window.EDITED_EVENT = false;
    var url = '/event/get_event_form/' + (Number(event_id) ? event_id : '');

    if($("#create-event").length) {
        $("#create-event").load(url, function() {
            $('#create-event-modal').modal('show');
        });
        return false;
    } else {
        return true;
    }
}

function show_add_team_dialog() {
    var event_id = $(this).attr("event-id"),
        url = '/event/get_add_team_form/' + event_id;
    $("#add-team-event").load(url, function() {
        $('#add-team-event-modal').modal('show');
    });
}

function show_team_score_dialog() {
    var team_id = $(this).attr("team-id"),
        url = '/event/get_team_score_form/' + team_id;
    $("#team-score").load(url, function() {
        $('#team-score-modal').modal('show');
    });
}

function show_event_edit_dialog() {
    var event_id = $(this).attr('event-id');
    show_event_dialog(event_id);
}

function init_venue_auto_complete() {
    $("#venue-text").autocomplete({
        source: function(request, response) {
            $.ajax({
              url: window.VENUE_SEARCH_URL,
              dataType: "jsonp",
              data: {
                key: request.term
              },
              success: function(data) {
                  window.VENUES = data;

                  //Clear pitch list
                  $('#id_pitch').hide();
                  $('#id_pitch').children('option').each(function(index, option) {
                      if (index > 0) {
                          option.remove();
                      }
                  });

                  //Map venue list
                  response($.map(data, function(item) {
                      return {
                          label: item.name,
                          value: item.name,
                          venue_id: item.id,
                          pitches: item.pitches
                      };
                  }));
              }
          });
        },
        minLength: 1,
        select: function(event, ui) {
            if(ui.item.venue_id) {
                window.VENUE_ID = ui.item.venue_id;
                init_pitches_list(ui.item.pitches);
            } else {
                quick_create_venue();
                return false;
            }
        },
        open: function() {
            $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        },
        close: function() {
            $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
        }
    });
}

function init_pitches_list(pitches) {
    $('#id_pitch').show();
    $('#new-pitch-control').hide();

    //Clean pitch list
    $('#id_pitch').children('option').each(function(index, option) {
        if (index > 0) {
            option.remove();
        }
    });

    var sport_id = $(".btn-sport.active").attr('sport-id'),
        has_sport_pitch = false,
        selected;

    //Filter list pitch with selected sport
    $.each(pitches, function(index, item) {
        selected = sport_id == item.sport_id
        if(selected) {
            has_sport_pitch = true;
            $('#id_pitch').append($('<option>', {
                value: item.id,
                text: item.name,
                selected: selected
            }));
        }
    });

    //If venue don't have pitch with selected sport
    //Ask player to create new pitch
    if(! has_sport_pitch) {
        $('#id_pitch').hide();
        $('#pitch-name').val('');
        $('#new-pitch-control').show();
    }
}


function quick_add_pitch() {
    var sport_id = $(".btn-sport.active").attr('sport-id'),
        venue_id = window.VENUE_ID,
        dialog_add_pitch = $('#id_pitch').attr('dialog-add-pitch'),
        pitch_name = $('#pitch-name').val();

    var dialog = confirm(dialog_add_pitch);
    if(dialog) {
        $.ajax({
            type: 'POST',
            url: '/api/quick_add_pitch/',
            data: {sport_id: sport_id, venue_id: venue_id, name: pitch_name},
            success: function(response){
                if(response.ret_code == window.RET_CODE._SUCCESS) {
                    init_pitches_list([response.result]);
                } else {
                    alert(response.message);
                }
            }
        });
    }
}

function init_date_picker() {
    //Date picker init
    $('#create-event .date-picker').datetimepicker({
        //language:  'fr',
        weekStart: 1,
        todayBtn:  1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0
    }).on('changeDate', function(ev){
        if($('#create-event .time-picker').children('input').val() == '') {
            $('#create-event .time-picker').datetimepicker('show');
        }
    });

    $('#create-event .time-picker').datetimepicker({
        //language:  'fr',
        autoclose: 1,
        startView: 1,
        minView: 0,
        maxView: 1,
        forceParse: 0
    });
}

function save_event() {
	var data = $('#event-form').serialize(),
        hidden_id = $('#event-form').find('#id_hidden_id').val(),
        btn = $(this);

	$.ajax({
        type: "POST",
        url: "/event/save_event/",
        data: data,
        success: function(msg) {
            check_success(btn, msg)
            var str = 'form'

            if (msg.indexOf(str) === -1){
                if (hidden_id == '' && Number(msg)) {
                    window.SAVED_EVENT = true;
                    window.location.href = msg + '#';
                } else {
                    $('#create-event').html(msg)
                    window.EDITED_EVENT = true;
                }
                $('#btn-next-event').hide();
                $('#btn-save-event').hide();
                reload_my_event();
            } else {
                $('#create-event').html(msg)
            }
        }
    });
}

function delete_event() {
    var event_id = $(this).attr("event-id"),
        dialog_text = $(this).attr('dialog-text'),
        dialogue = confirm(dialog_text);

    if (dialogue == true){
        $.ajax({
            type: 'POST',
            url: '/event/delete_event/',
            data: {'event_id': event_id},
            success: function(response){
                // alert(response);
                if(response == window.RET_CODE._SUCCESS) {
                    $("#main-content").load("/event/get_my_events/")
                }
            }
        });
    }
}

function reload_my_event() {
    if (window.SAVED_EVENT) {
        $('#menu-my-events').click();
        window.SAVED_EVENT = false;
    }

    if (window.EDITED_EVENT) {
        window.location.reload();
        window.EDITED_EVENT = false;
    }
}

function join_event() {
    var btn = $(this);
    var event_id = $(this).attr("event-id");
    var task = $(this).attr('task'),
        dialog,
        join_text = $(this).attr('join-text'),
        leave_text = $(this).attr('leave-text'),
        dialog_join = btn.attr('dialog-join'),
        dialog_leave = btn.attr('dialog-leave');

    if(task == "0" && dialog_leave){
        dialog = confirm(dialog_leave);
    } else if(task == "10"){
        dialog = true;
    } else if(dialog_join) {
        dialog = confirm(dialog_join);
    }

    if (dialog == true) {
        loading(btn);
        $.ajax({
            type:'POST',
            url: "/event/join_event/",
            data: {'event_id': event_id, 'task': task},
            success: function(response) {
                loading(btn);
                if(response == window.RET_CODE._SUCCESS){
                    if(task == '1'){
                        $('#btn-join-event').text(leave_text);
                        $('#btn-join-event').attr('task', '0');
                    } else if(task == '0'){
                        $('#btn-join-event').text(join_text);
                        $('#btn-join-event').attr('task', '1');
                    } else if(task == '10'){
                        update_notification();
                        return;
                    }

                    $("#main-content").load("/event/get_event_participants/"+event_id);
                }
                else{
                    alert(response);
                }
            }
        });
    }
}

function invite_fb_to_event() {
    var dialog = $(this).attr('dialog-text');
    if (confirm(dialog)) {
        var btn = $(this),
            facebook_id = btn.attr('facebook-id'),
            friend_name = btn.attr('friend-name'),
            add_friend  = btn.attr('add-friend'),
            friend_id  = btn.attr('invite'),
            create_account  = btn.attr('create-account'),
            event_id  = btn.attr('event-id'),
            success_text= btn.attr('success');

        loading(btn);
        $(this).parents('.view').addClass('active');

        $.ajax({
            type:'POST',
            url: '/event/invite/',
            data: {
                'facebook_id': facebook_id,
                'friend_name': friend_name,
                'add_friend' : add_friend,
                'friend_id' : friend_id,
                'create_account': create_account,
                'event_id': event_id
            },
            success: function(response) {
                console.log(response)
                loading(btn);
                alert(success_text)
                btn.addClass("hide");
                btn.prev().removeClass("hide");
                var url = $("[facebook-id = " + facebook_id + "]").attr("data-url") + response;
                $("[facebook-id = " + facebook_id + "]").attr("data-url", url);
            }
        });
    }
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

function show_upload_image() {

    var event_id = $(this).attr("event-id");
    $("#edit-image-event").load('/event/get_image_upload_form/' + event_id, function() {
        $('#edit-image-event-modal').modal('show');
    })
}

function up() {
   $('input[type=file]').click();
}

function save_team() {
    var data = $('#team-form').serialize(),
        event_id = $('#team-form').children('#id_hidden_id').val()
    $.ajax({
        type: "POST",
        url: "/event/save_team/",
        data: data,
        success: function(msg) {
            if(msg == window.RET_CODE._SUCCESS) {
                $("#main-content").load("/event/get_event_participants/" + event_id);
                $('#add-team-event-modal').modal('hide');
            } else {
                $('#add-team-event').html(msg);
            }
        }
    });
}

function save_team_score() {
    var data = $('#team-score-form').serialize();
    $.ajax({
        type: "POST",
        url: "/event/update_team_score/",
        data: data,
        success: function(msg) {
            if (msg == window.RET_CODE._SUCCESS) {
                $('#team-score-modal').modal('hide')
                $("#left-menu-event-participant").click()
            }else {
                alert(msg)
            }
        }
    });
}

function mark_escape_player() {
    var team_player_id = $(this).attr('team-player-id');
    $.ajax({
        type: "POST",
        url: "/event/mark_escape/",
        data: {'team_player_id': team_player_id},
        success: function(msg) {
            if (msg == window.RET_CODE._SUCCESS) {
                $("#left-menu-event-participant").click()
            }else {
                alert(msg)
            }
        }
    });
}

function remove_team() {
    var team_id = $(this).attr("delete-team"),
        event_id = $(this).attr("event-id"),
        delete_text = $(this).attr('delete-text');

    var dialog = confirm(delete_text);

    if(dialog==true){
        $.ajax({
            type: "POST",
            url: "/event/remove_team/",
            data: {"team_id" : team_id, "event_id": event_id},
            success: function(msg) {
                $("[delete-team=" + team_id + "]").parent().parent().remove();
                $("#main-content").load("/event/get_event_participants/" + event_id);
            }
        });
    }

}

function join_team(){
    var team_id = $(this).attr("team-id"),
        event_id = $(this).attr('event-id'),
        btn = $(this),
        leave_text = $('#btn-join-event').attr('leave-text'),
        dialog_join = $(this).attr('dialog-join'),
        dialog;

    if(typeof(team_id) == 'undefined'){ //for tooltip join event
        team_id = $('#tooltip-teams').find(':selected').val();
        if(team_id == 0){
            var select_text =$('#confirm-join-event').attr('select-text');
            alert(select_text)
            return false;
        }
        dialog = true;
    }else{
        dialog= confirm(dialog_join);
    }

    if(dialog == true){
        loading(btn);
        $.ajax({
            type: "POST",
            url:"/event/join_team/",
            data:{team_id: team_id},
            success: function(response){
                loading(btn);
                if(response == window.RET_CODE._SUCCESS){
                    if(typeof(update_notification) != 'undefined') {
                        update_notification();
                    }
                    $('#btn-join-event').text(leave_text);
                    $('#btn-join-event').attr('task', '0');

                    $("#main-content").load("/event/get_event_participants/"+event_id);
                    cancel_popover('destroy');
                }else{
                    alert(response);
                }
            }
        });
    }
}

function select_sport() {
    $('.btn-sport').removeClass('active')
    $(this).addClass('active');
    $('input[name=pitch_sport]').val($(this).attr('sport-id'));
    return false;
}

function event_dialog_change_step() {
    if($('.event-first-step').is(':visible')) {
        //Check selected sport
        if(! $(".btn-sport").hasClass('active')) {
            var select_sport_text = $('#btn-next-event').attr('select-sport-text');
            alert(select_sport_text);
            return;
        }

        var check_time = validate_event_time();
        if(check_time != '') {
            alert(check_time);
            return;
        }

        $('.event-first-step').fadeOut();
        $('.event-second-step').fadeIn();
        $('#btn-next-event').html('Previous');
        $('#btn-save-event').show();
    } else {
        $('.event-first-step').fadeIn();
        $('.event-second-step').fadeOut();
        $('#btn-next-event').html('Next');
        $('#btn-save-event').hide();
    }
}

function validate_event_time() {
    var date_info = $('#kick_off_date').val().split('-'),
        time_info = $('#kick_off_time').val().split(':'),
        date,
        invalid_date_txt=$('#kick_off_date').attr('invalid-text'),
        invalid_time_txt=$('#kick_off_time').attr('invalid-text'),
        hour_advance_txt = $('#kick_off_time').attr('hour-advance-text');

    if(date_info.length < 3) {
        return invalid_date_txt;
    }

    if(time_info.length < 2) {
        return invalid_time_txt;
    }

    date = new Date(date_info[2], date_info[0] - 1, date_info[1], time_info[0], time_info[1])
    if(date == 'Invalid Date') {
        return invalid_date_txt;
    }

    if(date - new Date() < 3600000) {
        return hour_advance_txt;
    }

    return '';
}

function quick_create_venue() {
    //If pitch list exist show the list to player and let them select on
    //If pitch list is empty, hide it, check location and ask player to create a new venue
    if($('#id_pitch').children('option').length > 1) {
        $('#id_pitch').show();
        return;
    } else {
        $('#id_pitch').hide();
    }

    var geocoder = new google.maps.Geocoder(),
        address = $('#venue-text').val(),
        dialog_text=$('#venue-text').attr('dialog-text');
    //If entered address is empty, do nothing
    if(address == '') {
        return;
    }

    //Check location
    geocoder.geocode({address: address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            window.NEW_VENUE_LOCATION = results[0];
            var create_venue = confirm(dialog_text + window.NEW_VENUE_LOCATION.formatted_address + "?")
            //If there is location, ask player to create new venue
            //If player answer no, do nothing
            if(! create_venue) {
                return;
            }

            //If user want to create new venue, make request to create new venue
            var sport_id = $(".btn-sport.active").attr('sport-id'),
                location_name = window.NEW_VENUE_LOCATION.formatted_address,
                longitude = window.NEW_VENUE_LOCATION.geometry.location.lng(),
                latitude = window.NEW_VENUE_LOCATION.geometry.location.lat(),
                data = {name: address, location_name: location_name, longitude: longitude, latitude: latitude, sport_id: sport_id};

            if(sport_id == undefined) {
                alert('Please select sport');
                event_dialog_change_step();
                return;
            }

            $.ajax({
                type:'POST',
                url: '/api/quick_create_venue/',
                data: data,
                success: function(response) {
                    if(response.ret_code == window.RET_CODE._SUCCESS) {
                        window.VENUE_ID = response.result.id;
                        $.ajax({
                            type:'GET',
                            url: '/api/get_pitch_list/?venue_id=' + response.result.id,
                            success: function(venue_pitches) {
                                if(venue_pitches.ret_code == window.RET_CODE._SUCCESS) {
                                    $('#id_pitch').show();
                                    $.each(venue_pitches.result, function(index, item) {
                                        $('#id_pitch').append($('<option>', {
                                            value: item.id,
                                            text: item.name,
                                            selected: true
                                        }));
                                    });
                                }
                            }
                        })
                    } else {
                        alert(response.message);
                    }
                }
            });

            //$('.venue-address').html(window.NEW_VENUE_LOCATION.formatted_address);
        } else {
            //$('.venue-address').html('Not found address');
        }
    });
}
