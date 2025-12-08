// AWS Cognito Hosted UI Configuration for Google Sign-In
export const GOOGLE_CONFIG = {
  // Cognito Hosted UI Domain
  cognitoDomain: import.meta.env.VITE_COGNITO_DOMAIN || 'https://ap-southeast-146xjlc8vb.auth.ap-southeast-1.amazoncognito.com',
  
  // Cognito App Client ID
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '4cjjbi67t2nldlm7od9q24nf9u',
  
  
  // OAuth Callback URL
  redirectUri: import.meta.env.VITE_COGNITO_OAUTH_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
  
  // OAuth Response Type (authorization code flow)
  responseType: 'code',
  
  // OAuth Scope
  scope: 'email openid',
  
  // Identity Provider (Google)
  identityProvider: 'Google',
  
  // State parameter for security
  state: 'cognito_google_signin',
  
  // Token endpoint
  tokenEndpoint: function() {
    return `${this.cognitoDomain}/oauth2/token`;
  },
  
  // Authorize endpoint
  authorizeEndpoint: function() {
    return `${this.cognitoDomain}/oauth2/authorize`;
  },
};

// Environment check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

console.log('🔐 Cognito OAuth Config loaded:', {
  domain: GOOGLE_CONFIG.cognitoDomain,
  clientId: GOOGLE_CONFIG.clientId ? `${GOOGLE_CONFIG.clientId.substring(0, 20)}...` : 'Not set',
  environment: import.meta.env.MODE,
  redirectUri: GOOGLE_CONFIG.redirectUri,
  identityProvider: GOOGLE_CONFIG.identityProvider,
});