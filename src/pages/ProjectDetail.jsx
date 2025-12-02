import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FolderIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '../hooks/useContext';
import ProjectModal from '../components/ProjectModal';
import TaskModal from '../components/TaskModal';
import { projectAPI, taskAPI, enrichTasksWithAssigneeNames } from '../services/api';
import toast from 'react-hot-toast';

const statusConfig = {
  active: { label: 'Đang thực hiện', color: 'bg-green-100 text-green-800' },
  planning: { label: 'Lên kế hoạch', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-800' },
  onhold: { label: 'Tạm dừng', color: 'bg-gray-100 text-gray-800' },
};

const priorityConfig = {
  high: { label: 'Cao', color: 'text-red-600' },
  medium: { label: 'Trung bình', color: 'text-yellow-600' },
  low: { label: 'Thấp', color: 'text-green-600' },
};

const taskStatusConfig = {
  'not-started': { label: 'Chưa bắt đầu', color: 'bg-gray-100 text-gray-800', icon: ClockIcon },
  'in-progress': { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800', icon: ChartBarIcon },
  'completed': { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  // Legacy support
  'pending': { label: 'Chờ thực hiện', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
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
          console.log('✅ Members loaded successfully:', members.length, members);
        } catch (memberError) {
          console.warn('⚠️ Failed to load project members:', memberError.message);
          setMembers([]); // Set empty array if members fail to load
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
      const res = await taskAPI.createTask(id, taskData);
      const newTask = res.data;
      
      setTasks([newTask, ...tasks]);
      toast.success('Tạo task thành công!');
      setShowTaskModal(false);
      
      // Refresh tasks list
      fetchProjectTasks();
    } catch (error) {
      console.error('❌ Lỗi tạo task:', error);
      toast.error('Không thể tạo task. Vui lòng thử lại.');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin dự án...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy dự án</h2>
        <p className="mt-2 text-gray-600">Dự án không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Link
          to="/projects"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Quay lại danh sách dự án
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li>
                  <Link to="/projects" className="text-gray-500 hover:text-gray-700">
                    Dự án
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li className="text-gray-900 font-medium">{project.name}</li>
              </ol>
            </nav>

            {/* Project Header */}
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <button
                    onClick={() => navigate('/projects')}
                    className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FolderIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">{project.key}</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusConfig[project.status]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusConfig[project.status]?.label || project.status || 'Không xác định'}
                        </span>
                        <span className={`text-sm font-medium ${
                          priorityConfig[project.priority]?.color || 'text-gray-600'
                        }`}>
                          Mức độ: {priorityConfig[project.priority]?.label || project.priority || 'Trung bình'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex lg:mt-0 lg:ml-4">
                <Link
                  to={`/projects/${id}/board`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Kanban Board
                </Link>

                <button
                  onClick={() => setShowTaskModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Tạo task
                </button>

                <button
                  onClick={() => setShowEditModal(true)}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'team'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thành viên ({members.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'overview' && (
          <div className="p-6">
            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                    <p className="text-2xl font-bold text-gray-900">{taskStats.completed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đang làm</p>
                    <p className="text-2xl font-bold text-gray-900">{taskStats.inProgress}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Thành viên</p>
                    <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Progress */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tiến độ dự án</h3>
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-primary-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {getProgressPercentage()}% hoàn thành ({taskStats.completed}/{taskStats.total} tasks)
              </p>
            </div>

            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Mô tả dự án</h3>
                <p className="text-gray-600 leading-relaxed">{project.description}</p>
              </div>

              {/* Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Project Lead:</dt>
                    <dd className="text-sm text-gray-900">{project.lead?.name || 'Chưa gán'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Ngày tạo:</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Ngày kết thúc:</dt>
                    <dd className={`text-sm font-medium ${
                      isOverdue(project.deadline) ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {new Date(project.deadline).toLocaleDateString('vi-VN')}
                      {isOverdue(project.deadline) && (
                        <span className="ml-2 text-red-500">(Quá hạn)</span>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Cập nhật lần cuối:</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(project.updatedAt).toLocaleDateString('vi-VN')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="p-6">
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.taskId || task.id || Math.random()}
                  onClick={() => {
                    console.log('🎯 Task clicked:', task);
                    navigate(`/tasks/${task.taskId || task.id}?projectId=${project.projectId || project.id}`);
                  }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            taskStatusConfig[task.status]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {taskStatusConfig[task.status]?.label || task.status || 'Không xác định'}
                        </span>
                        <span className={`text-sm font-medium ${
                          priorityConfig[task.priority]?.color || 'text-gray-600'
                        }`}>
                          {priorityConfig[task.priority]?.label || task.priority || 'Trung bình'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="h-3 w-3" />
                          <span>Giao cho: {task.assigneeName || task.assignee || 'Chưa phân công'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="h-3 w-3" />
                          <span>
                            Hạn: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Chưa có hạn'}
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
                <div className="text-center py-12">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có task nào</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Bắt đầu bằng cách tạo task đầu tiên cho dự án này.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Tạo task đầu tiên
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="p-6">
            <div className="space-y-4">
              {(members && members.length > 0) ? members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {member.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900">{member.name || 'Unknown'}</h4>
                      <p className="text-sm text-gray-500">{member.email || 'No email'}</p>
                      {member.joinedAt && (
                        <p className="text-xs text-gray-400">
                          Joined: {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-sm font-medium text-gray-900 capitalize">{member.role}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        member.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status || 'ACTIVE'}
                      </span>
                      {members.find(m => m.role === 'manager' && m.userId === member.userId) && (
                        <p className="text-xs text-primary-600 font-medium">Project Manager</p>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có thành viên</h3>
                  <p className="mt-1 text-sm text-gray-500">
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