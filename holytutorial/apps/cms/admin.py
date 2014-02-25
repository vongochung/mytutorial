from django.contrib import admin
from models import Category, Page
from mce_filebrowser.admin import MCEFilebrowserAdmin


class PageAdmin(MCEFilebrowserAdmin):
    #list_display = ('key',)
    #search_fields = ('key', 'content')
    exclude = ('slug',)
    #inlines = [get_inline(MyMetadata)]

class CategoryAdmin(MCEFilebrowserAdmin):
    #list_display = ('key',)
    #search_fields = ('key', 'content')
    exclude = ('slug',)
    #inlines = [get_inline(MyMetadata)]

admin.site.register(Page, PageAdmin)
admin.site.register(Category, CategoryAdmin)
