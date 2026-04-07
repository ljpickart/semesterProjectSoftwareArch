# The REST API takes in temperature from the transformer and places it in the database

from flask import Flask, request
from datetime import datetime, timezone
import psycopg2

app = Flask(__name__)

#def getDatabase():
    #TODO: return the database

# initDatabase():
    #TODO

@app.route("/temperature", methods=["POST"])
def storeInDatabase():
    data = request.get_json()
    temperature = data.get("temperature")
    time = data.get("timestamp")

    #validate temperature
    if temperature < -125 or temperature > 150:
        return "ERROR: Invalid temperature reading"
    
    try:
        dbase = getDatabase()
        id = 'test'
        #TODO: finish implementing here
    except Exception as e:
        return "DATABASE ERROR: " + e
    
    return jsonify({"status": "stored", "id": id})


