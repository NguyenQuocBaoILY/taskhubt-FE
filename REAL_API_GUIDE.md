# 🔌 Real API Integration Guide

## ✅ Đã Hoàn Thành Migration từ Mock → Real API

### 🎯 **Thay Đổi Chính:**

1. **Authentication**: Từ mock localStorage → Real API calls
2. **API Endpoints**: Tất cả endpoints đã được cập nhật
3. **Error Handling**: Enhanced với proper HTTP status handling
4. **Token Management**: Automatic refresh token với interceptors
5. **Backend Status**: Real-time connection monitoring

---

## 🚀 **Cách Chạy với Real Backend**

### 1. **Cấu hình Environment**

Đảm bảo file `.env` có:
```env
# Real API Configuration
VITE_API_BASE_URL=http://localhost:15155
VITE_USE_REAL_API=true
VITE_ENABLE_MOCK_API=false
```

### 2. **Start Backend trước**

```bash
# Terminal 1: Backend
cd path/to/your/backend
dotnet run
# Đảm bảo backend chạy ở http://localhost:15155
```

### 3. **Start Frontend**

```bash
# Terminal 2: Frontend  
npm run dev
# Frontend sẽ chạy ở http://localhost:5173
```

---

## 🔄 **API Endpoints Đã Implement**

### Authentication APIs
```javascript
POST /api/auth/login          // ✅ Đăng nhập
POST /api/auth/register       // ✅ Đăng ký  
GET  /api/auth/me            // ✅ Lấy thông tin user hiện tại
POST /api/auth/refresh       // ✅ Refresh token
POST /api/auth/logout        // ✅ Đăng xuất
```

### Workflow APIs (theo sơ đồ)
```javascript
// Step 1: Users
GET /api/users                           // ✅ Lấy danh sách users

// Step 2: User Projects  
GET /api/users/{userId}/projects         // ✅ Projects của user

// Step 3: Project Details
GET /api/projects/{projectId}            // ✅ Chi tiết project
GET /api/projects/{projectId}/members    // ✅ Members của project

// Step 4: Project Tasks
GET /api/projects/{projectId}/tasks      // ✅ Tasks của project

// Step 5: Member Management
PATCH /api/projects/{projectId}/members/{userId} // ✅ Update role

// Step 6: Task Creation  
POST /api/projects/{projectId}/tasks     // ✅ Tạo task mới

// Step 7: Task Management
PUT /api/tasks/{taskId}                  // ✅ Cập nhật task
DELETE /api/tasks/{taskId}               // ✅ Xóa task
```

### Dashboard APIs
```javascript
GET /api/dashboard/stats       // ✅ Thống kê dashboard
GET /api/dashboard/activities  // ✅ Hoạt động gần đây
```

### Health Check
```javascript
GET /health                    // ✅ Kiểm tra kết nối
```

---

## 🔐 **Authentication Flow**

### 1. **Login Process**
```javascript
// User nhập email + password
POST /api/auth/login
{
  "email": "user@example.com", 
  "password": "password123"
}

// Response
{
  "user": { "id": 1, "name": "User", "email": "..." },
  "access_token": "jwt_token...",
  "refresh_token": "refresh_token..."
}
```

### 2. **Auto Token Refresh**
- Khi API trả về 401, frontend tự động:
  1. Gọi `/api/auth/refresh` với refresh_token
  2. Cập nhật access_token mới
  3. Retry request ban đầu
  4. Nếu refresh fail → redirect login

### 3. **Logout Process**
```javascript
// Clear tokens từ backend + localStorage
POST /api/auth/logout
// + Remove từ localStorage
```

---

## 🎮 **Cách Test Workflow**

### 1. **Backend Connection**
- Mở WorkflowDemo page
- Kiểm tra **Backend Status** ở top
- Màu xanh = connected, đỏ = disconnected

### 2. **Authentication**
```bash
# Test login với real API
Email: admin@example.com
Password: password123
```

### 3. **Workflow Steps**
1. **Step 1**: Click "Load Users" → gọi `/api/users`
2. **Step 2**: Auto load user projects → gọi `/api/users/{id}/projects`
3. **Step 3**: Click project → gọi project details
4. **Step 4**: Auto load tasks → gọi project tasks
5. **Step 5**: Change member role → gọi member update API
6. **Step 6**: Create task → gọi task creation API
7. **Step 7**: Update/Delete task → gọi task management APIs

---

## 🔧 **Error Handling**

### 1. **Network Errors**
```javascript
// Không kết nối được server
Error: "Không thể kết nối đến server. Kiểm tra kết nối mạng"
```

### 2. **Authentication Errors** 
```javascript
// 401 Unauthorized
Error: "Bạn cần đăng nhập lại"

// 403 Forbidden  
Error: "Bạn không có quyền thực hiện thao tác này"
```

### 3. **Validation Errors**
```javascript
// 400 Bad Request
Error: "Dữ liệu không hợp lệ" 
// hoặc message từ server
```

### 4. **Server Errors**
```javascript
// 500 Internal Server Error
Error: "Lỗi server. Vui lòng thử lại sau"
```

---

## 📊 **Monitoring & Debugging**

### 1. **Console Logs**
```javascript
🔄 [Step X] Action starting...     // Bắt đầu API call
✅ [Step X] Action completed       // Thành công  
❌ [Step X] Action failed: error   // Thất bại
```

### 2. **Network Tab**
- Mở DevTools → Network
- Xem tất cả HTTP requests
- Check status codes, response data

### 3. **Backend Status Component**
- Real-time connection monitoring
- Response time tracking  
- Auto health checks every 30s

---

## 🚨 **Troubleshooting**

### **"Không thể kết nối đến server"**
```bash
✅ Check backend đã start chưa
✅ Check port đúng không (15155)
✅ Check VITE_API_BASE_URL trong .env
✅ Check firewall/antivirus
```

### **"Token invalid"**
```bash
✅ Clear localStorage và login lại
✅ Check backend có implement auth APIs chưa
✅ Check token format đúng chưa
```

### **"API endpoint not found"**
```bash
✅ Check backend có implement endpoint chưa
✅ Check HTTP method đúng chưa (GET/POST/PUT/DELETE)
✅ Check URL path đúng chưa
```

### **CORS Errors**
```bash
✅ Backend cần enable CORS cho localhost:5173
✅ Check Access-Control-Allow-Origin header
```

---

## ⚡ **Performance Tips**

### 1. **API Optimization**
- Parallel requests khi có thể
- Pagination cho large datasets
- Caching responses khi appropriate

### 2. **Error Recovery**
- Automatic retry cho network failures
- Graceful degradation khi API unavailable
- User-friendly error messages

### 3. **Loading States**
- Show spinners cho long requests
- Disable buttons khi đang xử lý
- Progressive data loading

---

## 🔮 **Next Steps**

### 1. **Enhanced Security**
- Implement role-based access control
- Add request signing
- Add rate limiting

### 2. **Advanced Features** 
- WebSocket cho real-time updates
- Offline mode với service workers
- Advanced caching strategies

### 3. **Production Ready**
- Environment-specific configs
- Monitoring & analytics
- Error reporting service

---

## 📚 **Code Examples**

### **Sử dụng Workflow Hook**
```javascript
import useWorkflow from '../hooks/useWorkflow';

function MyComponent() {
  const {
    loadUserProjects,
    handleCreateProjectTask,
    handleUpdateTask
  } = useWorkflow();

  // Load projects
  const handleLoadProjects = async () => {
    const result = await loadUserProjects(userId);
    if (result.success) {
      console.log('Projects:', result.data);
    }
  };

  // Create task  
  const handleCreateTask = async (taskData) => {
    const result = await handleCreateProjectTask(projectId, taskData);
    if (result.success) {
      console.log('Task created:', result.data);
    }
  };
}
```

### **Direct API Usage**
```javascript
import { userAPI, projectAPI, taskAPI } from '../services/api';

// Get users
const users = await userAPI.getUsers();

// Get project details
const project = await projectAPI.getProject(projectId);

// Update task
const updatedTask = await taskAPI.updateTask(taskId, taskData);
```

---

🎉 **Chúc mừng! Bạn đã successfully migrate từ mock data sang real API integration!**