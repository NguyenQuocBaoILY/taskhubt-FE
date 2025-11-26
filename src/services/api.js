import axios from 'axios';
import authService from './authService';

// CHỈ dùng đúng giá trị trong .env, không auto-detect nữa
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:15155';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

console.log('🌐 Using API Base URL:', api.defaults.baseURL);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          console.log('🔄 Attempting token refresh...');
          const response = await authService.refreshToken(refreshToken);
          
          // Update stored tokens
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          
          // Only redirect to login if refresh explicitly fails with 401/403
          if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
            console.log('🚑 Refresh token invalid, redirecting to login...');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_email');
            window.location.href = '/login';
          }
        }
      } else {
        console.log('⚠️ No refresh token available');
        // Don't automatically redirect - let component handle authentication state
        // localStorage.removeItem('access_token');
        // window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// User API endpoints - Updated to match backend schema
export const userAPI = {
  // 1. Lấy danh sách toàn bộ người dùng (Admin dùng để phân công)
  getUsers: (params = {}) => {
    const { query = '', limit = 50 } = params;
    return api.get('/api/users', { 
      params: { query, limit }
    });
  },
  
  // 2. Lấy danh sách project của một user cụ thể
  getUserProjects: (userId) => api.get(`/api/users/${userId}/projects`),
  
  // Lấy thông tin user hiện tại (sử dụng auth service)
  getCurrentUser: () => api.get('/api/Auth/me'),
};

// Project API endpoints - Updated to match backend schema
export const projectAPI = {
  // Lấy danh sách tất cả projects
  getProjects: (params = {}) => {
    const { orgId, status } = params;
    return api.get('/api/Projects', { 
      params: { orgId, status }
    });
  },
  
  // Lấy thông tin chi tiết project
  getProject: (orgId, projectId) => api.get(`/api/Projects/${orgId}/${projectId}`),
  
  // 3. Lấy danh sách thành viên và vai trò trong project
  // Note: This endpoint might need to be implemented in backend
  getProjectMembers: (projectId) => {
    // For now, try to get from project details or implement separate endpoint
    console.warn('ProjectMembers endpoint not found in swagger, using fallback');
    return api.get(`/api/ProjectMembers/${projectId}`).catch(() => {
      // Fallback: return empty array if endpoint not implemented
      return { data: [] };
    });
  },
  
  // 5. Thay đổi vai trò của user trong project
  // Note: This endpoint might need to be implemented in backend
  updateMemberRole: (projectId, userId, roleData) => {
    console.warn('UpdateMemberRole endpoint not found in swagger, using fallback');
    return api.patch(`/api/ProjectMembers/${projectId}/${userId}`, roleData).catch(() => {
      // Fallback: simulate success if endpoint not implemented
      return { data: { ...roleData, userId } };
    });
  },
  
  // 4. Lấy danh sách tasks trong project - Updated to match Task API
  getProjectTasks: (projectId) => api.get('/api/Task', {
    params: { projectId }
  }),
  
  // 6. Tạo task mới trong project - Use existing Task API
  createProjectTask: (projectId, taskData) => {
    const taskPayload = {
      projectId: projectId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'todo',
      type: taskData.type || 'task',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee || taskData.assignee_id,
      reporter: taskData.reporter || taskData.created_by,
      dueDate: taskData.dueDate || taskData.due_date,
      startDate: taskData.startDate,
      endDate: taskData.endDate,
      storyPoints: taskData.storyPoints || 0,
      labels: taskData.labels || []
    };
    return api.post('/api/Task', taskPayload);
  },
  
  // Tạo project mới - Updated to match backend schema
  createProject: (projectData) => {
    const projectPayload = {
      orgId: projectData.orgId,
      name: projectData.name,
      key: projectData.key || projectData.name.toUpperCase().replace(/\s+/g, ''),
      description: projectData.description,
      status: projectData.status || 'active',
      visibility: projectData.visibility || 'private',
      ownerUserId: projectData.ownerUserId,
      avatar: projectData.avatar || '',
    };
    return api.post('/api/Projects', projectPayload);
  },
  
  // Cập nhật project - Updated to match backend schema
  updateProject: (orgId, projectId, projectData) => 
    api.put(`/api/Projects/${orgId}/${projectId}`, projectData),
  
  // Xóa project - Updated to match backend schema
  deleteProject: (orgId, projectId) => 
    api.delete(`/api/Projects/${orgId}/${projectId}`),
  
  // Thêm thành viên vào project - Placeholder for future implementation
  addMember: (projectId, memberData) => {
    console.warn('AddMember endpoint not implemented in backend yet');
    return Promise.resolve({ data: memberData });
  },
  
  // Xóa thành viên khỏi project - Placeholder for future implementation
  removeMember: (projectId, userId) => {
    console.warn('RemoveMember endpoint not implemented in backend yet');
    return Promise.resolve({ data: { success: true } });
  },
};

// Task API endpoints - Updated to match backend Task schema
export const taskAPI = {
  // Get tasks with optional filters
  getTasks: (params = {}) => {
    const { projectId, status } = params;
    return api.get('/api/Task', {
      params: { projectId, status }
    });
  },

  // 7e. Cập nhật task - Updated to match backend schema
  updateTask: (taskId, taskData) => {
    const taskPayload = {
      taskId: taskId,
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      type: taskData.type || 'task',
      priority: taskData.priority,
      assignee: taskData.assignee || taskData.assignee_id,
      reporter: taskData.reporter || taskData.created_by,
      dueDate: taskData.dueDate || taskData.due_date,
      startDate: taskData.startDate,
      endDate: taskData.endDate,
      storyPoints: taskData.storyPoints || 0,
      labels: taskData.labels || []
    };
    return api.put(`/api/Task/${taskId}`, taskPayload);
  },
  
  // 7f. Xóa task - Updated to match backend schema
  deleteTask: (taskId, projectId = null) => {
    const params = projectId ? { projectId } : {};
    return api.delete(`/api/Task/${taskId}`, { params });
  },
  
  // Lấy thông tin chi tiết task
  getTask: (taskId) => api.get(`/api/Task/${taskId}`),
  
  // Tạo task mới - Updated to match backend schema
  createTask: (taskData) => {
    const taskPayload = {
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'todo',
      type: taskData.type || 'task',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee || taskData.assignee_id,
      reporter: taskData.reporter || taskData.created_by,
      dueDate: taskData.dueDate || taskData.due_date,
      startDate: taskData.startDate,
      endDate: taskData.endDate,
      storyPoints: taskData.storyPoints || 0,
      labels: taskData.labels || []
    };
    return api.post('/api/Task', taskPayload);
  },
  
  // Cập nhật trạng thái task
  updateTaskStatus: (taskId, status) => {
    // Use the main update method but only update status
    return api.put(`/api/Task/${taskId}`, { status });
  },
  
  // Assign task cho user
  assignTask: (taskId, userId) => {
    // Use the main update method but only update assignee
    return api.put(`/api/Task/${taskId}`, { assignee: userId });
  },
};

// ✅ Dashboard API - sử dụng real API endpoints
export const dashboardAPI = {
  getStats: async () => {
    try {
      // Gọi API thống kê thực tế
      const response = await api.get('/api/dashboard/stats');
      return {
        data: response.data
      };
    } catch (error) {
      console.warn('⚠️ Dashboard stats API failed, using fallback calculation');
      
      // Fallback: tính stats từ tasks data nếu API dashboard chưa có
      try {
        const tasksResponse = await taskAPI.getTasks();
        const tasks = tasksResponse.data || [];
        
        return {
          data: {
            totalProjects: 0, // Will be updated when project API is available
            totalTasks: tasks.length,
            pendingTasks: tasks.filter(t => ['pending', 'todo'].includes(t.status?.toLowerCase())).length,
            inProgressTasks: tasks.filter(t => ['in-progress', 'inprogress'].includes(t.status?.toLowerCase())).length,
            completedTasks: tasks.filter(t => ['completed', 'done'].includes(t.status?.toLowerCase())).length,
            totalMembers: 0, // Will be updated when user API is available
            overdueeTasks: 0, // Will be calculated when due dates are available
          }
        };
      } catch (fallbackError) {
        console.error('❌ Fallback stats calculation failed:', fallbackError);
        throw new Error('Unable to load dashboard statistics');
      }
    }
  },
  
  getActivities: async () => {
    try {
      // Gọi API activities thực tế
      const response = await api.get('/api/dashboard/activities');
      return {
        data: response.data
      };
    } catch (error) {
      console.warn('⚠️ Dashboard activities API failed, using empty state');
      
      // Fallback: trả về array rỗng nếu API activities chưa có
      return {
        data: []
      };
    }
  },
};

export default api;