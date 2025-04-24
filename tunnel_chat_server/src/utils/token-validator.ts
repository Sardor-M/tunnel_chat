import redis from '../config/redis';

type TokenValidationResult = {
    valid: boolean;
    username?: string;
    email?: string;
    error?: string;
};

/**
 * Validate an access token:
 * This checks if the token exists in Redis and has not expired
 */
export async function validateToken(token: string): Promise<TokenValidationResult> {
    try {
        const tokenData = await redis.get(`tokens:${token}`);

        if (!tokenData) {
            return {
                valid: false,
                error: 'Token not found',
            };
        }

        const parsed = JSON.parse(tokenData);

        if (parsed.accessTokenExpiresAt < Date.now()) {
            return {
                valid: false,
                error: 'Token expired',
            };
        }
        return {
            valid: true,
            username: parsed.username,
            email: parsed.email,
        };
    } catch (error) {
        console.error('Token validation error:', error);
        return {
            valid: false,
            error: 'Failed to validate token',
        };
    }
}
