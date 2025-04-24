import { db } from '../db';
import { users, rooms, roomMembers } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { Room, PrivateRoom, RoomResult } from '../types';
import crypto from 'crypto';

/**
 * RoomService:
 * A service responsible for managing chat rooms, including creating,
 * joining, leaving, and retrieving rooms.
 * It provides methods to create public and private rooms,
 * join and leave rooms, and get user rooms.
 * It also handles room membership and encryption.
 */
export const roomService = {
    async getUserRooms(username: string): Promise<(Room | PrivateRoom)[]> {
        const user = await db.select().from(users).where(eq(users.username, username)).limit(1);

        if (!user.length) return [];

        const userRooms = await db
            .select({
                room: rooms,
                membership: roomMembers,
            })
            .from(roomMembers)
            .innerJoin(rooms, eq(roomMembers.roomId, rooms.id))
            .where(eq(roomMembers.userId, user[0].id));

        const publicRooms = await db.select().from(rooms).where(eq(rooms.isPrivate, false));

        // root map for the both public and private
        const roomMap = new Map();

        userRooms.forEach(({ room }) => {
            roomMap.set(room.id, room);
        });

        publicRooms.forEach((room) => {
            if (!roomMap.has(room.id)) {
                roomMap.set(room.id, room);
            }
        });

        return Array.from(roomMap.values()).map((room) => {
            if (room.isPrivate) {
                return {
                    id: room.id,
                    name: room.name,
                    isPrivate: true as const,
                    isEncrypted: room.isEncrypted,
                    createdAt: room.createdAt.getTime(),
                    members: [],
                    encryptionKey: room.encryptionKey,
                    creator: room.createdBy,
                } as PrivateRoom;
            }

            return {
                id: room.id,
                name: room.name,
                isPrivate: false as const,
                isEncrypted: room.isEncrypted,
                createdAt: room.createdAt.getTime(),
                members: [],
            } as Room;
        });
    },

    /**
     * Create a public room.
     */
    async createPublicRoom(name: string, creator: string): Promise<RoomResult> {
        const user = await db.select().from(users).where(eq(users.username, creator)).limit(1);

        if (!user.length) {
            return { success: false, error: 'User not found' };
        }

        try {
            const [room] = await db
                .insert(rooms)
                .values({
                    name,
                    isPrivate: false,
                    createdBy: user[0].id,
                })
                .returning();

            await db.insert(roomMembers).values({
                roomId: room.id,
                userId: user[0].id,
                role: 'admin',
            });

            return {
                success: true,
                room: {
                    id: room.id,
                    name: room.name,
                    isPrivate: false as const,
                    isEncrypted: false,
                    createdAt: room.createdAt.getTime(),
                    members: [creator],
                } as Room,
            };
        } catch (error) {
            console.error('Create public room error:', error);
            return { success: false, error: 'Failed to create room' };
        }
    },

    /**
     * Create a private room.
     */
    async createPrivateRoom(name: string, creator: string, isEncrypted: boolean = false): Promise<RoomResult> {
        const user = await db.select().from(users).where(eq(users.username, creator)).limit(1);

        if (!user.length) {
            return { success: false, error: 'User not found' };
        }

        try {
            const encryptionKey = isEncrypted ? crypto.randomBytes(32).toString('hex') : null;

            const [room] = await db
                .insert(rooms)
                .values({
                    name,
                    isPrivate: true,
                    isEncrypted,
                    encryptionKey,
                    createdBy: user[0].id,
                })
                .returning();

            await db.insert(roomMembers).values({
                roomId: room.id,
                userId: user[0].id,
                role: 'admin',
            });
            return {
                success: true,
                room: {
                    id: room.id,
                    name: room.name,
                    isPrivate: false as const,
                    isEncrypted: false,
                    createdAt: room.createdAt.getTime(),
                    members: [creator],
                } as Room,
            };
        } catch (error) {
            console.error('Create private room error:', error);
            return { success: false, error: 'Failed to create room' };
        }
    },

    /**
     * Join a room.
     */
    async joinRoom(roomId: string, username: string): Promise<RoomResult> {
        const user = await db.select().from(users).where(eq(users.username, username)).limit(1);

        if (!user.length) {
            return { success: false, error: 'User not found' };
        }

        const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);

        if (!room) {
            return { success: false, error: 'Room not found' };
        }

        // we check if the user is already a member of the room
        const [existingMembership] = await db
            .select()
            .from(roomMembers)
            .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, user[0].id)))
            .limit(1);

        if (existingMembership) {
            return {
                success: true,
                room: room.isPrivate
                    ? {
                          id: room.id,
                          name: room.name,
                          isPrivate: true as const,
                          createdAt: room.createdAt.getTime(),
                          members: await roomService.getRoomMembers(roomId),
                          isEncrypted: room.isEncrypted,
                          encryptionKey: room.encryptionKey!,
                          creator: room.createdBy,
                      }
                    : ({
                          id: room.id,
                          name: room.name,
                          isPrivate: false as const,
                          createdAt: room.createdAt.getTime(),
                          members: await roomService.getRoomMembers(roomId),
                          isEncrypted: room.isEncrypted,
                      } as Room),
            };
        }

        await db.insert(roomMembers).values({
            roomId: room.id,
            userId: user[0].id,
            role: 'member',
        });

        const baseRoom = {
            id: room.id,
            name: room.name,
            isPrivate: room.isPrivate,
            createdAt: room.createdAt.getTime(),
            // here i need to check whether to fetch the all members or not
            members: [],
            isEncrypted: room.isEncrypted,
        };

        return {
            success: true,
            room: room.isPrivate
                ? ({
                      ...baseRoom,
                      isPrivate: true as const,
                      isEncrypted: room.isEncrypted,
                      encryptionKey: room.encryptionKey!,
                      creator: room.createdBy,
                  } as PrivateRoom)
                : ({
                      ...baseRoom,
                      isPrivate: false as const,
                  } as Room),
        };
    },

    /**
     *  Leave a room.
     */
    async leaveRoom(roomId: string, username: string): Promise<{ success: boolean; error?: string }> {
        const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
        if (!user.length) {
            return { success: false, error: 'User not found' };
        }
        try {
            await db.delete(roomMembers).where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, user[0].id)));

            return { success: true };
        } catch (error) {
            console.error('Leave room error:', error);
            return { success: false, error: 'User is not a member of this room' };
        }
    },
    /**
     * Check if a user is in a room.
     */
    async isUserInRoom(roomId: string, username: string): Promise<boolean> {
        const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
        if (!user.length) {
            return false;
        }
        const [membership] = await db
            .select()
            .from(roomMembers)
            .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, user[0].id)))
            .limit(1);
        return !!membership;
    },
    /**
     * Get all members of a room.
     */
    async getRoomMembers(roomId: string): Promise<string[]> {
        const members = await db
            .select({ username: users.username })
            .from(roomMembers)
            .innerJoin(users, eq(roomMembers.userId, users.id))
            .where(eq(roomMembers.roomId, roomId));
        return members.map((m) => m.username);
    },
};
