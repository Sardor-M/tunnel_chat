import { db } from '../db';
import { users, roomMembers, files } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { FileResult } from '../types';
import crypto from 'crypto';

type FileMetadata = {
    fileId: string;
    originalName: string;
    filename: string;
    size: number;
    mimeType: string;
    uploader: string;
    uploadTime: number;
    roomId?: string;
    isEncrypted: boolean;
    downloadCount: number;
    checksum: string;
};

/**
 * FileService:
 * A service responsible for managing file uploads, downloads, and deletions.
 * It provides methods to upload files, download files, delete files,
 */
export const fileService = {
    async uploadFile(
        file: Express.Multer.File,
        uploader: string,
        roomId?: string,
        shouldEncrypt: boolean = false,
    ): Promise<FileResult> {
        const user = await db.select().from(users).where(eq(users.username, uploader)).limit(1);

        if (!user.length) {
            return { success: false, error: 'User not found' };
        }

        try {
            const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

            const [savedFile] = await db
                .insert(files)
                .values({
                    fileId,
                    originalName: file.originalname,
                    filename: file.filename,
                    size: file.size,
                    mimeType: file.mimetype,
                    uploaderId: user[0].id,
                    roomId,
                    isEncrypted: shouldEncrypt,
                    checksum,
                })
                .returning();

            return {
                success: true,
                fileId: savedFile.fileId,
                metadata: {
                    fileId: savedFile.fileId,
                    originalName: savedFile.originalName,
                    filename: savedFile.filename,
                    size: savedFile.size,
                    mimeType: savedFile.mimeType,
                    uploader,
                    uploadTime: savedFile.uploadTime.getTime(),
                    roomId: savedFile.roomId ?? '',
                    isEncrypted: savedFile.isEncrypted,
                    downloadCount: savedFile.downloadCount,
                },
            };
        } catch (error) {
            console.error('File upload error:', error);
            return { success: false, error: 'Failed to upload file' };
        }
    },

    /**
     * Download a file by its ID.
     */
    async downloadFile(
        fileId: string,
        username: string,
    ): Promise<{
        success: boolean;
        data?: Buffer;
        metadata?: FileMetadata;
        error?: string;
    }> {
        const file = await db.select().from(files).where(eq(files.fileId, fileId)).limit(1);

        if (!file.length) {
            return { success: false, error: 'File not found' };
        }

        const [fileData] = file;

        if (fileData.roomId) {
            const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
            if (!user.length) {
                return { success: false, error: 'User not found.' };
            }
            const membership = await db
                .select()
                .from(roomMembers)
                .where(and(eq(roomMembers.roomId, fileData.roomId), eq(roomMembers.userId, user[0].id)))
                .limit(1);
            if (!membership) {
                return { success: false, error: 'User is not a member of the room' };
            }
        }
        try {
            // In real-world case, i should retrieve the file from storage (Firebase Storage or AWS S3)
            // As of now, we just simulate the file retrieval
            // const fileContent = await getFileFromStorage(fileId);
            // Later, i will implement the file retrieval from storage (firebase storage)
            const fileContent = Buffer.from('sampleFile.txt');

            // we update download count
            await db
                .update(files)
                .set({ downloadCount: fileData.downloadCount + 1 })
                .where(eq(files.fileId, fileId));
            const uploader = await db.select().from(users).where(eq(users.id, fileData.uploaderId)).limit(1);
            return {
                success: true,
                data: fileContent,
                metadata: {
                    fileId: fileData.fileId,
                    originalName: fileData.originalName,
                    filename: fileData.filename,
                    size: fileData.size,
                    mimeType: fileData.mimeType,
                    uploader: uploader[0].username,
                    uploadTime: fileData.uploadTime.getTime(),
                    roomId: fileData.roomId ?? undefined,
                    isEncrypted: fileData.isEncrypted,
                    downloadCount: fileData.downloadCount,
                    checksum: fileData.checksum,
                },
            };
        } catch (error) {
            console.error('Error downloading file:', error);
            return { success: false, error: 'Failed to download file' };
        }
    },

    /**
     * Delete a file by its ID.
     */
    async deleteFile(fileId: string, username: string): Promise<{ success: boolean; error?: string }> {
        const file = await db.select().from(files).where(eq(files.fileId, fileId)).limit(1);

        if (!file.length) {
            return { success: false, error: 'File not found' };
        }
        const [fileData] = file;

        const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
        if (!user.length) {
            return { success: false, error: 'User not found.' };
        }
        if (fileData.uploaderId !== user[0].id) {
            return {
                success: false,
                error: 'You are not authorized to delete this file',
            };
        }

        try {
            // Once i implement the file storage, i will delete the file from the storage
            // await deleteFileFromStorage(fileId);
            // For now, we just simulate the file deletion
            await db.delete(files).where(eq(files.fileId, fileId));
            return { success: true };
        } catch (error) {
            console.error('Error deleting file:', error);
            return { success: false, error: 'Failed to delete file' };
        }
    },
    /**
     * Get file metadata by file ID.
     */
    async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
        const file = await db.select().from(files).where(eq(files.fileId, fileId)).limit(1);
        if (!file.length) {
            return null;
        }
        const uploader = await db.select().from(users).where(eq(users.id, file[0].uploaderId)).limit(1);
        return {
            fileId: file[0].fileId,
            originalName: file[0].originalName,
            filename: file[0].filename,
            size: file[0].size,
            mimeType: file[0].mimeType,
            uploader: uploader[0].username,
            uploadTime: file[0].uploadTime.getTime(),
            roomId: file[0].roomId ?? undefined,
            isEncrypted: file[0].isEncrypted,
            downloadCount: file[0].downloadCount,
            checksum: file[0].checksum,
        };
    },
};
