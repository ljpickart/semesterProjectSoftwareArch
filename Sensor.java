public class Sensor {
  public static void main(String[] args) {
    while(true) {
      System.out.println("Sensor read: " + Math.random() * 25 + 15);
    }
  }
}
