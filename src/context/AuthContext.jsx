import { createContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

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
          // For now, use mock user data since backend is not ready
          const mockUser = {
            id: 1,
            name: localStorage.getItem('user_name') || 'Nguyen Van A',
            email: localStorage.getItem('user_email') || 'test@example.com',
            avatar: null,
          };
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: mockUser,
              token,
            },
          });
        } catch {
          // Token is invalid, remove it
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_name');
          localStorage.removeItem('user_email');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      // For now, use mock authentication since backend is not ready
      // Simple validation: just check if email and password are provided
      if (!email || !password) {
        throw new Error('Email và mật khẩu là bắt buộc');
      }

      const mockUser = {
        id: 1,
        name: 'Nguyen Van A',
        email: email,
        avatar: null,
      };
      
      const mockToken = 'mock_access_token_' + Date.now();
      const mockRefreshToken = 'mock_refresh_token_' + Date.now();

      // Store tokens and user info
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('refresh_token', mockRefreshToken);
      localStorage.setItem('user_name', mockUser.name);
      localStorage.setItem('user_email', mockUser.email);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: mockUser,
          token: mockToken,
        },
      });

      toast.success('Đăng nhập thành công!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Đăng nhập thất bại';
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

      // For now, use mock authentication since backend is not ready
      const mockUser = {
        id: 1,
        name: userData.name || 'Nguyen Van A',
        email: userData.email,
        avatar: null,
      };
      
      const mockToken = 'mock_access_token_' + Date.now();
      const mockRefreshToken = 'mock_refresh_token_' + Date.now();

      // Store tokens and user info
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('refresh_token', mockRefreshToken);
      localStorage.setItem('user_name', mockUser.name);
      localStorage.setItem('user_email', mockUser.email);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: mockUser,
          token: mockToken,
        },
      });

      toast.success('Đăng ký thành công!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
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
      // No need to call API for mock logout
      // await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
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