import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:15155';

const authAPI = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

console.log('🌐 Auth API Base URL:', authAPI.defaults.baseURL);

// Authentication API endpoints - Updated to match backend schema
export const authService = {
  // Login user - Updated to match backend response format
  login: async (emailOrUsername, password) => {
    const response = await authAPI.post('/api/Auth/cognito-login', {
      usernameOrEmail: emailOrUsername,
      password: password,
    });
    
    // Backend returns: { accessToken, refreshToken, user, message }
    // Need to transform to match AuthContext expectations
    const { accessToken, refreshToken, user, message } = response.data;
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: user,
      message: message
    };
  },

  // Register user
  register: async (userData) => {
    const response = await authAPI.post('/api/Auth/cognito-register', {
      username: userData.username || userData.email.split('@')[0],
      email: userData.email,
      password: userData.password,
      name: userData.name,
      phoneNumber: userData.phoneNumber || '',
      timezone: userData.timezone || 'Asia/Ho_Chi_Minh',
      language: userData.language || 'vi',
    });
    
    const responseData = response.data;
    console.log('📥 Register API response:', responseData);
    
    // Check if Cognito registration needs confirmation
    if (responseData.needsConfirmation || (responseData.user && !responseData.accessToken && !responseData.refreshToken)) {
      console.log('📧 Registration successful - needs email confirmation');
      return {
        needsConfirmation: true,
        username: responseData.username || userData.username || userData.email.split('@')[0],
        message: responseData.message || 'Vui lòng kiểm tra email để xác thực tài khoản'
      };
    }
    
    // API register returns { accessToken: null, refreshToken: null, user, message }
    // We need to auto-login after successful registration
    if (responseData.user && !responseData.accessToken) {
      console.log('🔄 Registration successful, attempting auto-login...');
      
      // Auto-login with the same credentials
      try {
        const loginResponse = await authAPI.post('/api/Auth/cognito-login', {
          usernameOrEmail: userData.email,
          password: userData.password,
        });
        
        const { accessToken, refreshToken, user } = loginResponse.data;
        
        return {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: user,
          message: responseData.message
        };
      } catch (loginError) {
        console.error('❌ Auto-login failed after registration:', loginError);
        // Return original registration response even if auto-login fails
        return {
          access_token: null,
          refresh_token: null,
          user: responseData.user,
          message: responseData.message,
          needsLogin: true
        };
      }
    }
    
    // If tokens are provided in registration (shouldn't happen based on API spec)
    if (responseData.accessToken && responseData.user) {
      return {
        access_token: responseData.accessToken,
        refresh_token: responseData.refreshToken,
        user: responseData.user
      };
    }
    
    return responseData;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await authAPI.post('/api/Auth/refresh', {
      refreshToken: refreshToken,
    });
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No token found');

    const response = await authAPI.get('/api/Auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Logout user
  logout: async (logoutAllDevices = false) => {
    const refreshToken = localStorage.getItem('refresh_token');
    const token = localStorage.getItem('access_token');
    
    if (refreshToken && token) {
      try {
        await authAPI.post('/api/Auth/logout', {
          refreshToken: refreshToken,
          logoutAllDevices: logoutAllDevices
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Logout API call failed, continuing with local logout');
      }
    }
  },

  // Google Login - DEPRECATED
  // Google authentication now handled via Cognito OAuth flow
  // FE exchanges code for tokens directly with Cognito (no BE involved)
  googleLogin: async () => {
    console.warn('⚠️ authService.googleLogin() is deprecated. Use Cognito OAuth flow instead.');
    throw new Error('Google login now handled via Cognito OAuth. See GoogleCallback.jsx');
  },

  // Forgot Password
  forgotPassword: async (username) => {
    const response = await authAPI.post('/api/Auth/cognito-forgot-password', {
      username: username,
    });
    return response.data;
  },

  // Reset Password (Cognito)
  resetPassword: async (username, confirmationCode, newPassword) => {
    console.log('🔒 Calling reset password API with:', { 
      username: username,
      hasConfirmationCode: !!confirmationCode,
      hasNewPassword: !!newPassword,
      apiBaseURL: authAPI.defaults.baseURL
    });
    
    const response = await authAPI.post('/api/Auth/cognito-confirm-forgot-password', {
      username: username,
      confirmationCode: confirmationCode,
      newPassword: newPassword,
    });
    
    console.log('✅ Reset password API success:', response.data);
    return response.data;
  },

  // Confirm Signup (Cognito)
  confirmSignup: async (username, confirmationCode) => {
    const response = await authAPI.post('/api/Auth/cognito-confirm', {
      username: username,
      confirmationCode: confirmationCode,
    });
    return response.data;
  },

  // Resend Confirmation Code (Cognito)
  resendConfirmationCode: async (username) => {
    const response = await authAPI.post('/api/Auth/cognito-resend-confirmation', {
      username: username,
    });
    return response.data;
  },
};

export default authService;