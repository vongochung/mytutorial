from django.conf.urls import *
from account.views import *

urlpatterns = patterns('account.views',
   url(r'dashboard/(?P<player_id>\d+)', 'dashboard', name='dashboard'),
   url(r'dashboard/', 'dashboard', name='dashboard'),
)
