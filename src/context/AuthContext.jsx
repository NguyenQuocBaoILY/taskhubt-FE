import { createContext, useReducer, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';
import { checkIsAdmin } from '../utils/authHelper';

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

  // Initialize authentication state
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('🔒 Token expired, logging out...');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };

    window.addEventListener('token-expired', handleTokenExpired);

    const initializeAuth = () => {
      console.log('🔍 Initializing authentication from localStorage...');
      
      const token = localStorage.getItem('access_token');
      const userName = localStorage.getItem('user_name');
      const userEmail = localStorage.getItem('user_email');
      
      if (token && userName) {
        console.log('✅ Token found, setting authenticated state');
        
        dispatch({
          type: AUTH_ACTIONS.INIT_FROM_STORAGE,
          payload: {
            hasToken: true,
            user: null,
            token
          }
        });
        
        // Load user info from API
        authService.getCurrentUser()
          .then(user => {
            console.log('✅ Token verified with API:', user.name || user.username);
            console.log('👤 Raw API response:', user);
            
            // Build user data object - KEEP original isAdmin value
            const userData = {
              userId: user.userId,
              name: user.name || user.username || userName,
              username: user.username || user.name || userName,
              email: user.email,
              avatar: user.avatar,
              status: user.status,
              isAdmin: user.isAdmin, // ✅ Keep original value (1, "1", true, etc.)
              authProvider: user.authProvider
            };
            
            // Log admin check
            console.log('🔑 Admin check:', {
              rawValue: user.isAdmin,
              rawType: typeof user.isAdmin,
              isAdmin: checkIsAdmin(userData)
            });
            
            dispatch({
              type: AUTH_ACTIONS.SET_USER,
              payload: userData
            });
          })
          .catch(error => {
            console.warn('⚠️ Token verification failed:', error.message);
            
            if (error.response?.status === 401 || error.response?.status === 403) {
              console.log('❌ Token invalid, logging out...');
              localStorage.clear();
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            } else {
              console.log('📡 Network error, using cached info');
              const fallbackUser = {
                name: userName || 'Unknown User',
                username: userName,
                email: userEmail,
                isAdmin: 0 // Safe default
              };
              dispatch({
                type: AUTH_ACTIONS.SET_USER,
                payload: fallbackUser
              });
            }
          });
          
      } else {
        console.log('❌ No token found');
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

    return () => {
      window.removeEventListener('token-expired', handleTokenExpired);
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      if (!email || !password) {
        throw new Error('Email và mật khẩu là bắt buộc');
      }

      console.log('🔐 Attempting login...');
      
      const response = await authService.login(email, password);
      const { user, access_token, refresh_token } = response;
      
      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user_name', user.name || user.username);
      localStorage.setItem('user_email', user.email);
      
      // Store user info - KEEP original isAdmin value
      localStorage.setItem('user_info', JSON.stringify({
        userId: user.userId,
        username: user.username,
        email: user.email,
        name: user.name || user.username,
        avatar: user.avatar,
        status: user.status,
        isAdmin: user.isAdmin // ✅ Keep original (1, "1", true, etc.)
      }));
      
      console.log('🔍 Login - Admin check:', {
        rawValue: user.isAdmin,
        rawType: typeof user.isAdmin,
        isAdmin: checkIsAdmin(user)
      });

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user, // Keep original user object
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
        if (error.response.status === 401) {
          errorMessage = 'Email hoặc mật khẩu không đúng';
        } else if (error.response.status === 429) {
          errorMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau';
        } else {
          errorMessage = error.response.data?.message || 'Lỗi server';
        }
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server';
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

      console.log('🔐 Attempting signup...');
      
      const response = await authService.register(userData);
      
      if (response.needsLogin) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: 'Registration successful' });
        return { 
          success: true, 
          needsLogin: true, 
          message: 'Đăng ký thành công! Vui lòng đăng nhập.' 
        };
      }
      
      const { user, access_token, refresh_token } = response;
      
      if (!access_token || !user) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: 'No tokens' });
        return { 
          success: true, 
          needsLogin: true, 
          message: 'Đăng ký thành công! Vui lòng đăng nhập.' 
        };
      }
      
      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user_name', user.name || user.username);
      localStorage.setItem('user_email', user.email);

      // Store user info - KEEP original isAdmin
      localStorage.setItem('user_info', JSON.stringify({
        userId: user.userId || user.id,
        username: user.username,
        email: user.email,
        name: user.name || user.username,
        avatar: user.avatar,
        status: user.status,
        isAdmin: user.isAdmin // ✅ Keep original
      }));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user,
          token: access_token,
        },
      });

      console.log('✅ Signup successful:', user.name);
      toast.success('Đăng ký thành công!');
      return { success: true };
    } catch (error) {
      console.error('❌ Signup failed:', error);
      
      let errorMessage = 'Đăng ký thất bại';
      
      if (error.response?.status === 409) {
        errorMessage = 'Email đã được sử dụng';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ';
      }
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    console.log('🚪 Logging out...');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    localStorage.clear();
    toast.success('Đăng xuất thành công!');
    
    try {
      await authService.logout();
    } catch (error) {
      console.warn('⚠️ Logout API error:', error.message);
    }
  };

  // Google Login
  const googleLogin = async (idToken) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      console.log('🔐 Google login...');
      
      const response = await authService.googleLogin(idToken, 'web');
      const { user, access_token, refresh_token, isNewUser } = response;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user_name', user.name || user.username);
      localStorage.setItem('user_email', user.email);
      
      localStorage.setItem('user_info', JSON.stringify({
        userId: user.userId,
        username: user.username,
        email: user.email,
        name: user.name || user.username,
        avatar: user.avatar,
        status: user.status,
        isAdmin: user.isAdmin, // ✅ Keep original
        authProvider: 'GOOGLE'
      }));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user,
          token: access_token
        }
      });

      console.log('✅ Google login successful');
      return { success: true, isNewUser };
    } catch (error) {
      console.error('❌ Google login failed:', error);
      
      let errorMessage = 'Đăng nhập Google thất bại';
      if (error.response?.status === 400) {
        errorMessage = 'Token Google không hợp lệ';
      }
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

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