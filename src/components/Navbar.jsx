import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useContext';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-white via-slate-50 to-white shadow-lg border-b border-slate-200/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">TaskHub</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-2 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`} />
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
              <div className="flex items-center space-x-3 bg-white/60 rounded-xl px-4 py-2 border border-slate-200/60 backdrop-blur-sm">
                <div className="flex-shrink-0">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800">
                    {user?.name || user?.username || 'Loading...'}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {user?.role || 'Member'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="group inline-flex items-center px-4 py-2 bg-white/60 border border-slate-200/60 text-sm font-semibold rounded-xl text-slate-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:border-transparent transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-lg"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl bg-white/60 border border-slate-200/60 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 backdrop-blur-sm shadow-sm"
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
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
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
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <div className="text-base font-medium text-gray-800">
                    {user?.name || user?.username || 'Loading...'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user?.email || 'Loading...'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                  Sign out
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}