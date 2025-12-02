// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  // Google Client ID từ Google Cloud Console
  // Cần được thay thế bằng Client ID thực tế từ Google Console
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1097379280226-ede5i0vtmkj3cb94se0gp7jm4t8ibujk.apps.googleusercontent.com',
  
  // Callback URL sau khi Google login thành công
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin + '/auth/google/callback',
  
  // Scope permissions cần thiết
  scope: 'openid email profile',
  
  // Response type
  responseType: 'id_token',
  
  // Nonce for security
  nonce: Math.random().toString(36).substring(2, 15),
};

// Google Identity Services Configuration
export const GOOGLE_IDENTITY_CONFIG = {
  client_id: GOOGLE_CONFIG.clientId,
  callback: 'handleGoogleCallback', // Global callback function name
  auto_select: false,
  cancel_on_tap_outside: true,
};

// Environment check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

console.log('📱 Google Config loaded:', {
  clientId: GOOGLE_CONFIG.clientId ? `${GOOGLE_CONFIG.clientId.substring(0, 20)}...` : 'Not set',
  environment: import.meta.env.MODE,
  redirectUri: GOOGLE_CONFIG.redirectUri,
});