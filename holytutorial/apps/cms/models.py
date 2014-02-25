from django.db import models
from datetime import datetime
from tinymce.models import HTMLField
from django.template.defaultfilters import slugify


class Category(models.Model):
    name = models.CharField(max_length=135, unique=True, null=True)
    slug = models.SlugField(blank=False, max_length=255, unique=True)
    parent_id = models.ForeignKey('self', null=True, blank=True)

    def __unicode__(self):
        return self.name

    @staticmethod
    def get_category(self, category_id=None):
        categories = Category.objects.filter(parent_id=category_id)
        return categories

    def save(self, *args, **kwargs):
        #if self.slug is None :
        self.slug = slugify(self.name)
        super(Category, self).save(*args, **kwargs)


class Page(models.Model):
    category = models.ForeignKey(Category, null=False, related_name='page_category')
    title = models.CharField(max_length=235, unique=True, null=True)
    slug = models.SlugField(blank=False, max_length=255, unique=True)
    description = HTMLField()
    content = HTMLField()

    @staticmethod
    def get_list_page(slug):
        pages = Page.objects.filter(category__slug=slug)
        return pages

    @staticmethod
    def get_page(slug):
        pages = Page.objects.get(slug=slug)
        return pages

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Page, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.title