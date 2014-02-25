from datetime import datetime
import re
import logging
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.mail import EmailMessage
from django.contrib.sessions.models import Session
from django.utils.translation import ugettext as _
from django.utils.timezone import utc
from pyfb import Pyfb
from lib.functions import get_or_none, get_current_user, normalize_query, get_query, parse_none
from account.models import Player
from account.forms import *

from holytutorial.settings import FACEBOOK_APP_ID,EMAIL_HOST_USER, DEFAULT_URL
from django_pyfb.views import _render_user
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, JSONPRenderer
from rest_framework.response import Response
from lib.models import ReturnObject, WallType, RetCode, MessageType


@api_view(['POST'])
@renderer_classes((JSONRenderer, JSONPRenderer))
def login(request):
    """
    Login API
    """
    params = ['email', 'password']
    for par in params:
        if par not in request.POST:
            return Response(ReturnObject(2, _('%s is required') % par, None).to_json())

    email = request.POST['email']
    password = request.POST['password']

    if email == '':
        return Response(ReturnObject(2, _('Email is not null'), None).to_json())

    if password == '':
        return Response(ReturnObject(2, _('Password is not null'), None).to_json())

    player = get_or_none(Player, email=email)
    if player and player.check_password(password):
        request.session['player'] = player
        request.session.save()
        return_object = ReturnObject(1, request.session.session_key, get_player_profile(request, player.id))
    else:
        return_object = ReturnObject(2, _('The email or password you entered is incorrect !'), None)
    return Response(return_object.to_json())


@api_view(['GET'])
@renderer_classes((JSONRenderer, JSONPRenderer))
def get_profile_player(request):
    """
    Get profile API
    """

    _init_session(request)

    if 'player_id' not in request.GET:
        return Response(ReturnObject(2, _('Player id is required'), None).to_json())
    player_id = request.GET['player_id']

    if 'player' not in request.session:
        return Response(ReturnObject(2, _('Not exit user'), None).to_json())

    player = get_player_profile(request, player_id)

    if player is not None:
        return_object = ReturnObject(1, _('OK'), player)
    else:
        return_object = ReturnObject(2, _('No data!'), None)

    return Response(return_object.to_json())


@api_view(['GET'])
@renderer_classes((JSONRenderer, JSONPRenderer))
def autocomplete_search(request):
    _init_session(request)

    key = request.GET['key']
    venues = Venue.objects.filter(Q(location_name__icontains=key) | Q(name__icontains=key))[:10]

    result = {}
    result[0] = {'id': 0, 'name': _('Create new venue')}
    for v in venues:
        pitches = v.get_pitch_list()
        if pitches.count() == 0:
            continue

        pitches_json = []
        for item in pitches.all():
            item_json = item.to_json()
            item_json['name'] = item.name + ' (%s)' % item.sport.name
            pitches_json.append(item_json)

        data = v.to_json()
        data['pitches'] = pitches_json
        result[v.id] = data

    return Response(result)


@api_view(['GET'])
@renderer_classes((JSONRenderer, JSONPRenderer))
def instant_search(request):
    """ Autocomplete search for Venue and Player API
    :param request:
    """
    _init_session(request)

    key = request.GET['key']
    result = []
    player_list = []

    # Find player
    search_fields = ['username', 'first_name', 'last_name']
    query = get_query(key, search_fields)
    players = Player.objects.filter(query)[:5]

    host_name = 'http://' + request.get_host()
    for p in players:
        ptmp = {}
        ptmp['id'] = p.id
        ptmp['name'] = str(p)
        ptmp['url'] = p.get_url()
        ptmp['address'] = p.location_name
        img_url = p.get_image_src()
        match = re.search(r'^http://\w+', img_url)
        if match:
            tmp = img_url
        else:
            tmp = host_name + img_url
        ptmp['image'] = tmp
        ptmp['category'] = 'Players'
        ptmp['label'] = str(p)
        result.append(ptmp)

    return Response(result)


@api_view(['POST'])
@renderer_classes((JSONRenderer, JSONPRenderer))
def sign_up(request):
    """
    Sign up API
    """
    try:
        form = SignUpForm(request.POST)
        #Check if data is valid
        if form.is_valid() and len(form._errors) == 0:
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']

            #Create new account
            player = Player(username=email, email=email, is_active=False)
            player.set_password(password)
            player.save()

            player_activation = player.create_activation()
            player_activation.save()
            html_content = render_to_string('email/signup.html',
                                            {'code': player_activation.code, 'id': player_activation.id,
                                             'default_url': DEFAULT_URL})
            msg = EmailMessage(_('WiDoo Sport Registration'), html_content, EMAIL_HOST_USER, [email])
            msg.content_subtype = 'html'
            msg.send()
            return Response(ReturnObject(1, _('Successfully'), player).to_json())
        else:
            message_error = []
            for key, error in form._errors.iteritems():
                message_error.append({key: error[0]})
            return Response(ReturnObject(2, message_error, None).to_json())
    except Exception:
        return Response(ReturnObject(2, _('System error'), None).to_json())



@api_view(['GET'])
@renderer_classes((JSONRenderer, JSONPRenderer))
def login_facebook(request):
    if 'access_token' not in request.GET:
        return Response(ReturnObject(RetCode._FAIL, _('Access token not exist in request'), None).to_json())

    try:
        access_token = request.GET.get('access_token')
        facebook = Pyfb(FACEBOOK_APP_ID)
        facebook.set_access_token(access_token)
        result = _render_user(facebook, request)
        if result != '':
            return Response(ReturnObject(RetCode._FAIL, result, None).to_json())
        else:
            current_player = get_current_user(request)
            return Response(ReturnObject(RetCode._SUCCESS, _('Login successfully'), current_player).to_json())
    except Exception, error:
        return Response(ReturnObject(RetCode._SYSTEM_ERROR, _('System error, access token is wrong'), None).to_json())

@api_view(['POST'])
@renderer_classes((JSONRenderer, JSONPRenderer))
def logout(request):
    _init_session(request)

    current_player = get_current_user(request)
    if current_player is None:
        return Response(ReturnObject(RetCode._FAIL, _('You session is ended'), None).to_json())

    try:
        #Django logout method
        from django.contrib.auth import logout

        logout(request)
        return Response(ReturnObject(RetCode._SUCCESS, _('Logout successfully'), None).to_json())
    except KeyError:
        return Response(ReturnObject(RetCode._SYSTEM_ERROR, _('Error'), None).to_json())