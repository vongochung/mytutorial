$(function() {
    window.MESSAGE_SEE_MORE_SUCCESS = true;
    $('#send-message-btn').live('click', wall_message_save);
    $('.btn-reply').live('click', wall_message_reply);
    $('.btn-show-reply').live('click', show_reply_panel);
    $('.txt-reply, #txt-new-message').live('change', check_message_content);
    $('#btn-more-message').live('click', view_more_message);
    $(document).live("scroll", function() {
        if($('#btn-more-message').length > 0) {
            scroll_messages_see_more();
        }
    });
    $('.btn-delete').live('click', wall_message_delete);
});


function wall_message_save() {
    var wall_id = $(this).attr('data-wall-id'),
        content = $('#txt-new-message').val(),
        wall_type = $(this).attr('wall-type'),
        btn = $(this),
        callback = function(response) {
            loading(btn)
            if(response.ret_code == RET_CODE._SUCCESS) {
                $('#txt-new-message').val('');
                $('#messages').prepend(response.result);
            } else {
                alert(response.message);
            }
        };

    if (content === '') {
        $('#txt-new-message').parent().addClass('error');
        return;
    }

    loading(btn)
    message_post(content, wall_id, wall_type, callback)
}

function wall_message_reply() {
    var btn = $(this),
        message_id = btn.attr('message-id'),
        txt_reply = btn.parent().children('.txt-reply'),
        content = $(txt_reply).val(),
        wall_type = btn.attr('wall-type'),
        wall_id = btn.attr('data-wall-id'),        
        call_back = function(response) {
            loading(btn)
            if(response.ret_code == RET_CODE._SUCCESS) {
                $(txt_reply).val('');
                btn.parent().parent().children('.reply-list').append(response.result);
                
            } else {
                alert(response.message);
            }
        };

    if(content === '') {
        $(txt_reply).parent().addClass('error');
        return;
    }

    loading(btn)
    message_reply(message_id, content, wall_id, wall_type, call_back);

}

function wall_message_delete(){
    var msg_id = $(this).attr('message-id'),
        btn = $(this),
        delete_text=$(this).attr('delete-text'),
        call_back = function(response){
            loading(btn)
            if(response.ret_code == RET_CODE._SUCCESS){
                $("div [message-id="+msg_id+"]").remove();
                $("div [reply-id="+msg_id+"]").remove();
                // alert(response.message);
            }else{
                alert(response.message);
            }
        };
    var dialog = confirm(delete_text);
    if(dialog==true){
        loading(btn)
        message_delete(msg_id, call_back);
    }
}

function show_reply_panel()
{
    var msg = $(this).parents('.msg')
    msg.find('.bottom').fadeToggle()
    msg.find('.txt-reply').focus()

    var new_text = $(this).attr('data-text'),
        current_text = $(this).text()

    if ($(this).is(':hidden')) {
        var a = current_text,
            current_text = new_text,
            new_text = a
    }

    $(this).attr('data-text', current_text).text(new_text)
}

function check_message_content() {
    var content = $(this).val();
    if(content !== '') {
        $(this).parent().removeClass('error');
    }
}

function view_more_message() {
    var btn = $('#btn-more-message'),
        player_id   =  $(btn).attr('player-id'),
        wall_type = $(btn).attr('wall-type'),
        arr = [];

    $(".msg").each(function(){
        var id =  $(this).attr("message-id");
        if ($.inArray(id, arr) == -1) {
            arr.push($(this).attr("message-id"));
        }
    });

    loading(btn)
    $.ajax({
        type:'POST',
        url: '/account/get_more_message/',
        data: {'player_id': player_id, 'arr_id': arr, 'wall_type': wall_type },
        success: function(response) {
            loading(btn)
            $(".next-msg").append(response);
            check_more_message(player_id, arr.length + parseInt(window.PAGE_SIZE), wall_type);
            window.MESSAGE_SEE_MORE_SUCCESS = true;
        }
    });
}

function check_more_message(player_id, count, wall_type){
    $.ajax({
        type:'POST',
        url: '/account/check_more_message/',
        data: {'player_id': player_id, 'count' : count, 'wall_type': wall_type},
        success: function(response) {
            if (response == "False") {
                $('#btn-more-message').hide()
            }
        }
    });
}

function scroll_messages_see_more(){
    var scrollAmount = $(window).scrollTop();
    var documentHeight = $(document).height();
    var content = $(window).height();
    if(scrollAmount == (documentHeight - content)) {
        if(window.MESSAGE_SEE_MORE_SUCCESS == true){
            window.MESSAGE_SEE_MORE_SUCCESS = false;
            view_more_message();
        }
    }
}