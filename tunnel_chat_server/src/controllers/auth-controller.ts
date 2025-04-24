import { Request, Response } from 'express';
import { authenticateWithGoogle } from '../models/oauth-model';
import { authService } from '../services/auth-service';

/**
 * Google OAuth Authentication
 * This function handles the authentication process with Google.
 */
export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'invalid_request',
                error_description: 'Google token is required',
            });
        }

        console.log('Processing Google authentication');
        const result = await authenticateWithGoogle(token);

        if (!result) {
            return res.status(401).json({
                error: 'invalid_token',
                error_description: 'Invalid or expired Google token',
            });
        }

        res.status(200).json({
            access_token: result.accessToken,
            refresh_token: result.refreshToken,
            token_type: 'bearer',
            expires_in: Math.floor((result.accessTokenExpiresAt.getTime() - Date.now()) / 1000),
            scope: result.scope,
        });
    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(500).json({
            error: 'server_error',
            error_description: 'Internal server error during authentication',
        });
    }
};

/**
 * Get current user profile data
 */
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        // User information is attached by the auth middleware
        if (!req.user || !req.user.email) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        // Get user from database with more details
        const user = await authService.findByEmail(req.user.email);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Return user profile with additional data
        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
