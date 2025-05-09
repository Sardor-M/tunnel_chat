import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

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
 * Authenticate the user using JWT:
 * This middleware checks the presence of a JWT in the authorization header
 * and verifies it. If valid, it attaches the user information to the request.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ message: 'Authorization header missing' });
            return;
        }

        if (!authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Invalid authorization format' });
            return;
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) {
                res.status(401).json({ message: 'Invalid or expired token' });
                return;
            }

            req.user = {
                username: decoded.username,
            };

            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Validate the presence of a parameter in the request.
 */
export function validateParam(paramName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.params[paramName]) {
            res.status(400).json({ message: `${paramName} parameter is required` });
            return;
        }

        next();
    };
}
