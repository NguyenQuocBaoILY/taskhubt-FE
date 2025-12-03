import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  PlayIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useContext';
import { projectAPI, taskAPI } from '../services/api';
import { toast } from 'react-hot-toast';

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
      // Try multiple field names for userId
      const userId = userInfo.userId || userInfo.id || userInfo.user_id;
      
      console.log('👤 User info from localStorage:', userInfo);
      console.log('🆔 Extracted userId:', userId);
      
      if (!userId) {
        console.error('❌ No userId found in user_info:', userInfo);
        // Try to get user ID from other localStorage keys as fallback
        const userName = localStorage.getItem('user_name');
        const userEmail = localStorage.getItem('user_email');
        console.log('🔄 Fallback check - userName:', userName, 'userEmail:', userEmail);
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
          // Get current user info
          const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
          const userId = currentUser.userId || currentUser.id;
          
          if (userId) {
            const tasksRes = await taskAPI.getProjectTasks(project.id, userId);
            const tasks = tasksRes.data || [];
            allTasks = [...allTasks, ...tasks.map(task => ({
              ...task,
              projectName: project.name,
              projectId: project.id
            }))];
          }
        } catch (error) {
          console.warn('Cannot load tasks for project', project.id, error.message);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-slate-200 border-t-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 space-y-8">
      {/* Welcome Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">
                  Chào mừng trở lại, {user?.username || 'User'}!
                </h1>
                <p className="text-slate-300 text-sm font-medium">
                  Tổng quan về hiệu suất và tiến độ công việc
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white border border-slate-200/60 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
              <FolderIcon className="h-6 w-6 text-blue-600" />
            </div>
            <ArrowTrendingUpIcon className="h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{stats.totalProjects}</p>
            <p className="text-sm font-semibold text-slate-600">Tổng dự án</p>
            <Link
              to="/projects"
              className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 mt-3 group-hover:translate-x-1 transition-transform"
            >
              Xem tất cả →
            </Link>
          </div>
        </div>

        <div className="group bg-white border border-slate-200/60 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
              <PlayIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{stats.activeProjects}</p>
            <p className="text-sm font-semibold text-slate-600">Đang hoạt động</p>
            <p className="text-xs text-emerald-600 font-medium mt-3">Đang tiến hành</p>
          </div>
        </div>

        <div className="group bg-white border border-slate-200/60 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
              <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" />
            </div>
            <ArrowTrendingUpIcon className="h-4 w-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{stats.totalTasks}</p>
            <p className="text-sm font-semibold text-slate-600">Tổng task</p>
            <p className="text-xs text-purple-600 font-medium mt-3">Được giao</p>
          </div>
        </div>

        <div className="group bg-white border border-slate-200/60 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
              <CheckCircleIcon className="h-6 w-6 text-orange-600" />
            </div>
            <ArrowTrendingUpIcon className="h-4 w-4 text-orange-400 group-hover:text-orange-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{stats.completedTasks}</p>
            <p className="text-sm font-semibold text-slate-600">Hoàn thành</p>
            <p className="text-xs text-orange-600 font-medium mt-3">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% tiến độ
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Projects */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">
                  Dự án gần đây
                </h3>
                <p className="text-sm text-slate-600">Các dự án bạn đang tham gia</p>
              </div>
              <Link
                to="/projects"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-4">
              {projects.length > 0 ? (
                projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="group relative bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl p-4 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer"
                  >
                    <Link to={`/projects/${project.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                            <FolderIcon className="h-5 w-5 text-slate-700" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                              {project.name}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1">
                              {project.memberCount || 0} thành viên • {project.taskCount || 0} task
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
                            project.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {project.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-4">
                    <FolderIcon className="h-8 w-8 text-slate-400 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Chưa có dự án</h3>
                  <p className="text-slate-600 mb-4">
                    Bắt đầu bằng cách tham gia một dự án.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">
                  Task gần đây
                </h3>
                <p className="text-sm text-slate-600">Task được giao cho bạn</p>
              </div>
            </div>
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group relative bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl p-4 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <ClipboardDocumentListIcon className="h-5 w-5 text-slate-700" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 group-hover:text-slate-800 transition-colors mb-1">
                            {task.title || task.name}
                          </h4>
                          <p className="text-sm text-slate-600 mb-2">
                            {task.projectName}
                          </p>
                          {task.dueDate && (
                            <div className="flex items-center text-xs text-slate-500">
                              <CalendarDaysIcon className="h-3 w-3 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
                        task.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : task.status === 'in-progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {getTaskStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-4">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-slate-400 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Chưa có task</h3>
                  <p className="text-slate-600">
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
