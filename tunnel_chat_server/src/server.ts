import express, { Request, Response } from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { onlineUsersRouter } from "./routes/onlineUsers";
import cors from "cors";

type ClientInfo = {
  socket: WebSocket;
  username: string;
  lastActive: number; // qachon kirganligini saqlaymiz
};

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// buyerda http server qilamiz va websocketga wrap qilamiz
const httpServer = http.createServer(app);
const tunnelServer = new WebSocketServer({ server: httpServer });

app.use("/onlineUsers", onlineUsersRouter);

const rooms: Record<string, string[]> = {
  General: [],
  Random: [],
};

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

app.post("/login", (req: Request, res: Response): void => {
  const { username, password } = req.body;
  const foundUser = users.find(
    (user) => user.username === username && user.password === password
  );
  if (foundUser) {
    res.status(200).json({
      message: "Login successful",
      username: username,
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// buyerda esa ulangan klientlarni saqlaymiz
export const connectedClients: Record<string, ClientInfo> = {};

tunnelServer.on("connection", (socket: WebSocket) => {
  console.log("Client joined the Tunnel Chat");
  let username: string | null = null;
  let currentRoom = "General";

  socket.on("message", (rawData: string) => {
    try {
      const data = JSON.parse(rawData);

      if (data.type === "SET_USERNAME") {
        if (typeof data.username === "string") {
          username = data.username;

          if (username) {
            connectedClients[username] = {
              socket,
              username,
              lastActive: Date.now(),
            };
            console.log(username, "joined");
            rooms[currentRoom].push(username);
          }

          // buyerdagi default roomga qoshiladi;
          broadcastToRoom(
            `${username} joined the room`,
            currentRoom,
            username!
          );
        }
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
          connectedClients[username].lastActive = Date.now();
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
    if (client && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify({ type: "CHAT", message }));
    }
  });
}

const port = 8080;
httpServer.listen(port, () => {
  console.log(`TunnelChar server listening on http://localhost:${port}`);
});
