import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { projectAPI } from '../../services/api';
import ProjectModal from '../../components/ProjectModal';
import toast from 'react-hot-toast';

export default function AdminProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('📁 Admin loading all projects from GET /api/projects...');
      const response = await projectAPI.getAllProjects(debouncedSearchTerm);
      setProjects(response.data || []);
      console.log('✅ Admin projects loaded:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      toast.error('Không thể tải danh sách dự án');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]); // Re-fetch when fetchProjects changes

  const handleCreateProject = async (projectData) => {
    try {
      console.log('📝 Admin creating project:', projectData);
      const response = await projectAPI.createProject(projectData);
      const newProject = response.data;
      
      setProjects([newProject, ...projects]);
      setShowCreateModal(false);
      toast.success('Tạo dự án thành công!');
      
      // Refresh projects list
      fetchProjects();
    } catch (error) {
      console.error('❌ Error creating project:', error);
      toast.error('Không thể tạo dự án. Vui lòng thử lại.');
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowCreateModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      try {
        await projectAPI.deleteProject(projectId);
        setProjects(projects.filter(p => p.id !== projectId));
        toast.success('Xóa dự án thành công!');
      } catch (error) {
        console.error('❌ Error deleting project:', error);
        toast.error('Không thể xóa dự án');
      }
    }
  };

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
            onClick={() => {
              setSelectedProject(null);
              setShowCreateModal(true);
            }}
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
                placeholder="Tìm kiếm tên dự án hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
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
            {projects.map((project) => (
              <tr 
                key={project.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  console.log('📋 Clicking on project row:', project.id);
                  console.log('🚀 Navigating to:', `/admin/projects/${project.id}`);
                  navigate(`/admin/projects/${project.id}`);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FolderIcon className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link 
                        to={`/admin/projects/${project.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('🔗 Clicking on project name:', project.id);
                        }}
                      >
                        {project.name}
                      </Link>
                      <div className="text-sm text-gray-500">
                        {project.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{project.lead?.name || 'Chưa gán'}</div>
                  <div className="text-sm text-gray-500">Quản lý dự án</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(project.status || 'active')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-blue-600 bg-blue-50">
                    Bình thường
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: '0%' }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">0%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">{project.memberCount || 0}</span>
                    <span className="text-sm text-gray-500 ml-1">/ {project.taskCount || 0} nhiệm vụ</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    className="text-yellow-600 hover:text-yellow-900"
                    title="Chỉnh sửa"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProject(project);
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    title="Xóa"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
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
      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có dự án</h3>
          <p className="mt-1 text-sm text-gray-500">
            Không tìm thấy dự án nào phù hợp với tìm kiếm của bạn.
          </p>
        </div>
      )}

      {/* Create/Edit Project Modal */}
      <ProjectModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedProject(null);
        }}
        onSubmit={handleCreateProject}
        project={selectedProject}
      />
    </div>
  );
}