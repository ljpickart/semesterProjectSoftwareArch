package sensor;
import java.time.LocalTime;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Sensor {
  static String sampler_url;
  static boolean first_message = false;

  public static void main(String[] args) {
    sampler_url = System.getenv("SAMPLER_URL");
    // Implement a count variable for simulation purposes. Can't have an infinite
    // loop for the sake of the CI/CD pipeline

    while (true) {
      double data = Math.random() * 25 + 15;

      try {
        sendPacket(data);
      } catch (Exception e) {
        System.err.println("err while sending packet: " + e);
      }
    }
  }

  // Function for sending data to the sampler
  private static void sendPacket(double measurement) throws Exception {
    // String hostname = "sampler";
    // int port = 3000;

    // Java has JSON libraries, but manually contructed JSON will
    // be easier for us probably
    String message = """
        {
          "measurement": %f
        }
        """.formatted(measurement);

    HttpClient client = HttpClient.newHttpClient();

    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(sampler_url))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(message))
        .build();

    int maxRetries = 10;
    for(int retryAttempt = 1; retryAttempt <= maxRetries; retryAttempt++) {
      try {
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (first_message) {
          System.out.println("SENSOR: first message, Status Code: " + response.statusCode());
          System.out.println("SENSOR: first message, Response Body: " + response.body());
          first_message = false;
        }
        return;
      } catch (java.net.ConnectException e) {
        System.err.println("Attempt " + retryAttempt + " out of " + maxRetries);
        if(retryAttempt == maxRetries) {
          throw e;
        }
        Thread.sleep(2000);
      }
    }
    
  }
}
