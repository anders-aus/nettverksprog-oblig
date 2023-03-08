const net = require("net");
const crypto = require("crypto");

// Simple HTTP server responds with a simple WebSocket client test
const httpServer = net.createServer((connection) => {
  connection.on("data", () => {
    let content = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    WebSocket test page
    <script>
      let ws = new WebSocket('ws://localhost:3001');
      ws.onmessage = event => {
        console.log('Message from server: ' + event.data);
      }
      ws.onopen = () => {
        console.log("handshake established");
        ws.send('hello');
      };
      ws.onclose = (event) => {
        console.log("connection closed with code " + event.code);
      };
    </script>
  </body>
</html>
`;
    connection.write(
      "HTTP/1.1 200 OK\r\nContent-Length: " +
        content.length +
        "\r\n\r\n" +
        content
    );
  });
});
httpServer.listen(3000, () => {
  console.log("HTTP server listening on port 3000");
});

let clients = new Set();

const wsServer = net.createServer((connection) => {
  clients.add(connection);
  console.log("Client connected");

  connection.on("data", (data) => {
    if (data.toString().startsWith("GET /")) {
      const headers = data.toString().split("\r\n");
      // console.log(headers);
      const [method, path] = headers[0].split(" ");
      let key = headers
        .find((header) => header.startsWith("Sec-WebSocket-Key"))
        .split(": ")[1]
        .trim();
      const acceptKey = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');
      connection.write(
        "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " +
          acceptKey +
          "\r\n\r\n"
      );
    } else {
      const FIN = data[0] & 0b10000000;
      const opcode = data[0] & 0b00001111;
      const masked = data[1] & 0b10000000;
      const payloadLength = data[1] & 0b01111111;
      let mask;
      let payloadData;

      if(masked) {
        mask = data.slice(2, 6);
        payloadData = data.slice(6);
      } else {
        mask = null;
        payloadData = data.slice(2);
      }

      if(payloadLength === 126) {
        mask = masked ? data.slice(4, 8) : null;
        payloadData = masked ? data.slice(8) : data.slice(4);
      }

      if(mask) {
        for (let i = 0; i < payloadData.length; i++) {
          payloadData[i] ^= mask[i % 4];
          
        }
        console.log(payloadData);
        console.log(payloadData.toString('utf8'));
      }
    }
    const message = "Hello from server";
    const buffer = Buffer.alloc(2 + message.length);
    buffer[0] = 0b10000001;
    buffer[1] = message.length;
    buffer.write(message, 2);
    broadcast(buffer);
  });
  
  connection.on("message", (data) => {
    
  });

  connection.on("end", () => {
    clients.delete(connection);
    console.log("Client disconnected");
  });
});
wsServer.on("error", (error) => {
  clients.delete(connecton);
  console.error("Error: ", error);
});
wsServer.listen(3001, () => {
  console.log("WebSocket server listening on port 3001");
});

function broadcast(message) {
  clients.forEach(client => {
    client.write(message);
  });
}