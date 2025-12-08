import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';

export default function ConfirmSignup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: searchParams.get('username') || '',
    email: searchParams.get('email') || '',
    confirmationCode: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Tên đăng nhập là bắt buộc';
    if (!formData.confirmationCode) newErrors.confirmationCode = 'Mã xác thực là bắt buộc';
    
    if (formData.confirmationCode.length !== 6) {
      newErrors.confirmationCode = 'Mã xác thực phải có 6 chữ số';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔐 Confirming signup with code...');
      
      const result = await authService.confirmSignup(formData.username, formData.confirmationCode);
      
      console.log('✅ Confirmation successful:', result);
      toast.success('Xác thực thành công! Vui lòng đăng nhập.');
      
      // Redirect to login with email pre-filled
      navigate(`/login?email=${encodeURIComponent(formData.email || formData.username)}`);
    } catch (error) {
      console.error('❌ Confirmation failed:', error);
      
      let errorMessage = 'Xác thực thất bại';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn';
      } else if (error.response?.status === 404) {
        errorMessage = 'Tên đăng nhập không tồn tại';
      }
      
      setErrors({ confirmationCode: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !formData.username) return;

    try {
      setResendLoading(true);
      console.log('📧 Resending confirmation code...');
      
      await authService.resendConfirmationCode(formData.username);
      
      console.log('✅ Code resent successfully');
      toast.success('Mã xác thực mới đã được gửi đến email của bạn');
      
      setCanResend(false);
      setCountdown(60); // 60 seconds countdown
    } catch (error) {
      console.error('❌ Resend failed:', error);
      
      let errorMessage = 'Không thể gửi lại mã';
      
      if (error.response?.status === 429) {
        errorMessage = 'Vui lòng đợi trước khi gửi lại';
      }
      
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers for confirmation code and limit to 6 digits
    if (name === 'confirmationCode') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src="/talkhub.jpg" 
          alt="TaskHub Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Confirmation Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Xác thực tài khoản
              </h2>
              <p className="text-sm text-gray-600">
                Nhập mã xác thực 6 chữ số đã được gửi đến email của bạn
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đăng nhập
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.username ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-900`}
                      placeholder="username"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email (tùy chọn)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-900 bg-gray-50"
                      placeholder="email@example.com"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Mã xác thực
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="confirmationCode"
                      name="confirmationCode"
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      value={formData.confirmationCode}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.confirmationCode ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-900 text-center text-2xl tracking-widest font-semibold`}
                      placeholder="000000"
                    />
                  </div>
                  {errors.confirmationCode && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmationCode}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? 'Đang xác thực...' : 'Xác thực tài khoản'}
                </button>
              </div>

              <div className="text-center space-y-3">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={!canResend || resendLoading || !formData.username}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    'Đang gửi...'
                  ) : countdown > 0 ? (
                    `Gửi lại sau ${countdown}s`
                  ) : (
                    'Gửi lại mã xác thực'
                  )}
                </button>

                <div className="text-sm text-gray-600">
                  Đã có tài khoản?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <div className="bg-white bg-opacity-90 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-medium mb-2">💡 Không nhận được mã?</p>
              <ul className="text-left space-y-1 text-xs">
                <li>• Kiểm tra trong thư mục Spam/Junk</li>
                <li>• Đảm bảo email nhập đúng</li>
                <li>• Đợi vài phút trước khi gửi lại</li>
                <li>• Mã có hiệu lực trong 24 giờ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
