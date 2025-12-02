import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useContext';
import toast from 'react-hot-toast';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { googleLogin } = useAuth();
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

        console.log('🔄 Processing Google OAuth callback...');

        // Get the id_token from URL fragment or query params
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment || window.location.search);
        
        const idToken = params.get('id_token');
        const error = params.get('error');
        const state = params.get('state');

        console.log('📋 Callback params:', { idToken: !!idToken, error, state });

        if (error) {
          console.error('Google OAuth error:', error);
          toast.error('Đăng nhập Google thất bại: ' + error);
          navigate('/login', { replace: true });
          return;
        }

        if (!idToken) {
          console.error('No id_token received');
          toast.error('Không nhận được token từ Google');
          navigate('/login', { replace: true });
          return;
        }

        if (state !== 'google_signin') {
          console.error('Invalid state parameter');
          toast.error('Phiên đăng nhập không hợp lệ');
          navigate('/login', { replace: true });
          return;
        }

        // Process the Google login ONCE
        toast.loading('Đang xử lý đăng nhập Google...', { id: 'google-callback' });
        
        const result = await googleLogin(idToken);
        
        if (result.success) {
          toast.success('Đăng nhập Google thành công!', { id: 'google-callback' });
          
          // Clean up
          localStorage.removeItem('google_signin_resolve');
          
          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error(result.error || 'Google login failed');
        }

      } catch (error) {
        console.error('Google callback error:', error);
        
        let errorMessage = 'Xử lý đăng nhập Google thất bại';
        
        if (error.message?.includes('ERR_CONNECTION_REFUSED')) {
          errorMessage = 'Backend server không khả dụng. Kiểm tra VITE_API_BASE_URL trong .env';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy';
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