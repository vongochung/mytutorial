from django.shortcuts import HttpResponse
from django.db.models import Q
from django.utils.translation import ugettext as _
import re


def get_or_none(model, **kwargs):
    try:
        return model.objects.get(**kwargs)
    except model.DoesNotExist:
        return None


def get_current_user(request):
    try:
        player = request.session['player']
        return player
    except:
        return None


def get_request_data(request, name, method='GET', default_value=None):
    try:
        if method == 'GET':
            return request.GET[name]
        else:
            return request.POST[name]
    except KeyError:
        return default_value


def common_render(template_path, context_data):
    from django.shortcuts import loader
    from django.template import Context

    t = loader.get_template("email/_email.html")
    c = Context({"mail": email})
    return t.render(c)


def handle_uploaded_file(files, tempDir, name):
    import pdb
    import Image as Image

    img = files[0]

    #Check image type
    try:
        Image.open(img)
    except:
        return HttpResponse(_('Invalid file !'))

    f = tempDir + name + '.png'
    f = f.encode('ascii', 'ignore')
    destination = open(f, 'wb+')
    for chunk in img.chunks():
        destination.write(chunk)
    destination.close()

    #Crop image
    img = Image.open(f)
    size = min(img.size)
    img = img.crop((0, 0, size, size))

    #Resize image
    size = 400, 400
    img.resize(size, Image.ANTIALIAS).save(f)


def get_array_field(dict_list, field):
    arr_return = []
    for item in dict_list:
        arr_return.append(getattr(item, field))
    return arr_return


def normalize_query(query_string,
                    findterms=re.compile(r'"([^"]+)"|(\S+)').findall,
                    normspace=re.compile(r'\s{2,}').sub):
    """Splits the query string in invidual keywords, getting rid of unecessary spaces
        and grouping quoted words together.
        auth: Julien
        url: http://julienphalip.com/post/2825034077/adding-search-to-a-django-site-in-a-snap
    """
    return [normspace(' ', (t[0] or t[1]).strip()) for t in findterms(query_string)]


def get_query(query_string, search_fields):
    """ Returns a query, that is a combination of Q objects. That combination
        aims to search keywords within a model by testing the given search fields.
        auth: Julien
        url: http://julienphalip.com/post/2825034077/adding-search-to-a-django-site-in-a-snap
    """
    query = None
    terms = normalize_query(query_string)
    for term in terms:
        or_query = None
        for field_name in search_fields:
            q = Q(**{"%s__icontains" % field_name: term})
            if or_query is None:
                or_query = q
            else:
                or_query = or_query | q
        if query is None:
            query = or_query
        else:
            query = query & or_query
    return query


def parse_none(className, value, default=None):
    try:
        return className(value)
    except:
        return default