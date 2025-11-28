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
          
          // ✅ Chỉ clear tokens, không force redirect
          // Để AuthContext xử lý authentication state
          if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
            console.log('🧼 Refresh token invalid, clearing tokens...');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_info');
            // Dispatch custom event to notify AuthContext about token expiration
            window.dispatchEvent(new CustomEvent('token-expired'));
          } else {
            console.log('📡 Refresh failed due to network/server error, keeping user logged in');
          }
        }
      } else {
        console.log('⚠️ No refresh token available');
        // ✅ Don't automatically redirect - let component handle authentication state
      }
    }
    
    // ✅ Nếu là network error, không làm gì cả
    if (!error.response) {
      console.log('📡 Network error or server unavailable');
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

// Project API endpoints - Updated to use ProjectMembers endpoints
export const projectAPI = {
  // Get user's projects - transforms membership data to project format
  getUserProjects: (userId) => {
    return api.get(`/api/users/${userId}/projects`).then(response => {
      const memberships = response.data || [];
      
      // Transform membership data to project format for UI
      const projects = memberships.map(membership => ({
        id: membership.projectId,
        name: `Project ${membership.projectId}`, // Default name, could be enhanced
        description: `Project managed by ${membership.username}`,
        status: membership.memberStatus === 'ACTIVE' ? 'active' : 'inactive',
        priority: 'medium', // Default priority
        role: membership.role,
        memberStatus: membership.memberStatus,
        joinedAt: membership.joinedAt,
        createdAt: membership.createdAt,
        updatedAt: membership.updatedAt,
        username: membership.username,
        userId: membership.userId,
        // Add default tasks structure
        tasks: {
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0
        },
        // Add default members array
        members: [{
          id: membership.userId,
          name: membership.username,
          role: membership.role,
          status: membership.memberStatus
        }],
        // Add lead/owner info
        lead: {
          id: membership.userId,
          name: membership.username
        }
      }));
      
      console.log('🔄 Transformed memberships to projects:', projects);
      return { data: projects };
    }).catch(async (error) => {
      console.warn('❌ /api/users/{userId}/projects failed:', error);
      return { data: [] };
    });
  },
  
  // Get specific project details - get from project members
  getProject: (projectId) => {
    // Get project info by fetching its members
    return api.get(`/api/projects/${projectId}/members`).then(response => {
      const members = response.data || [];
      
      if (members.length === 0) {
        throw new Error('Project not found or no members');
      }
      
      // Find owner/manager
      const owner = members.find(member => member.role === 'owner' || member.role === 'manager') || members[0];
      
      // Construct project from members data
      const project = {
        id: projectId,
        name: `Project ${projectId}`,
        description: `Project with ${members.length} member(s)`,
        status: 'active',
        priority: 'medium',
        createdAt: members[0]?.createdAt,
        updatedAt: members[0]?.updatedAt,
        // Project members
        members: members.map(member => ({
          id: member.userId,
          name: member.username,
          role: member.role,
          status: member.memberStatus,
          joinedAt: member.joinedAt,
          email: member.email || `${member.username}@example.com`
        })),
        // Project lead/owner
        lead: {
          id: owner.userId,
          name: owner.username,
          role: owner.role
        },
        // Default tasks structure
        tasks: {
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0
        }
      };
      
      console.log('🔄 Constructed project from members:', project);
      return { data: project };
    }).catch(error => {
      console.error('❌ Cannot get project details:', error);
      throw error;
    });
  },
  
  // Project CRUD operations - Create project using POST /api/projects
  createProject: (projectData) => {
    // Get userID from stored user info (from login response)
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const userId = userInfo.userId;
    const username = userInfo.username;
    
    console.log('📝 Creating project with payload:', {
      projectData,
      userId,
      userInfo
    });
    
    // Create payload for POST /api/projects with correct backend schema
    const projectPayload = {
      projectId: projectData.projectId,
      orgId: "string", // Required by backend
      name: projectData.name,
      key: "string", // Required by backend  
      description: projectData.description || '',
      visibility: "string", // Required by backend
      managerUserId: userId,
      managerUsername: username,
      managerRole: projectData.status || 'manager', // Use status field as role
      members: [
        {
          userId: userId,
          role: projectData.status || 'manager' // Use status field as role
        }
      ],
      priority: projectData.priority || 'medium',
      status: 'ACTIVE',
      startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : new Date().toISOString(),
      endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
    };
    
    console.log('📤 Sending project payload to POST /api/projects:', projectPayload);
    console.log('📋 Full payload structure:', JSON.stringify(projectPayload, null, 2));
    
    return api.post('/api/projects', projectPayload).then(response => {
      console.log('✅ Project creation success:', response.status);
      console.log('📊 Response data:', response.data);
      // Transform response to match expected project format for UI
      const project = response.data;
      return {
        data: {
          id: project.projectId || project.id,
          name: project.name,
          description: project.description,
          status: project.status ? project.status.toLowerCase() : 'active',
          priority: project.priority || 'medium',
          ownerId: project.managerUserId,
          members: project.members || [{
            id: project.managerUserId,
            name: project.managerUsername,
            role: project.managerRole
          }],
          createdAt: project.startDate || new Date().toISOString(),
          // Add required tasks object for UI
          tasks: {
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0
          },
          // Add lead info
          lead: {
            id: project.managerUserId,
            name: project.managerUsername
          },
          ...project
        }
      };
    }).catch(error => {
      console.error('❌ Error creating project:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response errors:', error.response?.data?.errors);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      throw error;
    });
  },
  
  updateProject: (projectId, projectData) => {
    // Get userID from stored user info
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const userId = userInfo.userId;
    
    console.log('📝 Updating project:', { projectId, projectData, userId, userInfo });
    
    // Create payload for PUT /api/projects/by-id/{projectId} with full schema
    const updatePayload = {
      projectId: projectData.projectId,
      orgId: projectData.orgId || "string",
      name: projectData.name,
      key: projectData.key || "string", 
      description: projectData.description || '',
      status: projectData.status || 'ACTIVE',
      visibility: projectData.visibility || "string",
      ownerUserId: projectData.ownerUserId || userId,
      avatar: projectData.avatar || null,
      taskCount: projectData.taskCount || 0,
      memberCount: projectData.memberCount || 0,
      priority: projectData.priority || 'medium',
      startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : new Date().toISOString(),
      endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : null,
      createdAt: projectData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gsI4PK: projectData.gsI4PK || `USER#${userId}`,
      gsI4SK: projectData.gsI4SK || `PROJECT#${projectData.projectId}`
    };
    
    console.log('📤 Sending update payload to PUT /api/projects/by-id/' + projectId + ':', updatePayload);
    
    return api.put(`/api/projects/by-id/${projectId}`, updatePayload).then(response => {
      console.log('✅ Project update success:', response.status);
      console.log('📊 Update response data:', response.data);
      return response;
    }).catch(error => {
      console.error('❌ Error updating project:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    });
  },
  deleteProject: (projectId) => api.delete(`/api/projects/${projectId}`),
  
  // Project members management using ProjectMembers endpoints
  getProjectMembers: (projectId) => api.get(`/api/projects/${projectId}/members`),
  
  // Get specific member info
  getProjectMember: (projectId, userId) => api.get(`/api/projects/${projectId}/members/${userId}`),
  
  // Add member to project
  addProjectMember: (projectId, memberData) => {
    const payload = {
      userId: memberData.userId,
      role: memberData.role || 'member' // default to 'member' role
    };
    return api.post(`/api/projects/${projectId}/members`, payload);
  },
  
  // Update member role and status
  updateMemberRole: (projectId, userId, roleData) => {
    const payload = {
      role: roleData.role,
      memberStatus: roleData.memberStatus || 'ACTIVE'
    };
    return api.patch(`/api/projects/${projectId}/members/${userId}`, payload);
  },
  
  // Remove member from project
  removeProjectMember: (projectId, userId) => {
    return api.delete(`/api/projects/${projectId}/members/${userId}`);
  },
};

// Task API endpoints - Optimized for specific project needs
export const taskAPI = {
  // Get tasks for a specific project only (to reduce unnecessary API calls)
  getProjectTasks: (projectId, params = {}) => {
    return api.get(`/api/projects/${projectId}/tasks`, { params });
  },

  // Get specific task details
  getTask: (taskId) => api.get(`/api/tasks/${taskId}`),
  
  // Create task in project
  createTask: (projectId, taskData) => {
    const taskPayload = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      assigneeId: taskData.assigneeId,
      dueDate: taskData.dueDate,
      // Add other fields as needed
    };
    return api.post(`/api/projects/${projectId}/tasks`, taskPayload);
  },
  
  // Update task
  updateTask: (taskId, taskData) => {
    return api.put(`/api/tasks/${taskId}`, taskData);
  },
  
  // Delete task
  deleteTask: (taskId) => {
    return api.delete(`/api/tasks/${taskId}`);
  },
};

// Dashboard API for getting summary statistics
export const dashboardAPI = {
  // 8. Dashboard data - statistics summary
  getSummary: (userId, params = {}) => {
    // Fallback for dashboard data if specific endpoint is not available
    return Promise.all([
      userAPI.getUserProjects(userId).catch(() => ({ data: [] }))
    ]).then(([projectsRes]) => {
      const projects = projectsRes.data || [];
      
      // Calculate summary from available data
      const summary = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        recentProjects: projects.slice(0, 5),
        recentTasks: [] // Will need separate task endpoint to get this
      };
      
      return { data: summary };
    }).catch(error => {
      console.warn('Dashboard summary calculation failed:', error);
      // Return default empty summary
      return {
        data: {
          totalProjects: 0,
          activeProjects: 0, 
          completedProjects: 0,
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          overdueTasks: 0,
          recentProjects: [],
          recentTasks: []
        }
      };
    });
  }
};