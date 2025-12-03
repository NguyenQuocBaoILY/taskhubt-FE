import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  UserIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { taskAPI, enrichTasksWithAssigneeNames, projectAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import { format, isBefore, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';

const statusConfig = {
  'not-started': { label: 'Chưa bắt đầu', icon: ClockIcon, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  'in-progress': { label: 'Đang thực hiện', icon: ChartBarIcon, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  'completed': { label: 'Hoàn thành', icon: CheckCircleIcon, color: 'text-green-600', bgColor: 'bg-green-100' },
};

const priorityConfig = {
  low: { label: 'Thấp', color: 'text-green-600', bgColor: 'bg-green-100' },
  medium: { label: 'Trung bình', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  high: { label: 'Cao', color: 'text-red-600', bgColor: 'bg-red-100' },
  urgent: { label: 'Khẩn cấp', color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [userProjectMembers, setUserProjectMembers] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  useEffect(() => {
    // Get current user info
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    setCurrentUser(userInfo);
    
    if (userInfo.userId || userInfo.id) {
      loadTasks();
    } else {
      // toast('Không tìm thấy thông tin user. Vui lòng đăng nhập lại.', { icon: '❌' });
    }
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = userInfo.userId || userInfo.id;
      
      if (!userId) {
        // toast('Không tìm thấy thông tin user. Vui lòng đăng nhập lại.', { icon: '❌' });
        return;
      }
      
      console.log('📋 Loading tasks for user:', userId);
      
      // Load user's projects first
      const projectsRes = await projectAPI.getUserProjects(userId);
      const projects = projectsRes.data || [];
      setUserProjects(projects);
      
      if (projects.length === 0) {
        setTasks([]);
        // toast('Bạn chưa có project nào. Vui lòng tạo project trước.', {
        //   icon: 'ℹ️',
        //   style: {
        //     borderRadius: '10px',
        //     background: '#333',
        //     color: '#fff',
        //   },
        // });
        return;
      }
      
      // Load project members for permission checking
      const membersData = {};
      for (const project of projects) {
        try {
          const projectId = project.projectId || project.id;
          const membersRes = await projectAPI.getProjectMembers(projectId);
          membersData[projectId] = membersRes.data || [];
        } catch (error) {
          console.warn('Cannot load members for project', project.id, error.message);
          membersData[project.projectId || project.id] = [];
        }
      }
      setUserProjectMembers(membersData);
      
      // Load tasks for all user projects
      let allTasks = [];
      for (const project of projects) {
        try {
          const tasksRes = await taskAPI.getProjectTasks(project.projectId || project.id, userId);
          const projectTasks = (tasksRes.data || []).map(task => ({
            ...task,
            projectName: project.name,
            projectId: project.projectId || project.id
          }));
          allTasks = [...allTasks, ...projectTasks];
        } catch (error) {
          console.warn('Cannot load tasks for project', project.id, error.message);
        }
      }
      
      // Enrich all tasks with assignee names
      const enrichedTasks = await enrichTasksWithAssigneeNames(allTasks);
      setTasks(enrichedTasks);
      console.log('✅ All tasks loaded:', enrichedTasks.length);
      
    } catch (err) {
      console.error('❌ Error loading tasks:', err);
      toast('Không tải được danh sách task', { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  const isUserManagerOfProject = (projectId) => {
    if (!currentUser || !userProjectMembers[projectId]) return false;
    const userId = currentUser.userId || currentUser.id;
    const member = userProjectMembers[projectId].find(m => m.userId === userId);
    return member?.role === 'manager';
  };

  const hasManagerProjects = () => {
    return userProjects.some(project => isUserManagerOfProject(project.projectId || project.id));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesProject = !projectFilter || task.projectId === projectFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return isBefore(new Date(t.dueDate), new Date()) && !isToday(new Date(t.dueDate));
    }).length;
    
    return { total, completed, inProgress, overdue };
  };

  const handleCreateClick = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (task) => {
    if (!confirm(`Xóa task "${task.title}"?`)) return;
    try {
      const userId = currentUser.userId || currentUser.id;
      await taskAPI.deleteTask(task.taskId, task.projectId, userId);
      toast('Đã xóa task', { icon: '✅' });
      loadTasks();
    } catch (err) {
      console.error(err);
      toast('Xóa task thất bại', { icon: '❌' });
    }
  };

  const handleModalSaved = () => {
    setIsModalOpen(false);
    loadTasks();
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tất cả Tasks</h1>
            <p className="text-gray-600 mt-1">Quản lý tasks từ tất cả projects của bạn</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              {viewMode === 'card' ? 'Table View' : 'Card View'}
            </button>
            
            {hasManagerProjects() ? (
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Tạo task mới
              </button>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Chỉ manager mới có thể tạo task
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Tổng tasks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-green-900">{stats.completed}</p>
                <p className="text-sm text-green-600">Hoàn thành</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-blue-900">{stats.inProgress}</p>
                <p className="text-sm text-blue-600">Đang làm</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-red-900">{stats.overdue}</p>
                <p className="text-sm text-red-600">Quá hạn</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusConfig).map(([status, config]) => (
              <option key={status} value={status}>{config.label}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả độ ưu tiên</option>
            {Object.entries(priorityConfig).map(([priority, config]) => (
              <option key={priority} value={priority}>{config.label}</option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả projects</option>
            {userProjects.map((project) => (
              <option key={project.projectId || project.id} value={project.projectId || project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Content */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.taskId}
              task={task}
              projectId={task.projectId}
              currentUserId={currentUser?.userId || currentUser?.id}
              onEdit={isUserManagerOfProject(task.projectId) ? () => handleEditClick(task) : undefined}
              onDelete={isUserManagerOfProject(task.projectId) ? () => handleDelete(task) : undefined}
            />
          ))}
          {filteredTasks.length === 0 && (
            <div className="col-span-full text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy task nào.</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.taskId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/projects/${task.projectId}`}
                        className="text-sm text-blue-600 hover:text-blue-900"
                      >
                        {task.projectName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[task.status]?.bgColor} ${statusConfig[task.status]?.color}`}>
                        {statusConfig[task.status]?.label || task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[task.priority]?.bgColor} ${priorityConfig[task.priority]?.color}`}>
                        {priorityConfig[task.priority]?.label || task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.assigneeName || 'Chưa phân công'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.dueDate ? format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: vi }) : 'Chưa có hạn'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isUserManagerOfProject(task.projectId) ? (
                        <>
                          <button
                            onClick={() => handleEditClick(task)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(task)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Không tìm thấy task nào.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSaved}
          task={selectedTask}
          project={selectedTask ? 
            { projectId: selectedTask.projectId, id: selectedTask.projectId } : 
            (() => {
              const managerProjects = userProjects.filter(p => isUserManagerOfProject(p.projectId || p.id));
              const firstManagerProject = managerProjects[0];
              return firstManagerProject ? 
                { projectId: firstManagerProject.projectId || firstManagerProject.id, id: firstManagerProject.projectId || firstManagerProject.id } :
                { projectId: '', id: '' };
            })()
          }
        />
      )}
    </div>
  );
}

export default TaskPage;