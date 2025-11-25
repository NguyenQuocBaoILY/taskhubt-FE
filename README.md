# TaskHub Frontend

Dự án này là giao diện web của ứng dụng quản lý công việc **TaskHub**, xây bằng **React + Vite + Tailwind CSS v3**.

README này viết cho người mới, chỉ cần làm đúng từng bước là chạy được.
## 1. Cần chuẩn bị trước

Trước khi bắt đầu, hãy cài những phần mềm sau (chỉ cần cài 1 lần trên máy):

1. **Node.js LTS (khuyến nghị 18.x hoặc 20.x)**  
    - Tải tại: https://nodejs.org/en/download  
    - Cài xong, mở **PowerShell** và kiểm tra:

    ```powershell
    node -v
    npm -v
    ```

    Nếu hiện ra số version (ví dụ `v20.10.0`) là được.

2. **.NET SDK 8.0** (dùng cho backend)  
    - Tải tại: https://dotnet.microsoft.com/download/dotnet/8.0  
    - Sau khi cài, kiểm tra:

    ```powershell
    dotnet --version
    ```

    Nếu thấy số version là OK.

3. **Git** (không bắt buộc nhưng nên có):  
    - Tải tại: https://git-scm.com/downloads

---

## 2. Cấu trúc dự án

Trong thư mục chính `projectAWS` bạn có:

- `taskhub_frontend/` – mã nguồn giao diện React/Vite (thư mục bạn đang mở).  
- `taskhub_backend-master/` – mã nguồn API backend ASP.NET Core.

Khi chạy dự án đầy đủ, ta sẽ:
- Chạy **backend** ở cổng `http://localhost:15155`.
- Chạy **frontend** ở cổng `http://localhost:5173`.

---

## 3. Thiết lập và chạy FRONTEND

Thực hiện các bước sau trong PowerShell.

### 3.1. Cài thư viện (chỉ lần đầu)

```powershell
cd D:\projectAWS\taskhub_frontend
npm install
```

Lệnh này có thể chạy 1–5 phút tùy máy. Chỉ cần làm lại nếu xóa thư mục `node_modules`.

### 3.2. Kiểm tra file cấu hình `.env`

Trong thư mục `taskhub_frontend`, tạo (hoặc mở) file `.env` và đảm bảo có dòng:

```env
VITE_API_BASE_URL=http://localhost:15155
```

Dòng này nói cho frontend biết phải gọi API ở đâu.

### 3.3. Chạy dev server

```powershell
cd D:\projectAWS\taskhub_frontend
npm run dev
```

- Sau khi chạy thành công, bạn sẽ thấy dòng tương tự:
   - `Local:   http://localhost:5173/`
- Mở trình duyệt (Chrome/Edge) và truy cập: `http://localhost:5173`.

Nếu có lỗi đỏ trong terminal, copy nội dung lỗi đó để hỏi lại.

---

## 4. Thiết lập và chạy BACKEND

Frontend gọi API từ backend, vì vậy muốn dữ liệu thật bạn cần chạy backend.

### 4.1. Cài thư viện backend (NuGet)

Thông thường chỉ cần lệnh `dotnet restore` một lần:

```powershell
cd D:\projectAWS\taskhub_backend-master
dotnet restore
```

### 4.2. Chạy Web API

Trong project backend, thư mục Web API chính là:

```text
D:\projectAWS\taskhub_backend-master\Web API\Web API.AppHost
```

Để chạy API:

```powershell
cd "D:\projectAWS\taskhub_backend-master\Web API\Web API.AppHost"
dotnet run
```

- Nếu chạy thành công, bạn sẽ thấy ứng dụng lắng nghe ở địa chỉ kiểu:
   - `http://localhost:15155`
- Đừng tắt cửa sổ này khi đang dùng frontend.

Nếu `dotnet run` báo lỗi (Exit Code 1), hãy đọc dòng lỗi cuối cùng và gửi lại để xử lý.

---

## 5. Thứ tự chạy đầy đủ

1. **Mở một cửa sổ PowerShell** để chạy backend:

    ```powershell
    cd "D:\projectAWS\taskhub_backend-master\Web API\Web API.AppHost"
    dotnet run
    ```

2. **Mở một cửa sổ PowerShell khác** để chạy frontend:

    ```powershell
    cd D:\projectAWS\taskhub_frontend
    npm run dev
    ```

3. Mở trình duyệt tại `http://localhost:5173`.

Chỉ cần cả hai cửa sổ vẫn mở, hệ thống sẽ hoạt động.

---

## 6. Đăng nhập / Đăng ký hiện tại hoạt động thế nào?

Quan trọng: ở phiên bản hiện tại **chưa kết nối API thật cho user**.

- Khi bấm **Đăng ký tài khoản** hoặc **Đăng nhập**, app đang dùng **dữ liệu giả (mock)**:
   - Thông tin user và token **lưu trong `localStorage` của trình duyệt**, không lưu vào database.
   - Vì vậy bạn có thể đăng ký / đăng nhập được **dù backend chưa bật**.
- Phần quản lý **Task** thì đang kết nối thật với API `/api/Task` của backend.

Sau này nếu bạn thêm API Auth thật (Register/Login), chỉ cần sửa `AuthContext` và `services/api.js` để dùng API thay vì mock.

---

## 7. Lỗi thường gặp và cách xử lý nhanh

### 7.1. Lỗi `npm run dev` báo không tìm thấy `node` hoặc `npm`

- Nguyên nhân: chưa cài Node.js hoặc chưa mở lại PowerShell sau khi cài.  
- Cách xử lý: cài Node.js từ https://nodejs.org, rồi **đóng và mở lại** PowerShell, thử lại:

   ```powershell
   node -v
   npm -v
   ```

### 7.2. Lỗi `dotnet` không được nhận diện

- Nguyên nhân: chưa cài .NET SDK.  
- Cách xử lý: cài .NET 8 từ https://dotnet.microsoft.com/download/dotnet/8.0 rồi mở lại PowerShell.

### 7.3. Frontend chạy được nhưng không load được Task

- Kiểm tra backend đã chạy chưa (`dotnet run`).
- Đảm bảo file `.env` trong `taskhub_frontend` có đúng dòng:

   ```env
   VITE_API_BASE_URL=http://localhost:15155
   ```

- F5 lại trang `http://localhost:5173/tasks`.

### 7.4. Lỗi CORS hoặc HTTPS khi gọi API

Phiên bản này được cấu hình để chạy **HTTP** cho dev:
- Backend: `http://localhost:15155`
- Frontend: `http://localhost:5173`

Nếu bạn thấy URL dạng `https://localhost:17057`, hãy kiểm tra:
- Dùng đúng đường dẫn `http://localhost:15155` trong `.env`.
- Đảm bảo trong `Program.cs` của backend đã tắt `UseHttpsRedirection` khi dev.

---

## 8. Nơi chỉnh màu sắc, giao diện

- **Tailwind config**: `taskhub_frontend/tailwind.config.js` – cấu hình màu `primary`, `gray`, font chữ.
- **CSS gốc**: `taskhub_frontend/src/index.css` – import Tailwind và reset cơ bản.
- **Layout chung** (navbar + khung nội dung): `taskhub_frontend/src/components/Layout.jsx`.
- **Trang chính**:
   - Đăng nhập: `src/pages/Login.jsx`
   - Đăng ký: `src/pages/Signup.jsx`
   - Dashboard: `src/pages/Dashboard.jsx`
   - Task list: `src/pages/TaskPage.jsx`

---

## 9. Cần trợ giúp thêm

Nếu bạn làm đúng các bước mà vẫn không chạy được:
- Chụp màn hình terminal (lỗi đỏ) và màn hình browser.
- Hoặc copy nguyên thông báo lỗi và đường dẫn thư mục hiện tại.

Chỉ cần hai thông tin đó là có thể hỗ trợ debug tiếp rất nhanh.
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
