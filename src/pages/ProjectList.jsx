import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  FolderIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '../hooks/useContext';
import { projectAPI, taskAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const statusConfig = {
  active: { label: 'Đang thực hiện', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  planning: { label: 'Lên kế hoạch', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Hoàn thành', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  onhold: { label: 'Tạm dừng', color: 'bg-slate-50 text-slate-700 border-slate-200' },
};

const priorityConfig = {
  high: { label: 'Cao', color: 'text-red-600' },
  medium: { label: 'Trung bình', color: 'text-amber-600' },
  low: { label: 'Thấp', color: 'text-emerald-600' },
};

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const { setCurrentProject } = useApp();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      console.log('📁 Loading projects from API...');
      
      // Get userId from stored user info
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      // Try multiple field names for userId
      const userId = userInfo.userId || userInfo.id || userInfo.user_id;
      
      console.log('👤 ProjectList - User info:', userInfo);
      console.log('🆔 ProjectList - Extracted userId:', userId);
      
      if (!userId) {
        console.error('❌ ProjectList - No userId found in user_info:', userInfo);
        // Try to get user ID from other localStorage keys as fallback
        const userName = localStorage.getItem('user_name');
        const userEmail = localStorage.getItem('user_email');
        console.log('🔄 ProjectList Fallback - userName:', userName, 'userEmail:', userEmail);
        throw new Error('No userId found in user_info');
      }
      
      const res = await projectAPI.getUserProjects(userId);
      const projects = res.data || [];
      
      // Fetch task statistics for each project
      const projectsWithStats = await Promise.all(
        projects.map(async (project) => {
          try {
            const tasksRes = await taskAPI.getProjectTasks(project.projectId || project.id, userId);
            const tasks = tasksRes.data || [];
            
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
            
            return {
              ...project,
              taskCount: tasks.length,
              completedTasks,
              inProgressTasks
            };
          } catch (error) {
            console.warn('Cannot fetch tasks for project', project.id, error);
            return {
              ...project,
              taskCount: 0,
              completedTasks: 0,
              inProgressTasks: 0
            };
          }
        })
      );
      
      setProjects(projectsWithStats);
      console.log('✅ Projects loaded with task stats:', projectsWithStats.length);
    } catch (error) {
      console.error('❌ Lỗi tải danh sách dự án:', error);
      // Set empty array on error
      setProjects([]);
      toast.error('Không thể tải danh sách dự án. Vui lòng thử lại.');
    }
  };

  // Load projects from API when component mounts
  useEffect(() => {
    // Get userId from stored user info
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const userId = userInfo.userId;
    
    if (userId) {
      fetchProjects();
    } else {
      console.warn('⚠️ No userId found in user_info');
      toast.error('Vui lòng đăng nhập lại để xem dự án.');
    }
  }, []);

  const filterProjects = useCallback(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    filterProjects();
  }, [filterProjects]);

  const handleProjectClick = (project) => {
    console.log('🔗 Navigating to project:', project);
    console.log('🔗 Project ID:', project.id, 'Type:', typeof project.id);
    console.log('🔗 Project projectId:', project.projectId, 'Type:', typeof project.projectId);
    
    setCurrentProject(project);
    
    // Use projectId if available, fallback to id
    const projectId = project.projectId || project.id;
    console.log('🔗 Using project ID for navigation:', projectId);
    
    navigate(`/projects/${projectId}`);
  };

  const getProgressPercentage = (project) => {
    // Add null/undefined check
    if (!project) return 0;
    
    // Calculate progress based on project task stats if available
    const totalTasks = project.taskCount || 0;
    const completedTasks = project.completedTasks || 0;
    
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 space-y-8">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
        <div className="flex items-center justify-between relative">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <FolderIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Dự án</h1>
              <p className="text-slate-300 text-sm font-medium">
                Quản lý và theo dõi tất cả dự án của bạn
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ArrowTrendingUpIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-200 focus:border-slate-400 bg-slate-50 focus:bg-white transition-all min-w-[140px]"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-200 focus:border-slate-400 bg-slate-50 focus:bg-white transition-all min-w-[140px]"
            >
              <option value="">Tất cả mức độ</option>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4 mr-2" />
              Lưới
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListBulletIcon className="h-4 w-4 mr-2" />
              Danh sách
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm font-medium text-slate-600">
          Hiển thị <span className="text-slate-900">{filteredProjects.length}</span> trong số <span className="text-slate-900">{projects.length}</span> dự án
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.filter(Boolean).map((project) => project && (
            <div
              key={project.id || project.projectId}
              onClick={() => handleProjectClick(project)}
              className="group bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
                      <FolderIcon className="h-6 w-6 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm font-medium text-slate-500">{project.key}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      statusConfig[project.status]?.color || 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {statusConfig[project.status]?.label || project.status || 'Không xác định'}
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                  {project.description}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-slate-700">Tiến độ</span>
                    <span className="text-sm font-bold text-slate-900">
                      {getProgressPercentage(project)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-slate-700 to-slate-800 h-2 rounded-full transition-all duration-500 group-hover:from-slate-600 group-hover:to-slate-700"
                      style={{ width: `${getProgressPercentage(project)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900">
                      {project.taskCount || 0}
                    </div>
                    <div className="text-xs font-medium text-slate-500">Tổng task</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600">
                      {project.completedTasks || 0}
                    </div>
                    <div className="text-xs font-medium text-slate-500">Hoàn thành</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {project.inProgressTasks || 0}
                    </div>
                    <div className="text-xs font-medium text-slate-500">Đang làm</div>
                  </div>
                </div>

                {/* Team and Deadline */}
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-4 w-4" />
                    <span className="font-medium">
                      {project.memberCount || 0} thành viên
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span className="font-medium">
                      {new Date(project.deadline).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-slate-700">
                        {project.lead?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{project.lead?.name || 'Chưa gán'}</span>
                  </div>
                  <span className={`text-sm font-semibold ${(priorityConfig[project.priority] || priorityConfig.medium).color}`}>
                    {(priorityConfig[project.priority] || priorityConfig.medium).label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredProjects.filter(Boolean).map((project) => project && (
              <div
                key={project.id || project.projectId}
                onClick={() => handleProjectClick(project)}
                className="group px-6 py-5 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
                      <FolderIcon className="h-6 w-6 text-slate-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                          {project.name}
                        </h3>
                        <span className="text-sm font-medium text-slate-500">({project.key})</span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            statusConfig[project.status]?.color || 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {statusConfig[project.status]?.label || project.status || 'Không xác định'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    {/* Progress */}
                    <div className="flex items-center space-x-3 min-w-[120px]">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-slate-700 h-2 rounded-full transition-all"
                          style={{ width: `${getProgressPercentage(project)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700 min-w-[35px]">
                        {getProgressPercentage(project)}%
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="text-sm text-slate-600 text-center min-w-[80px]">
                      <div className="font-semibold text-slate-900">{project.taskCount || 0} tasks</div>
                      <div className="text-xs text-slate-500">
                        {project.memberCount || 0} thành viên
                      </div>
                    </div>

                    {/* Lead */}
                    <div className="flex items-center space-x-3 min-w-[100px]">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-700">
                          {project.lead?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-700 hidden lg:block">
                        {project.lead?.name || 'Chưa gán'}
                      </span>
                    </div>

                    {/* Priority */}
                    <span className={`text-sm font-semibold min-w-[80px] text-center ${
                      (priorityConfig[project.priority] || priorityConfig.medium).color
                    }`}>
                      {(priorityConfig[project.priority] || priorityConfig.medium).label}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 text-center py-16 px-6">
          <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-6">
            <FolderIcon className="h-12 w-12 text-slate-400 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Không có dự án nào</h3>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            {searchTerm || statusFilter || priorityFilter
              ? 'Không tìm thấy dự án nào phù hợp với bộ lọc.'
              : 'Liên hệ với quản trị viên để tạo dự án mới.'}
          </p>
        </div>
      )}
    </div>
  );
}