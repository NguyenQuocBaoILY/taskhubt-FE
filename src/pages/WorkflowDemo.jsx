import { useState, useEffect } from 'react';
import { useAuth, useApp } from '../hooks/useContext';
import useWorkflow from '../hooks/useWorkflow';
import BackendStatus from '../components/BackendStatus';
import {
  UserGroupIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function WorkflowDemo() {
  const { user } = useAuth();
  const {
    users,
    userProjects,
    currentProject,
    currentProjectMembers,
    projectTasks,
    isLoading,
    error,
  } = useApp();

  const {
    loadAllUsers,
    loadUserProjects,
    loadCompleteProjectData,
    handleUpdateMemberRole,
    handleCreateProjectTask,
    handleUpdateTask,
    handleDeleteTask,
    initializeUserWorkspace,
  } = useWorkflow();

  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: '',
  });

  // Initialize workspace on component mount
  useEffect(() => {
    if (user) {
      // Check if user is admin (simple check, you might want to improve this)
      const isAdmin = user.role === 'admin' || user.email.includes('admin');
      initializeUserWorkspace(isAdmin);
    }
  }, [user, initializeUserWorkspace]);

  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    await loadCompleteProjectData(project.id);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    const result = await handleCreateProjectTask(selectedProject.id, {
      ...newTaskData,
      assignee_id: newTaskData.assigneeId,
      status: 'pending',
      created_by: user.id,
    });

    if (result.success) {
      setShowCreateTaskForm(false);
      setNewTaskData({
        title: '',
        description: '',
        priority: 'medium',
        assigneeId: '',
      });
    }
  };

  const handleTaskStatusUpdate = async (task, newStatus) => {
    await handleUpdateTask(task.id, {
      ...task,
      status: newStatus,
    });
  };

  const handleRoleUpdate = async (member, newRole) => {
    await handleUpdateMemberRole(selectedProject.id, member.userId, newRole);
  };

  return (
    <div className="space-y-8">
      {/* Backend Connection Status */}
      <BackendStatus />
      
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🗺️ Workflow Demo - Real API Integration
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">🔄 Real API Mode Enabled</h4>
          <p className="text-sm text-blue-700">
            Ứng dụng hiện đang kết nối với backend API thực tế thay vì sử dụng mock data. 
            Tất cả các thao tác sẽ được gửi đến server backend.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow Steps */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium mb-4">Các bước workflow:</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <UserGroupIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Bước 1: Load Users</div>
                  <div className="text-sm text-blue-700">
                    {users.length > 0 ? `✅ ${users.length} users` : '⏳ Loading...'}
                  </div>
                </div>
                <button
                  onClick={loadAllUsers}
                  className="ml-auto p-1 text-blue-600 hover:text-blue-800"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <FolderIcon className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Bước 2: User Projects</div>
                  <div className="text-sm text-green-700">
                    {userProjects.length > 0 ? `✅ ${userProjects.length} projects` : '⏳ Loading...'}
                  </div>
                </div>
                <button
                  onClick={() => loadUserProjects(user?.id)}
                  className="ml-auto p-1 text-green-600 hover:text-green-800"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900">Bước 3-4: Project Data</div>
                  <div className="text-sm text-purple-700">
                    {currentProject ? `✅ ${currentProject.name}` : '📋 Select project'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project List & Selection */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Danh sách dự án</h3>
              {isLoading && <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProjects.map((project) => (
                <div
                  key={project.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedProject?.id === project.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleProjectSelect(project)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.description}</p>
                      <div className="mt-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          project.role === 'admin' 
                            ? 'bg-red-100 text-red-800'
                            : project.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.role || 'member'}
                        </span>
                      </div>
                    </div>
                    <FolderIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Details & Members */}
      {currentProject && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Members */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">
              🧑‍💼 Thành viên dự án ({currentProjectMembers.length})
            </h3>
            <div className="space-y-3">
              {currentProjectMembers.map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.name || `User ${member.userId}`}</div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                    </div>
                  </div>
                  
                  <select
                    value={member.role || 'member'}
                    onChange={(e) => handleRoleUpdate(member, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Project Tasks */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                📋 Tasks ({projectTasks.length})
              </h3>
              <button
                onClick={() => setShowCreateTaskForm(!showCreateTaskForm)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Tạo Task
              </button>
            </div>

            {/* Create Task Form */}
            {showCreateTaskForm && (
              <form onSubmit={handleCreateTask} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Tiêu đề task..."
                      value={newTaskData.title}
                      onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Mô tả task..."
                      value={newTaskData.description}
                      onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2 rows-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={newTaskData.priority}
                      onChange={(e) => setNewTaskData({...newTaskData, priority: e.target.value})}
                      className="border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <select
                      value={newTaskData.assigneeId}
                      onChange={(e) => setNewTaskData({...newTaskData, assigneeId: e.target.value})}
                      className="border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Chọn người thực hiện...</option>
                      {currentProjectMembers.map((member) => (
                        <option key={member.userId} value={member.userId}>
                          {member.name || `User ${member.userId}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Tạo Task
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateTaskForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
              {projectTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <select
                          value={task.status || 'pending'}
                          onChange={(e) => handleTaskStatusUpdate(task, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="in-progress">🔄 In Progress</option>
                          <option value="completed">✅ Completed</option>
                        </select>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="ml-2 p-1 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {projectTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardDocumentListIcon className="h-8 w-8 mx-auto mb-2" />
                  <p>Chưa có task nào trong dự án này</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* API Calls Log */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">📊 API Workflow Status</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-mono">
            <div className="text-green-600">✅ GET /api/users - {users.length} users loaded</div>
            <div className="text-green-600">✅ GET /api/users/{user?.id}/projects - {userProjects.length} projects loaded</div>
            {currentProject && (
              <>
                <div className="text-green-600">✅ GET /api/projects/{currentProject.id} - Project details loaded</div>
                <div className="text-green-600">✅ GET /api/projects/{currentProject.id}/members - {currentProjectMembers.length} members loaded</div>
                <div className="text-green-600">✅ GET /api/projects/{currentProject.id}/tasks - {projectTasks.length} tasks loaded</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}