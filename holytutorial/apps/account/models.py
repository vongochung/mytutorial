from django.db import models
from django.contrib.auth.models import User
from datetime import datetime
import string
import random
from holytutorial.settings import PAGE_SIZE_FRIEND, STATIC_URL, DEFAULT_URL


class Player(User):
    fb_id = models.CharField(max_length=135, unique=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    image = models.CharField(max_length=765, null=True)
    physical_condition = models.CharField(max_length=300, null=True)
    level = models.FloatField(null=True)
    gender = models.IntegerField(null=True)
    phone = models.CharField(max_length=135, null=True)
    language_code = models.CharField(max_length=10, null=True, default='en')
    is_public = models.BooleanField(default=0)
    location_name = models.CharField(max_length=765, null=True)
    longitude = models.CharField(max_length=135, null=True)
    latitude = models.CharField(max_length=135, null=True)
    escaped_matches = models.IntegerField(max_length=11, default=0)
    num_follower = 0
    num_following = 0
    num_event = 0
    is_subscribed = models.BooleanField(default=True)

    def get_image_src(self, size=38, api=False):
        src = STATIC_URL + u'images/profile.png'
        if api:
            src = DEFAULT_URL + STATIC_URL + u'images/profile.png'

        if self.fb_id:
            src = 'http://graph.facebook.com/%s/picture?width=%s&height=%s' % (self.fb_id, size, size)

        if self.image is not None:
            if api:
                src = DEFAULT_URL + STATIC_URL + u'images/upload/user/%s' % self.image
            else:
                src = STATIC_URL + u'images/upload/user/%s' % self.image

        return src

    def get_large_image_src(self):
        return self.get_image_src(100)

    def to_json(self):
        birth_date = None if self.birth_date == None else datetime.strptime(str(self.birth_date), '%Y-%m-%d').strftime('%m-%d-%Y')
        gender = 2 if self.gender is None else self.gender
        sport_matches = self.get_sport_matches()

        dict = {
            'id': self.id,
            'fb_id': self.fb_id,
            'last_name': self.last_name,
            'first_name': self.first_name,
            'name': str(self),
            'image': self.get_image_src(size=100, api=True),
            'username': self.username,
            'birth_date': birth_date,
            'phone': self.phone,
            'gender': gender,
            'email': self.email,
            'num_follower': self.num_follower,
            'num_following': self.num_following,
            'num_event': self.num_event,
            'longitude': self.longitude,
            'latitude': self.latitude,
            'location_name': self.location_name,
            'sport_matches': sport_matches
        }
        return dict

    def to_basic_json(self):
        dict = {
            'id': self.id,
            'fb_id': self.fb_id,
            'last_name': self.last_name,
            'first_name': self.first_name,
            'name': str(self),
            'image': self.get_image_src(size=100, api=True),
            'email': self.email,
        }
        return dict


    def __unicode__(self):
        if self.first_name or self.last_name:
            return u'%s %s' % (self.first_name, self.last_name)
        else:
            return u'%s' % (self.email)

    def get_url(self):
        from django.core.urlresolvers import reverse
        # return reverse('dashboard_detail', args=[str(self.id),])
        return "/account/dashboard/%i/" % self.id


    class Meta:
        db_table = u'widoosport_player'

class PlayerActivation(models.Model):
    code = models.CharField(max_length=255, null=False)
    created_date = models.DateField(null=False)
    player = models.ForeignKey(Player, related_name='playe_activation_player')

    @staticmethod
    def generate_random_code(length=30):
        return ''.join(random.choice(string.ascii_lowercase + string.digits) for x in range(length))

    class Meta:
        db_table = u'widoosport_player_activation'