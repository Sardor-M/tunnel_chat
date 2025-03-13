// service.ts
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { WebSocket } from "ws";
import { 
  User, Room, PrivateRoom, ChatMessage, FileMetadata, 
  AuthResult, FileResult, RoomResult
} from "./types";

// JWT secret (in prod, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// In-memory data stores
const users: User[] = [
  { username: "admin", password: hashPassword("admin"), createdAt: new Date() },
  { username: "user", password: hashPassword("user"), createdAt: new Date() },
  { username: "test", password: hashPassword("test"), createdAt: new Date() }
];

const publicRooms: Record<string, Room> = {
  'General': {
    id: 'General',
    name: 'General',
    members: [],
    isPrivate: false,
    createdAt: Date.now()
  },
  'Random': {
    id: 'Random',
    name: 'Random',
    members: [],
    isPrivate: false,
    createdAt: Date.now()
  }
};

const privateRooms: Record<string, PrivateRoom> = {};
const messageHistory: Record<string, ChatMessage[]> = {};
const fileMetadata: Record<string, FileMetadata> = {};

// Auth service
export const authService = {
  login(username: string, password: string): AuthResult {
    try {
      if (!username || !password) {
        return { success: false, error: "Username and password are required" };
      }
      
      const hashedPassword = hashPassword(password);
      const user = users.find(u => u.username === username && u.password === hashedPassword);
      
      if (!user) {
        return { success: false, error: "Invalid credentials" };
      }
      
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
      
      return {
        success: true,
        token,
        username
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Authentication failed" };
    }
  },

  register(username: string, password: string): AuthResult {
    try {
      if (!username || !password) {
        return { success: false, error: "Username and password are required" };
      }
      
      if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
        return { 
          success: false, 
          error: "Username must be 3-16 characters and can only contain letters, numbers, and underscores" 
        };
      }
      
      if (password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long" };
      }
      
      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
        return { success: false, error: "Username already exists" };
      }
      
      users.push({
        username,
        password: hashPassword(password),
        createdAt: new Date()
      });
      
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
      
      return {
        success: true,
        token,
        username
      };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Registration failed" };
    }
  },

  validateToken(token: string): Promise<AuthResult> {
    return new Promise((resolve) => {
      try {
        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
          if (err) {
            resolve({ success: false, error: "Invalid or expired token" });
            return;
          }
          
          const user = users.find(u => u.username === decoded.username);
          if (!user) {
            resolve({ success: false, error: "User not found" });
            return;
          }
          
          resolve({
            success: true,
            username: decoded.username
          });
        });
      } catch (error) {
        console.error("Token validation error:", error);
        resolve({ success: false, error: "Token validation failed" });
      }
    });
  },

  verifyToken(token: string): { valid: boolean; username?: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
      return { valid: true, username: decoded.username };
    } catch (error) {
      return { valid: false };
    }
  }
};

// Room service
export const roomService = {
  getPublicRooms(): Room[] {
    return Object.values(publicRooms);
  },

  getUserPrivateRooms(username: string): PrivateRoom[] {
    return Object.values(privateRooms).filter(room => room.members.includes(username));
  },

  getUserRooms(username: string): (Room | PrivateRoom)[] {
    const userPublicRooms = Object.values(publicRooms);
    const userPrivateRooms = this.getUserPrivateRooms(username);
    return [...userPublicRooms, ...userPrivateRooms];
  },

  getRoomById(roomId: string): Room | PrivateRoom | null {
    return publicRooms[roomId] || privateRooms[roomId] || null;
  },

  getPrivateRoomById(roomId: string): PrivateRoom | null {
    return privateRooms[roomId] || null;
  },

  createPublicRoom(name: string, creator: string): RoomResult {
    try {
      if (!name || name.trim().length < 3 || name.trim().length > 30) {
        return { success: false, error: "Room name must be between 3 and 30 characters" };
      }
      
      if (publicRooms[name]) {
        return { success: false, error: "A room with this name already exists" };
      }
      
      const room: Room = {
        id: name,
        name,
        members: [creator],
        isPrivate: false,
        createdAt: Date.now()
      };
      
      publicRooms[name] = room;
      
      return {
        success: true,
        room
      };
    } catch (error) {
      console.error("Create public room error:", error);
      return { success: false, error: "Failed to create room" };
    }
  },

  createPrivateRoom(
    name: string,
    creator: string,
    isEncrypted: boolean = false
  ): RoomResult {
    try {
      if (!name || name.trim().length < 3 || name.trim().length > 30) {
        return { success: false, error: "Room name must be between 3 and 30 characters" };
      }
      
      const roomId = generateRoomId();
      const encryptionKey = isEncrypted ? generateEncryptionKey() : "";
      
      const room: PrivateRoom = {
        id: roomId,
        name,
        members: [creator],
        isPrivate: true,
        isEncrypted,
        encryptionKey,
        creator,
        createdAt: Date.now()
      };
      
      privateRooms[roomId] = room;
      
      return {
        success: true,
        room
      };
    } catch (error) {
      console.error("Create private room error:", error);
      return { success: false, error: "Failed to create room" };
    }
  },

  joinRoom(roomId: string, username: string): RoomResult {
    try {
      if (this.isUserInRoom(roomId, username)) {
        const room = this.getRoomById(roomId);
        if (!room) {
          return { success: false, error: "Room not found" };
        }
        
        if (room.isPrivate && (room as PrivateRoom).isEncrypted) {
          return {
            success: true,
            room,
            encryptionKey: (room as PrivateRoom).encryptionKey
          };
        }
        
        return { success: true, room };
      }
      
      if (publicRooms[roomId]) {
        publicRooms[roomId].members.push(username);
        return { success: true, room: publicRooms[roomId] };
      }
      
      if (privateRooms[roomId]) {
        privateRooms[roomId].members.push(username);
        
        if (privateRooms[roomId].isEncrypted) {
          return {
            success: true,
            room: privateRooms[roomId],
            encryptionKey: privateRooms[roomId].encryptionKey
          };
        }
        
        return { success: true, room: privateRooms[roomId] };
      }
      
      return { success: false, error: "Room not found" };
    } catch (error) {
      console.error("Join room error:", error);
      return { success: false, error: "Failed to join room" };
    }
  },

  leaveRoom(roomId: string, username: string): { success: boolean; error?: string } {
    try {
      if (publicRooms[roomId]) {
        if (!publicRooms[roomId].members.includes(username)) {
          return { success: false, error: "You are not in this room" };
        }
        
        publicRooms[roomId].members = publicRooms[roomId].members.filter(user => user !== username);
        return { success: true };
      }
      
      if (privateRooms[roomId]) {
        if (!privateRooms[roomId].members.includes(username)) {
          return { success: false, error: "You are not in this room" };
        }
        
        privateRooms[roomId].members = privateRooms[roomId].members.filter(user => user !== username);
        
        if (privateRooms[roomId].members.length === 0) {
          delete privateRooms[roomId];
        }
        
        return { success: true };
      }
      
      return { success: false, error: "Room not found" };
    } catch (error) {
      console.error("Leave room error:", error);
      return { success: false, error: "Failed to leave room" };
    }
  },

  isUserInRoom(roomId: string, username: string): boolean {
    if (publicRooms[roomId]) {
      return publicRooms[roomId].members.includes(username);
    }
    
    if (privateRooms[roomId]) {
      return privateRooms[roomId].members.includes(username);
    }
    
    return false;
  },

  getRoomMembers(roomId: string): string[] | null {
    if (publicRooms[roomId]) {
      return publicRooms[roomId].members;
    }
    
    if (privateRooms[roomId]) {
      return privateRooms[roomId].members;
    }
    
    return null;
  }
};

// Chat service
export const chatService = {
  getMessageHistory(
    roomId: string,
    limit: number = 50,
    username: string
  ): {
    success: boolean;
    messages?: ChatMessage[];
    isEncrypted?: boolean;
    encryptionKey?: string;
    error?: string;
  } {
    try {
      const room = roomService.getRoomById(roomId);
      if (!room) {
        return { success: false, error: "Room not found" };
      }
      
      if (!roomService.isUserInRoom(roomId, username)) {
        return { success: false, error: "You are not a member of this room" };
      }
      
      const messages = messageHistory[roomId] || [];
      
      let isEncrypted = false;
      let encryptionKey: string | undefined;
      
      if (room.isPrivate) {
        const privateRoom = roomService.getPrivateRoomById(roomId);
        if (privateRoom) {
          isEncrypted = privateRoom.isEncrypted;
          encryptionKey = privateRoom.isEncrypted ? privateRoom.encryptionKey : undefined;
        }
      }
      
      return {
        success: true,
        messages: messages.slice(-limit),
        isEncrypted,
        encryptionKey
      };
    } catch (error) {
      console.error("Get message history error:", error);
      return { success: false, error: "Failed to get message history" };
    }
  },

  addMessageToHistory(message: ChatMessage): void {
    const { roomId } = message;
    
    if (!messageHistory[roomId]) {
      messageHistory[roomId] = [];
    }
    
    if (messageHistory[roomId].length >= 100) {
      messageHistory[roomId].shift();
    }
    
    messageHistory[roomId].push(message);
  }
};

// File service
export const fileService = {
  getFileMetadata(fileId: string): FileMetadata | null {
    return fileMetadata[fileId] || null;
  },

  uploadFile(
    file: Express.Multer.File,
    uploader: string,
    roomId?: string,
    shouldEncrypt: boolean = false
  ): FileResult {
    try {
      if (!file) {
        return { success: false, error: "No file provided" };
      }
      
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const filePath = file.path;
      const fileContent = fs.readFileSync(filePath);
      const checksum = hashFile(fileContent);
      
      if (shouldEncrypt && roomId) {
        const room = roomService.getPrivateRoomById(roomId);
        
        if (!room || !room.isEncrypted) {
          return { success: false, error: "Room is not configured for encryption" };
        }
        
        const encryptionKey = room.encryptionKey;
        const { encryptedData, iv, authTag } = encryptFile(fileContent, encryptionKey);
        
        const encryptedFilename = `${fileId}_encrypted${path.extname(file.originalname)}`;
        const encryptedFilePath = path.join(UPLOADS_DIR, encryptedFilename);
        
        fs.writeFileSync(encryptedFilePath, encryptedData);
        fs.writeFileSync(`${encryptedFilePath}.iv`, iv);
        fs.writeFileSync(`${encryptedFilePath}.tag`, authTag);
        
        fs.unlinkSync(filePath);
        
        const metadata: FileMetadata = {
          fileId,
          originalName: file.originalname,
          filename: encryptedFilename,
          size: file.size,
          mimeType: file.mimetype,
          uploader,
          uploadTime: Date.now(),
          roomId,
          isEncrypted: true,
          checksum,
          downloadCount: 0
        };
        
        fileMetadata[fileId] = metadata;
        
        // Return result without checksum
        const { checksum: _, ...publicMetadata } = metadata;
        
        return {
          success: true,
          fileId,
          metadata: publicMetadata
        };
      // service.ts (continued)
    } else {
        const metadata: FileMetadata = {
          fileId,
          originalName: file.originalname,
          filename: path.basename(filePath),
          size: file.size,
          mimeType: file.mimetype,
          uploader,
          uploadTime: Date.now(),
          roomId,
          isEncrypted: false,
          checksum,
          downloadCount: 0
        };
        
        fileMetadata[fileId] = metadata;
        
        // Return result without checksum
        const { checksum: _, ...publicMetadata } = metadata;
        
        return {
          success: true,
          fileId,
          metadata: publicMetadata
        };
      }
    } catch (error) {
      console.error("File upload error:", error);
      return { success: false, error: "Failed to upload file" };
    }
  },

  downloadFile(
    fileId: string,
    username: string
  ): {
    success: boolean;
    data?: Buffer;
    metadata?: Omit<FileMetadata, "checksum">;
    error?: string;
  } {
    try {
      const metadata = fileMetadata[fileId];
      if (!metadata) {
        return { success: false, error: "File not found" };
      }
      
      if (metadata.roomId) {
        const hasAccess = roomService.isUserInRoom(metadata.roomId, username);
        if (!hasAccess) {
          return { success: false, error: "You don't have access to this file" };
        }
      }
      
      const filePath = path.join(UPLOADS_DIR, metadata.filename);
      
      if (!fs.existsSync(filePath)) {
        return { success: false, error: "File not found on server" };
      }
      
      // Update download count
      metadata.downloadCount++;
      
      if (metadata.isEncrypted && metadata.roomId) {
        const room = roomService.getPrivateRoomById(metadata.roomId);
        
        if (!room || !room.isEncrypted) {
          return { success: false, error: "Cannot decrypt file: missing encryption information" };
        }
        
        try {
          const encryptionKey = room.encryptionKey;
          const encryptedData = fs.readFileSync(filePath);
          const iv = fs.readFileSync(`${filePath}.iv`);
          const authTag = fs.readFileSync(`${filePath}.tag`);
          
          const decryptedData = decryptFile(encryptedData, iv, authTag, encryptionKey);
          
          const { checksum: _, ...publicMetadata } = metadata;
          
          return {
            success: true,
            data: decryptedData,
            metadata: publicMetadata
          };
        } catch (error) {
          console.error("File decryption error:", error);
          return { success: false, error: "Failed to decrypt file" };
        }
      }
      
      const fileData = fs.readFileSync(filePath);
      
      const { checksum: _, ...publicMetadata } = metadata;
      
      return {
        success: true,
        data: fileData,
        metadata: publicMetadata
      };
    } catch (error) {
      console.error("File download error:", error);
      return { success: false, error: "Failed to download file" };
    }
  },

  deleteFile(
    fileId: string,
    username: string
  ): {
    success: boolean;
    error?: string;
  } {
    try {
      const metadata = fileMetadata[fileId];
      if (!metadata) {
        return { success: false, error: "File not found" };
      }
      
      if (metadata.uploader !== username && username !== 'admin') {
        return { success: false, error: "You don't have permission to delete this file" };
      }
      
      const filePath = path.join(UPLOADS_DIR, metadata.filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        
        if (metadata.isEncrypted) {
          if (fs.existsSync(`${filePath}.iv`)) {
            fs.unlinkSync(`${filePath}.iv`);
          }
          if (fs.existsSync(`${filePath}.tag`)) {
            fs.unlinkSync(`${filePath}.tag`);
          }
        }
      }
      
      delete fileMetadata[fileId];
      
      return { success: true };
    } catch (error) {
      console.error("File deletion error:", error);
      return { success: false, error: "Failed to delete file" };
    }
  }
};

// Encryption utilities
function generateEncryptionKey(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

function encryptMessage(message: string, key: string): string {
  const keyBuffer = Buffer.from(key, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);
  
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

function decryptMessage(encryptedMessage: string, key: string): string {
  const keyBuffer = Buffer.from(key, "hex");
  const [ivHex, authTagHex, encryptedData] = encryptedMessage.split(":");
  
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function hashFile(fileBuffer: Buffer): string {
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

function encryptFile(fileBuffer: Buffer, key: string): { 
  encryptedData: Buffer, 
  iv: Buffer, 
  authTag: Buffer 
} {
  const keyBuffer = Buffer.from(key, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);
  
  const encryptedData = Buffer.concat([
    cipher.update(fileBuffer),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return { encryptedData, iv, authTag };
}

function decryptFile(
  encryptedData: Buffer, 
  iv: Buffer, 
  authTag: Buffer, 
  key: string
): Buffer {
  const keyBuffer = Buffer.from(key, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, iv);
  decipher.setAuthTag(authTag);
  
  const decryptedData = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);
  
  return decryptedData;
}

function generateRoomId(): string {
  return `room_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}