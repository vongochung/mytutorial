# Create your views here.
from django.shortcuts import render_to_response
from lib.functions import *
from django.template import RequestContext
from cms.functions import _get_category


def dashboard(request):
    current_user = get_current_user(request)
    categories = _get_category()
    data = {
        'profile_player': current_user,
        'current_user': current_user,
        'categories': categories

    }
    return render_to_response('account/dashboard.html', data, context_instance=RequestContext(request))