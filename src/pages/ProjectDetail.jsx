import { useState, useEffect } from 'react';
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
import { taskAPI } from '../services/api';
import toast from 'react-hot-toast';
//import { projectAPI } from '../services/api'; // TODO: sau này có thể thêm projectAPI

// Mock data - same as in ProjectList but with more details
const mockProject = {
  id: 1,
  name: 'E-commerce Platform',
  key: 'ECOM',
  description: 'Xây dựng nền tảng thương mại điện tử với React và Node.js. Dự án bao gồm frontend customer, admin dashboard, API backend và payment integration.',
  status: 'active',
  priority: 'high',
  lead: { id: 1, name: 'Nguyễn Văn A', email: 'nguyen.van.a@company.com', avatar: null },
  members: [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyen.van.a@company.com', role: 'Project Lead', avatar: null },
    { id: 2, name: 'Trần Thị B', email: 'tran.thi.b@company.com', role: 'Frontend Developer', avatar: null },
    { id: 3, name: 'Lê Văn C', email: 'le.van.c@company.com', role: 'Backend Developer', avatar: null },
    { id: 4, name: 'Phạm Văn D', email: 'pham.van.d@company.com', role: 'UI/UX Designer', avatar: null },
  ],
  tasks: {
    total: 45,
    completed: 12,
    inProgress: 18,
    pending: 15,
  },
  createdAt: '2024-01-15',
  updatedAt: '2024-11-10',
  deadline: '2024-12-31',
};

const mockTasks = [
  {
    id: 1,
    title: 'Setup project structure',
    description: 'Initialize React project with Vite and setup folder structure',
    status: 'completed',
    priority: 'high',
    assignee: { id: 2, name: 'Trần Thị B' },
    createdAt: '2024-01-16',
    updatedAt: '2024-01-20',
    dueDate: '2024-01-25',
  },
  {
    id: 2,
    title: 'Design user authentication flow',
    description: 'Create wireframes and mockups for login/register pages',
    status: 'completed',
    priority: 'high',
    assignee: { id: 4, name: 'Phạm Văn D' },
    createdAt: '2024-01-17',
    updatedAt: '2024-01-22',
    dueDate: '2024-01-30',
  },
  {
    id: 3,
    title: 'Implement user authentication API',
    description: 'Build authentication endpoints with JWT tokens',
    status: 'in-progress',
    priority: 'high',
    assignee: { id: 3, name: 'Lê Văn C' },
    createdAt: '2024-01-20',
    updatedAt: '2024-11-10',
    dueDate: '2024-11-15',
  },
  {
    id: 4,
    title: 'Create product catalog UI',
    description: 'Build product listing and detail pages',
    status: 'in-progress',
    priority: 'medium',
    assignee: { id: 2, name: 'Trần Thị B' },
    createdAt: '2024-02-01',
    updatedAt: '2024-11-08',
    dueDate: '2024-11-20',
  },
  {
    id: 5,
    title: 'Integration with payment gateway',
    description: 'Integrate Stripe/PayPal payment processing',
    status: 'pending',
    priority: 'high',
    assignee: { id: 3, name: 'Lê Văn C' },
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
    dueDate: '2024-12-01',
  },
];

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
  pending: { label: 'Chờ thực hiện', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  'in-progress': { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800', icon: ChartBarIcon },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentProject } = useApp();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        // TODO: API PROJECT
        // Khi có API project, thay mockProject bằng dữ liệu từ backend:
        // const resProject = await projectAPI.getProject(id);
        // const projectFromApi = resProject.data; // hoặc resProject.data.data tùy backend
        // setProject(projectFromApi);
        // setCurrentProject(projectFromApi);

        // Tạm thời vẫn dùng mock project cho UI
        const projectFromMock = mockProject;
        setProject(projectFromMock);
        setCurrentProject(projectFromMock);

        // API TASK: lấy danh sách task theo projectId từ backend
        try {
          const resTasks = await taskAPI.getTasks({ projectId: id });
          const tasksFromApi = resTasks.data || [];
          setTasks(tasksFromApi);
        } catch (taskError) {
          console.warn('⚠️ Cannot load tasks from API, using mock data:', taskError.message);
          // Fallback to mock tasks if API fails
          setTasks(mockTasks);
        }
      } catch (error) {
        console.error('Lỗi tải chi tiết dự án:', error);
        toast.error('Lỗi tải thông tin dự án');
        // Don't navigate away, just use mock data
        setProject(mockProject);
        setCurrentProject(mockProject);
        setTasks(mockTasks);
      }
    };

    if (id) {
      fetchProjectDetail();
    }
  }, [id, setCurrentProject]); // Add proper dependencies

  const handleUpdateProject = async (projectData) => {
    try {
      // TODO: API PROJECT UPDATE
      // Khi có API project update:
      // const res = await projectAPI.updateProject(id, projectData);
      // const updatedProjectFromApi = res.data; // hoặc res.data.data
      // setProject(updatedProjectFromApi);
      // setCurrentProject(updatedProjectFromApi);

      const updatedProject = { ...project, ...projectData };
      setProject(updatedProject);
      setCurrentProject(updatedProject);
      toast.success('Cập nhật dự án thành công!');
      setShowEditModal(false);
    } catch {
      toast.error('Lỗi cập nhật dự án');
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      // TODO: API TASK CREATE
      // Gợi ý body khi gọi backend:
      // const payload = { ...taskData, projectId: id };
      // const res = await taskAPI.createTask(payload);
      // const createdTask = res.data; // hoặc res.data.data
      // setTasks([createdTask, ...tasks]);

      // Tạm thời: thêm task mới vào state để test UI
      const newTask = {
        id: Date.now(),
        ...taskData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setTasks([newTask, ...tasks]);
      toast.success('Tạo task thành công!');
      setShowTaskModal(false);
    } catch {
      toast.error('Lỗi tạo task');
    }
  };

  const getProgressPercentage = () => {
    if (project?.tasks.total === 0) return 0;
    return Math.round((project.tasks.completed / project.tasks.total) * 100);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

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
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[project.status].color}`}
                        >
                          {statusConfig[project.status].label}
                        </span>
                        <span className={`text-sm font-medium ${priorityConfig[project.priority].color}`}>
                          Mức độ: {priorityConfig[project.priority].label}
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
              Thành viên ({project.members.length})
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
                    <p className="text-2xl font-bold text-gray-900">{project.tasks.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                    <p className="text-2xl font-bold text-gray-900">{project.tasks.completed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đang làm</p>
                    <p className="text-2xl font-bold text-gray-900">{project.tasks.inProgress}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Thành viên</p>
                    <p className="text-2xl font-bold text-gray-900">{project.members.length}</p>
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
                {getProgressPercentage()}% hoàn thành ({project.tasks.completed}/{project.tasks.total} tasks)
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
                    <dd className="text-sm text-gray-900">{project.lead.name}</dd>
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
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${taskStatusConfig[task.status].color}`}
                        >
                          {taskStatusConfig[task.status].label}
                        </span>
                        <span className={`text-sm font-medium ${priorityConfig[task.priority].color}`}>
                          {priorityConfig[task.priority].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <span>Giao cho: {task.assignee.name}</span>
                        <span>
                          Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                          {isOverdue(task.dueDate) && task.status !== 'completed' && (
                            <ExclamationTriangleIcon className="inline h-4 w-4 text-red-500 ml-1" />
                          )}
                        </span>
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
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{member.role}</span>
                    {member.id === project.lead.id && (
                      <p className="text-xs text-primary-600">Project Lead</p>
                    )}
                  </div>
                </div>
              ))}
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