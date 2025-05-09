import express, { Request, Response } from 'express';
import authRoutes from './auth/auth.routes';
import roomRoutes from './rooms/rooms.routes';
import chatRoutes from './chat/chat.routes';
import fileRoutes from './files/files.routes';

const router = express.Router();

router.get('/test', (req: Request, res: Response) => {
    console.log('Test route hit');
    res.json({ message: 'API routes working' });
});

// we mount the feature routes
router.use('/', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/chat', chatRoutes);
router.use('/files', fileRoutes);

export default router;
