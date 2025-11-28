import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    activeProjects: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalUsers: 156,
        totalProjects: 24,
        totalTasks: 342,
        activeProjects: 18,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      name: 'Tổng số người dùng',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Tổng số dự án',
      value: stats.totalProjects,
      icon: FolderIcon,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: 'Tổng số nhiệm vụ',
      value: stats.totalTasks,
      icon: ClipboardDocumentListIcon,
      color: 'bg-yellow-500',
      change: '+23%',
      changeType: 'increase',
    },
    {
      name: 'Dự án đang hoạt động',
      value: stats.activeProjects,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      change: '+5%',
      changeType: 'increase',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tổng quan hệ thống TaskHub
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {item.value.toLocaleString()}
              </p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Hoạt động gần đây
          </h3>
          <div className="mt-5">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                <li className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <UsersIcon className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Người dùng mới đăng ký
                      </p>
                      <p className="text-sm text-gray-500">
                        5 người dùng mới trong 24h qua
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">2h trước</div>
                  </div>
                </li>
                <li className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FolderIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Dự án mới được tạo
                      </p>
                      <p className="text-sm text-gray-500">
                        Project Alpha - Frontend Development
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">4h trước</div>
                  </div>
                </li>
                <li className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <ClipboardDocumentListIcon className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Nhiệm vụ hoàn thành
                      </p>
                      <p className="text-sm text-gray-500">
                        12 nhiệm vụ được hoàn thành hôm nay
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">6h trước</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}