import { WebSocket } from 'ws';

export type User = {
    id: string;
    username: string;
    password?: string;
    lastLogin?: Date;
    email?: string;
    createdAt?: Date;
};

export type Room = {
    id: string;
    name: string;
    members: string[];
    isPrivate: false;
    createdAt: number;
};

export type PrivateRoom = {
    id: string;
    name: string;
    members: string[];
    isPrivate: true;
    isEncrypted: boolean;
    encryptionKey: string;
    creator: string;
    createdAt: number;
};

export type ChatMessage = {
    id: string;
    roomId: string;
    sender: string;
    content: string;
    timestamp: number;
    isEncrypted: boolean;
};

export type FileMetadata = {
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
};

export type WebSocketMessage = {
    type: string;
    username?: string;
    roomId?: string;
    room?: string;
    message?: string;
    fileInfo?: any;
    isEncrypted?: boolean;
};

export type AuthResult = {
    success: boolean;
    token?: string;
    username?: string;
    error?: string;
    user?: User;
};

export type RoomResult = {
    success: boolean;
    room?: Room | PrivateRoom;
    encryptionKey?: string;
    error?: string;
};

export type FileResult = {
    success: boolean;
    fileId?: string;
    metadata?: Omit<FileMetadata, 'checksum'>;
    error?: string;
};

export type ClientInfo = {
    socket: WebSocket;
    username: string;
    lastActive: number;
};
