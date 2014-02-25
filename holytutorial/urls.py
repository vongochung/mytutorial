from django.conf.urls import patterns, include, url
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()


urlpatterns = patterns('',
    # Examples:
    (r'^i18n/', include('django.conf.urls.i18n')),
    (r'^jsi18n/$', 'django.views.i18n.javascript_catalog'),
    url(r'', include('home.urls')),
    url(r'', include('account.urls')),
    url(r'cms/', include('cms.urls')),
    url(r'^facebook_login/$', 'django_pyfb.views.facebook_login', name='facebook_login'),
    url(r'^facebook_login_success/$', 'django_pyfb.views.facebook_login_success'),
    (r'^mce_filebrowser/', include('mce_filebrowser.urls')),
    url(r'^admin/', include(admin.site.urls)),
    (r'^tinymce/', include('tinymce.urls')),
     # API App
    (r'^api/', include('api.urls')),
    (r'^account/', include('account.urls')),


)
