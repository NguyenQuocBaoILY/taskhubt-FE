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
  ClipboardDocumentListIcon,
  UserPlusIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { projectAPI, taskAPI, adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import ProjectModal from '../../components/ProjectModal';
import TaskModal from '../../components/TaskModal';
import AddMemberModal from '../components/AddMemberModal';

const statusConfig = {
  active: { label: 'Đang thực hiện', color: 'bg-green-100 text-green-800' },
  planning: { label: 'Lên kế hoạch', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-800' },
  onhold: { label: 'Tạm dừng', color: 'bg-gray-100 text-gray-800' },
};

export default function AdminProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log('🔍 AdminProjectDetail loaded with ID:', id);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProjectMembers, setUserProjectMembers] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Get current user info for admin
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    setCurrentUser(userInfo);
    
    const fetchProjectDetail = async () => {
      try {
        console.log('📁 Admin loading project details from API...');
        
        // Load project details
        const projectRes = await projectAPI.getProject(id);
        const project = projectRes.data;
        setProject(project);
        
        // Also load members for overview stats and permission checking
        const membersRes = await projectAPI.getProjectMembers(id);
        const members = membersRes.data || [];
        setMembers(members);
        
        // Store members for permission checking
        setUserProjectMembers({ [id]: members });
        
        console.log('✅ Admin project details and members loaded from API');
      } catch (error) {
        console.error('❌ Lỗi tải chi tiết dự án:', error);
        toast.error('Không thể tải thông tin dự án.');
        // Navigate back to admin projects list on error
        navigate('/admin/projects');
      }
    };

    if (id) {
      fetchProjectDetail();
    }
  }, [id, navigate]);

  // Permission checking functions
  const isUserManagerOfProject = (projectId) => {
    if (!currentUser || !userProjectMembers[projectId]) return true; // Admin can do everything
    const userId = currentUser.userId || currentUser.id;
    const member = userProjectMembers[projectId].find(m => m.userId === userId);
    return member?.role === 'manager' || true; // Admin override
  };

  const canManageTasks = () => {
    // Admin can always manage tasks, or if user is manager of this project
    return true; // Admin has full access
  };

  // Load members for the project
  const fetchProjectMembers = useCallback(async () => {
    try {
      console.log('👥 Admin loading project members...');
      const membersRes = await projectAPI.getProjectMembers(id);
      const members = membersRes.data || [];
      setMembers(members);
      console.log('✅ Admin members loaded:', members.length);
    } catch (error) {
      console.warn('⚠️ Cannot load members from API:', error.message);
      setMembers([]); // Set empty array instead of mock data
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'members' && id) {
      fetchProjectMembers();
    }
  }, [activeTab, id, fetchProjectMembers]);

  // Load tasks only when tasks tab is active to avoid unnecessary API calls
  const fetchProjectTasks = useCallback(async () => {
    try {
      console.log('📋 Admin loading project tasks...');
      console.log('📋 Project ID:', id);
      
      // Get current user info for admin
      const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = currentUser.userId || currentUser.id;
      
      console.log('📋 Current user:', { userId, currentUser });
      
      if (!userId) {
        console.warn('⚠️ No userId found in localStorage');
        setTasks([]);
        return;
      }
      
      // Use taskAPI with proper parameters as per API documentation
      // GET /api/task?projectId={projectId}&userId={userId}
      console.log('📋 Calling taskAPI.getProjectTasks with:', { projectId: id, userId });
      const tasksRes = await taskAPI.getProjectTasks(id, userId);
      
      const tasks = tasksRes.data || [];
      setTasks(tasks);
      console.log('✅ Admin tasks loaded:', tasks.length, 'tasks');
      console.log('📋 Sample task:', tasks[0]);
    } catch (error) {
      console.error('❌ Error loading tasks from API:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      setTasks([]); // Set empty array instead of mock data
      
      // Show error message for non-403 errors (403 might be expected for some users)
      if (error.response?.status !== 403) {
        toast.error('Không thể tải danh sách task.');
      } else {
        console.warn('⚠️ 403 error - user may not have permission to view tasks');
      }
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'tasks' && id) {
      fetchProjectTasks();
    }
  }, [activeTab, id, fetchProjectTasks]);

  const handleUpdateProject = async (projectData) => {
    try {
      console.log('📝 Admin updating project:', projectData);
      console.log('📝 Current project object:', project);
      
      // Use projectId if available, fallback to id
      const projectIdToUse = project.projectId || project.id || id;
      console.log('📝 Using projectId:', projectIdToUse);
      
      // Transform the form data to API format with ALL existing project data
      const apiData = {
        name: projectData.nameProject || projectData.name,
        description: projectData.descriptionP || projectData.description,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        // Preserve ALL existing project data
        ownerUserId: project.ownerUserId,
        taskCount: project.taskCount || 0,
        memberCount: project.memberCount || 0,
        createdAt: project.createdAt,
        projectId: projectIdToUse,
        // Include DynamoDB keys from existing project
        pk: project.pk,
        sk: project.sk,
        gsI4PK: project.gsI4PK,
        gsI4SK: project.gsI4SK
      };
      
      console.log('📝 Transformed API data:', apiData);
      
      await projectAPI.updateProject(projectIdToUse, apiData);
      
      // Refresh project data
      const projectRes = await projectAPI.getProject(id);
      setProject(projectRes.data);
      setShowEditModal(false);
      toast.success('Cập nhật dự án thành công!');
    } catch (error) {
      console.error('❌ Error updating project:', error);
      toast.error('Không thể cập nhật dự án. Vui lòng thử lại.');
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác.')) {
      try {
        console.log('🗑️ Admin deleting project:', project.id);
        await projectAPI.deleteProject(project.id);
        toast.success('Xóa dự án thành công!');
        navigate('/admin/projects');
      } catch (error) {
        console.error('❌ Error deleting project:', error);
        toast.error('Không thể xóa dự án. Vui lòng thử lại.');
      }
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      console.log('📝 Admin creating task:', taskData);
      
      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = currentUser.userId || currentUser.id;
      
      console.log('📝 Creating task with:', { projectId: project.id, userId, taskData });
      
      // Ensure required fields for the task
      const taskPayload = {
        ...taskData,
        projectId: project.id,
        userId: userId,
        assignee: taskData.assignee || userId // Default to current user if no assignee
      };
      
      console.log('📝 Final task payload:', taskPayload);
      
      // Use taskAPI.createTask which posts to /api/task
      await taskAPI.createTask(taskPayload);
      
      // Refresh tasks list
      fetchProjectTasks();
      setShowTaskModal(false);
      toast.success('Tạo task thành công!');
      console.log('✅ Task created successfully');
    } catch (error) {
      console.error('❌ Error creating task:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      toast.error('Không thể tạo task. Vui lòng thử lại.');
    }
  };

  const handleEditTask = async (task) => {
    // Set selected task for editing
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCreateNewTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleTaskModalSubmit = async (taskData) => {
    if (selectedTask) {
      // Update existing task
      await handleUpdateTask(taskData);
    } else {
      // Create new task
      await handleCreateTask(taskData);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      console.log('📝 Admin updating task:', taskData);
      console.log('📝 Selected task:', selectedTask);
      
      const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = currentUser.userId || currentUser.id;
      const taskId = selectedTask.taskId || selectedTask.id;
      
      console.log('📝 Update params:', { taskId, projectId: project.id, userId });
      
      // Use taskAPI to update
      await taskAPI.updateTask(taskId, project.id, userId, taskData);
      
      // Refresh tasks list
      fetchProjectTasks();
      setShowTaskModal(false);
      setSelectedTask(null);
      toast.success('Cập nhật task thành công!');
      console.log('✅ Task updated successfully');
    } catch (error) {
      console.error('❌ Error updating task:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      toast.error('Không thể cập nhật task. Vui lòng thử lại.');
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Bạn có chắc muốn xóa task "${task.title}"?`)) {
      return;
    }

    try {
      console.log('🗑️ Admin deleting task:', task);
      
      const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = currentUser.userId || currentUser.id;
      const taskId = task.taskId || task.id;
      
      console.log('🗑️ Delete params:', { taskId, projectId: project.id, userId });
      
      // Use taskAPI to delete
      await taskAPI.deleteTask(taskId, project.id, userId);
      
      // Refresh tasks list
      fetchProjectTasks();
      toast.success('Đã xóa task thành công!');
      console.log('✅ Task deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      toast.error('Không thể xóa task. Vui lòng thử lại.');
    }
  };

  const handleMemberAdded = async () => {
    try {
      console.log('🔄 Refreshing project data after member added...');
      const projectRes = await projectAPI.getProject(id);
      setProject(projectRes.data);
      // Refresh members list immediately
      await fetchProjectMembers();
      console.log('✅ Project data and members refreshed');
    } catch (error) {
      console.error('❌ Error refreshing project:', error);
      toast.error('Không thể tải lại thông tin dự án');
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      console.log('🔄 Updating member role...', { memberId, newRole });
      await projectAPI.updateMemberRole(id, memberId, { role: newRole });
      
      // Refresh members list to show updated role
      await fetchProjectMembers();
      toast.success('Cập nhật vai trò thành công');
      console.log('✅ Member role updated successfully');
    } catch (error) {
      console.error('❌ Error updating member role:', error);
      toast.error('Không thể cập nhật vai trò');
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${memberName} khỏi dự án này?`)) {
      return;
    }

    try {
      console.log('🔄 Removing member...', { memberId, memberName });
      await projectAPI.removeProjectMember(id, memberId);
      
      // Refresh members list and project data
      await fetchProjectMembers();
      const projectRes = await projectAPI.getProject(id);
      setProject(projectRes.data);
      
      toast.success('Đã xóa thành viên khỏi dự án');
      console.log('✅ Member removed successfully');
    } catch (error) {
      console.error('❌ Error removing member:', error);
      toast.error('Không thể xóa thành viên');
    }
  };

  const getProgressPercentage = () => {
    // Since API doesn't provide task status breakdown, return 0% for now
    return 0;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (!project) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900">Đang tải dự án...</h2>
        <p className="mt-2 text-gray-600">Project ID: {id}</p>
        <Link
          to="/admin/projects"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
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
                  <Link to="/admin/projects" className="text-gray-500 hover:text-gray-700">
                    Quản lý dự án
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li className="text-gray-900 font-medium">{project.name}</li>
              </ol>
            </nav>

            {/* Project Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin/projects"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FolderIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Xóa dự án
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Thành viên ({members.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500 truncate">Tổng Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{project.taskCount || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500 truncate">Hoàn thành</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500 truncate">Đang thực hiện</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500 truncate">Thành viên</p>
                    <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress and Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tiến độ dự án</h3>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Hoàn thành</span>
                    <span className="text-sm text-gray-600">{getProgressPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {getProgressPercentage()}% hoàn thành (0/{project.taskCount || 0} tasks)
                </p>
              </div>

              {/* Project Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Project Lead:</dt>
                    <dd className="text-sm text-gray-900">
                      {(() => {
                        // Find manager from members list
                        const manager = members.find(member => member.role === 'manager');
                        if (manager) {
                          return manager.name || manager.email || 'Manager';
                        }
                        // Fallback to project lead if available
                        if (project.lead?.name) {
                          return project.lead.name;
                        }
                        return 'Chưa gán';
                      })()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Ngày tạo:</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Ngày bắt đầu:</dt>
                    <dd className="text-sm text-gray-900">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Ngày kết thúc:</dt>
                    <dd className="text-sm text-gray-900">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Trạng thái:</dt>
                    <dd>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[project.status || 'active'].color}`}>
                        {statusConfig[project.status || 'active'].label}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                {canManageTasks() && (
                  <button
                    onClick={handleCreateNewTask}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Tạo Task
                  </button>
                )}
              </div>
              
              {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có task</h3>
                  </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id || task.taskId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                          {task.assignee && (
                            <p className="text-xs text-gray-400 mt-1">Phân công: {task.assignee}</p>
                          )}
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.priority === 'high' || task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                          {task.dueDate && isOverdue(task.dueDate) && (
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                          )}
                          
                          {/* Admin action buttons */}
                          {canManageTasks() && (
                            <div className="flex items-center space-x-1 ml-2">
                              <button
                                onClick={() => handleEditTask(task)}
                                className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded"
                                title="Chỉnh sửa task"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task)}
                                className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded"
                                title="Xóa task"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Thành viên ({members.length})
                </h3>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Thêm thành viên
                </button>
              </div>
              
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
                      <div className="flex flex-col items-end space-y-2">
                        {/* Role Display */}
                        <span className="text-sm font-medium text-gray-900 capitalize">{member.role}</span>
                        
                        {/* Status Badge */}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status || 'ACTIVE'}
                        </span>
                        
                        {/* Project Manager Badge */}
                        {member.role === 'manager' && (
                          <p className="text-xs text-red-600 font-medium">Project Manager</p>
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
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        onSubmit={handleTaskModalSubmit}
        task={selectedTask}
        project={project}
      />

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        projectId={project?.id}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  );
}