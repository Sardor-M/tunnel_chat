import { auth } from '@/config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

type TokenResponse = {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    scope?: string;
};

type UserProfile = {
    username: string;
    email: string;
};

class AuthError extends Error {
    status?: number;
    data?: any;

    constructor(message: string, status?: number, data?: any) {
        super(message);
        this.name = 'AuthError';
        this.status = status;
        this.data = data;
    }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AUTH_ENDPOINTS = {
    GOOGLE_AUTH: `${API_BASE_URL}/api/oauth/google`,
    USER_PROFILE: `${API_BASE_URL}/api/user/profile`,
};

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    TOKEN_EXPIRY: 'tokenExpiry',
    USER_EMAIL: 'userEmail',
    USERNAME: 'username',
};

/**
 * Standard response handler for API requests
 */
async function handleResponse(response: Response): Promise<any> {
    if (response.ok) {
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            console.warn(`Received non-JSON response with status ${response.status}`);
            return await response.text();
        }
    } else {
        let errorData: { message: string; error_description?: string; error?: string } = {
            message: `Request failed with status ${response.status}`,
        };

        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                errorData = await response.json();
            } else {
                errorData.message = (await response.text()) || errorData.message;
            }
        } catch (e) {
            console.error('Failed to parse error response:', e);
        }

        const message =
            errorData?.error_description || errorData?.message || errorData?.error || `HTTP error ${response.status}`;

        throw new AuthError(message, response.status, errorData);
    }
}

/**
 * Authentication Service
 */
export const authService = {
    /**
     * Login with Google using Firebase
     */
    async loginWithGoogle(): Promise<TokenResponse> {
        try {
            console.log('Initiating Google Sign-In...');

            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            const result = await signInWithPopup(auth, provider);

            const idToken = await result.user.getIdToken();
            if (!idToken) {
                throw new Error('Could not get Firebase ID token');
            }

            console.log('Firebase authentication successful, exchanging token...');

            const response = await fetch(AUTH_ENDPOINTS.GOOGLE_AUTH, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: idToken }),
            });

            const tokenData: TokenResponse = await handleResponse(response);

            if (tokenData?.access_token) {
                this.saveTokens({
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    expires_in: tokenData.expires_in,
                });

                if (result.user.email) {
                    localStorage.setItem(STORAGE_KEYS.USER_EMAIL, result.user.email);
                }

                const username = result.user.displayName || result.user.email?.split('@')[0] || 'User';
                localStorage.setItem(STORAGE_KEYS.USERNAME, username);

                console.log('Authentication successful');
                return tokenData;
            } else {
                throw new AuthError('Invalid token data received from server', 500, tokenData);
            }
        } catch (error: any) {
            console.error('Google login failed:', error);

            if (error.code === 'auth/popup-closed-by-user') {
                throw new AuthError('Google Sign-In cancelled by user', 400);
            }

            if (error instanceof AuthError) {
                throw error;
            }

            throw new AuthError(`Google Sign-In failed: ${error.message || 'Unknown error'}`, 500, error);
        }
    },

    /**
     * Handle Google OAuth token exchange
     */
    async exchangeGoogleToken(accessToken: string): Promise<TokenResponse> {
        try {
            const response = await fetch(AUTH_ENDPOINTS.GOOGLE_AUTH, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: accessToken }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error_description || 'Google authentication failed');
            }

            const tokenData: TokenResponse = await handleResponse(response);

            if (tokenData?.access_token) {
                this.saveTokens(tokenData);
                return tokenData;
            } else {
                throw new AuthError('Invalid token data received from server', 500, tokenData);
            }
        } catch (error: any) {
            console.error('Error exchanging Google token:', error);
            throw error;
        }
    },

    /**
     * Save authentication tokens to local storage
     */
    saveTokens(tokenData: any): void {
        if (!tokenData.access_token) {
            console.error('Cannot save tokens: No access token provided');
            return;
        }

        console.log('Saving tokens...');
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenData.access_token);

        if (tokenData.refresh_token) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokenData.refresh_token);
        } else {
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }

        if (tokenData.expires_in && !isNaN(tokenData.expires_in)) {
            const expiryTime = Date.now() + tokenData.expires_in * 1000;
            localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
            console.log(`Token expiry set to: ${new Date(expiryTime).toLocaleString()}`);
        } else {
            localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
            console.warn("No valid 'expires_in' provided, token expiry not set.");
        }
    },

    /**
     * Get the current access token
     */
    getAccessToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    /**
     * Get the current refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    },

    /**
     * Get the token expiry timestamp
     */
    getTokenExpiry(): number | null {
        const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
        return expiry ? parseInt(expiry, 10) : null;
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn(): boolean {
        const accessToken = this.getAccessToken();
        if (!accessToken) {
            return false;
        }

        const expiryTime = this.getTokenExpiry();
        if (expiryTime) {
            return expiryTime > Date.now();
        }

        // if no expiry time is set, assume logged in if token exists
        return true;
    },

    /**
     * Refresh the access token
     */
    async refreshToken(): Promise<TokenResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            console.error('Cannot refresh: No refresh token available');
            throw new AuthError('Refresh token not found', 401);
        }

        console.log('Refreshing access token...');

        try {
            const response = await fetch(`${API_BASE_URL}/api/oauth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                }).toString(),
            });

            const tokenData: TokenResponse = await handleResponse(response);

            if (tokenData?.access_token) {
                this.saveTokens({
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    expires_in: tokenData.expires_in,
                });
                console.log('Token refreshed successfully');
                return tokenData;
            } else {
                throw new AuthError('Invalid token data received during refresh', 500, tokenData);
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    },

    /**
     * Ensure a valid access token is available
     * Will attempt to refresh if token is expired or close to expiry
     */
    async ensureValidToken(): Promise<string | null> {
        const accessToken = this.getAccessToken();
        const expiryTime = this.getTokenExpiry();

        // check if token is missing or nearing expiry with 5 minutes
        const nearingExpiryThreshold = 5 * 60 * 1000;
        const isNearingExpiry = expiryTime && expiryTime < Date.now() + nearingExpiryThreshold;

        if (!accessToken || isNearingExpiry) {
            console.log(`Token ${!accessToken ? 'missing' : 'nearing expiry'}. Attempting refresh...`);

            try {
                const refreshResult = await this.refreshToken();
                return refreshResult?.access_token || null;
            } catch (error) {
                console.error('Token refresh failed:', error);
                this.logout(); // Clear invalid tokens
                return null;
            }
        }

        return accessToken;
    },

    /**
     * Get the current user's profile from the server
     */
    async getUserProfile(): Promise<UserProfile> {
        const token = await this.ensureValidToken();
        if (!token) {
            throw new AuthError('Authentication required', 401);
        }

        const response = await fetch(AUTH_ENDPOINTS.USER_PROFILE, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    },

    /**
     * Get the current user's email from local storage
     */
    getUserEmail(): string | null {
        return localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
    },

    /**
     * Get the current username from local storage
     */
    getUsername(): string | null {
        return localStorage.getItem(STORAGE_KEYS.USERNAME);
    },

    /**
     * Log the user out
     */
    logout(): void {
        console.log('Logging out...');
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);

        auth.signOut().catch((error) => {
            console.error('Error signing out from Firebase:', error);
        });
    },
};

export default authService;
