import { GOOGLE_CONFIG } from '../config/google';
import axios from 'axios';

/**
 * AWS Cognito OAuth Service for Google Sign-In
 * Uses Cognito Hosted UI with Google as Identity Provider
 */
class GoogleAuthService {
  constructor() {
    this.config = GOOGLE_CONFIG;
  }

  /**
   * Build Cognito Hosted UI authorization URL
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: this.config.responseType, // 'code'
      scope: this.config.scope,
      redirect_uri: this.config.redirectUri,
      identity_provider: this.config.identityProvider, // 'Google'
      state: this.config.state,
    });

    const authUrl = `${this.config.authorizeEndpoint()}?${params.toString()}`;
    console.log('🔗 Cognito OAuth URL:', authUrl);
    
    return authUrl;
  }

  /**
   * Redirect to Cognito Hosted UI for Google login
   */
  async signIn() {
    try {
      console.log('🚀 Redirecting to Cognito Hosted UI for Google login...');
      
      // Store state for validation on callback
      localStorage.setItem('oauth_state', this.config.state);
      
      // Redirect to Cognito Hosted UI
      const authUrl = this.getAuthorizationUrl();
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('❌ Error initiating Cognito OAuth:', error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for tokens
   * @param {string} code - Authorization code from callback
   * @returns {Promise<Object>} Token response { access_token, id_token, refresh_token, token_type, expires_in }
   */
  async exchangeCodeForTokens(code) {
    try {
      console.log('🔄 Exchanging authorization code for tokens...');

      // Build form data for token endpoint
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        code: code,
        redirect_uri: this.config.redirectUri,
      });

      // Use Basic Auth with client_id and client_secret
      const auth = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      
      const response = await axios.post(
        this.config.tokenEndpoint(),
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      console.log('✅ Token exchange successful');
      
      // Cognito returns: { access_token, id_token, refresh_token, token_type, expires_in }
      return response.data;
      
    } catch (error) {
      console.error('❌ Token exchange failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error_description || 'Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Validate state parameter from callback
   * @param {string} state - State from callback URL
   * @returns {boolean} True if state is valid
   */
  validateState(state) {
    const storedState = localStorage.getItem('oauth_state');
    const isValid = state === storedState;
    
    if (isValid) {
      localStorage.removeItem('oauth_state');
      console.log('✅ OAuth state validated');
    } else {
      console.error('❌ Invalid OAuth state');
    }
    
    return isValid;
  }

  /**
   * Decode JWT token (without verification - for display purposes only)
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Extract user info from id_token
   * @param {string} idToken - ID token from Cognito
   * @returns {Object} User information
   */
  getUserInfo(idToken) {
    const decoded = this.decodeToken(idToken);
    
    if (!decoded) {
      return null;
    }

    return {
      sub: decoded.sub, // User ID
      email: decoded.email,
      email_verified: decoded.email_verified,
      name: decoded.name || decoded.given_name || decoded.email,
      picture: decoded.picture,
      given_name: decoded.given_name,
      family_name: decoded.family_name,
      locale: decoded.locale,
      cognito_username: decoded['cognito:username'],
      identities: decoded.identities, // Provider info (Google)
    };
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshAccessToken(refreshToken) {
    try {
      console.log('🔄 Refreshing access token...');

      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        refresh_token: refreshToken,
      });

      const auth = btoa(`${this.config.clientId}:${this.config.clientSecret}`);

      const response = await axios.post(
        this.config.tokenEndpoint(),
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      console.log('✅ Token refresh successful');
      return response.data;
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Revoke tokens (logout)
   * @param {string} token - Access or refresh token to revoke
   * @returns {Promise<void>}
   */
  async revokeToken(token) {
    try {
      console.log('🔄 Revoking token...');

      const params = new URLSearchParams({
        token: token,
        client_id: this.config.clientId,
      });

      const auth = btoa(`${this.config.clientId}:${this.config.clientSecret}`);

      await axios.post(
        `${this.config.cognitoDomain}/oauth2/revoke`,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      console.log('✅ Token revoked successfully');
      
    } catch (error) {
      console.error('❌ Token revocation failed:', error.response?.data || error.message);
      // Don't throw error, just log it
    }
  }
}

// Create singleton instance
const googleAuthService = new GoogleAuthService();

// Export convenience functions
export const signInWithGoogle = () => googleAuthService.signIn();
export const exchangeCodeForTokens = (code) => googleAuthService.exchangeCodeForTokens(code);
export const validateOAuthState = (state) => googleAuthService.validateState(state);
export const decodeJWT = (token) => googleAuthService.decodeToken(token);
export const getUserInfoFromToken = (idToken) => googleAuthService.getUserInfo(idToken);
export const refreshToken = (refreshToken) => googleAuthService.refreshAccessToken(refreshToken);
export const revokeToken = (token) => googleAuthService.revokeToken(token);

export default googleAuthService;
