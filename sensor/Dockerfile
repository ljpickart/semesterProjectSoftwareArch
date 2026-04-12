FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY Sensor.java sensor/Sensor.java
RUN javac sensor/Sensor.java
CMD ["java", "sensor.Sensor"]