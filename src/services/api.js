import axios from 'axios';

// Function để tự động detect base URL
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_BASE_URL;
  
  if (envURL) {
    return envURL;
  }
  
  // Auto-detect based on current protocol
  const protocol = window.location.protocol; // 'http:' or 'https:'
  const httpsPort = '17057';
  const httpPort = '15155';
  
  if (protocol === 'https:') {
    return `https://localhost:${httpsPort}`;
  } else {
    return `http://localhost:${httpPort}`;
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

console.log('🌐 Using API Base URL:', api.defaults.baseURL);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Task API endpoints
export const taskAPI = {
  // ✅ API tạo task mới đã có
  createTask: (task) => api.post('/api/Task', task),
  
  // Các API khác
  getTasks: (params = {}) => {
    const { projectId, status } = params;
    const queryParams = new URLSearchParams();
    if (projectId) queryParams.append('projectId', projectId);
    if (status) queryParams.append('status', status);
    
    const url = `/api/Task${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get(url);
  },
  updateTask: (taskId, task) => api.put(`/api/Task/${taskId}`, task),
  deleteTask: (taskId, projectId) => {
    const queryParams = new URLSearchParams();
    if (projectId) queryParams.append('projectId', projectId);
    return api.delete(`/api/Task/${taskId}?${queryParams}`);
  },
};

// ✅ SỬA dashboardAPI - bỏ try/catch không cần thiết
export const dashboardAPI = {
  getStats: async () => {
    // Tính stats từ tasks data
    const tasksResponse = await taskAPI.getTasks();
    const tasks = tasksResponse.data || [];
    
    return {
      data: {
        totalProjects: 12, // Mock data tạm thời
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => ['pending', 'todo'].includes(t.status?.toLowerCase())).length,
        inProgressTasks: tasks.filter(t => ['in-progress', 'inprogress'].includes(t.status?.toLowerCase())).length,
        completedTasks: tasks.filter(t => ['completed', 'done'].includes(t.status?.toLowerCase())).length,
        totalMembers: 8, // Mock data tạm thời
        overdueeTasks: 3, // Mock data tạm thời
      }
    };
  },
  
  getActivities: () => {
    // Mock activities data - sau này có thể thay bằng real API
    return Promise.resolve({
      data: [
        {
          id: 1,
          type: 'task_completed',
          message: 'John Doe đã hoàn thành task "Setup database"',
          time: '2 phút trước',
          color: 'text-green-600',
        },
        {
          id: 2,
          type: 'task_assigned',
          message: 'Task "Design UI components" đã được giao cho Jane Smith',
          time: '15 phút trước',
          color: 'text-blue-600',
        }
      ]
    });
  },
};

export default api;