import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useContext';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  FolderIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const adminNavigation = [
  { name: 'Thống kê ADMIN', href: '/admin', icon: HomeIcon },
  { name: 'Quản lý Dự án', href: '/admin/projects', icon: FolderIcon },
  { name: 'Quản lý Nhân viên', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Thống kê', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Cài đặt', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is authenticated
    const checkAuth = () => {
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      const accessToken = localStorage.getItem('access_token');
      
      console.log('🔐 Admin auth check:');
      console.log('- Full userInfo object:', userInfo);
      console.log('- userInfo.isAdmin value:', userInfo.isAdmin);
      console.log('- userInfo.isAdmin type:', typeof userInfo.isAdmin);
      console.log('- hasToken:', !!accessToken);
      
      // Handle both boolean and string values from JWT + admin username fallback
      let isAdminCheck = userInfo.isAdmin === true || userInfo.isAdmin === 'true' || userInfo.isAdmin === 'True';
      
      // Fallback: Check for admin username/email (temporary until backend fix)
      if (!isAdminCheck && (userInfo.username === 'admin' || userInfo.email?.includes('admin'))) {
        console.log('⚠️ Admin fallback triggered in AdminLayout for:', userInfo.username, userInfo.email);
        isAdminCheck = true;
      }
      
      console.log('- isAdminCheck result:', isAdminCheck);
      
      // Allow access only if user is authenticated AND has admin privileges
      const hasAdminAccess = accessToken && isAdminCheck;
      
      console.log('- Final hasAdminAccess:', hasAdminAccess);
      
      if (!hasAdminAccess) {
        console.log('❌ Admin access denied');
        console.log('- Has token:', !!accessToken);
        console.log('- Is admin:', isAdminCheck);
      }
      
      setIsAuthenticated(!!hasAdminAccess);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          
          {/* Mobile sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-blue-600 to-gray-600">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <span className="ml-2 text-xl font-bold text-white">TaskHub Admin</span>
              </div>
              
              <nav className="mt-5 px-2 space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 ${
                          isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Mobile user info */}
            <div className="flex-shrink-0 flex border-t border-blue-400 border-opacity-50 p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.name || 'Admin'}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-blue-100 hover:text-white"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-gradient-to-b from-blue-600 to-gray-600">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <span className="ml-2 text-xl font-bold text-white">TaskHub Admin</span>
              </div>
              
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 ${
                          isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Desktop user info */}
            <div className="flex-shrink-0 flex border-t border-blue-400 border-opacity-50 p-4">
              <div className="flex items-center w-full">
                <div className="h-9 w-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-red-100">Quản trị viên</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-1 rounded-md text-red-100 hover:text-white hover:bg-white hover:bg-opacity-10"
                  title="Đăng xuất"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar for mobile */}
        <div className="md:hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex items-center">
                <h1 className="text-lg font-semibold text-gray-900">TaskHub Admin</h1>
              </div>
              
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}