import { RawData, WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import { validateToken } from '../utils/token-validator';
import { roomService } from '../services/room-service';
import { chatService } from '../services/chat-service';
import { randomUUID } from 'crypto';

type WebSocketClient = WebSocket & {
    isAlive: boolean;
    username?: string;
    lastActive: number;
    rooms: string[];
};

/**
 * Store connected clients
 */
export const connectedClients: Record<string, WebSocketClient> = {};

/**
 * WebSocket Server:
 * Responsible for handling connections, messages, and broadcasting
 */
export function setupWebSocket(server: http.Server): WebSocketServer {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (socket: WebSocket) => {
        console.log('New client connected to Tunnel Chat');

        const wsClient = socket as WebSocketClient;
        wsClient.isAlive = true;
        wsClient.lastActive = Date.now();
        wsClient.rooms = [];

        // incoming messages handling
        socket.on('message', (rawData: RawData) => {
            try {
                const data = JSON.parse(rawData.toString());
                console.log(`Received message type: ${data.type}`);

                switch (data.type) {
                    case 'AUTH':
                        handleAuthentication(wsClient, data);
                        break;
                    case 'SET_USERNAME':
                        handleSetUsername(wsClient, data);
                        break;

                    case 'JOIN_ROOM':
                        handleJoinRoom(wsClient, data);
                        break;

                    case 'LEAVE_ROOM':
                        handleLeaveRoom(wsClient, data);
                        break;

                    case 'CHAT':
                        handleChatMessage(wsClient, data);
                        break;

                    case 'FILE_TRANSFER':
                        handleFileTransfer(wsClient, data);
                        break;

                    default:
                        console.log(`Unknown message type: ${data.type}`);
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        });

        // disconnection handling
        socket.on('close', () => {
            console.log('Client disconnected from Tunnel Chat');

            if (wsClient.username) {
                // remove from tracked rooms
                wsClient.rooms.forEach((roomId) => {
                    roomService.leaveRoom(roomId, wsClient.username!);
                    broadcastToRoom(roomId, 'system', `${wsClient.username} has left the chat`);
                });

                // remove from connected clients
                delete connectedClients[wsClient.username];
            }
        });
    });

    // ping-pong mechanism to keep connections alive
    const interval = setInterval(() => {
        wss.clients.forEach((client) => {
            const wsClient = client as WebSocketClient;
            if (wsClient.isAlive === false) {
                console.log(`Terminating inactive client ${wsClient.username || 'unknown'}`);
                return wsClient.terminate();
            }

            wsClient.isAlive = false;
            wsClient.ping();
        });
    }, 60000); // 1 minute

    wss.on('close', () => {
        clearInterval(interval);
    });

    // periodically check for inactive clients
    setInterval(
        () => {
            const now = Date.now();
            const inactiveThreshold = 30 * 60 * 1000;

            for (const username in connectedClients) {
                const client = connectedClients[username];
                if (now - client.lastActive > inactiveThreshold) {
                    console.log(`Removing inactive client: ${username}`);

                    if (client.readyState === WebSocket.OPEN) {
                        client.close();
                    }
                    // remove from tracked rooms
                    delete connectedClients[username];
                }
            }
            // run every 10 minutes
        },
        10 * 60 * 1000,
    );

    return wss;
}

/**
 * Handle authentication via token:
 * This function validates the token and sets the username for the client.
 */
async function handleAuthentication(ws: WebSocketClient, data: any) {
    const { token } = data;

    if (!token) {
        sendErrorToClient(ws, 'Token is required');
        return;
    }

    console.log(`Authenticating client with token`);
    const result = await validateToken(token);

    if (result.valid && result.username) {
        ws.username = result.username;
        ws.lastActive = Date.now();
        connectedClients[result.username] = ws;

        ws.send(
            JSON.stringify({
                type: 'AUTH_RESPONSE',
                success: true,
                username: result.username,
            }),
        );

        console.log(`Client authenticated as: ${result.username}`);
    } else {
        sendErrorToClient(ws, result.error || 'Invalid token');
    }
}

function handleSetUsername(ws: WebSocketClient, data: any) {
    const { username } = data;

    if (!username) {
        sendErrorToClient(ws, 'Username is required');
        return;
    }

    console.log(`Setting username for client: ${username}`);

    ws.username = username;
    ws.lastActive = Date.now();

    if (!connectedClients[username]) {
        connectedClients[username] = ws;
    }

    ws.send(
        JSON.stringify({
            type: 'USERNAME_SET',
            username,
            success: true,
        }),
    );
}

/**
 * Handle joining a room:
 * This function allows a user to join a room and notifies other members.
 * It also updates the client's last active time.
 */
async function handleJoinRoom(ws: WebSocketClient, data: any) {
    if (!ws.username) {
        sendErrorToClient(ws, 'Authentication required');
        return;
    }

    const { roomId } = data;
    if (!roomId) {
        sendErrorToClient(ws, 'Room ID is required');
        return;
    }

    console.log(`User ${ws.username} joining room: ${roomId}`);
    const result = await roomService.joinRoom(roomId, ws.username);

    if (!result.success) {
        sendErrorToClient(ws, result.error || 'Failed to join room');
        return;
    }

    // add room to client's rooms
    if (!ws.rooms.includes(roomId)) {
        ws.rooms.push(roomId);
    }
    ws.lastActive = Date.now();

    // get the room count for accurate active user dat
    const members = await roomService.getRoomMembers(roomId);
    const activeUsers = members ? members.length : 1;

    // get message count from chat service
    const messageCount = await chatService.getRoomMessageCount(roomId);

    // now we send more detailed data
    ws.send(
        JSON.stringify({
            type: 'ROOM_JOINED',
            roomId,
            roomName: result.room?.name,
            room: result.room,
            encryptionKey: result.encryptionKey,
            activeUsers,
            messageCount,
            isPrivate: result.room?.isPrivate,
            isEncrypted: result.room?.isEncrypted || false,
        }),
    );
    notifyRoomMembersOfJoin(roomId, ws.username, activeUsers);

    console.log(`User ${ws.username} successfully joined room: ${roomId}`);
}

async function notifyRoomMembersOfJoin(roomId: string, username: string, activeUsers: number) {
    const members = await roomService.getRoomMembers(roomId);

    if (!members) {
        return;
    }

    members.forEach((memberUsername) => {
        if (memberUsername !== username) {
            // Don't notify the user who joined
            const client = connectedClients[memberUsername];
            if (client && client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify({
                        type: 'USER_JOINED',
                        roomId,
                        username,
                        activeUsers,
                    }),
                );
            }
        }
    });

    // then we send a system message to all members
    broadcastToRoom(roomId, 'system', `${username} joined the room`);
}

/**
 * Handle leaving a room:
 * This function allows a user to leave a room and notifies other members.
 * It also updates the client's last active time.
 */
async function handleLeaveRoom(ws: WebSocketClient, data: any) {
    if (!ws.username) {
        sendErrorToClient(ws, 'Authentication required');
        return;
    }

    const { roomId } = data;
    if (!roomId) {
        sendErrorToClient(ws, 'Room ID is required');
        return;
    }

    console.log(`User ${ws.username} leaving room: ${roomId}`);
    const result = await roomService.leaveRoom(roomId, ws.username);

    if (!result.success) {
        sendErrorToClient(ws, result.error || 'Failed to leave room');
        return;
    }
    // remove room from client's rooms
    ws.rooms = ws.rooms.filter((r) => r !== roomId);
    ws.lastActive = Date.now();
    ws.send(
        JSON.stringify({
            type: 'ROOM_LEFT',
            roomId,
        }),
    );
    broadcastToRoom(roomId, 'system', `${ws.username} left the room`);
    console.log(`User ${ws.username} successfully left room: ${roomId}`);
}

/**
 * Handle chat messages:
 * This function processes incoming chat messages, validates the sender,
 * and broadcasts the message to other members in the room.
 */
function handleChatMessage(ws: WebSocketClient, data: any) {
    if (!ws.username) {
        sendErrorToClient(ws, 'Authentication required');
        return;
    }

    const { roomId, message, isEncrypted } = data;

    if (!roomId || !message) {
        sendErrorToClient(ws, 'Room ID and message are required');
        return;
    }

    if (!roomService.isUserInRoom(roomId, ws.username)) {
        sendErrorToClient(ws, 'You are not a member of this room');
        return;
    }

    console.log(`Message from ${ws.username} in room ${roomId}`);
    ws.lastActive = Date.now();

    const messageId = randomUUID();

    const chatMessage = {
        id: messageId,
        roomId,
        sender: ws.username,
        content: message,
        timestamp: Date.now(),
        isEncrypted: isEncrypted || false,
    };

    chatService
        .addMessageToHistory(chatMessage)
        .then(() => {
            if (ws.username) {
                broadcastToRoom(roomId, ws.username, message, isEncrypted);
            }
        })
        .catch((error) => {
            console.error('Error saving message:', error);
            sendErrorToClient(ws, 'Failed to save message');
        });

    // sending a confirmation to the sender
    ws.send(
        JSON.stringify({
            type: 'CHAT',
            id: messageId,
            roomId,
            sender: ws.username,
            message: message,
            timestamp: Date.now(),
            isEncrypted: isEncrypted || false,
        }),
    );
}

/**
 * Handle file transfer notifications:
 * This handles the file transfer process, including validation and broadcasting
 */
async function handleFileTransfer(ws: WebSocketClient, data: any) {
    if (!ws.username) {
        sendErrorToClient(ws, 'Authentication required');
        return;
    }

    const { roomId, fileInfo } = data;

    if (!roomId || !fileInfo) {
        sendErrorToClient(ws, 'Room ID and file info are required');
        return;
    }

    if (!roomService.isUserInRoom(roomId, ws.username)) {
        sendErrorToClient(ws, 'You are not a member of this room');
        return;
    }

    console.log(`File shared by ${ws.username} in room ${roomId}: ${fileInfo.name}`);
    ws.lastActive = Date.now();

    const members = await roomService.getRoomMembers(roomId);

    if (!members) {
        return;
    }

    members.forEach((member) => {
        const client = connectedClients[member];
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    type: 'FILE_SHARED',
                    roomId,
                    username: ws.username,
                    fileInfo: {
                        ...fileInfo,
                        sharedAt: Date.now(),
                    },
                }),
            );
        }
    });
}

/**
 * Broadcast a message to all users in a room:
 * This function sends a message to all connected clients in the specified room.
 * It checks if the client is connected and sends the message.
 */
async function broadcastToRoom(
    roomId: string,
    sender: string,
    message: string,
    isEncrypted: boolean = false,
): Promise<void> {
    const members = await roomService.getRoomMembers(roomId);

    if (!members) {
        return;
    }

    const messageId = randomUUID();

    members.forEach((username) => {
        // we skip sending to the sender as they will get their own copy
        if (username === sender) return;

        const client = connectedClients[username];
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    type: 'CHAT',
                    id: messageId,
                    roomId,
                    sender,
                    message,
                    timestamp: Date.now(),
                    isEncrypted,
                }),
            );
        }
    });
}

/**
 * Send an error message to a client:
 * This function sends an error message to the client in case of any issues.
 */
function sendErrorToClient(ws: WebSocketClient, error: string) {
    console.log(`Sending error to client: ${error}`);

    ws.send(
        JSON.stringify({
            type: 'ERROR',
            error,
        }),
    );
}
