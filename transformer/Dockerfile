FROM python:3.12-slim
WORKDIR /restapi
COPY dependencies.txt .
RUN pip install -r dependenciest.txt

COPY transformer.py .
EXPOSE 5000
CMD ["python", "transformer.py"]