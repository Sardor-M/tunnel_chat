import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
app.use(express.json());

// keyinchalik buni databasega olamiz
// hozirchalik raw bop turadi
const users = [
  {
    username: "admin",
    password: "admin",
  },
  {
    username: "user",
    password: "user",
  },
  {
    username: "test",
    password: "test",
  },
];

app.post("login", (req, res) => {
  const { username, password } = req.body;
  const foundUser = users.find(
    (user) => user.username === username && user.password === password
  );
  if (foundUser) {
    res.status(200).json({
      message: "Login successful",
      username: { username },
    });
  }
  return res.status(401).json({ message: "Invalid credentials" });
});

// buyerda http server qilamiz va websocketga wrap qilamiz
const httpServer = http.createServer(app);
const tunnelServer = new WebSocketServer({ server: httpServer });

// buyerda esa ulangan kilentlarni saqlaymiz
const connectedClients: Record<string, WebSocket> = {};

const rooms: Record<string, string[]> = {
  General: [],
  Random: [],
};

tunnelServer.on("connection", (socket: WebSocket) => {
  console.log("Client joined the Tunnel Chat");
  let username: string | null = null;
  let currentRoom = "General";
  socket.on("message", (rawData: string) => {
    try {
      const data = JSON.parse(rawData);

      if (data.type === "SET_USERNAME") {
        username = data.username;
        connectedClients[username] = socket;
        // buyerdagi default roomga qoshiladi;
        rooms[currentRoom].push(username);
        broadcastToRoom(`${username} joined the room`, currentRoom, username);
      } else if (data.type === "SWITCH_ROOM") {
        const newRoom = data.room;
        if (username) {
          rooms[currentRoom] = rooms[currentRoom].filter(
            (user) => user !== username
          );
          rooms[newRoom].push(username);
          currentRoom = newRoom;
          //
          broadcastToRoom(
            `${username} joined room: ${newRoom}`,
            newRoom,
            username
          );
        }
      } else if (data.type === "CHAT") {
        const message = data.message;
        if (username) {
          broadcastToRoom(`${username}: ${message}`, currentRoom);
        }
      } else if (data.type === "FILE_TRANSFER") {
        // buyerdahi file data sending handle logic yozishim kerak
        // yani fileni store qilib unio route qilamiz (keyinchalik)
      }
    } catch (err) {
      console.log("Tunnel Server - Error parsing the message:", err);
    }
  });

  socket.on("close", () => {
    console.log("Client left the TunnelChat");
    if (username) {
      delete connectedClients[username];
      Object.keys(rooms).forEach((room) => {
        rooms[room] = rooms[room].filter((user) => user !== username);
      });
      broadcastToRoom(`${username} has left.`, currentRoom, username);
    }
  });
});

function broadcastToRoom(message: string, roomName: string, sender?: string) {
  const roomUsers = rooms[roomName];
  if (!roomUsers) return;

  roomUsers.forEach((user) => {
    const client = connectedClients[user];
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "CHAT", message }));
    }
  });
}

const port = 8080;
httpServer.listen(port, () => {
  console.log(`TunnelChar server listening on http://localhost:${port}`);
});
