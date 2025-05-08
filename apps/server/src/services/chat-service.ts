import { db } from '../db';
import { users, rooms, roomMembers, messages } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { ChatMessage } from '../types';

/**
 * ChatService:
 * A service responsible for managing chat messages and history.
 * It provides methods to add messages to history and retrieve message history.
 * It also checks if the user is a member of the room before allowing access to the message history.
 */
export const chatService = {
    async addMessageToHistory(message: ChatMessage): Promise<void> {
        const user = await db.select().from(users).where(eq(users.username, message.sender)).limit(1);

        if (!user.length) return;

        await db.insert(messages).values({
            id: message.id,
            roomId: message.roomId,
            senderId: user[0].id,
            content: message.content,
            isEncrypted: message.isEncrypted || false,
            timestamp: new Date(message.timestamp),
        });
    },

    /**
     * Retrieves the message history for a specific room.
     */
    async getMessageHistory(
        roomId: string,
        limit: number = 50,
        username: string,
    ): Promise<{
        success: boolean;
        messages?: ChatMessage[];
        isEncrypted?: boolean;
        encryptionKey?: string;
        error?: string;
    }> {
        const user = await db.select().from(users).where(eq(users.username, username)).limit(1);

        if (!user.length) {
            return { success: false, error: 'User not found' };
        }

        /**
         * we check if the user is a member of the room
         * before allowing access to the message history
         */
        const [membership] = await db
            .select()
            .from(roomMembers)
            .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, user[0].id)))
            .limit(1);

        if (!membership) {
            return { success: false, error: 'You are not a member of this room' };
        }

        const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);

        if (!room) {
            return { success: false, error: 'Room not found' };
        }

        const messageList = await db
            .select({
                message: messages,
                sender: users,
            })
            .from(messages)
            .innerJoin(users, eq(messages.senderId, users.id))
            .where(eq(messages.roomId, roomId))
            .orderBy(desc(messages.timestamp))
            .limit(limit);

        return {
            success: true,
            messages: messageList
                .map(({ message, sender }) => ({
                    id: message.id,
                    roomId: message.roomId,
                    sender: sender.username,
                    content: message.content,
                    timestamp: message.timestamp.getTime(),
                    isEncrypted: message.isEncrypted,
                }))
                .reverse(),
            isEncrypted: room.isEncrypted,
            // i added the nullish coalescing operator here (i need to be review this)
            encryptionKey: room.encryptionKey ?? undefined,
        };
    },

    /**
     * Gets the total number of messages in a room
     */
    async getRoomMessageCount(roomId: string): Promise<number> {
        try {
            const result = await db
                .select({ count: sql`count(*)` })
                .from(messages)
                .where(eq(messages.roomId, roomId));

            const count = result[0]?.count;

            return typeof count === 'number' ? count : 0;
        } catch (error) {
            console.error(`Error counting messages for room ${roomId}:`, error);
            return 0;
        }
    },
};
