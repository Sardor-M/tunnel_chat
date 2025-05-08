import express from 'express';
import { googleAuth, getUserProfile } from '../../controllers/auth-controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/oauth/google', googleAuth as express.RequestHandler);
router.get('/user/profile', authMiddleware, getUserProfile);

export default router;
