import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  FolderIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuth, useApp } from '../hooks/useContext';
import ProjectModal from '../components/ProjectModal';
import { projectAPI } from '../services/api';
import toast from 'react-hot-toast';

const mockProjects = [
  {
    id: 1,
    name: 'E-commerce Platform',
    key: 'ECOM',
    description: 'Xây dựng nền tảng thương mại điện tử với React và Node.js',
    status: 'active',
    priority: 'high',
    lead: { id: 1, name: 'Nguyễn Văn A', avatar: null },
    members: [
      { id: 1, name: 'Nguyễn Văn A', avatar: null },
      { id: 2, name: 'Trần Thị B', avatar: null },
      { id: 3, name: 'Lê Văn C', avatar: null },
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
  },
  {
    id: 2,
    name: 'Mobile Banking App',
    key: 'BANK',
    description: 'Ứng dụng ngân hàng di động với bảo mật cao',
    status: 'active',
    priority: 'high',
    lead: { id: 2, name: 'Trần Thị B', avatar: null },
    members: [
      { id: 2, name: 'Trần Thị B', avatar: null },
      { id: 4, name: 'Phạm Văn D', avatar: null },
    ],
    tasks: {
      total: 32,
      completed: 8,
      inProgress: 12,
      pending: 12,
    },
    createdAt: '2024-02-01',
    updatedAt: '2024-11-09',
    deadline: '2024-11-30',
  },
  {
    id: 3,
    name: 'HR Management System',
    key: 'HRMS',
    description: 'Hệ thống quản lý nhân sự tích hợp AI',
    status: 'planning',
    priority: 'medium',
    lead: { id: 3, name: 'Lê Văn C', avatar: null },
    members: [
      { id: 3, name: 'Lê Văn C', avatar: null },
      { id: 5, name: 'Hoàng Thị E', avatar: null },
    ],
    tasks: {
      total: 18,
      completed: 2,
      inProgress: 6,
      pending: 10,
    },
    createdAt: '2024-03-10',
    updatedAt: '2024-11-08',
    deadline: '2025-01-15',
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

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const { user } = useAuth();
  const { setCurrentProject } = useApp();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      // TODO: backend phải trả về mảng project
      // const res = await projectAPI.getProjects();
      // const list = res.data || []; // hoặc res.data.data tùy backend
      // setProjects(list);
      
      // Tạm thời dùng mock data cho đến khi API ready
      console.log('📁 Loading projects from mock data...');
      setProjects(mockProjects);
      
      // Uncomment phần dưới khi API ready:
      // console.log('📁 Loading projects from API...');
      // const res = await projectAPI.getProjects();
      // const list = res.data || [];
      // setProjects(list);
      // console.log('✅ Projects loaded from API:', list.length);
    } catch (error) {
      console.error('❌ Lỗi tải danh sách dự án:', error);
      // Fallback to mock data if API fails
      setProjects(mockProjects);
      toast.error('Sử dụng dữ liệu demo. API chưa sẵn sàng.');
    }
  };

  // Initialize with mock data immediately for better UX
  useEffect(() => {
    setProjects(mockProjects);
  }, []);

  // Then try to load from API
  useEffect(() => {
    fetchProjects();
  }, []);

  const filterProjects = useCallback(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleCreateProject = async (projectData) => {
    try {
      // TODO: backend create project
      // const res = await projectAPI.createProject(projectData);
      // const created = res.data; // hoặc res.data.data
      // setProjects([created, ...projects]);

      // Tạm thời (nếu backend chưa sẵn sàng) để test UI
      const newProject = {
        id: Date.now(),
        ...projectData,
        key: projectData.name.substring(0, 4).toUpperCase(),
        lead: user,
        members: [user],
        tasks: { total: 0, completed: 0, inProgress: 0, pending: 0 },
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setProjects([newProject, ...projects]);

      toast.success('Tạo dự án thành công!');
      setShowCreateModal(false);
      
      // Uncomment phần dưới khi API ready:
      // console.log('📝 Creating project via API...');
      // const res = await projectAPI.createProject(projectData);
      // const created = res.data;
      // setProjects([created, ...projects]);
      // toast.success('Tạo dự án thành công!');
      
    } catch (error) {
      console.error('❌ Lỗi tạo dự án:', error);
      toast.error('Lỗi tạo dự án');
    }
  };

  const handleProjectClick = (project) => {
    setCurrentProject(project);
    navigate(`/projects/${project.id}`);
  };

  const getProgressPercentage = (tasks) => {
    if (tasks.total === 0) return 0;
    return Math.round((tasks.completed / tasks.total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dự án</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý và theo dõi tất cả dự án của bạn
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tạo dự án
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
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
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } rounded-l-md border-r border-gray-300`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } rounded-r-md`}
            >
              List
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Hiển thị {filteredProjects.length} trong số {projects.length} dự án
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FolderIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500">{project.key}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[project.status].color}`}
                    >
                      {statusConfig[project.status].label}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {project.description}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Tiến độ</span>
                    <span className="text-sm text-gray-600">
                      {getProgressPercentage(project.tasks)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(project.tasks)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {project.tasks.total}
                    </div>
                    <div className="text-xs text-gray-500">Tổng task</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {project.tasks.completed}
                    </div>
                    <div className="text-xs text-gray-500">Hoàn thành</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {project.tasks.inProgress}
                    </div>
                    <div className="text-xs text-gray-500">Đang làm</div>
                  </div>
                </div>

                {/* Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {project.members.length} thành viên
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(project.deadline).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {project.lead.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{project.lead.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${priorityConfig[project.priority].color}`}>
                    {priorityConfig[project.priority].label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <li
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FolderIcon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <p className="text-lg font-semibold text-gray-900 truncate">
                            {project.name}
                          </p>
                          <span className="text-sm text-gray-500">({project.key})</span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[project.status].color}`}
                          >
                            {statusConfig[project.status].label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Progress */}
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${getProgressPercentage(project.tasks)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-10">
                          {getProgressPercentage(project.tasks)}%
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="text-sm text-gray-600 text-right">
                        <div>{project.tasks.total} tasks</div>
                        <div className="text-xs text-gray-500">
                          {project.members.length} thành viên
                        </div>
                      </div>

                      {/* Lead */}
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {project.lead.name.charAt(0)}
                          </span>
                        </div>
                      </div>

                      {/* Priority */}
                      <span className={`text-sm font-medium ${priorityConfig[project.priority].color} w-20 text-center`}>
                        {priorityConfig[project.priority].label}
                      </span>

                      <button className="text-gray-400 hover:text-gray-600">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có dự án nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter || priorityFilter
              ? 'Không tìm thấy dự án nào phù hợp với bộ lọc.'
              : 'Bắt đầu bằng cách tạo dự án đầu tiên của bạn.'}
          </p>
          {!searchTerm && !statusFilter && !priorityFilter && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Tạo dự án đầu tiên
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
        project={selectedProject}
      />
    </div>
  );
}