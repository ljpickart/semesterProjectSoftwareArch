FROM python:3.12-slim
WORKDIR /app
COPY dependencies.txt .
RUN pip install -r dependencies.txt

COPY restapi.py .
EXPOSE 5001
CMD ["python", "restapi.py"]