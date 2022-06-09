"""Settings specific to docker-compose deployment of the Argus API container"""
from argus.site.settings.dockerdev import *

MEDIA_PLUGINS = [
    "argus.notificationprofile.media.email.EmailNotification",
    "argus.notificationprofile.media.sms_as_email.SMSNotification",
]


