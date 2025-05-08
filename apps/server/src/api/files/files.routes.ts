import express from 'express';
import { uploadFile, downloadFile, getFileMetadata, deleteFile } from '../../controllers/file-controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';

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

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/:fileId', authMiddleware, downloadFile);
router.get('/:fileId/metadata', authMiddleware, getFileMetadata);
router.delete('/:fileId', authMiddleware, deleteFile);

export default router;
