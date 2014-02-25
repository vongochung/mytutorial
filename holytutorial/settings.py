# Django settings for facebook project.
import os
import sys

DEBUG = True
TEMPLATE_DEBUG = DEBUG

rel = lambda *x: os.path.join(os.path.dirname(os.path.abspath(__file__)), *x)

PROJECT_ROOT = os.path.normpath(os.path.dirname(__file__)) + '/'
sys.path.insert(0, os.path.join(PROJECT_ROOT, 'apps'))

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'facebook',                      # Or path to database file if using sqlite3.
        # The following settings are not used with sqlite3:
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '',                      # Set to empty string for default.
    }
}

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['*']

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = PROJECT_ROOT + '/static/uploads/' #rel('../uploads')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = '/static/uploads/'
# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = rel('../../staticfiles')

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'



PAGE_SIZE = 8
PAGE_SIZE_FRIEND = 8
# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    PROJECT_ROOT + '/static/',
)


# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'jhti@cn*-o(zr$nyrtwemsj^n7%51@#2^3qg_kuygivxawetkj'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'holytutorial.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'holytutorial.wsgi.application'

TEMPLATE_DIRS = (

    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    PROJECT_ROOT + 'templates/'
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'common',
    'pyfb',
    'lib',
    'django_pyfb',
    'api',
    'account',
    'home',
    'cms',
    'rest_framework',
    'compressor',
    'sorl.thumbnail',
    'mce_filebrowser',
    # Uncomment the next line to enable the admin:
    'django.contrib.admin',
    'tinymce',

    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

FACEBOOK_APP_ID = '178358228892649'
FACEBOOK_SECRET_KEY = 'cc2fbfac64784491fd84fc275b700496'
FACEBOOK_REDIRECT_URL = 'http://localhost:8000/facebook_login_success'
DEFAULT_URL = 'http://localhost:8000'


REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (),
    'PAGINATE_BY': 10,
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    )
}


TEMPLATE_CONTEXT_PROCESSORS = (
    # whatever comes before
    "django.core.context_processors.i18n",
    "django.contrib.auth.context_processors.auth",
    "holytutorial.context_processors.fb_appid",
    "holytutorial.context_processors.page_size",
    "holytutorial.context_processors.page_size_friend",
    "django.core.context_processors.request",
)
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'indiesart.contact@gmail.com'
EMAIL_USE_TLS = True
EMAIL_HOST_PASSWORD = '838dg34_$'
EMAIL_PORT = 587

COMPRESS_ENABLED = False
COMPRESS_ROOT = os.path.join(PROJECT_ROOT, 'static/')
COMPRESS_CSS_FILTERS = [
    'compressor.filters.css_default.CssAbsoluteFilter',
    'compressor.filters.cssmin.CSSMinFilter',
]

TINYMCE_DEFAULT_CONFIG = {
    'plugins': "table,spellchecker,paste,searchreplace",
    'theme': "advanced",
    'theme_advanced_buttons1': "formatselect,bold,italic,"
                               "underline,bullist,numlist,undo,redo,"
                               "link,unlink,justifyleft,justifycenter,justifyright,justifyfull,"
                               "code,fullscreen,pasteword,media,charmap",
    'theme_advanced_buttons2': 'image,search,pasteword,template,media,charmap,code,'
                               'cleanup,grappelli_documentstructure,forecolor',
    'extended_valid_elements': "script[type|src]",
    'theme_advanced_blockformats': "p,h2,h3,h4,h5,h6",
    'cleanup_on_startup': True,
    'custom_undo_redo_levels': 10,
    'theme_advanced_resizing': True,
    'file_browser_callback': 'mce_filebrowser'
}