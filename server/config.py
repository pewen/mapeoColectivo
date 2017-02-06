"""
Configuration of the server
"""

import sys

from .keys import flask_key, twitter_key, twitter_secret

# Configure the base path depending if is the local machine or openshift
if 'openshift' in sys.path[1]:
    PATH_BASE = '/var/lib/openshift/589353cf2d52713621000059/app-root/runtime/repo/'
    SERVER_URL = 'https://mapeocolectivo-pewen.rhcloud.com/'
else:
    PATH_BASE = './'
    SERVER_URL = 'http://127.0.0.1:5000/'


class Config(object):
    DEBUG = False
    TESTING = False

    # Flask secret key
    SECRET_KEY = flask_key

    SERVER_URL = SERVER_URL

    # Direct action layers valid names
    DA_LAYERS_NAMES = ['arbol', 'taller',
                       'actividad_artistica',
                       'intervencion_publica']
    # Direct action data folder
    DA_FOLDER = PATH_BASE + "data/direct_action/"

    # Citizen map layers valid names
    CM_LAYERS_NAMES = ['micro_basural', 'bache',
                       'arbol_peligroso', 'iluminacion',
                       'agua_cloaca', 'obra_inconclusa',
                       'inundacion', 'otro']
    # Citizen map data folder
    CM_FOLDER = PATH_BASE + "data/citizen_map/"

    # Allowed image files extension
    ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])
    # Folter to save the photos
    UPLOAD_FOLDER = PATH_BASE + 'imgs/'

    # Twitter consumer key and secret.
    # Keep this in diferent file to be secured
    TWITTER_CONSUMER_KEY = twitter_key
    TWITTER_CONSUMER_SECRET = twitter_secret

    # Twitter allowed user to create a new point
    TWITTER_ALLOWED = ['fnbellomo', 'asaffadi', 'ucaomo']


class ProductionConfig(Config):
    """
    In the config I can put all the path to local host
    and in this config, put all the path to the server
    """
    pass


class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = True


class TestingConfig(Config):
    DEBUG = False
    TESTING = True
