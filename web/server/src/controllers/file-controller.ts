import { Request, Response } from 'express';
import { fileService } from '../services/file-service';
import { checkAuthenticated } from '../utils/auth-check';

/**
 * Upload file
 */
export const uploadFile = [
    checkAuthenticated,
    async (req: Request, res: Response) => {
        try {
            if (!req.file || !req.user) {
                res.status(400).json({ message: 'File and authentication required' });
                return;
            }

            const { roomId, isEncrypted } = req.body;
            const username = req.user.username;

            if (!username) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const result = await fileService.uploadFile(req.file, username, roomId, isEncrypted === 'true');

            if (result.success) {
                res.status(200).json({
                    fileId: result.fileId,
                    metadata: result.metadata,
                });
            } else {
                res.status(400).json({ message: result.error || 'Failed to upload file' });
            }
        } catch (error) {
            console.error('File upload error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];

/**
 * Download a file
 */
export const downloadFile = [
    checkAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { fileId } = req.params;
            const username = req.user!.username;

            const result = await fileService.downloadFile(fileId, username);

            if (result.success && result.data) {
                // we set the appropriate headers
                res.setHeader('Content-Type', result.metadata?.mimeType || 'application/octet-stream');
                res.setHeader(
                    'Content-Disposition',
                    `attachment; filename="${result.metadata?.originalName || 'download'}"`,
                );

                // Send file data
                res.send(result.data);
            } else {
                res.status(400).json({ message: result.error || 'Failed to download file' });
            }
        } catch (error) {
            console.error('File download error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];

/**
 * Get file metadata
 */
export const getFileMetadata = [
    checkAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { fileId } = req.params;
            const metadata = await fileService.getFileMetadata(fileId);

            if (metadata) {
                // we remove the checksum from response
                const { checksum, ...publicMetadata } = metadata;

                res.status(200).json({ metadata: publicMetadata });
            } else {
                res.status(404).json({ message: 'File not found' });
            }
        } catch (error) {
            console.error('Get file metadata error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];

/**
 * Delete a file
 */
export const deleteFile = [
    checkAuthenticated,
    async (req: Request, res: Response) => {
        try {
            const { fileId } = req.params;
            const username = req.user!.username;

            const result = await fileService.deleteFile(fileId, username);

            if (result.success) {
                res.status(200).json({ message: 'File deleted successfully' });
            } else {
                res.status(400).json({ message: result.error || 'Failed to delete file' });
            }
        } catch (error) {
            console.error('File deletion error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
];
