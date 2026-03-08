public class Sensor {
  public static void main(String[] args) {
    //Implement a count variable for simulation purposes. Can't have an infinite loop for the sake of the CI/CD pipeline
    int count = 0;
    while(count < 200) {
      System.out.println("Sensor read: " + Math.random() * 25 + 15);
      count++;
    }
  }
}
