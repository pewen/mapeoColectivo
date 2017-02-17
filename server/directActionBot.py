#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Telegram bot to add new point to direct action map.
Only the allowed telegram user can create a new point
on the map.

TODO:
----
* Guarda con un nombre correcto la foto subida
* Si todo el proceso es correto, hacer un post al servido
* Si el usuarrio no tiene gps (teelgram web) el server se queda esperando
  obtener las coordenadas. De alguna forma chequear si tienen gps y si no
  terminar el proceso.
* Si el usuario no habilita el gps, dar un error.
"""
import logging

from telegram import ReplyKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import Updater, CommandHandler, MessageHandler,\
    Filters, RegexHandler, ConversationHandler

from keys import da_telegram_token


# Initialize the logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create a file handler
handler = logging.FileHandler('telegramDirectAction.log')
handler.setLevel(logging.INFO)

# Create a logging format
log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
formatter = logging.Formatter(log_format)
handler.setFormatter(formatter)

# Add the handlers to the logger
logger.addHandler(handler)

# Allowed telegram username
ALLOWED_TELEGRAM_USERNAME = ['fnbellomo']

# Name of the diferent step in the creation of a new point
LOCATION, PHOTO, POINT_TYPE, TITLE, DESCRIPTION = range(5)


def start(bot, update):
    """
    Start menssage. Check if the user is allowed to create new points.
    """
    user = update.message.from_user

    # The user is not allowed
    if user.username not in ALLOWED_TELEGRAM_USERNAME:
        # Log
        logger.warn("%s Permsio invalido" % (user.username))

        update.message.reply_text(
            "Lo siento, pero su usuario no esta habilitado " +
            "para agregar nuevos puntos")

        return ConversationHandler.END

    # Else, the user is allowed
    # Keyboard with custom answers
    keyboard = [['Árbol', 'Actividad Artística'],
                ['Intervención Pública', 'Taller']]
    reply_markup = ReplyKeyboardMarkup(keyboard,
                                       resize_keyboard=True,
                                       one_time_keyboard=True)

    update.message.reply_text(
        "Agregar un nuevo punto al mapa de acción directa " +
        "Podes cancelar la creación del mismo escribiendo /cancelar"
        "\n\n" +
        "Por favor, primero selecciona el tipo del nuevo punto",
        reply_markup=reply_markup)

    return POINT_TYPE


def point_type(bot, update, user_data):
    """
    Get the type of the new point
    """
    user = update.message.from_user
    # Persist data between responses
    user_data['type'] = update.message.text

    # Log
    logger.info("%s nuevo punto tipo: %s"
                % (user.username, update.message.text))

    update.message.reply_text(
        "Vas a crear un nuevo punto del tipo: " + update.message.text +
        "\n\n" +
        "¿Cual es el titulo del nuevo punto?")

    return TITLE


def title(bot, update, user_data):
    """
    Get the title of the new point
    """
    user = update.message.from_user
    user_data['title'] = update.message.text

    # Log
    logger.info("%s nuevo punto titulo: %s"
                % (user.username, update.message.text))

    update.message.reply_text(
        'Agrega una pequeña descripción sobre este nuevo punto.')

    return DESCRIPTION


def description(bot, update, user_data):
    """
    Get the description of the new point
    """
    user = update.message.from_user
    user_data['description'] = update.message.text

    # Log
    logger.info("%s nuevo punto descripcion: %s"
                % (user.username, update.message.text))

    update.message.reply_text(
        'Toma una foto del nuevo punto.')

    return PHOTO


def photo(bot, update, user_data):
    """
    Get the photo of the new point

    TODO
    ----
    * Poner un bueno nombre de foto
    """
    user = update.message.from_user
    photo_file = bot.getFile(update.message.photo[-1].file_id)

    photo_name = 'user_photo.jpg'
    photo_file.download(photo_name)

    user_data['photo_name'] = photo_name

    # Log
    logger.info("%s nuevo punto foto: %s"
                % (user.username, photo_name))

    update.message.reply_text(
        'Por ultimo, comparti tu posición actual')

    return LOCATION


def location(bot, update, user_data):
    """
    Get the location of the new point
    """
    user = update.message.from_user
    location = update.message.location

    user_data['location'] = location

    # Log
    logger.info("%s nuevo punto posicion (lat - long): %f - %f"
                % (user.username,
                   location.latitude,
                   location.longitude))

    update.message.reply_text(
        'Muchas gracias por subir un nuevo punto!')

    # Print the data of the new point
    print(user_data)
    return ConversationHandler.END


def cancel(bot, update):
    """
    Cancelar la conversación
    """
    user = update.message.from_user

    # Log
    logger.info("%s cancelo el nuevo punto."
                % user.username)

    update.message.reply_text(
        "Se cancelo la creación de un nuevo punto." +
        "\n\nPara crear uno nuevo escribe /start",
        reply_markup=ReplyKeyboardRemove())

    return ConversationHandler.END


def error(bot, update, error):
    logger.warn('Update "%s" caused error "%s"' % (update, error))


def create_bot():
    # Create the EventHandler and pass it your bot's token.
    updater = Updater(da_telegram_token)

    # Get the dispatcher to register handlers
    dispatcher = updater.dispatcher

    # Filter used to select the new point type
    type_regex = '^(Árbol|Actividad Artística|Intervención Pública|Taller)$'

    # Add conversation handler with the states
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler('start', start)],

        states={
            POINT_TYPE: [RegexHandler(type_regex, point_type,
                                      pass_user_data=True)],
            TITLE: [MessageHandler(Filters.text, title,
                                   pass_user_data=True)],
            DESCRIPTION: [MessageHandler(Filters.text, description,
                                         pass_user_data=True)],
            PHOTO: [MessageHandler(Filters.photo, photo,
                                   pass_user_data=True)],
            LOCATION: [MessageHandler(Filters.location, location,
                                      pass_user_data=True)]
        },
        fallbacks=[CommandHandler('cancelar', cancel)]
    )

    dispatcher.add_handler(conv_handler)

    # Log all errors
    dispatcher.add_error_handler(error)

    # Start the Bot
    updater.start_polling()

    # Run the bot until the you presses Ctrl-C or the
    # process receives SIGINT,
    # SIGTERM or SIGABRT. This should be used most of the time, since
    # start_polling() is non-blocking and will stop the bot gracefully.
    updater.idle()


"""
if __name__ == '__main__':
    main()
"""
