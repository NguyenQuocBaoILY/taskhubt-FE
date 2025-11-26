import { createContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('access_token'),
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
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

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          console.log('🔍 Verifying token with API...');
          
          // Verify token with real API
          const user = await authService.getCurrentUser();
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user,
              token,
            },
          });
          
          console.log('✅ Token verified, user logged in:', user.name);
        } catch (error) {
          console.warn('⚠️ Token invalid, logging out:', error.message);
          
          // Token is invalid, remove it
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_name');
          localStorage.removeItem('user_email');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        console.log('ℹ️ No token found, user not logged in');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuth();
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
      localStorage.setItem('user_name', user.name);
      localStorage.setItem('user_email', user.email);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user,
          token: access_token,
        },
      });

      console.log('✅ Login successful:', user.name);
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
      localStorage.setItem('user_name', user.name);
      localStorage.setItem('user_email', user.email);

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

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Logging out with real API...');
      
      // Call real logout API
      await authService.logout();
      
      console.log('✅ Logout API called successfully');
    } catch (error) {
      console.warn('⚠️ Logout API error (continuing with local logout):', error.message);
    } finally {
      // Clear tokens and state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Đăng xuất thành công!');
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