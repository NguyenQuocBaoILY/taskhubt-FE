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
  CalendarDaysIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useContext';
import { projectAPI, taskAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading dashboard data...');
      
      // Get userId from stored user info
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = userInfo.userId;
      
      if (!userId) {
        throw new Error('No userId found in user_info');
      }

      // Fetch user's projects
      const projectsRes = await projectAPI.getUserProjects(userId);
      const userProjects = projectsRes.data || [];
      setProjects(userProjects);

      // Calculate project stats
      const totalProjects = userProjects.length;
      const activeProjects = userProjects.filter(p => p.status === 'active').length;
      
      // Fetch tasks for all projects
      let allTasks = [];
      for (const project of userProjects.slice(0, 3)) { // Limit to first 3 projects for performance
        try {
          const tasksRes = await taskAPI.getProjectTasks(project.id);
          const tasks = tasksRes.data || [];
          allTasks = [...allTasks, ...tasks.map(task => ({
            ...task,
            projectName: project.name,
            projectId: project.id
          }))];
        } catch (error) {
          console.warn(`Cannot load tasks for project ${project.id}`);
        }
      }

      // Sort tasks by creation date and get recent ones
      const sortedTasks = allTasks.sort((a, b) => 
        new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
      );
      setRecentTasks(sortedTasks.slice(0, 5));

      // Calculate task stats
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => 
        task.status === 'completed' || task.status === 'done'
      ).length;

      setStats({
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks
      });

      console.log('✅ Dashboard data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'done':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
      case 'todo':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskStatusLabel = (status) => {
    switch (status) {
      case 'completed':
      case 'done':
        return 'Hoàn thành';
      case 'in-progress':
      case 'active':
        return 'Đang làm';
      case 'pending':
      case 'todo':
        return 'Chờ thực hiện';
      default:
        return status || 'Không xác định';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Chào mừng trở lại, {user?.username || 'User'}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Đây là tổng quan về các dự án và task của bạn.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng dự án
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalProjects}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/projects"
                className="font-medium text-blue-700 hover:text-blue-900"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PlayIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Dự án đang hoạt động
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.activeProjects}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng task
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Task hoàn thành
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.completedTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
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
                to="/projects"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-3">
              {projects.length > 0 ? (
                projects.slice(0, 5).map((project) => (
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
                          to={`/projects/${project.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600"
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
                        {project.status === 'active' ? 'Đang hoạt động' : project.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có dự án</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Bắt đầu bằng cách tham gia một dự án.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Task gần đây
              </h3>
            </div>
            <div className="space-y-3">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {task.title || task.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.projectName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        getTaskStatusColor(task.status)
                      }`}>
                        {getTaskStatusLabel(task.status)}
                      </span>
                      {task.dueDate && (
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có task</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Task sẽ xuất hiện ở đây khi bạn được giao việc.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
