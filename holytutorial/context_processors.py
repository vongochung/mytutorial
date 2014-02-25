from django.conf import settings # import the settings file

def fb_appid(request):
    # return the value you want as a dictionnary. you may add multiple values in there.
    return {'FB_APPID': settings.FACEBOOK_APP_ID}

def page_size(request):
    # return the value you want as a dictionnary. you may add multiple values in there.
    return {'PAGE_SIZE': settings.PAGE_SIZE}

def page_size_friend(request):
    # return the value you want as a dictionnary. you may add multiple values in there.
    return {'PAGE_SIZE_FRIEND': settings.PAGE_SIZE_FRIEND}