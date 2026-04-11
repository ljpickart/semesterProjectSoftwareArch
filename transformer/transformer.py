# The Transformer converts sampled voltage into temperature.

from flask import Flask, request, jsonify
from datetime import datetime, timezone
import requests

app = Flask(__name__)

# TODO: Using localhost will block traffic from other containers
REST_API_url = "http://localhost:5001/temperature"

@app.route("/", methods=["GET", "POST"])
def voltage_to_temperature_json():
    if request.method == "POST":
        # Receives sampled voltage
        # Integrates with the existing Sampler
        json_packet = request.json
        print(f"JSON FROM SAMPLER: {{\n{json_packet}\n}}")

        voltage = json_packet.get("sampledVoltage")

        # Converts it to temperature
        temperature = voltage_to_temperature(voltage)

        time = datetime.now(timezone.utc).isoformat()
        payload = {"temperature": temperature, "timestamp": time}
        
        try:
            response = requests.post(REST_API_url, json=payload, timeout=5)
            result = response.json()
        except Exception as e:
            return "ERROR Reaching REST API"
        
        return jsonify({
            "temperature": temperature,
            "stored": result
        })

    else:
        # visual HTTP for users
        return "<p>hello<p>"


def voltage_to_temperature(voltage):
    if isinstance(voltage, list):
        return [v * 2 for v in voltage]
    return voltage * 2


if __name__ == "__main__":
    app.run(debug=True)
