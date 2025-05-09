import express from 'express';
import {
    getRoomsList,
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomMembers,
    getOnlineUsers,
} from '../../controllers/room-controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', authMiddleware, getRoomsList);
router.post('/', authMiddleware, createRoom);
router.post('/join', authMiddleware, joinRoom);
router.post('/leave', authMiddleware, leaveRoom);
router.get('/:roomId/members', authMiddleware, getRoomMembers);
router.get('/online-users', authMiddleware, getOnlineUsers);

export default router;
