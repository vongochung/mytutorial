from models import Category,Page


def _get_category():
    categories = Category.get_category(None)
    return categories


def _get_list_page(slug=None):
    pages = Page.get_list_page(slug)
    return pages


def _get_page(slug=None):
    page = Page.get_page(slug)
    return page