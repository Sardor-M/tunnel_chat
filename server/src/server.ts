import * as WebSocket from "ws";

const port = 8080;
const server = new WebSocket.Server({ port });

server.on("connection", (socket: WebSocket) => {
  console.log("Client connected");

  socket.on("message", (message: string) => {
    console.log(`Received: ${message}`);
    server.clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server running on ws://localhost:${port}`);