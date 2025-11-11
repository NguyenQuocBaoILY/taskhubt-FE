import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.taskhub.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token: newRefreshToken } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          // Retry original request
          return api(originalRequest);
        }
      } catch {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  signup: (userData) =>
    api.post('/auth/signup', userData),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  refreshToken: (refreshToken) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
};

// Project API
export const projectAPI = {
  getProjects: (page = 1, limit = 10, search = '') =>
    api.get(`/projects?page=${page}&limit=${limit}&search=${search}`),
  
  getProject: (id) =>
    api.get(`/projects/${id}`),
  
  createProject: (data) =>
    api.post('/projects', data),
  
  updateProject: (id, data) =>
    api.put(`/projects/${id}`, data),
  
  deleteProject: (id) =>
    api.delete(`/projects/${id}`),
  
  getProjectMembers: (projectId) =>
    api.get(`/projects/${projectId}/members`),
  
  addProjectMember: (projectId, userData) =>
    api.post(`/projects/${projectId}/members`, userData),
  
  removeProjectMember: (projectId, userId) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
  
  updateMemberRole: (projectId, userId, role) =>
    api.put(`/projects/${projectId}/members/${userId}`, { role }),
};

// Task API
export const taskAPI = {
  getTasks: (projectId, filters = {}) => {
    const params = new URLSearchParams();
    if (projectId) params.append('project_id', projectId);
    if (filters.status) params.append('status', filters.status);
    if (filters.assignee) params.append('assignee', filters.assignee);
    if (filters.due_date) params.append('due_date', filters.due_date);
    
    return api.get(`/tasks?${params}`);
  },
  
  getTask: (id) =>
    api.get(`/tasks/${id}`),
  
  createTask: (data) =>
    api.post('/tasks', data),
  
  updateTask: (id, data) =>
    api.put(`/tasks/${id}`, data),
  
  deleteTask: (id) =>
    api.delete(`/tasks/${id}`),
  
  updateTaskStatus: (id, status) =>
    api.patch(`/tasks/${id}/status`, { status }),
  
  assignTask: (id, assigneeId) =>
    api.patch(`/tasks/${id}/assign`, { assignee_id: assigneeId }),
  
  addComment: (taskId, comment) =>
    api.post(`/tasks/${taskId}/comments`, { comment }),
  
  getComments: (taskId) =>
    api.get(`/tasks/${taskId}/comments`),
};

// User API
export const userAPI = {
  getUsers: (page = 1, limit = 10, search = '') =>
    api.get(`/users?page=${page}&limit=${limit}&search=${search}`),
  
  getUser: (id) =>
    api.get(`/users/${id}`),
  
  updateUser: (id, data) =>
    api.put(`/users/${id}`, data),
  
  deleteUser: (id) =>
    api.delete(`/users/${id}`),
  
  updateUserRole: (id, role) =>
    api.patch(`/users/${id}/role`, { role }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    api.get('/dashboard/stats'),
  
  getChartData: (type, period = '7d') =>
    api.get(`/dashboard/charts/${type}?period=${period}`),
  
  getActivities: (limit = 10) =>
    api.get(`/dashboard/activities?limit=${limit}`),
};

export default api;