// controller.ts
import { Request, Response } from "express";
import { 
  authService, chatService, roomService, fileService 
} from "./service";

// Auth controllers
export const login = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }
    
    const result = authService.login(username, password);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json({ message: result.error || "Authentication failed" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const register = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }
    
    const result = authService.register(username, password);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json({ message: result.error || "Registration failed" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ message: "Token is required" });
      return;
    }
    
    const result = await authService.validateToken(token);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json({ message: result.error || "Invalid token" });
    }
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Room controllers
export const getRoomsList = (req: Request, res: Response) => {
  try {
    const username = req.user?.username;
    
    if (!username) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const rooms = roomService.getUserRooms(username);
    res.status(200).json({ rooms });
  } catch (error) {
    console.error("Get rooms list error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createRoom = (req: Request, res: Response) => {
  try {
    const { roomName, isPrivate, isEncrypted } = req.body;
    const username = req.user?.username;
    
    if (!username) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    if (!roomName) {
      res.status(400).json({ message: "Room name is required" });
      return;
    }
    
    const result = isPrivate 
      ? roomService.createPrivateRoom(roomName, username, isEncrypted)
      : roomService.createPublicRoom(roomName, username);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json({ message: result.error || "Failed to create room" });
    }
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinRoom = (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;
    const username = req.user?.username;
    
    if (!username) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    if (!roomId) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }
    
    const result = roomService.joinRoom(roomId, username);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ message: result.error || "Failed to join room" });
    }
  } catch (error) {
    console.error("Join room error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveRoom = (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;
    const username = req.user?.username;
    
    if (!username) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    if (!roomId) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }
    
    const result = roomService.leaveRoom(roomId, username);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ message: result.error || "Failed to leave room" });
    }
  } catch (error) {
    console.error("Leave room error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoomMembers = (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const username = req.user?.username;
    
    if (!username) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const members = roomService.getRoomMembers(roomId);
    
    if (members) {
      res.status(200).json({ members });
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    console.error("Get room members error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Chat controllers
export const getMessageHistory = (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const username = req.user?.username;
    
    if (!username) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const result = chatService.getMessageHistory(roomId, 50, username);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ message: result.error || "Failed to get message history" });
    }
  } catch (error) {
    console.error("Get message history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// File controllers
export const uploadFile = (req: Request, res: Response) => {
  try {
    if (!req.file || !req.user) {
      res.status(400).json({ message: "File and authentication required" });
      return;
    }
    
    const { roomId, isEncrypted } = req.body;
    const username = req.user.username;
    
    const result = fileService.uploadFile(
      req.file, 
      username, 
      roomId, 
      isEncrypted === "true"
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ message: result.error || "Failed to upload file" });
    }
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const downloadFile = (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const username = req.user?.username;
    
    if (!username) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const result = fileService.downloadFile(fileId, username);
    
    if (result.success && result.data) {
      res.setHeader("Content-Type", result.metadata?.mimeType || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${result.metadata?.originalName || "download"}"`);
      res.send(result.data);
    } else {
      res.status(400).json({ message: result.error || "Failed to download file" });
    }
  } catch (error) {
    console.error("File download error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFileMetadata = (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const username = req.user?.username;
    
    if (!username) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const metadata = fileService.getFileMetadata(fileId);
    
    if (metadata) {
      res.status(200).json({ metadata });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("Get file metadata error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteFile = (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const username = req.user?.username;
    
    if (!username) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const result = fileService.deleteFile(fileId, username);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ message: result.error || "Failed to delete file" });
    }
  } catch (error) {
    console.error("File deletion error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User controllers
export const getOnlineUsers = (req: Request, res: Response) => {
  try {
    const username = req.user?.username;
    
    if (!username) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { connectedClients } = require('./websocket');
    
    const onlineUsers = Object.keys(connectedClients).map(username => ({
      username,
      lastActive: connectedClients[username].lastActive
    }));
    
    res.status(200).json({
      onlineCount: onlineUsers.length,
      users: onlineUsers
    });
  } catch (error) {
    console.error("Get online users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};