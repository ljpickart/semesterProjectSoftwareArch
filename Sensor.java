import java.time.LocalTime;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Sensor {
  public static void main(String[] args) {
    // Implement a count variable for simulation purposes. Can't have an infinite
    // loop for the sake of the CI/CD pipeline

    // test
    try {
      sendPacket(5.0);
    } catch (Exception exception) {
      System.err.println("err while sending packet: " + exception.getMessage());
    }

    int count = 0;
    while (count < 200) {
      //System.out.println("Sensor read: " + Math.random() * 25 + 15);
      count++;
    }
  }

  // Function for sending data to the sampler
  private static void sendPacket(double measurement) throws Exception {
    String hostname = "127.0.0.1";
    int port = 3000;
    LocalTime currentTime = LocalTime.now();

    String message = "what's up. Measurement: " + measurement + " at time: " + currentTime; // TODO: this should be json
                                                                                            // format

    HttpClient client = HttpClient.newHttpClient();

    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("http://" + hostname + ":" + port))
        .header("Content-Type", "text/plain")
        .POST(HttpRequest.BodyPublishers.ofString(message))
        .build();

    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

    System.out.println("Status Code: " + response.statusCode());
    System.out.println("Response Body: " + response.body());
  }
}
