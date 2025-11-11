# TaskHub Frontend

TaskHub là một nền tảng quản lý nhiệm vụ và tiến độ theo mô hình DevSecOps trên AWS, được phát triển với Vite + React + JavaScript.

## 🚀 Tính năng chính

- **Dashboard**: Trang tổng quan với thống kê dự án, task và hoạt động gần đây
- **Authentication**: Đăng nhập/đăng ký với validation và tích hợp sẵn cho AWS Cognito
- **Project Management**: Quản lý dự án với CRUD operations
- **Task Management**: Kanban board với drag & drop cho quản lý task
- **Role-based Access Control**: Phân quyền theo vai trò (Admin, Manager, Member)
- **Responsive Design**: Giao diện responsive với Tailwind CSS

## 🛠 Công nghệ sử dụng

- **Frontend Framework**: React 19 với Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios với interceptors
- **Form Handling**: React Hook Form
- **Icons**: Heroicons
- **Drag & Drop**: @dnd-kit
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Notifications**: React Hot Toast

## 📁 Cấu trúc dự án

```
src/
├── components/         # Shared components
│   ├── Layout.jsx     # Layout chính
│   └── Navbar.jsx     # Navigation bar
├── pages/             # Page components
│   ├── Login.jsx      # Trang đăng nhập
│   ├── Signup.jsx     # Trang đăng ký
│   └── Dashboard.jsx  # Trang dashboard
├── context/           # React contexts
│   ├── AuthContext.jsx   # Authentication state
│   └── AppContext.jsx    # Application state
├── services/          # API services
│   └── api.js         # API configuration và methods
├── hooks/            # Custom hooks
│   └── useContext.js  # Context hooks
└── utils/            # Utility functions
```

## 🚦 Cài đặt và chạy dự án

### Prerequisites

- Node.js 18+ và npm
- Git

### Cài đặt

1. Clone repository:
   ```bash
   git clone <repository-url>
   cd taskhub-frontend
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Tạo file môi trường:
   ```bash
   cp .env.example .env
   ```

4. Chỉnh sửa file `.env` theo cấu hình của bạn:
   ```
   VITE_API_URL=http://localhost:3000/api/v1
   VITE_AWS_REGION=us-east-1
   VITE_COGNITO_USER_POOL_ID=your-user-pool-id
   VITE_COGNITO_CLIENT_ID=your-client-id
   ```

5. Chạy development server:
   ```bash
   npm run dev
   ```

6. Mở trình duyệt và truy cập: `http://localhost:5173`

### Build cho production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 🔐 Authentication Flow

Dự án đã được tích hợp sẵn để hoạt động với AWS Cognito:

1. **Login**: Form đăng nhập với email/password
2. **Signup**: Form đăng ký với validation đầy đủ
3. **Token Management**: Tự động refresh token khi hết hạn
4. **Protected Routes**: Chỉ user đã đăng nhập mới truy cập được
5. **Role-based Access**: Phân quyền theo vai trò user

## 📊 API Integration

API service đã được cấu hình với:

- **Base URL**: Configurable through environment variables
- **Authentication**: Automatic token attachment
- **Error Handling**: Centralized error handling
- **Request/Response Interceptors**: Auto token refresh

### API Endpoints

```javascript
// Auth
POST /auth/login
POST /auth/signup
POST /auth/logout
GET /auth/me
POST /auth/refresh

// Projects
GET /projects
GET /projects/:id
POST /projects
PUT /projects/:id
DELETE /projects/:id

// Tasks
GET /tasks
GET /tasks/:id
POST /tasks
PUT /tasks/:id
DELETE /tasks/:id
PATCH /tasks/:id/status
```

## 🎨 UI Components

### Layout
- **Navbar**: Responsive navigation với mobile menu
- **Layout**: Wrapper layout với outlet cho pages

### Pages
- **Login**: Form đăng nhập với validation
- **Signup**: Form đăng ký với role selection
- **Dashboard**: Tổng quan với stats và recent activities

### Planned Components
- **ProjectList**: Danh sách dự án với filter/search
- **TaskBoard**: Kanban board với drag & drop
- **TaskCard**: Component hiển thị task
- **Modal**: Reusable modal component

## 🔄 State Management

### AuthContext
- User authentication state
- Login/logout functionality
- Token management
- User profile data

### AppContext
- Project management state
- Task management state
- Filters và search state
- Global loading và error states

## 📱 Responsive Design

Giao diện được thiết kế responsive với Tailwind CSS:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📈 Deployment

### AWS S3 + CloudFront (Recommended)

1. Build project:
   ```bash
   npm run build
   ```

2. Upload `dist` folder to S3 bucket

3. Configure CloudFront distribution

4. Setup Route53 for custom domain

### GitHub Actions CI/CD

File workflow sẽ được tạo để tự động:
- Build và test
- Security scan
- Deploy lên AWS S3
- Invalidate CloudFront cache

## 🔒 Security Features

- **XSS Protection**: Sanitized inputs
- **CSRF Protection**: Token-based authentication
- **Secure Storage**: Token storage best practices
- **API Security**: Request/response validation
- **Role-based Access**: Authorization checks

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.taskhub.com/v1` |
| `VITE_AWS_REGION` | AWS Region | `us-east-1` |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID | `us-east-1_xxxxxxxx` |
| `VITE_COGNITO_CLIENT_ID` | Cognito Client ID | `xxxxxxxxxxxxxxxxxx` |

## 🤝 Contribution

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team Roles

Dự án này được phát triển theo mô hình team với các role:

1. **Backend Lead**: API design, architecture, code standards
2. **Backend Developer 1**: Task CRUD, DynamoDB optimization  
3. **Backend Developer 2**: Project/User CRUD, Auth & Security
4. **Frontend Developer**: UI/UX, API integration (current role)
5. **DevOps Engineer**: CI/CD, Infrastructure, Security monitoring

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub repository.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
