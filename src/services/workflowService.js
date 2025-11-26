import { userAPI, projectAPI, taskAPI } from './api';
import toast from 'react-hot-toast';

/**
 * Service để handle luồng chạy theo sơ đồ API workflow
 * Sử dụng REAL API endpoints thay vì mock data
 */

const handleAPIError = (error, fallbackMessage) => {
  let errorMessage = fallbackMessage;
  
  if (error.response) {
    // API returned error
    if (error.response.status === 400) {
      errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ';
    } else if (error.response.status === 401) {
      errorMessage = 'Bạn cần đăng nhập lại';
    } else if (error.response.status === 403) {
      errorMessage = 'Bạn không có quyền thực hiện thao tác này';
    } else if (error.response.status === 404) {
      errorMessage = 'Không tìm thấy dữ liệu';
    } else if (error.response.status >= 500) {
      errorMessage = 'Lỗi server. Vui lòng thử lại sau';
    } else {
      errorMessage = error.response.data?.message || fallbackMessage;
    }
  } else if (error.request) {
    // Network error
    errorMessage = 'Không thể kết nối đến server. Kiểm tra kết nối mạng';
  } else {
    // Other errors
    errorMessage = error.message || fallbackMessage;
  }
  
  return errorMessage;
};

export const workflowService = {
  /**
   * Bước 1: Đăng nhập / Xem danh sách người dùng
   * Admin dùng để phân quyền và phân công
   */
  async getAllUsers() {
    try {
      console.log('🔄 [Step 1] Fetching all users from real API...');
      const response = await userAPI.getUsers();
      console.log('✅ [Step 1] Users fetched successfully:', response.data.length, 'users');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ [Step 1] Failed to fetch users:', error);
      const errorMessage = handleAPIError(error, 'Không thể lấy danh sách người dùng');
      toast.error(errorMessage);
      return { success: false, error: { message: errorMessage } };
    }
  },

  /**
   * Bước 2: Truy cập Project
   * Lấy danh sách tất cả project mà user đang tham gia
   */
  async getUserProjects(userId) {
    try {
      console.log(`🔄 [Step 2] Fetching projects for user ${userId} from real API...`);
      const response = await userAPI.getUserProjects(userId);
      console.log('✅ [Step 2] User projects fetched successfully:', response.data.length, 'projects');
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ [Step 2] Failed to fetch projects for user ${userId}:`, error);
      const errorMessage = handleAPIError(error, 'Không thể lấy danh sách dự án của người dùng');
      toast.error(errorMessage);
      return { success: false, error: { message: errorMessage } };
    }
  },

  /**
   * Bước 3: Chọn Project
   * Lấy thông tin chi tiết project và danh sách thành viên với vai trò
   */
  async getProjectDetails(projectId, orgId = 'default-org') {
    try {
      console.log(`🔄 [Step 3] Fetching project details for ${projectId} from real API...`);
      
      // Lấy thông tin project và members (members có thể chưa implement)
      const projectResponse = await projectAPI.getProject(orgId, projectId);
      
      // Thử lấy members, nếu không có thì dùng empty array
      let membersResponse;
      try {
        membersResponse = await projectAPI.getProjectMembers(projectId);
      } catch (error) {
        console.warn('[Step 3] ProjectMembers endpoint not available, using empty array');
        membersResponse = { data: [] };
      }

      console.log('✅ [Step 3] Project details fetched successfully:', {
        project: projectResponse.data.name,
        members: membersResponse.data.length
      });

      return {
        success: true,
        data: {
          project: projectResponse.data,
          members: membersResponse.data
        }
      };
    } catch (error) {
      console.error(`❌ [Step 3] Failed to fetch project details for ${projectId}:`, error);
      const errorMessage = handleAPIError(error, 'Không thể lấy thông tin chi tiết dự án');
      toast.error(errorMessage);
      return { success: false, error: { message: errorMessage } };
    }
  },

  /**
   * Bước 4: Xem Task
   * Lấy danh sách các task trong project
   */
  async getProjectTasks(projectId) {
    try {
      console.log(`🔄 [Step 4] Fetching tasks for project ${projectId} from real API...`);
      const response = await projectAPI.getProjectTasks(projectId);
      console.log('✅ [Step 4] Project tasks fetched successfully:', response.data.length, 'tasks');
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ [Step 4] Failed to fetch tasks for project ${projectId}:`, error);
      const errorMessage = handleAPIError(error, 'Không thể lấy danh sách task của dự án');
      toast.error(errorMessage);
      return { success: false, error: { message: errorMessage } };
    }
  },

  /**
   * Bước 5: Quản lý Thành viên
   * Thay đổi vai trò của user trong project
   */
  async updateMemberRole(projectId, userId, newRole) {
    try {
      console.log(`🔄 [Step 5] Updating role for user ${userId} in project ${projectId} to ${newRole} via real API...`);
      const response = await projectAPI.updateMemberRole(projectId, userId, { role: newRole });
      console.log('✅ [Step 5] Member role updated successfully');
      toast.success(`Đã cập nhật vai trò thành ${newRole}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ [Step 5] Failed to update member role:`, error);
      const errorMessage = handleAPIError(error, 'Không thể cập nhật vai trò thành viên');
      toast.error(errorMessage);
      return { success: false, error: { message: errorMessage } };
    }
  },

  /**
   * Bước 6: Tạo Task
   * Manager tạo task mới để giao việc
   */
  async createProjectTask(projectId, taskData) {
    try {
      console.log(`🔄 [Step 6] Creating new task in project ${projectId} via real API...`);
      const response = await projectAPI.createProjectTask(projectId, taskData);
      console.log('✅ [Step 6] Task created successfully:', response.data.title);
      toast.success('Đã tạo task mới thành công');
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ [Step 6] Failed to create task:`, error);
      const errorMessage = handleAPIError(error, 'Không thể tạo task mới');
      toast.error(errorMessage);
      return { success: false, error: { message: errorMessage } };
    }
  },

  /**
   * Bước 7e: Cập nhật Task
   * Cập nhật trạng thái/thông tin task
   */
  async updateTask(taskId, taskData) {
    try {
      console.log(`🔄 [Step 7e] Updating task ${taskId} via real API...`);
      const response = await taskAPI.updateTask(taskId, taskData);
      console.log('✅ [Step 7e] Task updated successfully');
      toast.success('Đã cập nhật task thành công');
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ [Step 7e] Failed to update task ${taskId}:`, error);
      const errorMessage = handleAPIError(error, 'Không thể cập nhật task');
      toast.error(errorMessage);
      return { success: false, error: { message: errorMessage } };
    }
  },

  /**
   * Bước 7f: Xóa Task
   */
  async deleteTask(taskId) {
    try {
      console.log(`🔄 [Step 7f] Deleting task ${taskId} via real API...`);
      await taskAPI.deleteTask(taskId);
      console.log('✅ [Step 7f] Task deleted successfully');
      toast.success('Đã xóa task thành công');
      return { success: true };
    } catch (error) {
      console.error(`❌ [Step 7f] Failed to delete task ${taskId}:`, error);
      const errorMessage = handleAPIError(error, 'Không thể xóa task');
      toast.error(errorMessage);
      return { success: false, error: { message: errorMessage } };
    }
  },

  /**
   * Workflow hoàn chỉnh: Load toàn bộ data của một project
   * Dùng cho khi user chọn vào một project
   */
  async loadCompleteProjectData(projectId, currentUserId, orgId = 'default-org') {
    try {
      console.log(`🔄 [Workflow] Loading complete project data for ${projectId}...`);
      
      // Thực hiện các bước 3 + 4 song song
      const [projectResult, tasksResult] = await Promise.all([
        this.getProjectDetails(projectId, orgId),
        this.getProjectTasks(projectId)
      ]);

      if (!projectResult.success || !tasksResult.success) {
        throw new Error('Failed to load project data');
      }

      console.log('✅ [Workflow] Complete project data loaded successfully');
      
      return {
        success: true,
        data: {
          project: projectResult.data.project,
          members: projectResult.data.members,
          tasks: tasksResult.data,
        }
      };
    } catch (error) {
      console.error(`❌ [Workflow] Failed to load complete project data:`, error);
      const errorMessage = handleAPIError(error, 'Không thể tải dữ liệu dự án');
      toast.error(errorMessage);
      return { success: false, error: { message: errorMessage } };
    }
  },

  /**
   * Workflow khởi tạo: Load data cho user khi đăng nhập
   */
  async initializeUserWorkspace(userId, isAdmin = false) {
    try {
      console.log(`🔄 [Init] Initializing workspace for user ${userId}...`);
      
      const requests = [
        this.getUserProjects(userId)
      ];

      // Admin cần thêm danh sách all users
      if (isAdmin) {
        requests.push(this.getAllUsers());
      }

      const results = await Promise.all(requests);
      
      const userProjectsResult = results[0];
      const allUsersResult = isAdmin ? results[1] : null;

      if (!userProjectsResult.success) {
        throw new Error('Failed to load user projects');
      }

      if (isAdmin && !allUsersResult?.success) {
        throw new Error('Failed to load all users');
      }

      console.log('✅ [Init] User workspace initialized successfully');

      return {
        success: true,
        data: {
          userProjects: userProjectsResult.data,
          allUsers: isAdmin ? allUsersResult.data : null
        }
      };
    } catch (error) {
      console.error(`❌ [Init] Failed to initialize workspace:`, error);
      toast.error('Không thể khởi tạo workspace');
      return { success: false, error };
    }
  }
};

export default workflowService;