import multiprocessing

from server.routes import app
from server.directActionBot import create_bot

# Start the direct action telegram bot in a new process
process = multiprocessing.Process(target=create_bot)
process.start()

app.run()
