import { WebSocket } from "ws";

export interface User {
  username: string;
  password: string;
  lastLogin?: Date;
  createdAt: Date;
}

export interface Room {
  id: string;
  name: string;
  members: string[];
  isPrivate: false;
  createdAt: number;
}

export interface PrivateRoom {
  id: string;
  name: string;
  members: string[];
  isPrivate: true;
  isEncrypted: boolean;
  encryptionKey: string;
  creator: string;
  createdAt: number;
}

// Message types
export interface ChatMessage {
  id: string;
  roomId: string;
  sender: string;
  content: string;
  timestamp: number;
  isEncrypted: boolean;
}


export interface FileMetadata {
  fileId: string;
  originalName: string;
  filename: string;
  size: number;
  mimeType: string;
  uploader: string;
  uploadTime: number;
  roomId?: string;
  isEncrypted: boolean;
  checksum: string;
  downloadCount: number;
  lastDownloaded?: number;
}


export interface WebSocketMessage {
  type: string;
  username?: string;
  roomId?: string;
  room?: string;
  message?: string;
  fileInfo?: any;
  isEncrypted?: boolean;
}


export interface AuthResult {
  success: boolean;
  token?: string;
  username?: string;
  error?: string;
}

export interface RoomResult {
  success: boolean;
  room?: Room | PrivateRoom;
  encryptionKey?: string;
  error?: string;
}

export interface FileResult {
  success: boolean;
  fileId?: string;
  metadata?: Omit<FileMetadata, "checksum">;
  error?: string;
}

export interface ClientInfo {
  socket: WebSocket;
  username: string;
  lastActive: number;
}
