import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  { name: 'Dashboard Admin', href: '/admin', icon: HomeIcon },
  { name: 'Quản lý Dự án', href: '/admin/projects', icon: FolderIcon },
  { name: 'Quản lý Nhân viên', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Thống kê', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Cài đặt', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <nav className="bg-red-600 shadow-lg border-b border-red-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/admin" className="flex items-center">
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="h-5 w-5 text-red-600" />
                </div>
                <span className="ml-2 text-xl font-bold text-white">TaskHub Admin</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {adminNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-white text-white'
                        : 'border-transparent text-red-100 hover:border-red-300 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {/* User menu */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-medium text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {user?.name || 'Admin'}
                  </span>
                  <span className="text-xs text-red-100">
                    Quản trị viên
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-100 hover:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Đăng xuất
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-red-100 hover:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-red-700 border-white text-white'
                      : 'border-transparent text-red-100 hover:bg-red-700 hover:border-red-300 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="pt-4 pb-3 border-t border-red-700">
            <div className="px-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <div className="text-base font-medium text-white">
                    {user?.name || 'Admin'}
                  </div>
                  <div className="text-sm text-red-100">
                    admin@example.com
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-red-100 hover:text-white hover:bg-red-700"
              >
                <div className="flex items-center">
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                  Đăng xuất
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}