import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  UsersIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  PlayIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { projectAPI, userAPI, taskAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    activeProjects: 0,
    totalMembers: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading admin dashboard data...');

      // Fetch all projects for admin overview
      const projectsRes = await projectAPI.getAllProjects();
      const allProjects = projectsRes.data || [];
      setRecentProjects(allProjects.slice(0, 5)); // Show 5 most recent

      // Calculate project stats
      const totalProjects = allProjects.length;
      const activeProjects = allProjects.filter(p => p.status === 'active').length;

      // Fetch all users
      const usersRes = await userAPI.getUsers({ limit: 1000 });
      const allUsers = usersRes.data || [];
      const totalUsers = allUsers.length;

      // Calculate total tasks and members from all projects
      let totalTasks = 0;
      let totalMembers = 0;
      
      for (const project of allProjects.slice(0, 10)) { // Limit to first 10 for performance
        totalTasks += project.taskCount || 0;
        totalMembers += project.memberCount || 0;
      }

      setStats({
        totalUsers,
        totalProjects,
        totalTasks,
        activeProjects,
        totalMembers,
      });

      console.log('✅ Admin dashboard data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error fetching admin dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-blue-600',
      href: '/admin/users',
    },
    {
      name: 'Tổng dự án',
      value: stats.totalProjects,
      icon: FolderIcon,
      color: 'bg-green-600',
      href: '/admin/projects',
    },
    {
      name: 'Dự án hoạt động',
      value: stats.activeProjects,
      icon: PlayIcon,
      color: 'bg-purple-600',
      href: '/admin/projects',
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
        <h1 className="text-3xl font-bold text-gray-900">Thống kê ADMIN</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tổng quan hệ thống TaskHub
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
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
            </dd>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Projects */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Dự án gần đây
              </h3>
              <Link
                to="/admin/projects"
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-3">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <FolderIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <Link
                          to={`/admin/projects/${project.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-red-600"
                        >
                          {project.name}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {project.memberCount} thành viên • {project.taskCount} task
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'active' ? 'Hoạt động' : project.status}
                      </span>
                      {project.endDate && (
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          {new Date(project.endDate).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có dự án</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Hệ thống chưa có dự án nào được tạo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Tổng quan hệ thống
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900">Người dùng hoạt động</p>
                    <p className="text-xs text-blue-700">Tổng người dùng trong hệ thống</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {stats.totalUsers}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">Dự án hoạt động</p>
                    <p className="text-xs text-green-700">
                      {stats.activeProjects} / {stats.totalProjects} dự án
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {Math.round((stats.activeProjects / Math.max(stats.totalProjects, 1)) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}