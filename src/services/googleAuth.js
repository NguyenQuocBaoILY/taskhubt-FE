import { GOOGLE_CONFIG, GOOGLE_IDENTITY_CONFIG } from '../config/google';

// Google Identity Services Integration
class GoogleAuthService {
  constructor() {
    this.isInitialized = false;
    this.isScriptLoaded = false;
  }

  // Load Google Identity Services script
  async loadGoogleScript() {
    if (this.isScriptLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.getElementById('google-identity-script')) {
        this.isScriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Identity Services script loaded');
        this.isScriptLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Google Identity Services script');
        reject(new Error('Failed to load Google Identity Services script'));
      };

      document.head.appendChild(script);
    });
  }

  // Initialize Google Identity Services
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load script first
      await this.loadGoogleScript();
      
      // Wait for google object to be available
      await this.waitForGoogle();
      
      // Initialize accounts
      if (window.google?.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CONFIG.clientId,
          callback: this.handleCredentialResponse.bind(this),
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        this.isInitialized = true;
        console.log('✅ Google Identity Services initialized with client ID:', 
          GOOGLE_CONFIG.clientId.substring(0, 20) + '...');
      } else {
        throw new Error('Google Identity Services not available');
      }
    } catch (error) {
      console.error('❌ Google Auth initialization failed:', error);
      throw error;
    }
  }

  // Wait for Google object to be available
  async waitForGoogle() {
    let attempts = 0;
    const maxAttempts = 50;
    
    while (!window.google && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.google) {
      throw new Error('Google Identity Services not loaded');
    }
  }

  // Handle credential response (callback from Google)
  handleCredentialResponse(response) {
    if (this.pendingPromise) {
      this.pendingPromise.resolve(response.credential);
      this.pendingPromise = null;
    }
  }

  // Sign in with Google (One Tap or Button)
  async signIn() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      try {
        this.pendingPromise = { resolve, reject };
        
        // First try One Tap
        window.google.accounts.id.prompt((notification) => {
          console.log('📱 Google One Tap notification:', notification);
          
          // If One Tap fails, immediately try alternative method
          if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
            console.log('⚠️ One Tap failed, trying direct OAuth flow...');
            this.tryDirectOAuth();
          }
        });
        
        // Timeout for One Tap
        setTimeout(() => {
          if (this.pendingPromise) {
            console.log('⏱️ One Tap timeout, trying direct OAuth...');
            this.tryDirectOAuth();
          }
        }, 3000);
        
      } catch (error) {
        console.error('❌ Google sign-in error:', error);
        reject(error);
      }
    });
  }

  // Direct OAuth flow without popup blocking issues
  async tryDirectOAuth() {
    try {
      if (!this.pendingPromise) return;

      // Use Google OAuth2 direct URL
      const params = new URLSearchParams({
        client_id: GOOGLE_CONFIG.clientId,
        response_type: 'id_token',
        scope: GOOGLE_CONFIG.scope,
        redirect_uri: window.location.origin + '/auth/google/callback',
        nonce: GOOGLE_CONFIG.nonce,
        state: 'google_signin',
        prompt: 'select_account'
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      
      // Open in same window for better browser compatibility
      console.log('🔗 Redirecting to Google OAuth:', authUrl);
      
      // Store the resolve function for when we return
      localStorage.setItem('google_signin_resolve', 'true');
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('❌ Direct OAuth error:', error);
      if (this.pendingPromise) {
        this.pendingPromise.reject(error);
        this.pendingPromise = null;
      }
    }
  }

  // Remove the problematic popup method
  async tryPopupSignIn() {
    // Fallback to direct OAuth instead of popup
    this.tryDirectOAuth();
  }

  // Render Google Sign-In Button
  renderButton(elementId, options = {}) {
    if (!this.isInitialized) {
      console.error('Google Auth not initialized');
      return;
    }

    const defaultOptions = {
      type: 'standard',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '100%',
      theme: 'outline',
    };

    const buttonOptions = { ...defaultOptions, ...options };

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      buttonOptions
    );
  }
}

// Create singleton instance
const googleAuthService = new GoogleAuthService();

// Export convenience functions
export const initGoogleAuth = () => googleAuthService.initialize();
export const signInWithGoogle = () => googleAuthService.signIn();
export const renderGoogleButton = (elementId, options) => 
  googleAuthService.renderButton(elementId, options);

export default googleAuthService;