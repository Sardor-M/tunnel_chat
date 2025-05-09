import { Request, Response } from 'express';
import { chatService } from '../services/chat-service';
import { connectedClients } from '../socket/socket';
import { roomService } from '../services/room-service';
import { checkAuthenticated } from '../utils/auth-check';

/**
 * Get list of rooms for Curr User
 */
export const getRoomsList = [
    checkAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const username = req.user?.username;

            if (!username) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const rooms = await roomService.getUserRooms(username);
            res.status(200).json({ rooms });
        } catch (error) {
            console.error('Get rooms list error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];

/**
 * Create a new room
 */
export const createRoom = [
    checkAuthenticated,
    async (req: Request, res: Response) => {
        console.log('Create room called', req.body);
        try {
            const { roomName, isPrivate, isEncrypted } = req.body;
            const username = req.user!.username;

            if (!roomName) {
                res.status(400).json({ message: 'Room name is required' });
                return;
            }

            const result = await (isPrivate
                ? roomService.createPrivateRoom(roomName, username, isEncrypted)
                : roomService.createPublicRoom(roomName, username));

            if (result.success && result.room) {
                res.status(201).json({
                    roomId: result.room.id,
                    name: result.room.name,
                    isPrivate: result.room.isPrivate,
                    isEncrypted: result.room.isPrivate ? (result.room as any).isEncrypted : false,
                    encryptionKey: result.encryptionKey,
                });
            } else {
                res.status(400).json({ message: result.error || 'Failed to create room' });
            }
        } catch (error) {
            console.error('Create room error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];

/**
 * Join a room
 */
export const joinRoom = [
    checkAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { roomId } = req.body;
            const username = req.user!.username;

            if (!roomId) {
                res.status(400).json({ message: 'Room ID is required' });
                return;
            }

            const result = await roomService.joinRoom(roomId, username);

            if (result.success && result.room) {
                res.status(200).json({
                    roomId: result.room.id,
                    name: result.room.name,
                    isPrivate: result.room.isPrivate,
                    isEncrypted: result.room.isPrivate ? (result.room as any).isEncrypted : false,
                    encryptionKey: result.encryptionKey,
                });
            } else {
                res.status(400).json({ message: result.error || 'Failed to join room' });
            }
        } catch (error) {
            console.error('Join room error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];

/**
 * Leave a room
 */
export const leaveRoom = [
    checkAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { roomId } = req.body;
            const username = req.user!.username;

            if (!roomId) {
                res.status(400).json({ message: 'Room ID is required' });
                return;
            }

            // Now async
            const result = await roomService.leaveRoom(roomId, username);

            if (result.success) {
                res.status(200).json({ message: 'Successfully left room' });
            } else {
                res.status(400).json({ message: result.error || 'Failed to leave room' });
            }
        } catch (error) {
            console.error('Leave room error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];

/**
 * Get room members
 */
export const getRoomMembers = [
    checkAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { roomId } = req.params;
            const username = req.user!.username;

            const isInRoom = await roomService.isUserInRoom(roomId, username);
            if (!isInRoom) {
                res.status(403).json({ message: 'You are not a member of this room' });
                return;
            }

            const members = await roomService.getRoomMembers(roomId);

            if (members) {
                res.status(200).json({ members });
            } else {
                res.status(404).json({ message: 'Room not found' });
            }
        } catch (error) {
            console.error('Get room members error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];

/**
 * Get message history for a room
 */
export const getMessageHistory = [
    checkAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { roomId } = req.params;
            const username = req.user!.username;

            const result = await chatService.getMessageHistory(roomId, 50, username);

            if (result.success) {
                res.status(200).json({
                    messages: result.messages,
                    isEncrypted: result.isEncrypted,
                    encryptionKey: result.encryptionKey,
                });
            } else {
                res.status(400).json({ message: result.error || 'Failed to get message history' });
            }
        } catch (error) {
            console.error('Get message history error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];

/**
 * Get list of online users
 */
export const getOnlineUsers = (req: Request, res: Response) => {
    try {
        const onlineUsers = Object.keys(connectedClients).map((username) => ({
            username,
            lastActive: connectedClients[username].lastActive,
        }));

        res.status(200).json({
            onlineCount: onlineUsers.length,
            users: onlineUsers,
        });
    } catch (error) {
        console.error('Get online users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
