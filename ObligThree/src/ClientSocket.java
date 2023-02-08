import java.io.*;
import java.net.*;
import java.util.Scanner;

class ClientSocket {
  public static void main(String[] args) throws IOException {
    final int PORT_NUMBER = 1250;

    /* Read the requested server name */
    Scanner commandLineReader = new Scanner(System.in);
    System.out.print("Enter the name of the server to connect to: ");
    String serverName = commandLineReader.nextLine();

    /* Create a connection to the server */
    Socket connection = new Socket(serverName, PORT_NUMBER);
    System.out.println("Connected.");

    /* Open a communication line with the server */
    InputStreamReader connectionReader = new InputStreamReader(connection.getInputStream());
    BufferedReader reader = new BufferedReader(connectionReader);
    PrintWriter writer = new PrintWriter(connection.getOutputStream(), true);

    /* Read messages from the server */
    String introductionLine1 = reader.readLine();
    String introductionLine2 = reader.readLine();
    System.out.println(introductionLine1 + "\n" + introductionLine2);

    /* Read entered user messages */
    String aLine = commandLineReader.nextLine();
    while (!aLine.equals("")) {
      writer.println(aLine);  // Send the text to the server
      String response = reader.readLine();  // Receive a response from the server
      System.out.println("From server: " + response);
      aLine = commandLineReader.nextLine();
    }

    /* Close the connection */
    reader.close();
    writer.close();
    connection.close();
  }
}
