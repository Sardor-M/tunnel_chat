import express from 'express';
import { getMessageHistory } from '../../controllers/room-controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/:roomId/history', authMiddleware, getMessageHistory);

export default router;
