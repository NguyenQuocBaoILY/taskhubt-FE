import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import authService from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      console.log('📧 Sending forgot password email to:', email);
      
      await authService.forgotPassword(email);
      
      setIsEmailSent(true);
      toast.success('Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
      
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    setIsEmailSent(false);
    setEmail('');
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/talkhub.jpg" 
          alt="TaskHub Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
            {!isEmailSent ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                    <EnvelopeIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Quên mật khẩu?
                  </h2>
                  <p className="text-sm text-gray-600">
                    Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                  </p>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-900`}
                        placeholder="Nhập email của bạn"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isLoading ? 'Đang gửi...' : 'Gửi email xác thực'}
                    </button>
                  </div>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-1" />
                      Quay lại đăng nhập
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <>
                {/* Email Sent Confirmation */}
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                    <EnvelopeIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Email đã được gửi!
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email <strong>{email}</strong>. 
                    Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleResendEmail}
                      className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      Gửi lại email
                    </button>
                    
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-1" />
                      Quay lại đăng nhập
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}