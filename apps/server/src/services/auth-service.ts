import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { User } from '../types';
import crypto from 'crypto';

/**
 * AuthService:
 * A service which is responsible for user authentication and management.
 * It provides methods to create users, find users by email or ID,
 * and handle password hashing.
 */
export const authService = {
    async createUser(userData: { username: string; email: string; password?: string }): Promise<User> {
        const [newUser] = await db
            .insert(users)
            .values({
                username: userData.username,
                email: userData.email,
                passwordHash: userData.password
                    ? crypto.createHash('sha256').update(userData.password).digest('hex')
                    : null,
            })
            .returning();

        return {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt,
        };
    },

    async findByEmail(email: string): Promise<User | null> {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        return user
            ? {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  createdAt: user.createdAt,
              }
            : null;
    },

    async findByUserId(userId: string): Promise<User | null> {
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        return user
            ? {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  createdAt: user.createdAt,
              }
            : null;
    },
};
