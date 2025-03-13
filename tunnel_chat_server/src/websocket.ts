import { RawData, WebSocket, WebSocketServer } from "ws";
import http from "http";
import { chatService, roomService } from "./service";

export const connectedClients: Record<string, {
  socket: WebSocket;
  username: string;
  lastActive: number;
}> = {};

// Setup WebSocket server
export function setupWebSocket(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket: WebSocket) => {
    console.log("New client connected to Tunnel Chat");
    let username: string | null = null;
    let currentRoom = "General";

    socket.on("message", (rawData: RawData) => {
      try {
        const data = JSON.parse(rawData.toString());

        switch (data.type) {
          case "SET_USERNAME":
            if (typeof data.username === "string") {
              username = data.username;

              // Store client info
              if (username) {
                connectedClients[username] = {
                  socket,
                  username,
                  lastActive: Date.now()
                };
                console.log(`User ${username} joined`);
                
                // Join the default room
                roomService.joinRoom("General", username);
                
                // Send room list to client
                socket.send(JSON.stringify({
                  type: "CONNECTION_SUCCESS",
                  username,
                  availableRooms: Object.keys(roomService.getPublicRooms())
                }));
              }
            }
            break;

          case "SWITCH_ROOM":
            if (username && data.room) {
              // Leave current room
              if (currentRoom) {
                roomService.leaveRoom(currentRoom, username);
              }
              
              // Join new room
              roomService.joinRoom(data.room, username);
              
              // Update current room
              currentRoom = data.room;
              
              // Broadcast room change messages
              broadcastToRoom(currentRoom, "system", `${username} joined the room`);
            }
            break;

          case "CHAT":
            if (username && data.message) {
              // Update last active time
              connectedClients[username].lastActive = Date.now();
              
              // Create message ID
              const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
              
              // Create message object
              const message = {
                id: messageId,
                roomId: currentRoom,
                sender: username,
                content: data.message,
                timestamp: Date.now(),
                isEncrypted: data.isEncrypted || false
              };
              
              // Add to message history
              chatService.addMessageToHistory(message);
              
              // Broadcast message
              broadcastToRoom(currentRoom, username, data.message);
            }
            break;

          case "FILE_TRANSFER":
            if (username && data.fileInfo) {
              handleFileTransfer(username, currentRoom, data.fileInfo);
            }
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    socket.on("close", () => {
      console.log("Client disconnected from Tunnel Chat");
      if (username) {
        // Remove from connected clients
        delete connectedClients[username];
        
        // Remove from all rooms
        if (currentRoom) {
          roomService.leaveRoom(currentRoom, username);
          broadcastToRoom(currentRoom, "system", `${username} has left the chat`);
        }
      }
    });
  });

  // Periodic cleanup of inactive clients (every 10 minutes)
  setInterval(() => {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
    
    for (const username in connectedClients) {
      const client = connectedClients[username];
      if (now - client.lastActive > inactiveThreshold) {
        // Close connection
        if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.close();
        }
        
        // Remove from connected clients
        delete connectedClients[username];
      }
    }
  }, 10 * 60 * 1000);

  return wss;
}

// Broadcast message to room
function broadcastToRoom(roomId: string, sender: string, message: string): void {
  const members = roomService.getRoomMembers(roomId);
  
  if (!members) {
    return;
  }
  
  members.forEach((username: string) => {
    const client = connectedClients[username];
    if (client && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify({
        type: "CHAT",
        roomId,
        sender,
        message,
        timestamp: Date.now()
      }));
    }
  });
}

// Handle file transfer notification
function handleFileTransfer(username: string, roomId: string, fileInfo: any): void {
  const members = roomService.getRoomMembers(roomId);
  
  if (!members) {
    return;
  }
  
  members.forEach(member => {
    const client = connectedClients[member];
    if (client && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify({
        type: "FILE_SHARED",
        roomId,
        username,
        fileInfo: {
          ...fileInfo,
          sharedAt: Date.now()
        }
      }));
    }
  });
}