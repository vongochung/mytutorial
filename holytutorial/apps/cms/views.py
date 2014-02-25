from datetime import datetime, timedelta
from django.shortcuts import render_to_response, redirect, HttpResponse
from django.template import RequestContext
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.utils.translation import ugettext as _
from holytutorial.settings import DEFAULT_URL,EMAIL_HOST_USER
from cms.functions import _get_category, _get_page, _get_list_page
from lib.functions import *

def index(request):
    return None


def detail(request, slug=None):
    current_user = get_current_user(request)
    categories = _get_category()
    pages = _get_list_page(slug)
    data = {
        'profile_player': current_user,
        'current_user': current_user,
        'categories': categories,
        'pages': pages,
        'category_name': slug
    }
    return render_to_response("cms/category_detail.html", data, context_instance=RequestContext(request))

def detail_page(request,category_slug=None, page_slug=None):
    current_user = get_current_user(request)
    categories = _get_category()
    page = _get_page(page_slug)
    data = {
        'profile_player': current_user,
        'current_user': current_user,
        'categories': categories,
        'page': page,
        'page_name': page.title,
        'category_name': category_slug
    }
    return render_to_response("cms/page_detail.html", data, context_instance=RequestContext(request))