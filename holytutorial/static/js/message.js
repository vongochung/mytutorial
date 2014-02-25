/**
 * Post new message
 * @param {string} content
 * @param {int} wall_id
 * @param {int} wall_type
 * @param {function} call_back
 * @returns {sting} response
 */
function message_post(content, wall_id, wall_type, call_back) {
    var data = {content:content, wall_id:wall_id, wall_type: wall_type}
    $.ajax({
        type:'POST',
        url:'/message/post/',
        data: data,
        dataType: 'json',
        success: function(response) {
            if(call_back) {
                call_back(response);
            }
        }
    });
}

/**
 * Reply a message
 * @param {id} message_id
 * @param {string} content
 * @param {int} wall_type
 * @param {function} call_back
 * @returns {string} response
 */
function message_reply(message_id, content, wall_id, wall_type, call_back) {
    var data = {message_id:message_id, content: content, wall_id: wall_id, wall_type: wall_type};
    $.ajax({
        type:'POST',
        url:'/message/reply/',
        data: data,
        dataType: 'json',
        success: function(response) {
            if(call_back) {
                call_back(response);
            }
        }
    });
}

/**
 * Delete a message
 * @param {id} message_id
 * @param {function} call_back
 * @returns {string} response
 */
function message_delete(message_id, call_back){
    var data = {message_id:message_id};
    $.ajax({
        type: 'POST',
        url: '/message/delete/',
        data: data,
        dataType: 'json',
        success: function(response){
            if(call_back){
                call_back(response);
            }
        }
    });
}