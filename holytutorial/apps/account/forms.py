from django import forms
from django.utils.translation import ugettext as _

from account.models import Player
from lib.functions import get_or_none


class SignInForm(forms.Form):
    email = forms.EmailField(max_length=100, required=True,
                             widget=forms.TextInput(attrs={'placeholder': _('Email'), 'class': 'input-block-level'}))
    password = forms.CharField(max_length=100, required=True,
                               widget=forms.PasswordInput(
                                   attrs={'placeholder': _('Password'), 'class': 'input-block-level'}))


class SignUpForm(SignInForm):
    #Function to valid sign up email
    def clean_email(self):
        email = self.cleaned_data['email']
        player = get_or_none(Player, email=email)

        if player is not None:
            if player.fb_id == '' or player.fb_id is None:
                raise forms.ValidationError(_('%s was already existed') % email)
            else:
                raise forms.ValidationError(_('%s already exists via facebook') % email)
        else:
            return email


class EditProfileForm(forms.Form):
    email = forms.EmailField(label=_('Your Email'), max_length=100, required=True,
                             widget=forms.TextInput(attrs={'placeholder': _('Email')}))
    birth_date = forms.DateField(label=_('Your Birth Date'), input_formats=['%m-%d-%Y'],
                                 widget=forms.TextInput(attrs={'placeholder': _('Birthday')}), required=False)
    gender = forms.ChoiceField(widget=forms.Select(),
                               choices=([('2', _('--Please select--')), ('1', _('Male')), ('0', _('Female'))]),
                               initial='0', required=True)
    phone = forms.RegexField(required=False, regex=r'^ *\+?[0-9.() -]*[0-9][0-9.() -]*$',
                             label=_('Phone'), max_length=50,
                             widget=forms.TextInput(attrs={'size': '15', 'placeholder': _('Your phone')}),
                             error_message=(_('This value must contain only numbers.')))
    first_name = forms.CharField(label=_('Your First Name'), max_length=30,
                                 widget=forms.TextInput(attrs={'placeholder': _('First name')}))
    last_name = forms.CharField(label=_('Your Last Name'), max_length=30,
                                widget=forms.TextInput(attrs={'placeholder': _('Last name')}))
    hidden_id = forms.CharField(widget=forms.HiddenInput())


class UploadFileForm(forms.Form):
    file = forms.FileField()
    hidden_id = forms.CharField(widget=forms.HiddenInput())


class ForgotPassForm(forms.Form):
    email = forms.EmailField(max_length=100, required=True,
                             widget=forms.TextInput(attrs={'placeholder': _('Email'), 'class': 'input-block-level'}))

    #Function to valid  email
    def clean_email(self):
        email = self.cleaned_data['email']
        player = get_or_none(Player, email=email)

        if player:
            return True
        else:
            raise forms.ValidationError(_('%s not exists') % email)


class ResetPassForm(forms.Form):
    new_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': _('New password'), 'class': 'input-block-level'}),
        max_length=100, min_length=6)
    re_new_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': _('Retype new password'), 'class': 'input-block-level'}),
        max_length=100, min_length=6)

    def clean_re_new_password(self):
        new_password = self.cleaned_data['new_password']
        re_new_password = self.cleaned_data['re_new_password']
        if new_password == re_new_password:
            return True
        else:
            raise forms.ValidationError(_('You retype new password not match! '))


class ChangePassForm(ResetPassForm):
    old_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': _('Old password'), 'class': 'input-block-level'}),
        max_length=100, required=False)