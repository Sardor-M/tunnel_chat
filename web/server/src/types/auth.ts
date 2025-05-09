import OAuth2Server from 'oauth2-server';

export type OAuthClient = OAuth2Server.Client & {
    id: string;
    redirectUris: string[];
    grants: string[];
    secret?: string;
};

export type OAuthToken = OAuth2Server.Token & {
    accessToken: string;
    accessTokenExpiresAt: Date;
    refreshToken?: string;
    refreshTokenExpiresAt?: Date;
    scope?: string | string[];
    client: OAuthClient;
    user: OAuthUser;
};

export type OAuthUser = OAuth2Server.User & {
    id: string;
    username: string;
    email?: string;
};

export type OAuthAuthorizationCode = {
    authorizationCode: string;
    expiresAt: Date;
    redirectUri: string;
    scope?: string | string[];
    client: OAuthClient;
    user: { id: string; username: string; email?: string };
    codeChallenge?: string;
    codeChallengeMethod?: string;
};

export type OAuthRefreshToken = OAuth2Server.RefreshToken & {
    refreshToken: string;
    refreshTokenExpiresAt: Date;
    scope?: string | string[];
    client: OAuthClient;
    user: OAuthUser;
};

export type GoogleTokenInfo = {
    sub: string;
    email: string;
    name?: string;
    [key: string]: any;
};
