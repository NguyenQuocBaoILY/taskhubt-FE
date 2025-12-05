import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  FolderIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '../hooks/useContext';
import ProjectModal from '../components/ProjectModal';
import TaskModal from '../components/TaskModal';
import { projectAPI, taskAPI, enrichTasksWithAssigneeNames } from '../services/api';
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

const taskStatusConfig = {
  'not-started': { label: 'Chưa bắt đầu', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: ClockIcon },
  'in-progress': { label: 'Đang thực hiện', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: ChartBarIcon },
  'completed': { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircleIcon },
  'pending': { label: 'Chờ thực hiện', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: ClockIcon },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentProject } = useApp();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isProjectManager, setIsProjectManager] = useState(false);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        setLoading(true);
        console.log('📁 Loading project details from API for project ID:', id);
        
        // Validate project ID
        if (!id) {
          console.error('❌ No project ID provided');
          toast.error('ID dự án không hợp lệ');
          navigate('/projects');
          return;
        }
        
        // Get current user info
        const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
        const userId = currentUser.userId || currentUser.id;
        
        // Load project details
        const projectRes = await projectAPI.getProject(id);
        const project = projectRes.data;
        console.log('📊 Project data received:', project);
        setProject(project);
        
        // Load project members for display
        try {
          const membersRes = await projectAPI.getProjectMembers(id);
          const members = membersRes.data || [];
          setMembers(members);
          
          // Check if current user is project manager
          if (userId) {
            const currentUserMembership = members.find(member => member.userId === userId);
            const isManager = currentUserMembership && currentUserMembership.role === 'manager';
            setIsProjectManager(isManager);
            console.log('👤 Current user manager status:', isManager, 'User role:', currentUserMembership?.role);
          } else {
            setIsProjectManager(false);
          }
          
          console.log('✅ Members loaded successfully:', members.length, members);
        } catch (memberError) {
          console.warn('⚠️ Failed to load project members:', memberError.message);
          setMembers([]); // Set empty array if members fail to load
          setIsProjectManager(false);
        }
        
        console.log('✅ Project details and members loaded from API');
      } catch (error) {
        console.error('❌ Lỗi tải chi tiết dự án:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        let errorMessage = 'Không thể tải thông tin dự án.';
        if (error.response?.status === 404) {
          errorMessage = 'Dự án không tồn tại hoặc bạn không có quyền truy cập.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập dự án này.';
        }
        
        toast.error(errorMessage);
        // Navigate back to projects list on error
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetail();
    }
  }, [id, navigate]);

  // Separate effect for setting current project to avoid infinite loop
  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);

  // Load tasks only when tasks tab is active to avoid unnecessary API calls
  const fetchProjectTasks = useCallback(async () => {
    try {
      console.log('📋 Loading project tasks...');
      
      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = currentUser.userId || currentUser.id;
      
      if (!userId) {
        console.warn('⚠️ No userId found in localStorage');
        setTasks([]);
        return;
      }
      
      const tasksRes = await taskAPI.getProjectTasks(id, userId);
      const rawTasks = tasksRes.data || [];
      
      // Enrich tasks with assignee names
      const enrichedTasks = await enrichTasksWithAssigneeNames(rawTasks);
      setTasks(enrichedTasks);
      console.log('✅ Tasks loaded with assignee names:', enrichedTasks.length);
    } catch (error) {
      console.warn('⚠️ Cannot load tasks from API:', error.message);
      setTasks([]); // Set empty array instead of mock data
      toast.error('Không thể tải danh sách task.');
    }
  }, [id]);

  // Load tasks when component mounts to show statistics immediately
  useEffect(() => {
    if (id) {
      fetchProjectTasks();
    }
  }, [id, fetchProjectTasks]);

  const handleUpdateProject = async (projectData) => {
    try {
      console.log('📝 Updating project via API...');
      const res = await projectAPI.updateProject(id, projectData);
      const updatedProject = res.data;
      
      setProject(updatedProject);
      setCurrentProject(updatedProject);
      toast.success('Cập nhật dự án thành công!');
      setShowEditModal(false);
    } catch (error) {
      console.error('❌ Lỗi cập nhật dự án:', error);
      toast.error('Không thể cập nhật dự án. Vui lòng thử lại.');
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      console.log('📝 Creating task via API...');
      // Current user info
      const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = currentUser.userId || currentUser.id;
      
      // Call createTask with correct parameter order: (taskData, projectId, userId)
      const res = await taskAPI.createTask(taskData, id, userId);
      const newTask = res.data;
      
      console.log('✅ Task created successfully:', newTask);
      toast.success('Tạo task thành công!');
      setShowTaskModal(false);
      
      // Refresh tasks list to show new task
      await fetchProjectTasks();
    } catch (error) {
      console.error('❌ Lỗi tạo task:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Không thể tạo task. Vui lòng thử lại.');
      throw error; // Re-throw để TaskModal có thể handle
    }
  };

  const getProgressPercentage = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Calculate task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const notStarted = tasks.filter(task => task.status === 'not-started' || !task.status).length;
    
    return { total, completed, inProgress, notStarted };
  };

  const taskStats = getTaskStats();

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-slate-200 border-t-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải thông tin dự án...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md">
          <div className="p-4 bg-white rounded-2xl w-fit mx-auto mb-6 shadow-lg">
            <FolderIcon className="h-12 w-12 text-slate-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Không tìm thấy dự án</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">Dự án không tồn tại hoặc bạn không có quyền truy cập.</p>
          <Link
            to="/projects"
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-slate-800 hover:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại danh sách dự án
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 space-y-8">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
        <div className="relative">
          {/* Breadcrumb */}
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li>
                <Link to="/projects" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                  Dự án
                </Link>
              </li>
              <li>
                <span className="text-slate-400">/</span>
              </li>
              <li className="text-white font-semibold text-sm">{project.name}</li>
            </ol>
          </nav>

          {/* Project Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/projects')}
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <FolderIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-slate-300 text-sm font-medium">{project.key}</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/10 backdrop-blur-sm ${
                        project.status === 'active' ? 'text-emerald-300 border-emerald-300/50' : 'text-slate-300 border-slate-300/50'
                      }`}
                    >
                      {statusConfig[project.status]?.label || project.status || 'Không xác định'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {isProjectManager && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-semibold text-white hover:bg-white/20 transition-all duration-200 shadow-lg"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Tạo task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
        <nav className="flex space-x-6 px-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'tasks'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'team'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Thành viên ({members.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        {activeTab === 'overview' && (
          <div className="p-5">
            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="group bg-white border border-slate-200/60 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <ArrowTrendingUpIcon className="h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Tổng tasks</p>
                <p className="text-3xl font-bold text-slate-900">{taskStats.total}</p>
              </div>

              <div className="group bg-white border border-slate-200/60 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Hoàn thành</p>
                <p className="text-3xl font-bold text-slate-900">{taskStats.completed}</p>
              </div>

              <div className="group bg-white border border-slate-200/60 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                    <ClockIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <ArrowTrendingUpIcon className="h-4 w-4 text-orange-400 group-hover:text-orange-600 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Đang làm</p>
                <p className="text-3xl font-bold text-slate-900">{taskStats.inProgress}</p>
              </div>

              <div className="group bg-white border border-slate-200/60 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <UserGroupIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <ArrowTrendingUpIcon className="h-4 w-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Thành viên</p>
                <p className="text-3xl font-bold text-slate-900">{members.length}</p>
              </div>
            </div>

            {/* Project Progress */}
            <div className="bg-white border border-slate-200/60 rounded-lg p-5 mb-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-slate-500/10 rounded-lg">
                  <SparklesIcon className="h-4 w-4 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Tiến độ dự án</h3>
              </div>
              <div className="bg-slate-50/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-700">Tiến độ tổng thể</span>
                  <span className="text-lg font-bold text-slate-900">{getProgressPercentage()}%</span>
                </div>
                <div className="bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-slate-600 to-slate-700 h-2 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600 mt-4 font-medium">
                  {getProgressPercentage()}% hoàn thành ({taskStats.completed}/{taskStats.total} tasks)
                </p>
              </div>
            </div>

            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Description */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-lg shadow-slate-200/50">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Mô tả dự án</h3>
                <p className="text-slate-700 leading-relaxed">{project.description}</p>
              </div>

              {/* Details */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-lg shadow-slate-200/50">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Thông tin</h3>
                <dl className="space-y-4">
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-semibold text-slate-600">Project Lead:</dt>
                    <dd className="text-sm font-medium text-slate-900">{project.lead?.name || 'Chưa gán'}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-semibold text-slate-600">Ngày tạo:</dt>
                    <dd className="text-sm font-medium text-slate-900">
                      {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-semibold text-slate-600">Ngày kết thúc:</dt>
                    <dd className={`text-sm font-semibold ${
                      isOverdue(project.deadline) ? 'text-red-600' : 'text-slate-900'
                    }`}>
                      {new Date(project.deadline).toLocaleDateString('vi-VN')}
                      {isOverdue(project.deadline) && (
                        <span className="ml-2 text-red-500">(Quá hạn)</span>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-semibold text-slate-600">Cập nhật lần cuối:</dt>
                    <dd className="text-sm font-medium text-slate-900">
                      {new Date(project.updatedAt).toLocaleDateString('vi-VN')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="p-5">
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.taskId || task.id || Math.random()}
                  onClick={() => {
                    console.log('🎯 Task clicked:', task);
                    navigate(`/tasks/${task.taskId || task.id}?projectId=${project.projectId || project.id}`);
                  }}
                  className="group bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <ClockIcon className="h-4 w-4 text-slate-700" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900 group-hover:text-slate-800 transition-colors mb-1">
                            {task.title}
                          </h4>
                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                              taskStatusConfig[task.status]?.color || 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {taskStatusConfig[task.status]?.label || task.status || 'Không xác định'}
                          </span>
                          <span className={`text-sm font-semibold ${
                            priorityConfig[task.priority]?.color || 'text-slate-600'
                          }`}>
                            {priorityConfig[task.priority]?.label || task.priority || 'Trung bình'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-slate-500">
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="h-4 w-4" />
                          <span className="font-medium">
                            Giao cho: <span className="text-slate-700">{task.assigneeName || task.assignee || 'Chưa phân công'}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarDaysIcon className="h-4 w-4" />
                          <span className="font-medium">
                            Hạn: <span className="text-slate-700">
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Chưa có hạn'}
                            </span>
                            {task.dueDate && isOverdue(task.dueDate) && task.status !== 'completed' && (
                              <ExclamationTriangleIcon className="inline h-4 w-4 text-red-500 ml-1" />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="text-center py-16">
                  <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-6">
                    <ClockIcon className="h-12 w-12 text-slate-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Chưa có task nào</h3>
                 
                  {isProjectManager && (
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-slate-800 hover:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Tạo task đầu tiên
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="p-5">
            <div className="space-y-4">
              {(members && members.length > 0) ? members.map((member) => (
                <div
                  key={member.id}
                  className="bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-sm font-bold text-slate-700">
                          {member.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">
                          {member.name || 'Unknown User'}
                        </h4>
                        <p className="text-sm text-slate-600 mb-1">
                          {member.email || 'No email provided'}
                        </p>
                        {member.joinedAt && (
                          <p className="text-xs text-slate-500">
                            Tham gia: {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end space-y-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 capitalize">
                          {member.role}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          member.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {member.status || 'ACTIVE'}
                        </span>
                        {member.role === 'manager' && (
                          <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                            Project Manager
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16">
                  <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-6">
                    <UserGroupIcon className="h-12 w-12 text-slate-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Chưa có thành viên</h3>
                  <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                    Dự án này chưa có thành viên nào được thêm vào.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateProject}
        project={project}
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
        project={project}
      />
    </div>
  );
}