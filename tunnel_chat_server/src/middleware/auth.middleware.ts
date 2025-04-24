import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../utils/token-validator';

declare global {
    namespace Express {
        interface Request {
            user?: {
                username: string;
                email?: string;
            };
        }
    }
}

/**
 * Authentication Middleware:
 * Validates access tokens and attaches user information to requests
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // we get the auth header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const result = await validateToken(token);

        if (!result.valid || !result.username) {
            res.status(401).json({ message: result.error || 'Invalid token' });
            return;
        }

        // we attache the user information to request
        req.user = {
            username: result.username,
            email: result.email,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
