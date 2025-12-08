import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { exchangeCodeForTokens, validateOAuthState, getUserInfoFromToken } from '../services/googleAuth';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current || isProcessing) {
      return;
    }

    const handleCallback = async () => {
      try {
        hasProcessed.current = true;
        setIsProcessing(true);

        console.log('🔄 Processing Cognito OAuth callback...');

        // Get authorization code and state from URL query params
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('📋 Callback params:', { 
          hasCode: !!code, 
          state, 
          error,
          errorDescription 
        });

        // Handle OAuth errors
        if (error) {
          console.error('Cognito OAuth error:', error, errorDescription);
          toast.error(`Đăng nhập Google thất bại: ${errorDescription || error}`);
          navigate('/login', { replace: true });
          return;
        }

        // Validate authorization code
        if (!code) {
          console.error('No authorization code received');
          toast.error('Không nhận được mã xác thực từ Cognito');
          navigate('/login', { replace: true });
          return;
        }

        // Validate state parameter
        if (!validateOAuthState(state)) {
          console.error('Invalid state parameter');
          toast.error('Phiên đăng nhập không hợp lệ');
          navigate('/login', { replace: true });
          return;
        }

        // Exchange authorization code for tokens
        toast.loading('Đang xử lý đăng nhập Google...', { id: 'google-callback' });
        
        const tokens = await exchangeCodeForTokens(code);
        
        console.log('🎫 Tokens received:', {
          hasAccessToken: !!tokens.access_token,
          hasIdToken: !!tokens.id_token,
          hasRefreshToken: !!tokens.refresh_token,
          tokenType: tokens.token_type,
          expiresIn: tokens.expires_in,
        });

        // Store tokens in localStorage
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        
        // Extract user info from id_token
        const userInfo = getUserInfoFromToken(tokens.id_token);
        
        if (!userInfo) {
          throw new Error('Failed to extract user information from token');
        }

        console.log('👤 User info:', {
          email: userInfo.email,
          name: userInfo.name,
          sub: userInfo.sub,
        });

        // Store user info
        localStorage.setItem('user_email', userInfo.email);
        localStorage.setItem('user_name', userInfo.name);
        localStorage.setItem('user_id', userInfo.sub);
        
        if (userInfo.picture) {
          localStorage.setItem('user_picture', userInfo.picture);
        }

        // Success
        toast.success('Đăng nhập Google thành công!', { id: 'google-callback' });
        
        // Clean up
        localStorage.removeItem('oauth_state');
        
        // Force page reload to update auth context
        window.location.href = '/dashboard';

      } catch (error) {
        console.error('Google callback error:', error);
        
        let errorMessage = 'Xử lý đăng nhập Google thất bại';
        
        if (error.message?.includes('ERR_CONNECTION_REFUSED')) {
          errorMessage = 'Không thể kết nối đến Cognito. Kiểm tra cấu hình VITE_COGNITO_DOMAIN';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Không thể kết nối đến Cognito. Vui lòng kiểm tra internet';
        } else if (error.message?.includes('authorization code')) {
          errorMessage = 'Mã xác thực không hợp lệ hoặc đã hết hạn';
        } else {
          errorMessage = error.message || 'Xử lý đăng nhập Google thất bại';
        }
        
        toast.error(errorMessage, { id: 'google-callback' });
        navigate('/login', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, []); // Empty dependency array - only run once

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang xử lý đăng nhập Google...</p>
        <p className="mt-2 text-sm text-gray-400">Vui lòng đợi một chút...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;