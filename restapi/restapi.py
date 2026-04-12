# The REST API takes in temperature from the transformer and places it in the database

from flask import Flask, request, jsonify
from datetime import datetime, timezone
import psycopg2
import os

app = Flask(__name__)

# Get connection to database
def getDatabase():
    #TODO: return the database
    print("Connecting to db")
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=int(os.environ.get("DB_PORT", 5432)),
        dbname=os.environ.get("DB_NAME", "weatherstation"),
        user=os.environ.get("DB_USER", "postgres"),
        password=os.environ.get("DB_PASS", "password")
    )

# initialize/create database
def initDatabase():
    connection = getDatabase()
    cursor = connection.cursor()
    cursor.execute("""
CREATE TABLE IF NOT EXISTS temperatures (id SERIAL PRIMARY KEY, temperature FLOAT NOT NULL, timestamp TIMESTAMPTZ NOT NULL)""")
    connection.commit()
    cursor.close()
    connection.close()

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
        cursor = dbase.cursor()
        cursor.execute("INSERT INTO temperatures (temperature, timestamp) VALUES (%s, %s) RETURNING id", (temperature, time))
        id = cursor.fetchone()[0]
        dbase.commit()
        cursor.close()
        dbase.close()
        #TODO: finish implementing here
    except Exception as e:
        return "DATABASE ERROR: " + str(e)
    
    return jsonify({"status": "stored", "id": id})

if __name__ == "__main__":
    initDatabase()
    app.run(host='0.0.0.0', port=5001, debug=True)

