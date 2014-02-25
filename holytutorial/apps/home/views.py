from datetime import datetime, timedelta

from django.shortcuts import render_to_response, redirect, HttpResponse
from django.template import RequestContext
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.utils.translation import ugettext as _

from holytutorial.settings import DEFAULT_URL
from account.forms import *
from lib.functions import get_current_user, get_or_none
from account.models import *
from account.views import dashboard
from holytutorial.settings import EMAIL_HOST_USER


def signup(request):
    #Check if user logging
    player = get_current_user(request)
    if player:
        return redirect('/account/dashboard')

    if request.method == 'POST':
        form = SignUpForm(request.POST)
        #Check if data is valid
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']

            #Create new account
            player = Player(username=email, email=email, password=password, is_active=False)
            player.set_password(password)
            player.save()

            player_activation = player.create_activation()
            player_activation.save()
            html_content = render_to_string('email/signup.html',
                                            {'code': player_activation.code, 'id': player_activation.id,
                                             'default_url': DEFAULT_URL})
            msg = EmailMessage(_('WiDoo Sport Registration'), html_content, EMAIL_HOST_USER, [email])
            msg.content_subtype = "html"
            msg.send()
            return redirect('/?status=success')
    else:
        form = SignUpForm()
    return index(request, None, form)


def signin(request):
    #Check if user logging
    player = get_current_user(request)
    if player:
        return redirect(dashboard)

    if request.method == 'POST':
        form = SignInForm(request.POST)
        if form.is_valid():
            email = request.POST['email']
            password = request.POST['password']
            player = get_or_none(Player, email=email)
            if player and player.check_password(password):
                if player.is_active:
                    request.session['player'] = player
                    set_lang(request, player.language_code)
                    return redirect(dashboard)
                else:
                    from django.forms.util import ErrorList

                    errors = form._errors.setdefault("email", ErrorList())
                    errors.append(_('Account is not active. Please check your email !'))
            else:
                from django.forms.util import ErrorList

                errors = form._errors.setdefault("email", ErrorList())
                errors.append(_('User or password incorrect'))
    else:
        form = None
    return index(request, form)


def index(request, signin_form=None, signup_form=None):
    #Check if user logging
    player = get_current_user(request)
    #if player:
    #    return redirect(dashboard)

    is_signup = False
    status = request.GET.get('status')

    if status == 'success' or signup_form is not None:
        is_signup = True

    if signin_form is None:
        signin_form = SignInForm()

    if signup_form is None:
        signup_form = SignUpForm()

    return render_to_response('home/index.html',
                              {'signin_form': signin_form, 'signup_form': signup_form, 'is_signup': is_signup,
                               'status': status}, context_instance=RequestContext(request))


def forgot_pass(request):
    form = ForgotPassForm()
    if request.method == 'POST':
        form = ForgotPassForm(request.POST)
        #Check if data is valid
        if form.is_valid():
            #Create new pass
            email = request.POST['email']
            player = Player.objects.get(email=email)
            player_activation = player.create_activation()
            player_activation.save()

            html_content = render_to_string('email/reset_pass.html',
                                            {'id': player_activation.id, 'code': player_activation.code,
                                             'default_url': DEFAULT_URL})
            msg = EmailMessage(_('WiDoo Sport Reset Password'), html_content, EMAIL_HOST_USER, [email])
            msg.content_subtype = "html"
            msg.send()
            return render_to_response('home/_forgot_pass_success.html', {}, context_instance=RequestContext(request))
        else:
            from django.forms.util import ErrorList

            errors = form._errors.setdefault("email", ErrorList())
            return render_to_response('home/_forgot_pass_form.html', {'form': form},
                                      context_instance=RequestContext(request))
    return render_to_response('home/_forgot_pass_form.html', {'form': form}, context_instance=RequestContext(request))


def active_player(request, id, code):
    player_activation = get_or_none(PlayerActivation, id=id, code=code)
    is_expired = False
    success = False
    if player_activation is not None:
        expired_date = player_activation.created_date + timedelta(days=10)
        if datetime.now().date() > expired_date:
            is_expired = True
        else:
            player_activation.player.is_active = True
            player_activation.player.save()
            player_activation.delete()
            success = True

    data = {'player_activation': player_activation, 'is_expired': is_expired, 'success': success}
    return render_to_response('home/account_active.html', data, context_instance=RequestContext(request))


def change_email(request, id, code):
    player_activation = get_or_none(PlayerActivation, id=id, code=code)
    is_expired = False
    success = False
    if player_activation is not None:
        expired_date = player_activation.created_date + timedelta(days=10)
        if datetime.now().date() > expired_date:
            is_expired = True
        else:
            email = decrypt_email(code)
            player_activation.player.email = email
            player_activation.player.save()
            player_activation.delete()
            success = True

    data = {'player_activation': player_activation, 'is_expired': is_expired, 'success': success}
    return render_to_response('home/account_active.html', data, context_instance=RequestContext(request))


def reset_password(request, id, code):
    form = ResetPassForm()
    error_message = ''
    player_activation = get_or_none(PlayerActivation, id=id, code=code)
    if player_activation is not None:
        expired_date = player_activation.created_date + timedelta(days=10)
        if datetime.now().date() > expired_date:
            error_message = _('Active code is expired !')
        else:
            if request.method == 'POST':
                form = ResetPassForm(request.POST)
                #Check if data is valid
                if form.is_valid():
                    new_password = form.cleaned_data['new_password']
                    player = player_activation.player
                    player.set_password(new_password)
                    player.is_active = True
                    player.save()
                    player_activation.delete()

                    return redirect('/')
    else:
        error_message = _('Active code not exist !')

    return render_to_response('home/reset_password.html', {'error_message': error_message, 'form': form},
                              context_instance=RequestContext(request))


def set_lang(request, lang_code):
    from django import http
    from django.utils.translation import check_for_language

    response = http.HttpResponseRedirect('/')
    if not check_for_language(lang_code):
        lang_code = "en"

    if hasattr(request, 'session'):
        request.session['django_language'] = lang_code
    else:
        response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang_code)

    current_player = get_current_user(request)
    if current_player is not None:
        current_player.language_code = lang_code
        current_player.save()

    return response


def cfm_unsub(request):
    if request.method != 'GET':
        return HttpResponse('')
    if request.GET['code']:
        code = request.GET['code']
    else:
        code = _('No string attached')

    return render_to_response('home/cfm_unsub.html', {'code': code}, context_instance=RequestContext(request))


def _unsubscribe(request):
    unsubribe = None
    if request.method != 'POST':
        return HttpResponse('')

    code = request.POST['code']
    email = decrypt_email(code)
    player = Player.objects.filter(email=email)
    if player:
        unsubribe = player.update(is_subscribed=0)
    if unsubribe:
        return HttpResponse(RetCode._SUCCESS)
    else:
        return HttpResponse(RetCode._FAIL)