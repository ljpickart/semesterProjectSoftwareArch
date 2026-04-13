FROM python:3.12-slim
WORKDIR /app
COPY dependencies.txt .
RUN pip install -r dependencies.txt

COPY transformer.py .
EXPOSE 5000
CMD ["python", "transformer.py"]
