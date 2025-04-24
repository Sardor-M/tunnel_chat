import { pgTable, text, timestamp, boolean, integer, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastActive: timestamp('last_active').defaultNow().notNull(),
});

export const rooms = pgTable('rooms', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    isPrivate: boolean('is_private').default(false).notNull(),
    isEncrypted: boolean('is_encrypted').default(false).notNull(),
    encryptionKey: text('encryption_key'),
    createdBy: uuid('created_by')
        .references(() => users.id)
        .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const roomMembers = pgTable('room_members', {
    roomId: uuid('room_id')
        .references(() => rooms.id)
        .notNull(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    role: text('role').default('member').notNull(), // admin, member
});

export const messages = pgTable('messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    roomId: uuid('room_id')
        .references(() => rooms.id)
        .notNull(),
    senderId: uuid('sender_id')
        .references(() => users.id)
        .notNull(),
    content: text('content').notNull(),
    isEncrypted: boolean('is_encrypted').default(false).notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const files = pgTable('files', {
    id: uuid('id').primaryKey().defaultRandom(),
    fileId: text('file_id').notNull().unique(),
    originalName: text('original_name').notNull(),
    filename: text('filename').notNull(),
    size: integer('size').notNull(),
    mimeType: text('mime_type').notNull(),
    uploaderId: uuid('uploader_id')
        .references(() => users.id)
        .notNull(),
    roomId: uuid('room_id').references(() => rooms.id),
    isEncrypted: boolean('is_encrypted').default(false).notNull(),
    checksum: text('checksum').notNull(),
    downloadCount: integer('download_count').default(0).notNull(),
    uploadTime: timestamp('upload_time').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    ownedRooms: many(rooms),
    messages: many(messages),
    files: many(files),
    roomMemberships: many(roomMembers),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
    creator: one(users, {
        fields: [rooms.createdBy],
        references: [users.id],
    }),
    messages: many(messages),
    members: many(roomMembers),
    files: many(files),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    room: one(rooms, {
        fields: [messages.roomId],
        references: [rooms.id],
    }),
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
    }),
}));

export const filesRelations = relations(files, ({ one }) => ({
    uploader: one(users, {
        fields: [files.uploaderId],
        references: [users.id],
    }),
    room: one(rooms, {
        fields: [files.roomId],
        references: [rooms.id],
    }),
}));
