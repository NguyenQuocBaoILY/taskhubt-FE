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
  // Login user
  login: async (emailOrUsername, password) => {
    const response = await authAPI.post('/api/Auth/login', {
      usernameOrEmail: emailOrUsername,
      password: password,
    });
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await authAPI.post('/api/Auth/register', {
      username: userData.username || userData.email.split('@')[0],
      email: userData.email,
      password: userData.password,
      name: userData.name,
      phoneNumber: userData.phoneNumber || '',
      timezone: userData.timezone || 'Asia/Ho_Chi_Minh',
      language: userData.language || 'vi',
    });
    return response.data;
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
};

export default authService;