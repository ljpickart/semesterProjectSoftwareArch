# Software Architecture Semester Project

## Sensor.java

Generates fake voltages as sensor readings

## sampler.js

Node.js file with HTTP endpoints. Takes voltage readings from the sensor
and samples the data.

## transformer.py

Python flask server with HTTP endpoints. Takes in sampled voltage data from sampler.js
and converts the voltage data into temperature data.

## Python dependences (transformer.py)

The python flask server runs in a virtual environment with these dependences (from pip freeze)

blinker==1.9.0
click==8.3.1
colorama==0.4.6
Flask==3.1.3
itsdangerous==2.2.0
Jinja2==3.1.6
MarkupSafe==3.0.3
Werkzeug==3.1.6
