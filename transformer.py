# The Transformer converts sampled voltage into temperature.

from flask import Flask, request

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def voltage_to_temperature_json():
    if request.method == "POST":
        # Receives sampled voltage
        # Integrates with the existing Sampler
        json_packet = request.json
        print(f"JSON FROM SAMPLER: {{\n{json_packet}\n}}")

        voltage = json_packet.get("sampled")

        # Converts it to temperature
        temperature = voltage_to_temperature(voltage)

        # Returns temperature in JSON
        return {
            "voltage": temperature,
        }  # Flask converts dicts to JSON
    else:
        # visual HTTP for users
        return "<p>hello<p>"


def voltage_to_temperature(voltage):
    return voltage * 2
