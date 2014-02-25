from datetime import datetime

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, redirect
from django.db.models import Q
from django.utils.translation import ugettext as _

from holytutorial.settings import FACEBOOK_APP_ID, FACEBOOK_SECRET_KEY, FACEBOOK_REDIRECT_URL
from account.models import *
from lib.functions import get_or_none, get_current_user
from pyfb import Pyfb


def index(request):
    return render_to_response("index.html", {"FACEBOOK_APP_ID": FACEBOOK_APP_ID})


#This view redirects the user to facebook in order to get the code that allows
#pyfb to obtain the access_token in the facebook_login_success view
def facebook_login(request):
    if "access_token" not in request.session:
        facebook = Pyfb(FACEBOOK_APP_ID)
        return HttpResponseRedirect(facebook.get_auth_code_url(redirect_uri=FACEBOOK_REDIRECT_URL))
    return redirect('/account/dashboard')


#This view must be refered in your FACEBOOK_REDIRECT_URL. For example: http://www.mywebsite.com/facebook_login_success/
def facebook_login_success(request):
    code = request.GET.get('code')
    facebook = Pyfb(FACEBOOK_APP_ID)
    access_token = facebook.get_access_token(FACEBOOK_SECRET_KEY, code, redirect_uri=FACEBOOK_REDIRECT_URL)
    facebook.set_access_token(access_token)
    request.session['access_token'] = access_token
    return render_user(facebook, request)


#Login with the js sdk and backend queries with pyfb
def facebook_javascript_login_success(request):
    access_token = request.GET.get("access_token")
    facebook = Pyfb(FACEBOOK_APP_ID)
    facebook.set_access_token(access_token)
    return render_user(facebook)


def render_user(facebook, request):
    result = _render_user(facebook, request)
    if result != '':
        return HttpResponse(result)
    return redirect('/account/dashboard')


def _render_user(facebook, request):
    me = facebook.get_myself()
    fb_id = me.id
    current_player = get_current_user(request)
    if current_player is not None:
        if fb_id != current_player.fb_id:
            #Check exit fb_id in table Player
            exit_fb_id = get_or_none(Player, fb_id=fb_id)
            if exit_fb_id is not None:
                if exit_fb_id.is_active:
                    del request.session['access_token']
                    return _('This facebook account is using by other player. Please try another!')
                else:
                    player = merge_users(current_player, exit_fb_id)
                    request.session['player'] = player
            else:
                player = get_or_none(Player, pk=current_player.id)
                player.fb_id = fb_id
                if hasattr(me, 'first_name'):
                    player.first_name = me.first_name
                if hasattr(me, 'last_name'):
                    player.last_name = me.last_name
                if hasattr(me, 'gender'):
                    if me.gender == 'male':
                        player.gender = 1
                    else:
                        player.gender = 0
                if hasattr(me, 'birthday'):
                    player.birth_date = datetime.strptime(me.birthday, "%m/%d/%Y").strftime("%Y-%m-%d")
                player.save()
                request.session['player'] = player
    else:
        player = get_or_none(Player, fb_id=fb_id)
        if player is None:
            set_username = False
            player = Player()

            #Check if account with email exist
            if hasattr(me, 'email'):
                email = me.email
                player = get_or_none(Player, email=email)
                if player is None:
                    player = Player()
                    player.email = email
                    player.username = email
                    set_username = True

            if hasattr(me, 'first_name'):
                player.first_name = me.first_name

            if hasattr(me, 'last_name'):
                player.last_name = me.last_name

            if hasattr(me, 'gender'):
                if me.gender == 'male':
                    player.gender = 1
                else:
                    player.gender = 0

            if hasattr(me, 'birthday'):
                player.birth_date = datetime.strptime(me.birthday, "%m/%d/%Y").strftime("%Y-%m-%d")

            if not set_username:
                player.username = fb_id

            player.fb_id = fb_id
            player.is_active = True
            player.save()
        else:
            if not player.is_active:
                #Merge account when account with email exist and account with facebook exist
                if hasattr(me, 'email'):
                    email = me.email
                    email_account = get_or_none(Player, ~Q(id=player.id), email=email)
                    if email_account is not None:
                        player = merge_users(email_account, player)
                    elif player.email is None or player.email == '':
                        player.email = email

                player.is_active = True
                player.save()

        request.session['player'] = player
    return ''


def merge_users(main_user, merge_uer):
    #Merge fb_id
    main_user.fb_id = main_user.fb_id if main_user.fb_id else merge_uer.fb_id
    merge_uer.delete()
    main_user.save()
    return main_user