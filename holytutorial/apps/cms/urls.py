from django.conf.urls import *


urlpatterns = patterns('cms.views',
    url(r'^$', 'index', name='index1'),
    url(r'^category/(?P<slug>[-\w]+)$', 'detail', name='detail_category'),
    url(r'^(?P<category_slug>[-\w]+)/(?P<page_slug>[-\w]+)$', 'detail_page', name='detail_page'),
)
