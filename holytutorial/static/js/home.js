$(function() {
    $('.flip').click(flip_form)
    $('#btn-forgot-pass').live('click', show_forgot_form)
    $('#btn-send-pass').live('click', reset_password);
    $('#unsubcribe').live('click', unsubcribe);

    if (window.IS_SIGNUP) {
        flip_form()
    }
    $('#no-unsub').click(function(){
        window.location.href = '/';
    })
})

function flip_form()
{
    if (Modernizr.csstransforms3d) {
        $('.card').toggleClass('flipping')
    } else {
        $('.card .face').fadeToggle()
    }
}

function show_forgot_form()
{
	$("#forgot-pass").load('/forgot_pass/', function() {
    	$('#forgot-pass-modal').modal('show')
	})
}

function reset_password()
{
	var data = $('#send-pass-form').serialize(),
        btn = $(this);
	loading(btn);
	$.ajax({
        type: "POST",
        url: "/forgot_pass/",
        data: data
    }).done(function(response) {
    	$("#forgot-pass").html(response);
    	loading(btn);
    })
}

function unsubcribe(){
    var  btn = $(this),
        code = btn.attr('code'),
        cant_unsubcribe = btn.attr('cant-unsubcribe'),
        success = btn.attr('success');
    $.ajax({
        url: '/_unsubscribe/',
        data: {code: code},
        type: 'POST',
        success: function (response) {
            if(response == window.RET_CODE._SUCCESS){
                alert(success);
            }
            else if(response == window.RET_CODE._FAIL){
                alert(cant_unsubcribe);
            }

        }
    });

}
