import java.io.*;
import java.net.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class Server {
  public static final int PORT_NUMBER = 1250;
  public static int connectionCount = 0;
  public static int maxConnections = 10;

  public static String reportConnectionCount() {
    return connectionCount + " clients connected";
  }

  public static void main(String[] args) throws IOException {

    try (ServerSocket serverSocket = new ServerSocket(PORT_NUMBER)) {
      System.out.println("Server started");

      while(connectionCount < maxConnections) {
        Socket clientSocket = serverSocket.accept();
        ++connectionCount;
        System.out.println("Client connected");
        System.out.println(reportConnectionCount());

        Thread t = new Thread(new ClientHandler(clientSocket));
        t.start();
      }
    }
  }
}


class ClientHandler implements Runnable {
  private final Socket clientSocket;

  public ClientHandler(Socket clientSocket) {
    this.clientSocket = clientSocket;
  }


  @Override
  public void run() {
    InputStreamReader readerConnection;
    BufferedReader reader = null;
    PrintWriter writer = null;
    try {
      readerConnection = new InputStreamReader(clientSocket.getInputStream());
      reader = new BufferedReader(readerConnection);
      writer = new PrintWriter(clientSocket.getOutputStream(), true);

      /* Send initial message to client */
      writer.println("Connection is open.");
      writer.println("Enter a calculation to be performed (no spaces!)");

      /* Receive data from client */
      String oneLine = reader.readLine();  // Receive a line of text
      Pattern pattern = Pattern.compile("(\\d+)([+\\-*/])(\\d+)");
      while (oneLine != null) {  // Client connection is closed
        Matcher matcher = pattern.matcher(oneLine);
        double a = 0, b = 0;
        char operator = ' ';
        if (matcher.find()) {
          a = Double.parseDouble(matcher.group(1));
          operator = matcher.group(2).charAt(0);
          b = Double.parseDouble(matcher.group(3));
        }

        double result = 0;
        switch (operator) {
          case '+' -> result = a + b;
          case '-' -> result = a - b;
          case '*' -> result = a * b;
          case '/' -> {
            if(b != 0) {
              result = a / b;
            } else {
              writer.println("Math error");
            }
          }
          default -> {
            System.out.println("Invalid operator");
            return;
          }
        }
        System.out.println("A client wrote: " + oneLine);
        writer.println("Result: " + result);  // Send response to client
        oneLine = reader.readLine();
      }
    } catch (SocketException socketException) {
      --Server.connectionCount;
      System.out.println("A client lost connection");
      System.out.println(Server.reportConnectionCount());
    }
    catch (Exception e) {
      e.printStackTrace();
    } finally {
      /* Close connection */
      try {
        assert reader != null;
        reader.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
      assert writer != null;
      writer.close();
      --Server.connectionCount;
    }
  }
}