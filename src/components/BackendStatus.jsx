import { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

export default function BackendStatus() {
  const [status, setStatus] = useState({
    isConnected: false,
    isLoading: true,
    lastChecked: null,
    error: null,
    responseTime: null,
  });

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    const startTime = Date.now();
    
    try {
      // Test connection với swagger endpoint hoặc auth endpoint
      await api.get('/swagger/v1/swagger.json', { timeout: 5000 }).catch(() => {
        // Nếu swagger fail, thử auth me endpoint
        return api.get('/api/Auth/me', { timeout: 5000 });
      });
      
      const responseTime = Date.now() - startTime;
      
      setStatus({
        isConnected: true,
        isLoading: false,
        lastChecked: new Date(),
        error: null,
        responseTime,
      });
    } catch (error) {
      console.error('Backend connection failed:', error);
      
      let errorMessage = 'Không thể kết nối';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Server từ chối kết nối';
      } else if (error.response?.status) {
        errorMessage = `HTTP ${error.response.status}`;
      }
      
      setStatus({
        isConnected: false,
        isLoading: false,
        lastChecked: new Date(),
        error: errorMessage,
        responseTime: null,
      });
    }
  };

  useEffect(() => {
    // Check immediately
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date?.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {status.isLoading ? (
              <ArrowPathIcon className="h-5 w-5 text-gray-500 animate-spin" />
            ) : status.isConnected ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            )}
            
            <div>
              <div className={`font-medium ${
                status.isConnected ? 'text-green-700' : 'text-red-700'
              }`}>
                Backend API: {status.isConnected ? 'Kết nối' : 'Mất kết nối'}
              </div>
              
              <div className="text-sm text-gray-500">
                {status.lastChecked ? (
                  <>
                    Kiểm tra lần cuối: {formatTime(status.lastChecked)}
                    {status.responseTime && (
                      <span className="ml-2">({status.responseTime}ms)</span>
                    )}
                  </>
                ) : (
                  'Đang kiểm tra...'
                )}
              </div>
              
              {status.error && (
                <div className="text-sm text-red-600 mt-1">
                  Lỗi: {status.error}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={checkConnection}
          disabled={status.isLoading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-1 ${status.isLoading ? 'animate-spin' : ''}`} />
          Kiểm tra lại
        </button>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          <div><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL}</div>
          <div><strong>Real API Mode:</strong> {import.meta.env.VITE_USE_REAL_API === 'true' ? 'Enabled' : 'Disabled'}</div>
        </div>
      </div>
    </div>
  );
}