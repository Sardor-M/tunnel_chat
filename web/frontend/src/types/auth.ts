export type TokenResponse = {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
};

export type RegisterResponse = {
    message: string;
    userId?: string;
};
