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
  
  // 3. Lấy thông tin user theo ID
  getUserById: (userId) => api.get(`/api/users/${userId}`),
  
  // Lấy thông tin user hiện tại (sử dụng auth service)
  getCurrentUser: () => api.get('/api/Auth/me'),
};

// Project API endpoints - Updated to use ProjectMembers endpoints
export const projectAPI = {
  // Get all projects from GET /api/projects
  getAllProjects: (searchTerm = '') => {
    const params = searchTerm ? { search: searchTerm } : {};
    return api.get('/api/projects', { params }).then(response => {
      const projects = response.data || [];
      
      // Transform API response to UI format
      const transformedProjects = projects.map(project => ({
        id: project.projectId,
        name: project.name,
        description: project.description,
        status: 'active', // Default status since API doesn't provide this
        priority: 'medium', // Default priority
        memberCount: project.memberCount || 0,
        taskCount: project.taskCount || 0,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        ownerUserId: project.ownerUserId,
        // Default structure for compatibility
        tasks: {
          total: project.taskCount || 0,
          completed: 0,
          inProgress: 0,
          pending: 0
        },
        members: [], // Will be populated separately if needed
        lead: project.ownerUserId ? {
          id: project.ownerUserId,
          name: 'Project Owner'
        } : null
      }));
      
      console.log('🔄 Transformed projects:', transformedProjects);
      return { data: transformedProjects };
    }).catch(error => {
      console.error('❌ Cannot fetch projects:', error);
      throw error;
    });
  },

  // Get user's projects - using membership data and project details
  getUserProjects: (userId) => {
    return api.get(`/api/users/${userId}/projects`).then(async response => {
      const memberships = response.data || [];
      
      // Get detailed project info for each membership
      const projectPromises = memberships.map(async membership => {
        try {
          // Get full project details using the new API
          const projectRes = await api.get(`/api/projects/${membership.projectId}`);
          const project = projectRes.data;
          
          // Get project members to get real count and find manager
          let realMemberCount = 0;
          let projectManager = null;
          
          try {
            const membersRes = await api.get(`/api/projects/${membership.projectId}/members`);
            const members = membersRes.data || [];
            realMemberCount = members.length;
            
            // Find manager from members
            projectManager = members.find(member => member.role === 'manager');
          } catch (memberError) {
            console.warn('Cannot load members for project', membership.projectId);
            realMemberCount = project.memberCount || 0;
          }
          
          return {
            id: project.projectId,
            projectId: project.projectId,
            name: project.name,
            description: project.description,
            status: membership.memberStatus === 'ACTIVE' ? 'active' : 'inactive',
            priority: 'medium', // Default priority
            role: membership.role,
            memberStatus: membership.memberStatus,
            joinedAt: membership.joinedAt,
            memberCount: realMemberCount,
            taskCount: project.taskCount || 0,
            startDate: project.startDate,
            endDate: project.endDate,
            deadline: project.endDate, // For compatibility
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            ownerUserId: project.ownerUserId,
            // Add tasks structure
            tasks: {
              total: project.taskCount || 0,
              completed: 0,
              inProgress: 0,
              pending: 0
            },
            // Add member info from membership
            members: [{
              id: membership.userId,
              name: membership.username,
              role: membership.role,
              status: membership.memberStatus
            }],
            // Add lead/manager info
            lead: projectManager ? {
              id: projectManager.userId,
              name: projectManager.name || projectManager.username || `User ${projectManager.userId.slice(-8)}`
            } : {
              id: project.ownerUserId,
              name: 'Project Owner'
            }
          };
        } catch (error) {
          console.warn(`⚠️ Cannot get details for project ${membership.projectId}:`, error);
          // Fallback to basic membership data
          return {
            id: membership.projectId,
            projectId: membership.projectId,
            name: `Project ${membership.projectId}`,
            description: `Project managed by ${membership.username}`,
            status: membership.memberStatus === 'ACTIVE' ? 'active' : 'inactive',
            priority: 'medium',
            role: membership.role,
            memberStatus: membership.memberStatus,
            joinedAt: membership.joinedAt,
            createdAt: membership.createdAt,
            updatedAt: membership.updatedAt,
            memberCount: 1, // Fallback count
            taskCount: 0,
            deadline: new Date().toISOString(), // Add deadline for compatibility
            tasks: { total: 0, completed: 0, inProgress: 0, pending: 0 },
            members: [{ id: membership.userId, name: membership.name || membership.username, role: membership.role, status: membership.memberStatus }],
            lead: { id: membership.userId, name: membership.name || membership.username }
          };
        }
      });
      
      const projects = await Promise.all(projectPromises);
      console.log('🔄 Transformed user projects with real data:', projects);
      return { data: projects };
    }).catch(error => {
      console.warn('❌ /api/users/{userId}/projects failed:', error);
      return { data: [] };
    });
  },
  
  // Get specific project details - using direct project API
  getProject: (projectId) => {
    return api.get(`/api/projects/${projectId}`).then(response => {
      const project = response.data;
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Transform API response to UI format  
      const transformedProject = {
        id: project.projectId,
        projectId: project.projectId,
        name: project.name,
        description: project.description,
        status: 'active', // Default status since API doesn't provide this
        priority: 'medium', // Default priority
        memberCount: project.memberCount || 0,
        taskCount: project.taskCount || 0,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        ownerUserId: project.ownerUserId,
        // Preserve API fields for updates
        pk: project.pk,
        sk: project.sk,
        gsI4PK: project.gsI4PK,
        gsI4SK: project.gsI4SK,
        // Default structure for compatibility
        tasks: {
          total: project.taskCount || 0,
          completed: 0,
          inProgress: 0,
          pending: 0
        },
        members: [], // Will be loaded separately if needed
        lead: project.ownerUserId ? {
          id: project.ownerUserId,
          name: 'Project Owner'
        } : null
      };
      
      console.log('🔄 Transformed project details:', transformedProject);
      return { data: transformedProject };
    }).catch(error => {
      console.error('❌ Cannot get project details:', error);
      throw error;
    });
  },
  
  // Project CRUD operations - Create project using POST /api/projects
  createProject: (projectData) => {
    console.log('📝 Creating project with payload:', projectData);
    
    // Create payload for POST /api/projects matching API schema
    const projectPayload = {
      nameProject: projectData.nameProject,
      descriptionP: projectData.descriptionP,
      startDate: projectData.startDate,
      endDate: projectData.endDate
    };
    
    console.log('📤 Sending project payload to POST /api/projects:', projectPayload);
    
    return api.post('/api/projects', projectPayload).then(response => {
      console.log('✅ Project creation success:', response.status);
      console.log('📊 Response data:', response.data);
      
      // Transform response to match expected project format for UI
      const project = response.data;
      return {
        data: {
          id: project.projectId || project.id,
          projectId: project.projectId,
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          taskCount: project.taskCount || 0,
          memberCount: project.memberCount || 0
        }
      };
    }).catch(error => {
      console.error('❌ Project creation failed:', error.response?.data || error.message);
      throw error;
    });
  },
  
  updateProject: (projectId, projectData) => {
    console.log('📝 Updating project:', { projectId, projectData });
    
    // Create payload with ALL required fields from API schema
    const updatePayload = {
      // Required DynamoDB keys
      pk: "PROJECT",
      sk: `PROJECT#${projectId}`,
      projectId: projectId,
      
      // Core project fields
      name: projectData.name,
      description: projectData.description || '',
      
      // Required fields with proper defaults
      ownerUserId: projectData.ownerUserId || "system",
      taskCount: parseInt(projectData.taskCount) || 0,
      memberCount: parseInt(projectData.memberCount) || 0,
      
      // Date fields
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      createdAt: projectData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Required GSI fields
      gsI4PK: projectData.gsI4PK || `USER#${projectData.ownerUserId || "system"}`,
      gsI4SK: projectData.gsI4SK || `PROJECT#${projectId}`
    };
    
    console.log('📤 Sending update payload to PUT /api/projects/' + projectId + ':', updatePayload);
    
    return api.put(`/api/projects/${projectId}`, updatePayload).then(response => {
      console.log('✅ Project update success:', response.status);
      console.log('📊 Update response data:', response.data);
      return response;
    }).catch(error => {
      console.error('❌ Error updating project:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      console.error('❌ Full error response:', error.response);
      
      // Log validation errors if available
      if (error.response?.data?.errors) {
        console.error('❌ Validation errors:', error.response.data.errors);
      }
      
      // Log the exact payload that failed
      console.error('❌ Failed payload was:', updatePayload);
      throw error;
    });
  },
  deleteProject: (projectId) => api.delete(`/api/projects/${projectId}`),
  
  // Project members management using ProjectMembers endpoints
  getProjectMembers: async (projectId) => {
    try {
      console.log('🔄 Fetching project members for:', projectId);
      
      // Get members list
      const membersResponse = await api.get(`/api/projects/${projectId}/members`);
      const rawMembers = membersResponse.data || [];
      console.log('📋 Raw members data:', rawMembers);
      
      // If no members, return empty array
      if (rawMembers.length === 0) {
        return { data: [] };
      }
      
      // Get all users to match userId with user details
      const usersResponse = await userAPI.getUsers({ limit: 1000 });
      const users = usersResponse.data || [];
      console.log('👥 All users data:', users.length, 'users');
      
      // Transform members with user details
      const membersWithDetails = rawMembers.map(member => {
        const userDetails = users.find(user => 
          user.userId === member.userId || user.id === member.userId
        );
        
        return {
          id: member.userId,
          userId: member.userId,
          name: userDetails?.name || userDetails?.username || member.username || `User ${member.userId.slice(-8)}`,
          email: userDetails?.email || `${member.username || 'user'}@email.com`,
          role: member.role || 'member',
          status: member.memberStatus || 'ACTIVE',
          joinedAt: member.joinedAt,
          permissions: member.permissions || []
        };
      });
      
      console.log('✅ Transformed members with details:', membersWithDetails);
      return { data: membersWithDetails };
      
    } catch (error) {
      console.error('❌ Error fetching project members:', error);
      throw error;
    }
  },
  
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

// Task API endpoints - Updated to match backend controller
export const taskAPI = {
  // Get tasks for a specific project (GET /api/task)
  getProjectTasks: (projectId, userId, params = {}) => {
    const queryParams = {
      projectId,
      userId,
      ...params // status, assignee
    };
    console.log('🚀 taskAPI.getProjectTasks calling:', {
      endpoint: '/api/task',
      queryParams
    });
    return api.get('/api/task', { params: queryParams });
  },

  // Get specific task details (GET /api/task/{taskId})
  getTask: (taskId, projectId, userId) => {
    const queryParams = { projectId, userId };
    return api.get(`/api/task/${taskId}`, { params: queryParams });
  },
  
  // Create task using POST /api/task endpoint
  createTask: (taskData, projectId = null, userId = null) => {
    console.log('📝 Creating task with data:', taskData);
    
    const finalProjectId = projectId || taskData.projectId;
    const finalUserId = userId || taskData.userId || taskData.assignee;
    const taskId = taskData.taskId || crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Create payload matching backend API schema with all required DynamoDB fields
    const taskPayload = {
      // DynamoDB keys
      pk: `TASK#${taskId}`,
      sk: `TASK#${taskId}`,
      entityType: "TASK",
      
      // Core task fields
      projectId: finalProjectId,
      taskId: taskId,
      title: taskData.title,
      description: taskData.description || '',
      assignee: taskData.assignee || finalUserId,
      assignedAt: now,
      dueDate: taskData.dueDate || taskData.endDate || '',
      status: taskData.status || 'not-started',
      priority: taskData.priority || 'medium',
      createdAt: now,
      updatedAt: now,
      
      // GSI fields for indexing
      gsI3PK: `PROJECT#${finalProjectId}`,
      gsI3SK: `TASK#${taskId}`,
      gsI4PK: `USER#${finalUserId}`,
      gsI4SK: `TASK#${taskId}`,
      gsI5PK: `STATUS#${taskData.status || 'not-started'}`,
      gsI5SK: `TASK#${taskId}`
    };
    
    console.log('📤 Sending task payload to POST /api/task:', taskPayload);
    
    // API requires projectId and userId as query parameters
    const params = {
      projectId: finalProjectId,
      userId: finalUserId
    };
    
    console.log('📤 Query parameters:', params);
    
    return api.post('/api/task', taskPayload, { params }).then(response => {
      console.log('✅ Task creation success:', response.status);
      console.log('📊 Task response data:', response.data);
      return response;
    }).catch(error => {
      console.error('❌ Task creation failed:', error.response?.data || error.message);
      console.error('❌ Request URL:', error.config?.url);
      console.error('❌ Request params:', error.config?.params);
      throw error;
    });
  },
  
  // Update task (PUT /api/task/{taskId})
  updateTask: (taskId, taskData, projectId, userId = null) => {
    console.log('📝 Updating task:', { taskId, taskData, projectId, userId });
    
    const now = new Date().toISOString();
    const finalUserId = userId || taskData.assignee;
    
    // Create full payload with all DynamoDB fields for update
    const updatePayload = {
      // DynamoDB keys
      pk: `TASK#${taskId}`,
      sk: `TASK#${taskId}`,
      entityType: "TASK",
      
      // Core task fields
      projectId: projectId || taskData.projectId,
      taskId: taskId,
      title: taskData.title,
      description: taskData.description || '',
      assignee: taskData.assignee,
      assignedAt: taskData.assignedAt || now,
      dueDate: taskData.dueDate || taskData.endDate || '',
      status: taskData.status,
      priority: taskData.priority || 'medium',
      createdAt: taskData.createdAt || now,
      updatedAt: now,
      
      // GSI fields for indexing
      gsI3PK: `PROJECT#${projectId || taskData.projectId}`,
      gsI3SK: `TASK#${taskId}`,
      gsI4PK: `USER#${taskData.assignee}`,
      gsI4SK: `TASK#${taskId}`,
      gsI5PK: `STATUS#${taskData.status}`,
      gsI5SK: `TASK#${taskId}`
    };
    
    // API requires projectId and userId as query parameters
    const params = {
      projectId: projectId || taskData.projectId,
      userId: finalUserId
    };
    
    console.log('📤 Update task payload:', updatePayload);
    console.log('📤 Update task params:', params);
    
    return api.put(`/api/task/${taskId}`, updatePayload, { params });
  },
  
  // Update task status only (PATCH /api/task/{taskId}/status)
  updateTaskStatus: (taskId, projectId, userId, status) => {
    const params = { projectId, userId };
    // New API spec: body should be object with status property
    return api.patch(`/api/task/${taskId}/status`, { status: status }, { 
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  
  // Delete task (DELETE /api/task/{taskId})
  deleteTask: (taskId, projectId, userId) => {
    console.log('🗑️ Deleting task:', { taskId, projectId, userId });
    
    const params = { 
      projectId: projectId,
      userId: userId 
    };
    
    console.log('📤 Delete task params:', params);
    return api.delete(`/api/task/${taskId}`, { params });
  },

  // Task files management
  getTaskFiles: (taskId, projectId, userId) => {
    const params = { projectId, userId };
    return api.get(`/api/task/${taskId}/files`, { params });
  },

  uploadTaskFile: (taskId, projectId, userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const params = { projectId, userId };
    
    return api.post(`/api/task/${taskId}/files`, formData, {
      params,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  deleteTaskFile: (taskId, fileId, projectId, userId) => {
    console.log('🗑️ Deleting task file:', { taskId, fileId, projectId, userId });
    
    const params = {
      projectId: projectId,
      userId: userId
    };
    
    console.log('📤 Delete file params:', params);
    return api.delete(`/api/task/${taskId}/files/${fileId}`, { params });
  },

  downloadTaskFile: (taskId, fileId, projectId, userId) => {
    console.log('📥 Downloading task file:', { taskId, fileId, projectId, userId });
    
    const params = {
      projectId: projectId,
      userId: userId
    };
    
    return api.get(`/api/task/${taskId}/files/${fileId}/download`, { 
      params,
      responseType: 'arraybuffer', // Sử dụng arraybuffer thay vì blob để xử lý file mã hóa
      headers: {
        'Accept': '*/*'
      }
    });
  },
};

// Dashboard API for getting summary statistics
export const dashboardAPI = {
  // 8. Dashboard data - statistics summary
  getSummary: (userId) => {
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

// Helper functions để enrich tasks với assignee names
export const enrichTasksWithAssigneeNames = async (tasks) => {
  if (!tasks || !Array.isArray(tasks)) return tasks;
  
  // Lấy danh sách unique assignee IDs
  const assigneeIds = [...new Set(
    tasks
      .map(task => task.assignee)
      .filter(assignee => assignee && typeof assignee === 'string')
  )];
  
  if (assigneeIds.length === 0) return tasks;
  
  try {
    // Fetch thông tin users
    const usersResponse = await userAPI.getUsers();
    const users = usersResponse.data || [];
    
    // Tạo map userId -> user info
    const userMap = {};
    users.forEach(user => {
      userMap[user.userId] = user;
    });
    
    // Enrich tasks với assignee names
    return tasks.map(task => ({
      ...task,
      assigneeName: task.assignee && userMap[task.assignee] 
        ? userMap[task.assignee].name || userMap[task.assignee].username
        : null
    }));
    
  } catch (error) {
    console.warn('Failed to fetch assignee names:', error);
    return tasks;
  }
};

// Admin API - Special endpoints for admin users
export const adminAPI = {
  // Admin can view all tasks without permission restrictions
  getProjectTasks: async (projectId) => {
    try {
      console.log('🔄 Admin fetching project tasks for:', projectId);
      
      // Get current admin user
      const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = currentUser.userId || currentUser.id;
      
      // Use regular API but with admin token
      const response = await api.get(`/api/task`, {
        params: { projectId, userId },
        headers: {
          'X-Admin-Override': 'true' // Custom header to indicate admin access
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ Admin API error loading tasks:', error);
      throw error;
    }
  },
  
  // Admin can create tasks in any project
  createTask: async (projectId, userId, taskData) => {
    try {
      console.log('🔄 Admin creating task:', { projectId, taskData });
      
      const response = await api.post('/api/task', taskData, {
        params: { projectId, userId },
        headers: {
          'X-Admin-Override': 'true'
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ Admin API error creating task:', error);
      throw error;
    }
  }
};