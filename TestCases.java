// Compile test cases by using the command: javac -cp ".;junit-platform-console-standalone-1.10.2.jar" TestCases.java
// Run test cases by using the command: java -jar junit-platform-console-standalone-1.10.2.jar --class-path . --scan-class-path --include-classname '.*TestCases'

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.lang.reflect.Method;

public class TestCases {

    /*
    *   Test cases for sensor 
    */

    // Test that sendPacket method exists
    @Test
    void testSendPacketMethodExists() throws Exception {
        Method method = Sensor.class.getDeclaredMethod("sendPacket", double.class);
        assertNotNull(method);
    }

    // Test invoking sendPacket with reflection
    @Test
    void testSendPacketInvocation() throws Exception {
        Method method = Sensor.class.getDeclaredMethod("sendPacket", double.class);
        method.setAccessible(true);

        // invoke with a test measurement
        assertDoesNotThrow(() -> {
            method.invoke(null, 20.5);
        });
    }

    // Test multiple measurement values
    @Test
    void testSendPacketWithVariousMeasurements() throws Exception {
        Method method = Sensor.class.getDeclaredMethod("sendPacket", double.class);
        method.setAccessible(true);

        double[] values = {15.0, 20.0, 30.5, 40.2};

        for (double value : values) {
            assertDoesNotThrow(() -> {
                method.invoke(null, value);
            });
        }
    }


    // Makes sure data is recieved
    @Test
    void serverRespondsOK() throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String json = "{ \"measurement\": 25 }";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://127.0.0.1:3000"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        // Check the server responds 200 and returns "Data received."
        assertEquals(200, response.statusCode());
        assertEquals("Data received.", response.body().trim());
    }


    /*
    *   Test cases for transformer
    */

    // Test GET request
    @Test
    void transformerGetRequest() throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://127.0.0.1:5000"))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("hello"));
    }

    // Test POST with single voltage value
    @Test
    void transformerSingleVoltage() throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        String json = "{ \"sampledVoltage\": 10 }";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://127.0.0.1:5000"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("20")); 
    }

    // Test POST with multiple voltages 
    @Test
    void transformerVoltageList() throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        String json = "{ \"sampledVoltage\": [1, 2, 3] }";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://127.0.0.1:5000"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("2"));
        assertTrue(response.body().contains("4"));
        assertTrue(response.body().contains("6"));
    }

    // Test missing voltage field
    @Test
    void transformerMissingVoltage() throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        String json = "{ }";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://127.0.0.1:5000"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("temperature"));
    }

}