import express, { Request, Response } from 'express';
import { googleAuth, getUserProfile } from '../controllers/auth-controller';
import {
    getRoomsList,
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomMembers,
    getMessageHistory,
    getOnlineUsers,
} from '../controllers/room-controller';
import { uploadFile, downloadFile, getFileMetadata, deleteFile } from '../controllers/file-controller';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth.middleware';

/**
 * Setting up the multer for file uploads
 * This will store files in the 'uploads' directory with a unique name
 */
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({ storage });

const router = express.Router();

router.get('/test', (req: Request, res: Response) => {
    console.log('Test route hit');
    res.json({ message: 'API routes working' });
});

router.post('/oauth/google', googleAuth as express.RequestHandler);
router.get('/user/profile', authMiddleware, getUserProfile);

router.get('/rooms', authMiddleware, getRoomsList);
router.post('/rooms', authMiddleware, createRoom);
router.post('/rooms/join', authMiddleware, joinRoom);
router.post('/rooms/leave', authMiddleware, leaveRoom);
router.get('/rooms/:roomId/members', authMiddleware, getRoomMembers);
router.get('/chat/:roomId/history', authMiddleware, getMessageHistory);
router.get('/users/online', getOnlineUsers);

router.post('/files/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/files/:fileId', authMiddleware, downloadFile);
router.get('/files/:fileId/metadata', authMiddleware, getFileMetadata);
router.delete('/files/:fileId', authMiddleware, deleteFile);

export default router;
