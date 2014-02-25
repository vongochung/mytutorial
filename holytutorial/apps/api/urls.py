from django.conf.urls import patterns, url, include

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browseable API.
urlpatterns = patterns('api.views',
    url(r'login/', 'login'),
    url(r'autocomplete_search/', 'autocomplete_search', name='autocomplete_search'),
    url(r'instant_search/', 'instant_search', name='instant_search'),
    url(r'sign_up/', 'sign_up'),
    url(r'logout/', 'logout', name="logout"),
    url(r'login_facebook/', 'login_facebook')
)