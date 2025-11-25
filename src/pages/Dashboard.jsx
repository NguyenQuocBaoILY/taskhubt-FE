import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useContext';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔄 Đang kết nối với API...');
      
      const statsResponse = await dashboardAPI.getStats();
      console.log('📊 Stats từ API:', statsResponse.data);
      
      const activitiesResponse = await dashboardAPI.getActivities();
      console.log('📋 Activities từ API:', activitiesResponse.data);
      
      setStats(statsResponse.data);
      setActivities(activitiesResponse.data);
      
      toast.success('Đã tải dữ liệu dashboard từ API');
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      
      if (error.response) {
        toast.error(`API Error: ${error.response.status}`);
      } else if (error.request) {
        toast.error('Không thể kết nối với server');
      } else {
        toast.error(`Lỗi: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = stats ? [
    {
      name: 'Tổng số dự án',
      value: stats.totalProjects,
      icon: FolderIcon,
      color: 'bg-blue-500',
      href: '/projects',
    },
    {
      name: 'Tổng số task',
      value: stats.totalTasks,
      icon: ClipboardDocumentListIcon,
      color: 'bg-green-500',
      href: '/tasks',
    },
    {
      name: 'Task đang thực hiện',
      value: stats.inProgressTasks,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      href: '/tasks?status=in-progress',
    },
    {
      name: 'Task hoàn thành',
      value: stats.completedTasks,
      icon: CheckCircleIcon,
      color: 'bg-green-600',
      href: '/tasks?status=completed',
    },
    {
      name: 'Task quá hạn',
      value: stats.overdueeTasks,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      href: '/tasks?overdue=true',
    },
    {
      name: 'Thành viên',
      value: stats.totalMembers,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      href: '/users',
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">
          Không tải được dữ liệu dashboard từ API. Hãy kiểm tra backend và thử tải lại trang.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Chào mừng trở lại, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Đây là tổng quan về các dự án và task của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <dt>
              <div className={`absolute ${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </Link>
        ))}
      </div>

      {/* Task Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Phân phối trạng thái task
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Chờ thực hiện</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.pendingTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Đang thực hiện</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.inProgressTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Hoàn thành</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.completedTasks}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-500 via-blue-500 to-green-500 h-2 rounded-full"
                style={{
                  width: `${(stats.completedTasks / stats.totalTasks) * 100}%`
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% hoàn thành
            </p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Hoạt động gần đây
            </h3>
            <Link
              to="/activities"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Xem tất cả
            </Link>
          </div>
          
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {activities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`${activity.color} h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}>
                          <activity.icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900">{activity.message}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thao tác nhanh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FolderIcon className="h-5 w-5 mr-2" />
            Tạo dự án mới
          </Link>
          <Link
            to="/tasks/new"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            Tạo task mới
          </Link>
          <Link
            to="/reports"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Xem báo cáo
          </Link>
          <Link
            to="/users"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Quản lý thành viên
          </Link>
        </div>
      </div>
    </div>
  );
}