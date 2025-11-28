import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate loading projects from API
    setTimeout(() => {
      const mockProjects = [
        {
          id: 1,
          name: 'TaskHub Frontend',
          description: 'Frontend development for TaskHub application',
          status: 'active',
          priority: 'high',
          manager: 'Nguyen Van A',
          memberCount: 8,
          taskCount: 24,
          createdAt: '2024-11-01',
          progress: 65,
        },
        {
          id: 2,
          name: 'Mobile App Development',
          description: 'Mobile application for TaskHub',
          status: 'planning',
          priority: 'medium',
          manager: 'Tran Thi B',
          memberCount: 5,
          taskCount: 12,
          createdAt: '2024-11-15',
          progress: 30,
        },
        {
          id: 3,
          name: 'API Backend',
          description: 'Backend API development and optimization',
          status: 'completed',
          priority: 'high',
          manager: 'Le Van C',
          memberCount: 6,
          taskCount: 18,
          createdAt: '2024-10-01',
          progress: 100,
        },
        {
          id: 4,
          name: 'Database Migration',
          description: 'Migrate database to new infrastructure',
          status: 'onhold',
          priority: 'low',
          manager: 'Pham Thi D',
          memberCount: 3,
          taskCount: 8,
          createdAt: '2024-11-20',
          progress: 15,
        },
      ];
      setProjects(mockProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Đang thực hiện', color: 'bg-green-100 text-green-800' },
      planning: { label: 'Lên kế hoạch', color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-800' },
      onhold: { label: 'Tạm dừng', color: 'bg-gray-100 text-gray-800' },
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { label: 'Cao', color: 'text-red-600 bg-red-50' },
      medium: { label: 'Trung bình', color: 'text-yellow-600 bg-yellow-50' },
      low: { label: 'Thấp', color: 'text-green-600 bg-green-50' },
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      setProjects(projects.filter(project => project.id !== projectId));
      toast.success('Xóa dự án thành công!');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Dự án</h1>
          <p className="mt-2 text-sm text-gray-600">
            Quản lý tất cả dự án trong hệ thống
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tạo dự án mới
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án, quản lý..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang thực hiện</option>
            <option value="planning">Lên kế hoạch</option>
            <option value="completed">Hoàn thành</option>
            <option value="onhold">Tạm dừng</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
            <option value="">Tất cả mức độ</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dự án
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quản lý
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Độ ưu tiên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiến độ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thành viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FolderIcon className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{project.manager}</div>
                  <div className="text-sm text-gray-500">Quản lý dự án</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(project.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(project.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">{project.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">{project.memberCount}</span>
                    <span className="text-sm text-gray-500 ml-1">/ {project.taskCount} nhiệm vụ</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    title="Xem chi tiết"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="text-yellow-600 hover:text-yellow-900"
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    title="Xóa"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có dự án</h3>
          <p className="mt-1 text-sm text-gray-500">
            Không tìm thấy dự án nào phù hợp với tìm kiếm của bạn.
          </p>
        </div>
      )}
    </div>
  );
}