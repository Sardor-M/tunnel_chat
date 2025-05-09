export type RoomInfo = {
    id: string;
    name: string;
    activeUsers: number;
    messageCount: number;
    isPrivate: boolean;
    isEncrypted: boolean;
};

export type Message = {
    text: string;
    isMine: boolean;
    isSystem?: boolean;
    timestamp?: Date;
    sender?: string;
    rawMessage?: string;
};

export type MessageHandlerData = {
    type: 'ROOM_JOINED' | 'USER_JOINED' | 'USER_LEFT' | 'CHAT';
    roomId?: string;
    room?: Partial<RoomInfo>;
    roomName?: string;
    activeUsers?: number;
    sender?: string;
    message?: string;
    timestamp?: number;
    username?: string;
};

export type AuthHandlerData = {
    type: 'AUTH_RESPONSE' | 'USERNAME_SET';
    success: boolean;
};
