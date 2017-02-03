#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import sys
from time import gmtime, strftime
from string import ascii_uppercase, digits
import random

from flask import Flask
from flask import request, url_for, session, redirect, flash, jsonify
from flask import current_app, make_response, abort, send_file, render_template
from flask_cors import CORS
from flask_oauthlib.client import OAuth
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage

from .utils import read4json, save2json, create_menssage


# Create the flask app
app = Flask(__name__,
            template_folder="../templates/_site",
            static_folder="../static",
            instance_relative_config=True)

# Cofiguration of flask
sys.path.insert(0, os.getcwd())
app.config.from_object('server.config.DevelopmentConfig')

# Allow post from other domains with cookies
cors = CORS(app, supports_credentials=True)

# Twitter configuration to login via OAuth
oauth = OAuth()
twitter = oauth.remote_app(
    'twitter',
    base_url='https://api.twitter.com/1.1/',
    request_token_url='https://api.twitter.com/oauth/request_token',
    access_token_url='https://api.twitter.com/oauth/access_token',
    authorize_url='https://api.twitter.com/oauth/authorize',
    consumer_key=app.config['TWITTER_CONSUMER_KEY'],
    consumer_secret=app.config['TWITTER_CONSUMER_SECRET']
)


def generate_random_id(size=20, chars=ascii_uppercase + digits):
    """
    Generate a random string used on the cookies to
    autetication of the user.

    Thanks to Ignacio Vazquez-Abrams for this solution
    https://stackoverflow.com/questions/2257441/random-string-generation-with-upper-case-letters-and-digits-in-python#2257449

    Parameters
    ----------
    size: int
      Leng of the random string
    chars: string
      String used to choice the random values
    """
    return ''.join(random.choice(chars) for _ in range(size))


def allowed_file(filename):
    """
    Check if the upload image is in a valid format

    Parameters
    ----------
    filename: string
      Filename
    """
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() \
        in app.config['ALLOWED_EXTENSIONS']


"""
Login in the aplication
-----------------------
"""


@app.route('/login')
def login():
    """
    Login via twitter

    TODO:
    ----
    * Login via facebook
    * Guardar la url de la que viene para volver a la misma
    """
    callback_url = url_for('oauthorized', next=request.args.get('next'))
    return twitter.authorize(callback=callback_url or
                             request.referrer or None)


@app.route('/logout')
def logout():
    """
    Logout and remove all the cookies

    TODO:
    ----
    * Guardar la url de la que viene para volver a la misma
    """
    response = current_app.make_response(redirect('/accionDirecta'))

    # Remove all the cookies
    response.set_cookie('status', '', expires=0)
    response.set_cookie('session', '', expires=0)

    return response


@app.route('/oauthorized')
def oauthorized():
    """
    Check if the login user have the correct permission to add points.

    TODO:
    * check if the facebook user have the coorect permission
    * retornar a la ultima pagina que visito el usuario antes del login
    """
    resp = twitter.authorized_response()

    if resp is None:
        flash('You denied the request to sign in.')
        return redirect('/')
    elif resp['screen_name'] not in app.config['TWITTER_ALLOWED']:
        flash('You dont have premission')
        return redirect('/')

    access_token = resp['oauth_token']
    session['access_token'] = access_token
    session['screen_name'] = resp['screen_name']

    session['twitter_token'] = (
        resp['oauth_token'],
        resp['oauth_token_secret']
    )

    flash('You were successfully logged in')

    response = current_app.make_response(redirect("/accionDirecta"))
    response.set_cookie('status', value=generate_random_id())
    return response


"""
Basic routes
------------
"""


@app.route('/')
def home():
    return render_template("index.html")


@app.route('/accionDirecta')
def accion_directa():
    return render_template("accionDirecta.html",
                           layersNames=app.config['DA_LAYERS_NAMES'])


@app.route('/mapeoCiudadano')
def mapeo_ciudadano():
    return render_template("mapeoCiudadano.html",
                           layersNames=app.config['CM_LAYERS_NAMES'])


@app.route('/historico')
def historio():
    return render_template("index.html")


"""
Direct action routes
--------------------
"""


@app.route('/direct_action/layers', methods=['GET'])
def da_layers_names():
    """
    Get the valid layers names
    """
    layers = jsonify(app.config['DA_LAYERS_NAMES'])
    return layers


@app.route('/direct_action/layer/<layer_name>', methods=['GET'])
def da_data(layer_name):
    """
    Get a geoJson data layer for direct action map.
    If the 'layer_name' dont exist, return an empty json

    Parameters
    ----------
    layer_name: str
      Name of the layer
    """
    data_path = app.config['DA_FOLDER'] + layer_name + '.geojson'

    if layer_name in app.config['DA_LAYERS_NAMES']:
        data = read4json(data_path)
        return jsonify(data)
    else:
        return jsonify({})


@app.route('/direct_action/new_point', methods=['POST'])
def da_new_point():
    """
    Add a new point to direct action map

    Parameters
    ----------

    Errors
    ------
    401: user dont have permission to make post
    400: the image is empty
    400: Invalid type of image
    """
    # The user don't have permission
    if 'twitter_token' not in session:
        print("Error: no tiene permiso")
        abort(401, "You don't have permission")

    # Data of the point: title, day, etc
    data = request.files['data'].read()
    data = eval(data)

    # Photo
    file = FileStorage(request.files['photo'])
    filename = secure_filename(request.files['photo'].filename)

    # Diferents check of the data and image

    # Invalid coordinates
    """
    if data['latitud'] == 0:
        print("Error: latitud invalida")
        abort(400, "Invalid latitude")
    if data['longitud'] == 0:
        print("Error: longitud invalida")
        abort(400, "Invalid longitude")
    """

    # Empty file
    if filename == '':
        print('Error: no archivo')
        abort(400, "The image is empty")

    # Invalid image extention
    if not allowed_file(filename):
        print("Error: Tipo de imagen invalida")
        abort(400, "Invalid type of image")
    elif not file:
        print("Error: Tipo de imagen invalida")
        abort(400, "Invalid type of image")

    # Invalid data layer
    if data['tipo'] not in app.config['DA_LAYERS_NAMES']:
        print("Error: Nombre de capa invalido")
        abort(400, "Invalid layer name")

    # Open the geojson dataframe
    data_path = app.config['DA_FOLDER'] + data['tipo'] + '.geojson'
    df = read4json(data_path)

    # The image is correct and can save
    amount_type = len(df['features']) + 1
    filename = data['tipo'] + '_' + str(amount_type) + '.jpeg'
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(path)

    # Save the now point to geojson file
    point = {
        "type": "Feature",
        "properties": {
            "fecha_creacion": strftime("%Y-%m-%d %H:%M:%S", gmtime()),
            "foto": filename,
            "nombre": data['titulo'],
            "descripcion": data['resumen'],
            "barrio": data['barrio'],
            "tipo": data['tipo'].replace("_", " "),
            "twit": "",
            "face": ""
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                data['latitud'],
                data['longitud']
            ]
        }
    }

    df['features'].append(point)
    save2json(data_path, df)

    # Update the message
    create_menssage("direct_action", data['tipo'])

    return jsonify('201')


"""
Citizen map routes
------------------
"""


@app.route('/citizen_map/layers', methods=['GET'])
def cm_layers_names():
    """
    Get the valid layers names
    """
    layers = jsonify(app.config['CM_LAYERS_NAMES'])
    return layers


@app.route('/citizen_map/layer/<layer_name>', methods=['GET'])
def citizen_data(layer_name):
    """
    Get a geoJson data layer for citizen map.
    If the 'layer_name' dont exist, return an empty json

    Parameters
    ----------
    layer_name: str
      Name of the layer
    """
    data_path = app.config['CM_FOLDER'] + layer_name + '.geojson'

    if layer_name in app.config['CM_LAYERS_NAMES']:
        data = read4json(data_path)
        return jsonify(data)
    else:
        return jsonify({})


@app.route('/citizen_map/new_point', methods=['POST'])
def citizen_new_point():
    """

    """
    pass


"""
Get image
-----------
"""


@app.route('/image/<image_name>', methods=['GET'])
def get_image(image_name):
    """

    """
    elemets = os.listdir(app.config['UPLOAD_FOLDER'])

    if image_name not in elemets:
        print("Error: nombre de imagen incorrecto")
        abort(400, "Invalid image name")

    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_name)

    return send_file(image_path, mimetype='image/gif')


"""
Http Errors
-----------
"""


@app.errorhandler(400)
def bad_request(error):
    """
    Error 400 for Bad Request.
    The body request is empy or with a bad key
    For example `new_name` in side of `name`.
    """
    if error.description:
        message = error.description
    else:
        message = 'Not found'
    return make_response(jsonify({'error': message}), 400)


@app.errorhandler(401)
def unauthorized(error):
    """
    Error 401 for Unauthorized.
    """
    if error.description:
        message = error.description
    else:
        message = 'Unauthorized'

    return make_response(jsonify({'error': message}), 401)


@app.errorhandler(404)
def not_found(error):
    """
    Error 404 for Resource Not Found.
    The id in the URI don't exist.
    """
    if error.description:
        message = error.description
    else:
        message = 'Not found'

    return make_response(jsonify({'error': message}), 404)
