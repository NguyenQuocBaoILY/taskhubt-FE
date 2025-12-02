import { createContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('access_token'),
  isLoading: true,
  isAuthenticated: false,
  hasInitialized: false,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  INIT_FROM_STORAGE: 'INIT_FROM_STORAGE',
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.INIT_FROM_STORAGE:
      return {
        ...state,
        isLoading: false,
        hasInitialized: true,
        isAuthenticated: action.payload.hasToken,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state immediately from localStorage
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('🔔 Received token-expired event, logging out...');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };

    // Listen for token expiration events from API interceptor
    window.addEventListener('token-expired', handleTokenExpired);

    const initializeAuth = () => {
      console.log('🔐 Khởi tạo authentication từ localStorage...');
      
      const token = localStorage.getItem('access_token');
      const userName = localStorage.getItem('user_name');
      const userEmail = localStorage.getItem('user_email');
      
      if (token && userName) {
        // ✅ CÓ TOKEN → SET AUTHENTICATED NGAY để tránh redirect
        console.log('✅ Tìm thấy token, đặt user authenticated ngay lập tức');
        
        // ❌ KHÔNG dùng cached user info ngay lập tức
        // Chỉ set authenticated state, user info sẽ được load từ API
        dispatch({
          type: AUTH_ACTIONS.INIT_FROM_STORAGE,
          payload: {
            hasToken: true,
            user: null, // Không dùng cached user
            token
          }
        });
        
        // ✅ Load user info từ API ngay lập tức
        authService.getCurrentUser()
          .then(user => {
            console.log('✅ Token verified với API:', user.name || user.username);
            console.log('👤 Full user data from /api/Auth/me:', user);
            
            // API giờ chỉ trả về {userId, name, email} - đảm bảo có đủ fields cần thiết
            const userData = {
              userId: user.userId,
              name: user.name || user.username || userName || 'Unknown User', // Ưu tiên name từ API, fallback về cached userName
              username: user.username || user.name || userName, // Fallback cho compatibility
              email: user.email,
              ...user // Spread để giữ các fields khác nếu có
            };
            
            console.log('📝 Final userData being set:', userData);
            
            dispatch({
              type: AUTH_ACTIONS.SET_USER,
              payload: userData
            });
          })
          .catch(error => {
            console.warn('⚠️ Token verification failed:', error.message);
            // Chỉ logout nếu là 401/403 - token thực sự invalid
            if (error.response?.status === 401 || error.response?.status === 403) {
              console.log('❌ Token invalid, logging out...');
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_name');
              localStorage.removeItem('user_email');
              localStorage.removeItem('user_info');
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            } else {
              // Network errors hoặc server errors - dùng cached user info
              console.log('📡 Network/server error, using cached user info temporarily');
              const fallbackUser = {
                name: userName || 'Unknown User', // Ưu tiên name field
                username: userName, // Keep username for compatibility
                email: userEmail
              };
              dispatch({
                type: AUTH_ACTIONS.SET_USER,
                payload: fallbackUser
              });
              // Retry sau 5 giây nếu là network error
              if (!error.response) {
                setTimeout(() => {
                  authService.getCurrentUser()
                    .then(user => {
                      dispatch({
                        type: AUTH_ACTIONS.SET_USER,
                        payload: user
                      });
                    })
                    .catch(() => {
                      console.log('📡 Retry failed, but keeping user logged in');
                    });
                }, 5000);
              }
            }
          });
          
      } else {
        // ✅ KHÔNG CÓ TOKEN → Set not authenticated
        console.log('❌ Không tìm thấy token, user chưa login');
        dispatch({
          type: AUTH_ACTIONS.INIT_FROM_STORAGE,
          payload: {
            hasToken: false,
            user: null,
            token: null
          }
        });
      }
    };

    initializeAuth();

    // Cleanup event listener
    return () => {
      window.removeEventListener('token-expired', handleTokenExpired);
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      // Validate input
      if (!email || !password) {
        throw new Error('Email và mật khẩu là bắt buộc');
      }

      console.log('🔐 Attempting login with real API...');
      
      // Call real API
      const response = await authService.login(email, password);
      
      // Extract data from API response
      const { user, access_token, refresh_token } = response;
      
      // Store tokens and user info
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user_name', user.name || user.username); // Ưu tiên name
      localStorage.setItem('user_email', user.email);
      
      // Store complete user info for API usage (including userId)
      localStorage.setItem('user_info', JSON.stringify({
        userId: user.userId,
        username: user.username,
        email: user.email,
        name: user.name || user.username, // Đảm bảo có name field
        avatar: user.avatar,
        status: user.status,
        userType: user.userType || 'User' // Add userType for role-based redirection
      }));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user,
          token: access_token,
        },
      });

      console.log('✅ Login successful:', user.name || user.username);
      toast.success('Đăng nhập thành công!');
      return { success: true };
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = 'Đăng nhập thất bại';
      
      if (error.response) {
        // API returned error
        if (error.response.status === 401) {
          errorMessage = 'Email hoặc mật khẩu không đúng';
        } else if (error.response.status === 429) {
          errorMessage = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau';
        } else {
          errorMessage = error.response.data?.message || 'Lỗi server';
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng';
      } else {
        // Other errors
        errorMessage = error.message || 'Đăng nhập thất bại';
      }
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      console.log('📝 Attempting signup with real API...');
      
      // Call real API
      const response = await authService.register(userData);
      
      // Extract data from API response
      const { user, access_token, refresh_token } = response;
      
      // Store tokens and user info
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user_name', user.name || user.username); // Ưu tiên name
      localStorage.setItem('user_email', user.email);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user,
          token: access_token,
        },
      });

      console.log('✅ Signup successful:', user.name || user.username);
      toast.success('Đăng ký thành công!');
      return { success: true };
    } catch (error) {
      console.error('❌ Signup failed:', error);
      
      let errorMessage = 'Đăng ký thất bại';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'Email này đã được sử dụng';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ';
        } else {
          errorMessage = error.response.data?.message || 'Lỗi server';
        }
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng';
      } else {
        errorMessage = error.message || 'Đăng ký thất bại';
      }
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function - optimized for speed
  const logout = async () => {
    console.log('🚪 Fast logout initiated...');
    
    // 1. Immediately update UI state (fastest)
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    
    // 2. Clear all localStorage in batch
    const keysToRemove = ['access_token', 'refresh_token', 'user_name', 'user_email', 'user_info', 'admin_token', 'admin_user'];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 3. Show success message immediately
    toast.success('Đăng xuất thành công!');
    
    // 4. Call API in background (non-blocking)
    try {
      authService.logout().catch(error => {
        console.warn('⚠️ Background logout API error:', error.message);
      });
      console.log('✅ Logout completed (API call in progress)');
    } catch (error) {
      console.warn('⚠️ Logout API error (UI already updated):', error.message);
    }
  };

  // Google Login function
  const googleLogin = async (idToken) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      console.log('🔐 Attempting Google login with real API...');
      
      // Call Google login API
      const response = await authService.googleLogin(idToken, 'web');
      
      // Extract data from API response
      const { user, access_token, refresh_token, isNewUser } = response;
      
      // Store tokens and user info (same as regular login)
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user_name', user.name || user.username); // Ưu tiên name
      localStorage.setItem('user_email', user.email);
      
      // Store complete user info for API usage
      localStorage.setItem('user_info', JSON.stringify({
        userId: user.userId,
        username: user.username,
        email: user.email,
        name: user.name || user.username, // Đảm bảo có name field
        avatar: user.avatar,
        status: user.status,
        userType: user.userType || 'User',
        authProvider: 'GOOGLE' // Mark as Google user
      }));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: user,
          token: access_token
        }
      });

      // Show appropriate message (only if not from callback)
      if (isNewUser) {
        console.log('🎉 New user created via Google:', user.name);
      } else {
        console.log('👋 Existing user logged in via Google:', user.name);
      }
      
      console.log('✅ Google login successful for:', user.name || user.username);
      return { success: true, isNewUser };
    } catch (error) {
      console.error('❌ Google login failed:', error);
      
      let errorMessage = 'Đăng nhập Google thất bại';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Token Google không hợp lệ';
        } else {
          errorMessage = error.response.data?.message || 'Lỗi server';
        }
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server';
      } else {
        errorMessage = error.message || 'Đăng nhập Google thất bại';
      }
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.SET_USER,
      payload: userData,
    });
  };

  const contextValue = {
    ...state,
    login,
    signup,
    googleLogin,
    logout,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;