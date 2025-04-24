import redis from '../config/redis';
import { authService } from '../services/auth-service';
import OAuth2Server from 'oauth2-server';
import { OAuthToken, OAuthUser } from '../types/auth';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// We get OAuth client configuration from env variables
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID || 'tunnel-chat-client';
const OAUTH_REDIRECT_URIS = (process.env.OAUTH_REDIRECT_URIS || 'http://localhost:5173/callback').split(',');

type StoredTokenData = {
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken?: string;
    refreshTokenExpiresAt?: number;
    scope?: string | string[];
    clientId: string;
    userId: string;
    username?: string;
    email?: string;
};

/**
 * we initialize the OAuth client in redis
 * this is a one-time setup step, so we only run this once
 */
// (async () => {
//     try {
//         await redis.hset(`clients:${OAUTH_CLIENT_ID}`, {
//             id: OAUTH_CLIENT_ID,
//             redirectUris: JSON.stringify(OAUTH_REDIRECT_URIS),
//             grants: JSON.stringify(['refresh_token']), // Only refresh token needed for Google auth
//         });
//         console.log(`OAuth client initialized: ${OAUTH_CLIENT_ID}`);
//     } catch (error) {
//         console.error('Failed to initialize OAuth client:', error);
//     }
// })();

type GoogleUserInfo = {
    email: string;
    sub: string;
    name?: string;
};

type CompleteModel = OAuth2Server.RefreshTokenModel &
    OAuth2Server.PasswordModel &
    OAuth2Server.AuthorizationCodeModel &
    OAuth2Server.ExtensionModel;

async function verifyGoogleToken(accessToken: string): Promise<{ email: string; name: string; id?: string } | false> {
    console.log(`Verifying Google token...`);
    try {
        const response = await axios.get<GoogleUserInfo>('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const userInfo = response.data;
        if (userInfo && userInfo.email && userInfo.sub) {
            console.log('Google authentication successful for:', userInfo.email);
            return {
                id: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name || userInfo.email.split('@')[0],
            };
        } else {
            console.warn('Invalid Google token response:', userInfo);
            return false;
        }
    } catch (error) {
        console.error('Google token verification failed:', error);
        return false;
    }
}

/**
 * Authenticating user with Google token
 */
export async function authenticateWithGoogle(token: string): Promise<OAuthToken | false> {
    console.log('Processing Google authentication');
    const googleUser = await verifyGoogleToken(token);

    if (!googleUser) {
        console.error('Google token verification failed');
        return false;
    }

    try {
        const email = googleUser.email;
        const username = googleUser.name;

        let user = await authService.findByEmail(email);
        if (!user) {
            console.log(`Creating new user for: ${email}`);
            user = await authService.createUser({ username, email });
            if (!user) {
                console.error('User creation failed');
                return false;
            }
        }

        const accessToken = crypto.randomBytes(32).toString('hex');
        const refreshToken = crypto.randomBytes(32).toString('hex');
        const accessTokenExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
        const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 days

        // save the tokens to Redis
        const tokenData: StoredTokenData = {
            accessToken,
            accessTokenExpiresAt: accessTokenExpiresAt.getTime(),
            refreshToken,
            refreshTokenExpiresAt: refreshTokenExpiresAt.getTime(),
            scope: 'profile chat',
            userId: user.id,
            username: user.username,
            email: user.email,
            clientId: OAUTH_CLIENT_ID,
        };

        await redis.set(`tokens:${accessToken}`, JSON.stringify(tokenData), 'EX', 3600);
        await redis.set(`refresh:${refreshToken}`, JSON.stringify(tokenData), 'EX', 30 * 24 * 3600);

        console.log(`Tokens generated for user: ${user.username}`);

        // we return OAuth token
        return {
            accessToken,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt,
            scope: 'profile chat',
            client: {
                id: OAUTH_CLIENT_ID,
                grants: ['refresh_token'],
                redirectUris: OAUTH_REDIRECT_URIS,
            },
            user: { id: user.id, username: user.username, email: user.email },
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
}

/**
 * OAuth2 Server Model Implementation:
 * This model is used to handle OAuth2 token storage and retrieval
 * using Redis for storing tokens and client information.
 */
const model: CompleteModel = {
    getAuthorizationCode: async () => {
        // as of now we do not have authorization code flow
        return false;
    },
    saveAuthorizationCode: async () => {
        // as of now we do not have authorization code flow
        return false;
    },
    revokeAuthorizationCode: async () => {
        // as of now we do not have authorization code flow
        return false;
    },

    /**
     * Get client information from Redis
     */
    getClient: async (clientId, clientSecret) => {
        console.log(`Getting client: ${clientId}`);
        const clientData = await redis.hgetall(`clients:${clientId}`);

        if (!clientData || Object.keys(clientData).length === 0) return false;

        try {
            const redirectUris = JSON.parse(clientData.redirectUris || '[]');
            const grants = JSON.parse(clientData.grants || '[]');

            return {
                id: clientData.id,
                redirectUris,
                grants,
            };
        } catch (error) {
            console.error(`Failed to parse client data for ${clientId}`, error);
            return false;
        }
    },

    getUser: async () => {
        // this is used for password grant but as of now we do not have password grant flow
        return false;
    },

    saveToken: async (token, client, user) => {
        console.log(`Saving token for user: ${user.id}`);

        const tokenData: StoredTokenData = {
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt?.getTime() ?? Date.now() + 3600000,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt?.getTime(),
            scope: token.scope,
            clientId: client.id,
            userId: user.id,
            username: user.username,
            email: user.email,
        };

        const accessTtl = Math.floor(
            (token.accessTokenExpiresAt?.getTime() ?? Date.now() + 3600000 - Date.now()) / 1000,
        );

        // we save access token
        await redis.set(
            `tokens:${token.accessToken}`,
            JSON.stringify(tokenData),
            'EX',
            accessTtl > 0 ? accessTtl : 3600,
        );

        // we also save refresh token if it is a present
        if (token.refreshToken && token.refreshTokenExpiresAt) {
            const refreshTtl = Math.floor((token.refreshTokenExpiresAt.getTime() - Date.now()) / 1000);
            await redis.set(
                `refresh:${token.refreshToken}`,
                JSON.stringify(tokenData),
                'EX',
                refreshTtl > 0 ? refreshTtl : 30 * 24 * 3600,
            );
        }

        return {
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            scope: token.scope,
            client: {
                id: client.id,
                redirectUris: client.redirectUris || [],
                grants: client.grants || [],
            },
            user: {
                id: user.id,
                username: user.username || '',
            },
        };
    },

    getAccessToken: async (accessToken) => {
        console.log(`Getting access token: ${accessToken.substring(0, 5)}...`);

        const tokenData = await redis.get(`tokens:${accessToken}`);
        if (!tokenData) return false;

        const parsed = JSON.parse(tokenData);
        const client = await model.getClient(parsed.clientId, '');

        if (!client) return false;

        return {
            accessToken: parsed.accessToken,
            accessTokenExpiresAt: new Date(parsed.accessTokenExpiresAt),
            refreshToken: parsed.refreshToken,
            refreshTokenExpiresAt: parsed.refreshTokenExpiresAt ? new Date(parsed.refreshTokenExpiresAt) : undefined,
            scope: parsed.scope,
            client,
            user: {
                id: parsed.userId,
                username: parsed.username || '',
                email: parsed.email,
            },
        };
    },

    getRefreshToken: async (refreshToken) => {
        console.log(`Getting refresh token: ${refreshToken.substring(0, 5)}...`);

        const tokenData = await redis.get(`refresh:${refreshToken}`);
        if (!tokenData) return false;

        const parsed = JSON.parse(tokenData);
        if (!parsed.refreshToken) return false;

        const client = await model.getClient(parsed.clientId, '');
        if (!client) return false;

        return {
            refreshToken: parsed.refreshToken,
            refreshTokenExpiresAt: new Date(parsed.refreshTokenExpiresAt),
            scope: parsed.scope,
            client,
            user: {
                id: parsed.userId,
                username: parsed.username || '',
                email: parsed.email,
            },
        };
    },

    revokeToken: async (token) => {
        console.log(`Revoking token: ${token.refreshToken?.substring(0, 5) ?? 'unknown'}...`);
        if (!token.refreshToken) return false;
        const result = await redis.del(`refresh:${token.refreshToken}`);
        return result === 1;
    },

    validateScope: async (user, client, scope) => {
        const validScopes = ['profile', 'chat'];
        if (!scope) return false;

        const requestedScopes = Array.isArray(scope) ? scope : scope.split(' ');

        const authorizedScopes = requestedScopes.filter((s) => validScopes.includes(s));
        return authorizedScopes.length > 0 ? authorizedScopes : false;
    },

    verifyScope: async (token, scope) => {
        if (!token.scope) return false;

        const tokenScopes = Array.isArray(token.scope) ? token.scope : token.scope.split(' ');

        const requiredScopes = Array.isArray(scope) ? scope : scope.split(' ');

        return requiredScopes.every((s) => tokenScopes.includes(s));
    },
};

export default model;
