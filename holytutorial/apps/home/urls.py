from django.conf.urls import *

urlpatterns = patterns('home.views',
   url(r'^$', 'index'),
   url(r'^signin/', 'signin', name='signin'),
   url(r'^signup/', 'signup', name='signup'),
   url(r'^forgot_pass/', 'forgot_pass', name='forgot_pass'),
   url(r'active_player/(?P<id>\d+)/(?P<code>\w+)', 'active_player', name='active_player'),
   url(r'change_email/(?P<id>\d+)/(?P<code>\w+)', 'change_email', name='change_email'),
   url(r'reset_password/(?P<id>\d+)/(?P<code>\w+)', 'reset_password', name='reset_password'),
   url(r'^set_lang/(?P<lang_code>\w+)', 'set_lang', name='set_lang'),
   url(r'^cfm_unsub/', 'cfm_unsub', name='cfm_unsub'),
   url(r'^_unsubscribe/', '_unsubscribe', name='_unsubscribe'),

)
