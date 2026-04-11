# The REST API takes in temperature from the transformer and places it in the database

from flask import Flask, request
from datetime import datetime, timezone
import psycopg2
import os

app = Flask(__name__)

# Get connection to database
def getDatabase():
    #TODO: return the database
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "localhost")
        port=os.environ.get("DB_PORT", 5432)
        dbname=os.environ.get("DB_NAME", "weatherstation")
        user=os.environ.get("DB_USER", "postgres")
        password=os.environ.get("DB_PASS", "password")
    )

# initialize/create database
def initDatabase():
    connection = getDatabase()
    cursor = connection.cursor()
    cursor.execute("""
CREATE TABLE IF NOT EXISTS temperatures (id PRIMARY KEY, temperature FLOAT NOT NULL, timestamp TIMESTAMPTZ NOT NULL)""")


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


