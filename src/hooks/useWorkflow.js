import { useCallback } from 'react';
import { useAuth } from './useContext';
import { useApp } from './useContext';
import workflowService from '../services/workflowService';

/**
 * Custom hook để handle workflow theo sơ đồ API
 */
export function useWorkflow() {
  const { user } = useAuth();
  const {
    setLoading,
    setError,
    clearError,
    setUsers,
    setUserProjects,
    setCurrentProject,
    setProjectMembers,
    setProjectTasks,
    updateMemberRole,
    addProjectTask,
    updateTask,
    deleteTask,
  } = useApp();

  // Step 1: Load all users (Admin only)
  const loadAllUsers = useCallback(async () => {
    setLoading(true);
    clearError();
    
    const result = await workflowService.getAllUsers();
    
    if (result.success) {
      setUsers(result.data);
    } else {
      setError(result.error?.message || 'Không thể tải danh sách người dùng');
    }
    
    setLoading(false);
    return result;
  }, [setLoading, clearError, setUsers, setError]);

  // Step 2: Load user projects
  const loadUserProjects = useCallback(async (userId = user?.id) => {
    if (!userId) {
      console.warn('No user ID provided for loadUserProjects');
      return { success: false, error: 'No user ID' };
    }

    setLoading(true);
    clearError();
    
    const result = await workflowService.getUserProjects(userId);
    
    if (result.success) {
      setUserProjects(result.data);
    } else {
      setError(result.error?.message || 'Không thể tải dự án của người dùng');
    }
    
    setLoading(false);
    return result;
  }, [user?.id, setLoading, clearError, setUserProjects, setError]);

  // Step 3: Load project details and members
  const loadProjectDetails = useCallback(async (projectId) => {
    if (!projectId) {
      console.warn('No project ID provided for loadProjectDetails');
      return { success: false, error: 'No project ID' };
    }

    setLoading(true);
    clearError();
    
    const result = await workflowService.getProjectDetails(projectId);
    
    if (result.success) {
      setCurrentProject(result.data.project);
      setProjectMembers(result.data.members);
    } else {
      setError(result.error?.message || 'Không thể tải thông tin dự án');
    }
    
    setLoading(false);
    return result;
  }, [setLoading, clearError, setCurrentProject, setProjectMembers, setError]);

  // Step 4: Load project tasks
  const loadProjectTasks = useCallback(async (projectId) => {
    if (!projectId) {
      console.warn('No project ID provided for loadProjectTasks');
      return { success: false, error: 'No project ID' };
    }

    setLoading(true);
    clearError();
    
    const result = await workflowService.getProjectTasks(projectId);
    
    if (result.success) {
      setProjectTasks(result.data);
    } else {
      setError(result.error?.message || 'Không thể tải danh sách task');
    }
    
    setLoading(false);
    return result;
  }, [setLoading, clearError, setProjectTasks, setError]);

  // Step 5: Update member role
  const handleUpdateMemberRole = useCallback(async (projectId, userId, newRole) => {
    setLoading(true);
    clearError();
    
    const result = await workflowService.updateMemberRole(projectId, userId, newRole);
    
    if (result.success) {
      updateMemberRole({ userId, role: newRole, ...result.data });
    } else {
      setError(result.error?.message || 'Không thể cập nhật vai trò');
    }
    
    setLoading(false);
    return result;
  }, [setLoading, clearError, updateMemberRole, setError]);

  // Step 6: Create project task
  const handleCreateProjectTask = useCallback(async (projectId, taskData) => {
    setLoading(true);
    clearError();
    
    const result = await workflowService.createProjectTask(projectId, taskData);
    
    if (result.success) {
      addProjectTask(result.data);
    } else {
      setError(result.error?.message || 'Không thể tạo task mới');
    }
    
    setLoading(false);
    return result;
  }, [setLoading, clearError, addProjectTask, setError]);

  // Step 7e: Update task
  const handleUpdateTask = useCallback(async (taskId, taskData) => {
    setLoading(true);
    clearError();
    
    const result = await workflowService.updateTask(taskId, taskData);
    
    if (result.success) {
      updateTask(result.data);
    } else {
      setError(result.error?.message || 'Không thể cập nhật task');
    }
    
    setLoading(false);
    return result;
  }, [setLoading, clearError, updateTask, setError]);

  // Step 7f: Delete task
  const handleDeleteTask = useCallback(async (taskId) => {
    setLoading(true);
    clearError();
    
    const result = await workflowService.deleteTask(taskId);
    
    if (result.success) {
      deleteTask(taskId);
    } else {
      setError(result.error?.message || 'Không thể xóa task');
    }
    
    setLoading(false);
    return result;
  }, [setLoading, clearError, deleteTask, setError]);

  // Complete workflow: Load full project data
  const loadCompleteProjectData = useCallback(async (projectId) => {
    setLoading(true);
    clearError();
    
    const result = await workflowService.loadCompleteProjectData(projectId, user?.id);
    
    if (result.success) {
      setCurrentProject(result.data.project);
      setProjectMembers(result.data.members);
      setProjectTasks(result.data.tasks);
    } else {
      setError(result.error?.message || 'Không thể tải dữ liệu dự án');
    }
    
    setLoading(false);
    return result;
  }, [user?.id, setLoading, clearError, setCurrentProject, setProjectMembers, setProjectTasks, setError]);

  // Initialize user workspace
  const initializeUserWorkspace = useCallback(async (isAdmin = false) => {
    if (!user?.id) {
      console.warn('No user available for workspace initialization');
      return { success: false, error: 'No user' };
    }

    setLoading(true);
    clearError();
    
    const result = await workflowService.initializeUserWorkspace(user.id, isAdmin);
    
    if (result.success) {
      setUserProjects(result.data.userProjects);
      if (isAdmin && result.data.allUsers) {
        setUsers(result.data.allUsers);
      }
    } else {
      setError(result.error?.message || 'Không thể khởi tạo workspace');
    }
    
    setLoading(false);
    return result;
  }, [user?.id, setLoading, clearError, setUserProjects, setUsers, setError]);

  return {
    // Individual steps
    loadAllUsers,           // Step 1
    loadUserProjects,       // Step 2
    loadProjectDetails,     // Step 3
    loadProjectTasks,       // Step 4
    handleUpdateMemberRole, // Step 5
    handleCreateProjectTask,// Step 6
    handleUpdateTask,       // Step 7e
    handleDeleteTask,       // Step 7f
    
    // Combined workflows
    loadCompleteProjectData,
    initializeUserWorkspace,
  };
}

export default useWorkflow;