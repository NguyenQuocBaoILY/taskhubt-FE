# 🗺️ TaskHub Workflow Implementation Guide

Hướng dẫn sử dụng luồng API workflow đã được implement theo sơ đồ đề xuất.

## 📊 Sơ Đồ Luồng API Đã Implement

### Workflow Steps

| Step | Mô tả | API Endpoint | React Hook | Component |
|------|--------|--------------|------------|-----------|
| 1 | Lấy danh sách users (Admin) | `GET /api/users` | `loadAllUsers()` | WorkflowDemo |
| 2 | Lấy projects của user | `GET /api/users/{userId}/projects` | `loadUserProjects()` | WorkflowDemo |
| 3 | Lấy chi tiết project + members | `GET /api/projects/{projectId}`<br>`GET /api/projects/{projectId}/members` | `loadProjectDetails()` | WorkflowDemo |
| 4 | Lấy tasks của project | `GET /api/projects/{projectId}/tasks` | `loadProjectTasks()` | WorkflowDemo |
| 5 | Cập nhật role member | `PATCH /api/projects/{projectId}/members/{userId}` | `handleUpdateMemberRole()` | WorkflowDemo |
| 6 | Tạo task mới | `POST /api/projects/{projectId}/tasks` | `handleCreateProjectTask()` | WorkflowDemo |
| 7e | Cập nhật task | `PUT /api/tasks/{taskId}` | `handleUpdateTask()` | WorkflowDemo |
| 7f | Xóa task | `DELETE /api/tasks/{taskId}` | `handleDeleteTask()` | WorkflowDemo |

## 🚀 Quick Start

### 1. Chạy ứng dụng
```bash
npm install
npm run dev
```

### 2. Truy cập Workflow Demo
- Mở browser: `http://localhost:5173`
- Đăng nhập với bất kỳ email/password nào (mock authentication)
- Điều hướng đến: **Workflow Demo** trong navbar

### 3. Test Workflow
1. **Step 1**: Click nút reload ở "Load Users" để test API `/api/users`
2. **Step 2**: Click nút reload ở "User Projects" để test API `/api/users/{userId}/projects`
3. **Step 3-4**: Click vào một project để load chi tiết và tasks
4. **Step 5**: Thay đổi role của thành viên
5. **Step 6**: Tạo task mới
6. **Step 7**: Cập nhật hoặc xóa task

## 🏗️ Architecture Implementation

### Service Layer (`src/services/`)

#### `workflowService.js`
Chứa tất cả business logic cho workflow:
```javascript
// Load users (Step 1)
await workflowService.getAllUsers()

// Load user projects (Step 2)
await workflowService.getUserProjects(userId)

// Load project details (Step 3)
await workflowService.getProjectDetails(projectId)

// Manage tasks (Step 6, 7e, 7f)
await workflowService.createProjectTask(projectId, taskData)
await workflowService.updateTask(taskId, taskData)
await workflowService.deleteTask(taskId)
```

#### `api.js`
Chứa raw API calls:
```javascript
// User APIs
userAPI.getUsers()
userAPI.getUserProjects(userId)

// Project APIs
projectAPI.getProject(projectId)
projectAPI.getProjectMembers(projectId)
projectAPI.getProjectTasks(projectId)

// Task APIs
taskAPI.updateTask(taskId, data)
taskAPI.deleteTask(taskId)
```

### Hook Layer (`src/hooks/`)

#### `useWorkflow.js`
Custom hook để sử dụng workflow:
```javascript
const {
  loadAllUsers,           // Step 1
  loadUserProjects,       // Step 2
  loadProjectDetails,     // Step 3
  loadProjectTasks,       // Step 4
  handleUpdateMemberRole, // Step 5
  handleCreateProjectTask,// Step 6
  handleUpdateTask,       // Step 7e
  handleDeleteTask,       // Step 7f
} = useWorkflow();
```

### State Management (`src/context/`)

#### `AppContext.jsx` - Updated
Thêm state cho workflow:
```javascript
// New state
users: [],                    // All users (Admin)
userProjects: [],            // Projects của user
currentProjectMembers: [],   // Members của project hiện tại
projectTasks: [],           // Tasks của project hiện tại

// New actions
setUsers()
setUserProjects()
setProjectMembers()
setProjectTasks()
updateMemberRole()
```

## 🎯 Component Usage

### WorkflowDemo Component
```jsx
import useWorkflow from '../hooks/useWorkflow';
import { useAuth, useApp } from '../hooks/useContext';

function MyComponent() {
  const { user } = useAuth();
  const { users, userProjects, currentProject } = useApp();
  const { loadUserProjects, loadCompleteProjectData } = useWorkflow();

  // Load user's projects
  useEffect(() => {
    loadUserProjects(user.id);
  }, [user]);

  // Load complete project data
  const handleSelectProject = async (project) => {
    await loadCompleteProjectData(project.id);
  };
}
```

## 🔄 API Mock vs Real Backend

### Hiện tại (Mock Mode)
- Authentication: Mock trong localStorage
- Task APIs: Một số endpoints đã sẵn sàng kết nối backend
- User/Project APIs: Sẽ gọi đến backend khi có

### Khi có Real Backend
```javascript
// Chỉ cần cập nhật base URL trong .env
VITE_API_BASE_URL=https://your-real-api.com

// Tất cả workflow sẽ hoạt động với real API
```

## 🧪 Testing Workflow

### Manual Testing
1. Mở Developer Tools → Console
2. Theo dõi logs với format:
   ```
   🔄 [Step X] Action starting...
   ✅ [Step X] Action completed
   ❌ [Step X] Action failed: error
   ```

### API Calls Monitoring
Workflow Demo page hiển thị real-time status của tất cả API calls đã thực hiện.

## 📝 Error Handling

Tất cả API calls đều có error handling:
```javascript
// Service level
try {
  const result = await api.call();
  return { success: true, data: result.data };
} catch (error) {
  console.error('API Error:', error);
  toast.error('User-friendly message');
  return { success: false, error };
}

// Hook level  
const result = await workflowService.method();
if (result.success) {
  updateState(result.data);
} else {
  setError(result.error);
}
```

## 🎨 UI/UX Features

- **Real-time status**: Visual indicators cho từng workflow step
- **Loading states**: Spinner animations khi đang gọi API
- **Error feedback**: Toast notifications và error messages
- **Interactive workflow**: Click-through demonstration
- **API logs**: Console logs để debug

## 🔧 Customization

### Thêm API endpoint mới
1. Cập nhật `api.js`:
```javascript
export const newAPI = {
  newMethod: (params) => api.get('/api/new-endpoint', { params })
};
```

2. Cập nhật `workflowService.js`:
```javascript
async newWorkflowMethod(params) {
  const result = await newAPI.newMethod(params);
  // Handle result...
}
```

3. Cập nhật `useWorkflow.js`:
```javascript
const handleNewAction = useCallback(async (params) => {
  const result = await workflowService.newWorkflowMethod(params);
  // Update state...
}, []);
```

## 📚 Code Examples

### Complete Project Selection Flow
```javascript
// User selects a project
const handleProjectSelect = async (project) => {
  setSelectedProject(project);
  
  // Step 3-4: Load complete project data
  const result = await loadCompleteProjectData(project.id);
  
  if (result.success) {
    // State automatically updated via useWorkflow
    console.log('Project loaded:', currentProject);
    console.log('Members loaded:', currentProjectMembers);
    console.log('Tasks loaded:', projectTasks);
  }
};
```

### Task Management Flow
```javascript
// Create task (Step 6)
const createTask = async (taskData) => {
  const result = await handleCreateProjectTask(selectedProject.id, {
    title: taskData.title,
    description: taskData.description,
    priority: taskData.priority,
    assignee_id: taskData.assigneeId,
    status: 'pending',
  });
  
  // Task automatically added to projectTasks state
};

// Update task status (Step 7e)
const updateTaskStatus = async (task, newStatus) => {
  await handleUpdateTask(task.id, {
    ...task,
    status: newStatus,
  });
};
```

## 🎉 Next Steps

1. **Connect Real Backend**: Cập nhật API endpoints khi backend sẵn sàng
2. **Add Authentication**: Tích hợp AWS Cognito
3. **Add Permissions**: Implement role-based access control
4. **Add Validations**: Form validation và business rules
5. **Add Tests**: Unit tests và integration tests

## 🐛 Troubleshooting

### API Connection Issues
```bash
# Check console for API errors
# Verify VITE_API_BASE_URL in .env file
# Ensure backend is running on correct port
```

### State Not Updating
```bash
# Check useWorkflow hook is properly imported
# Verify AppContext provider is wrapping component
# Check console for service call results
```

### Workflow Demo Not Working
```bash
# Ensure user is logged in (mock auth)
# Check browser console for errors
# Verify route is added to App.jsx
```