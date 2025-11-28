import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Hardcoded admin credentials
      if (formData.email === 'admin@gmail.com' && formData.password === 'admin123') {
        // Simulate admin login
        const adminUser = {
          userId: 'admin-001',
          username: 'admin',
          email: 'admin@gmail.com',
          name: 'Administrator',
          role: 'admin',
          isAdmin: true
        };

        // Store admin tokens and info
        localStorage.setItem('admin_token', 'admin-fake-token-' + Date.now());
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        
        toast.success('Đăng nhập admin thành công!');
        navigate('/admin');
      } else {
        toast.error('Email hoặc mật khẩu admin không đúng!');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Truy cập hệ thống quản trị TaskHub
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Admin
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="admin@gmail.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Nhập mật khẩu admin"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Thông tin đăng nhập admin:</p>
                <p>Email: <code className="bg-yellow-100 px-1 rounded">admin@gmail.com</code></p>
                <p>Mật khẩu: <code className="bg-yellow-100 px-1 rounded">admin123</code></p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}