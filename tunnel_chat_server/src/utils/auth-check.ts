import { Request, Response, NextFunction } from 'express';

/**
 * Check if the user is authenticated
 * This middleware checks if the user is authenticated by verifying
 * the presence of a username in the request.
 */
export const checkAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const username = req.user?.username;

    if (!username) {
        res.status(401).json({ message: 'Authentication is required, please login' });
        return;
    }

    next();
};
