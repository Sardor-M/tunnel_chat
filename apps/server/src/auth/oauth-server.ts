import OAuth2Server from 'oauth2-server';
import model from '../models/oauth-model';

const oauth = new OAuth2Server({
    model: model as OAuth2Server.PasswordModel & OAuth2Server.RefreshTokenModel,
    accessTokenLifetime: 60 * 60, // 1 hour
    refreshTokenLifetime: 60 * 60 * 24 * 14, // 2 weeks
    allowBearerTokensInQueryString: true,
    allowExtendedTokenAttributes: true,
});

export default oauth;
