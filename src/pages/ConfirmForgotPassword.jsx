import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import authService from '../services/authService';

export default function ConfirmForgotPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: searchParams.get('username') || '',
    confirmationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isLongEnough: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    }
    if (!formData.confirmationCode) {
      newErrors.confirmationCode = 'Mã xác thực là bắt buộc';
    } else if (formData.confirmationCode.length !== 6) {
      newErrors.confirmationCode = 'Mã xác thực phải có 6 chữ số';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!passwordStrength.hasUpperCase) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 1 chữ hoa';
    } else if (!passwordStrength.hasLowerCase) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 1 chữ thường';
    } else if (!passwordStrength.hasNumber) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 1 chữ số';
    } else if (!passwordStrength.hasSpecialChar) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔒 Confirming forgot password with code...');
      
      await authService.resetPassword(
        formData.username,
        formData.confirmationCode,
        formData.newPassword
      );
      
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
      navigate('/login');
      
    } catch (error) {
      console.error('❌ Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      
      if (errorMessage.includes('code') || errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        toast.error('Mã xác thực không hợp lệ hoặc đã hết hạn.');
        setErrors({ confirmationCode: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
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
    
    // Check password strength
    if (name === 'newPassword') {
      setPasswordStrength({
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecialChar: /[!@#$%^&*()_+\-={}[\];':"\\|,.<>/?]/.test(value),
        isLongEnough: value.length >= 8,
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
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <LockClosedIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Xác thực và đặt lại mật khẩu
              </h2>
              <p className="text-sm text-gray-600">
                Nhập mã xác thực từ email và mật khẩu mới của bạn
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Username */}
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
                      placeholder="Tên đăng nhập"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                {/* Confirmation Code */}
                <div>
                  <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Mã xác thực
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
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
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-900 text-center text-xl tracking-widest font-semibold`}
                      placeholder="000000"
                    />
                  </div>
                  {errors.confirmationCode && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmationCode}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Nhập mã 6 chữ số đã được gửi đến email của bạn
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border ${
                        errors.newPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-900`}
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-700">Độ mạnh mật khẩu:</p>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <span className={`mr-2 ${passwordStrength.isLongEnough ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordStrength.isLongEnough ? '✓' : '○'}
                          </span>
                          <span className={passwordStrength.isLongEnough ? 'text-green-600' : 'text-gray-500'}>
                            Ít nhất 8 ký tự
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className={`mr-2 ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordStrength.hasUpperCase ? '✓' : '○'}
                          </span>
                          <span className={passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}>
                            Có chữ hoa (A-Z)
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className={`mr-2 ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordStrength.hasLowerCase ? '✓' : '○'}
                          </span>
                          <span className={passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}>
                            Có chữ thường (a-z)
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className={`mr-2 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordStrength.hasNumber ? '✓' : '○'}
                          </span>
                          <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                            Có chữ số (0-9)
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className={`mr-2 ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordStrength.hasSpecialChar ? '✓' : '○'}
                          </span>
                          <span className={passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}>
                            Có ký tự đặc biệt (!@#$%^&*...)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-900`}
                      placeholder="Xác nhận mật khẩu mới"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu'}
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <div className="bg-white bg-opacity-90 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-medium mb-2">💡 Lưu ý:</p>
              <ul className="text-left space-y-1 text-xs">
                <li>• Mã xác thực có 6 chữ số</li>
                <li>• Kiểm tra email trong thư mục Spam nếu chưa nhận được</li>
                <li>• Mã có hiệu lực trong 24 giờ</li>
                <li>• Mật khẩu phải đáp ứng đủ các điều kiện bảo mật</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
