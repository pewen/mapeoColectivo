#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
Algunas funciones utilizadas en el servidor
"""

import json
import sys

# Configure the base path depending if is the local machine or openshift
if 'openshift' in sys.path[1]:
    PATH_BASE = '/var/lib/openshift/589353cf2d52713621000059/app-root/runtime/repo/'
else:
    PATH_BASE = './'

def read4json(file_path):
    """
    Leo la un json y lo retorno
    Parameter
    ---------
    file_path : str
      Path al json
    """
    with open(file_path, 'r') as data_file:
        data = json.load(data_file)
    return data


def save2json(file_path, data):
    """
    Salvo un dic a un json
    Parameters
    ----------
    file_path: str
      Path al json
    data: dic
      Diccionario a guardar
    """
    with open(file_path, 'w') as data_file:
        json.dump(data, data_file, indent=4)


def create_menssage(layer, type_point):
    """
    Create the menssage depending the type of new point

    Parameters
    ----------
    layer: str
      Layer name (direct_action or citizen_map)
    type_point: str
      Type of the new point

    Return
    ------
    message: str
      Message to use on twitter or facebook
    """
    url = "https://pewen.github.io"

    text = {
        'arbol': "Un nuevo árbol plantado. Ya van {0}:&url=" +
        url + "&hashtags=MasÁrboles",
        'taller': "Este es el curso número {0}:&url=" + url +
        "&hashtags=Capasitación",
        'actividad_artistica': "Esta es la actividad artistica \
        número {1} de {0}:&url=" + url + "&hashtags=ArteEnLasCalles",
        'intervencion_publica': "Esta es la intervención pública \
        número {1} de {0}:&url=" + url + "&hashtags=Spam"
    }

    path = PATH_BASE + "data/" + layer + "/" + type_point + ".geojson"
    data = read4json(path)

    amount = len(data['features'])

    for index, element in enumerate(data['features']):
        message = text[type_point].format(amount, index + 1)
        message = message.replace(" ", "+")
        element['properties']['twit'] = "https://twitter.com/intent/tweet?text=" + message

    save2json(path, data)
