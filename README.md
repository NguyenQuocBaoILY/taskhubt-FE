# TaskHub Frontend

Dự án web quản lý công việc và dự án **TaskHub**, được xây dựng bằng **React 19 + Vite + Tailwind CSS**.

README này viết dành cho người mới bắt đầu, hướng dẫn từng bước để chạy được dự án.

---

## 📋 Mục lục

1. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
2. [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
3. [Cài đặt và chạy dự án](#-cài-đặt-và-chạy-dự-án)
4. [Cấu hình môi trường](#-cấu-hình-môi-trường)
5. [Cấu trúc dự án](#-cấu-trúc-dự-án)
6. [Các lệnh thường dùng](#-các-lệnh-thường-dùng)
7. [Xử lý lỗi thường gặp](#-xử-lý-lỗi-thường-gặp)

---

## 🛠 Công nghệ sử dụng

Dự án này sử dụng các công nghệ và thư viện sau:

### Core Technologies
- **React 19** - Thư viện JavaScript để xây dựng giao diện người dùng
- **Vite** - Build tool và dev server cực nhanh
- **JavaScript (ES6+)** - Ngôn ngữ lập trình chính

### Styling & UI
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **@tailwindcss/forms** - Plugin form styling cho Tailwind
- **Heroicons** - Bộ icon SVG từ Tailwind Labs
- **Lucide React** - Thư viện icon đẹp và nhẹ

### State Management & Routing
- **React Router DOM 7** - Quản lý routing và navigation
- **React Context API** - Quản lý state toàn cục

### Data Fetching & Forms
- **Axios** - HTTP client để gọi API
- **React Hook Form** - Quản lý form với validation
- **React Hot Toast** - Thông báo đẹp và dễ dùng

### Additional Features
- **@dnd-kit** - Drag and drop cho Kanban board
- **date-fns** - Xử lý ngày tháng
- **Recharts** - Vẽ biểu đồ thống kê
- **clsx & tailwind-merge** - Utilities để merge CSS classes

### Backend Integration
- **AWS Cognito** - Xác thực và quản lý người dùng
- **Google OAuth** - Đăng nhập bằng Google
- **AWS API Gateway** - Backend API đã deploy trên AWS
- **ASP.NET Core** - Backend framework (deploy trên AWS Lambda)

---

## 💻 Yêu cầu hệ thống

Trước khi bắt đầu, bạn cần cài đặt các phần mềm sau:

### 1. Node.js (Bắt buộc)
- **Phiên bản**: Node.js 18.x hoặc 20.x (khuyến nghị LTS)
- **Tải về**: https://nodejs.org/en/download
- **Kiểm tra sau khi cài**:
  ```powershell
  node -v
  # Nên thấy: v20.x.x hoặc v18.x.x
  
  npm -v
  # Nên thấy: 9.x.x hoặc 10.x.x
  ```

### 2. Git (Tùy chọn nhưng nên có)
- **Tải về**: https://git-scm.com/downloads

### 3. Code Editor
- **Visual Studio Code** (khuyến nghị): https://code.visualstudio.com/
- Hoặc bất kỳ editor nào bạn thích

---

## 🚀 Cài đặt và chạy dự án

### Bước 1: Mở PowerShell

Nhấn `Windows + X` → chọn **Windows PowerShell** hoặc **Terminal**

### Bước 2: Di chuyển đến thư mục dự án

```powershell
cd D:\projectAWS\taskhub_frontend
```

### Bước 3: Cài đặt các thư viện (packages)

```powershell
npm install
```

**Lưu ý**: 
- Lệnh này sẽ chạy 1-5 phút tùy vào tốc độ mạng và máy tính
- Chỉ cần chạy 1 lần đầu tiên hoặc khi có thay đổi `package.json`
- Sau khi chạy xong sẽ có thư mục `node_modules` chứa tất cả thư viện

### Bước 4: Kiểm tra file `.env`

Dự án có 2 file environment:
- `.env` - Cho môi trường development (local)
- `.env.production` - Cho môi trường production (AWS)

**File `.env` (Development)**:
```env
# API Backend URL (Local)
VITE_API_BASE_URL=http://localhost:15155

# Google OAuth
VITE_GOOGLE_CLIENT_ID=1097379280226-ede5i0vtmkj3cb94se0gp7jm4t8ibujk.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173

# AWS Cognito
VITE_COGNITO_REGION=ap-southeast-1
VITE_COGNITO_USER_POOL_ID=ap-southeast-1_46xJLc8VB
VITE_COGNITO_CLIENT_ID=4cjjbi67t2nldlm7od9q24nf9u
VITE_COGNITO_DOMAIN=https://ap-southeast-146xjlc8vb.auth.ap-southeast-1.amazoncognito.com
VITE_COGNITO_OAUTH_REDIRECT_URI=http://localhost:5173/auth/google/callback

# App Configuration
VITE_APP_NAME=TaskHub
VITE_APP_VERSION=1.0.0
```

**File `.env.production` (Production)**:
```env
# API Backend URL (AWS API Gateway)
VITE_API_BASE_URL=https://ne6pw5hqej.execute-api.ap-southeast-1.amazonaws.com/prod

# Google OAuth
VITE_GOOGLE_CLIENT_ID=1097379280226-ede5i0vtmkj3cb94se0gp7jm4t8ibujk.apps.googleusercontent.com

# AWS Cognito
VITE_COGNITO_REGION=ap-southeast-1
VITE_COGNITO_USER_POOL_ID=ap-southeast-1_46xJLc8VB
VITE_COGNITO_CLIENT_ID=4cjjbi67t2nldlm7od9q24nf9u
VITE_COGNITO_DOMAIN=https://ap-southeast-146xjlc8vb.auth.ap-southeast-1.amazoncognito.com
VITE_COGNITO_OAUTH_REDIRECT_URI=https://d3vdjh6xgexs6v.cloudfront.net/auth/google/callback

# App Configuration
VITE_APP_NAME=TaskHub
VITE_APP_VERSION=1.0.0
```

**Quan trọng**: 
- Khi chạy `npm run dev` sẽ dùng file `.env`
- Khi chạy `npm run build` sẽ dùng file `.env.production`

### Bước 5: Chạy development server

```powershell
npm run dev
```

**Kết quả mong đợi**:
```
  VITE v7.2.2  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Bước 6: Mở trình duyệt

Truy cập: **http://localhost:5173**

Bạn sẽ thấy giao diện trang chủ của TaskHub.

---

## 🔧 Cấu hình môi trường

### File `.env` chi tiết

| Biến môi trường | Mục đích | Development | Production |
|----------------|----------|-------------|------------|
| `VITE_API_BASE_URL` | URL của backend API | `http://localhost:15155` | `https://ne6pw5hqej.execute-api.ap-southeast-1.amazonaws.com/prod` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID cho Google OAuth | Giống nhau | Giống nhau |
| `VITE_COGNITO_REGION` | AWS Cognito Region | `ap-southeast-1` | `ap-southeast-1` |
| `VITE_COGNITO_USER_POOL_ID` | ID của Cognito User Pool | `ap-southeast-1_46xJLc8VB` | Giống nhau |
| `VITE_COGNITO_CLIENT_ID` | Client ID của Cognito App | `4cjjbi67t2nldlm7od9q24nf9u` | Giống nhau |
| `VITE_COGNITO_DOMAIN` | Domain của Cognito | AWS Cognito URL | Giống nhau |
| `VITE_COGNITO_OAUTH_REDIRECT_URI` | Redirect URL sau OAuth | `http://localhost:5173/...` | `https://d3vdjh6xgexs6v.cloudfront.net/...` |
| `VITE_APP_NAME` | Tên ứng dụng | `TaskHub` | `TaskHub` |
| `VITE_APP_VERSION` | Phiên bản ứng dụng | `1.0.0` | `1.0.0` |

**Lưu ý về Vite environment variables**:
- Tất cả biến môi trường phải bắt đầu với `VITE_`
- Các biến này sẽ được nhúng vào code khi build
- Không lưu thông tin nhạy cảm (secret keys) trong frontend
- Backend API đang deploy trên AWS API Gateway, không cần chạy local backend

---

## 📁 Cấu trúc dự án

```
taskhub_frontend/
├── public/                 # Static assets
├── src/
│   ├── admin/             # Trang quản trị
│   │   ├── components/    # Components dành cho admin
│   │   └── pages/         # Pages dành cho admin
│   ├── assets/            # Hình ảnh, fonts, icons
│   ├── components/        # Shared components
│   │   ├── Layout.jsx     # Layout wrapper
│   │   ├── Navbar.jsx     # Navigation bar
│   │   ├── TaskCard.jsx   # Card hiển thị task
│   │   ├── TaskModal.jsx  # Modal tạo/sửa task
│   │   └── ...
│   ├── config/            # Cấu hình
│   │   └── google.js      # Google OAuth config
│   ├── context/           # React Context
│   │   ├── AuthContext.jsx    # Context quản lý auth
│   │   └── AppContext.jsx     # Context quản lý app state
│   ├── hooks/             # Custom React hooks
│   │   └── useContext.js  # Hook để dùng contexts
│   ├── pages/             # Các trang chính
│   │   ├── Login.jsx      # Trang đăng nhập
│   │   ├── Signup.jsx     # Trang đăng ký
│   │   ├── Dashboard.jsx  # Trang dashboard
│   │   ├── ProjectList.jsx    # Danh sách dự án
│   │   ├── ProjectDetail.jsx  # Chi tiết dự án
│   │   ├── TaskPage.jsx       # Trang quản lý tasks
│   │   └── ...
│   ├── services/          # API services
│   │   ├── api.js         # Axios instance & API calls
│   │   ├── authService.js # Authentication service
│   │   └── googleAuth.js  # Google OAuth service
│   ├── utils/             # Utility functions
│   │   └── authHelper.js  # Helper functions cho auth
│   ├── App.jsx            # Root component
│   ├── App.css            # Global styles
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind imports
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML template
├── package.json          # NPM dependencies
├── postcss.config.js     # PostCSS config
├── tailwind.config.js    # Tailwind configuration
├── vite.config.js        # Vite configuration
└── README.md             # Tài liệu này
```

---

## ⚙️ Các lệnh thường dùng

### Development

```powershell
# Chạy dev server (hot reload)
npm run dev

# Chạy dev server và mở browser tự động
npm run dev -- --open

# Chạy dev server và expose ra network (truy cập từ máy khác)
npm run dev -- --host
```

### Build & Preview

```powershell
# Build cho production (tạo thư mục dist/)
npm run build

# Preview production build trước khi deploy
npm run preview
```

### Code Quality

```powershell
# Kiểm tra lỗi code với ESLint
npm run lint

# Tự động fix các lỗi ESLint có thể fix
npm run lint -- --fix
```

### Package Management

```powershell
# Cài package mới
npm install <package-name>

# Cài package cho dev only
npm install -D <package-name>

# Gỡ package
npm uninstall <package-name>

# Cập nhật tất cả packages
npm update

# Kiểm tra packages lỗi thời
npm outdated
```

---

## 🌐 Backend API

**Quan trọng**: Dự án này đã có backend API deploy sẵn trên AWS, bạn **không cần chạy backend local**.

### API Endpoints

- **Development**: `http://localhost:15155` (nếu có backend local)
- **Production**: `https://ne6pw5hqej.execute-api.ap-southeast-1.amazonaws.com/prod`

### Chạy với Production API

Nếu muốn test với API production:

```powershell
# Tạm thời dùng env production cho dev
npm run dev -- --mode production
```

Hoặc sửa file `.env` để trỏ đến production API:
```env
VITE_API_BASE_URL=https://ne6pw5hqej.execute-api.ap-southeast-1.amazonaws.com/prod
```

---

## 🐛 Xử lý lỗi thường gặp

### 1. Lỗi: `'node' is not recognized`

**Nguyên nhân**: Chưa cài Node.js hoặc chưa thêm vào PATH.

**Giải pháp**:
1. Cài Node.js từ https://nodejs.org
2. Đóng và mở lại PowerShell
3. Kiểm tra: `node -v`

### 2. Lỗi: `npm install` thất bại

**Nguyên nhân**: Có thể do lỗi mạng hoặc quyền truy cập.

**Giải pháp**:
```powershell
# Xóa thư mục node_modules và file lock
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Cài lại
npm install
```

### 3. Lỗi: `Cannot find module 'vite'`

**Nguyên nhân**: Chưa cài dependencies.

**Giải pháp**:
```powershell
npm install
```

### 4. Lỗi: Frontend chạy nhưng không gọi được API

**Triệu chứng**: Các request API bị lỗi 404 hoặc timeout.

**Kiểm tra**:
1. Đang dùng API nào?
   - **Production API** (khuyến nghị): `https://ne6pw5hqej.execute-api.ap-southeast-1.amazonaws.com/prod`
   - **Local API** (nếu có backend local): `http://localhost:15155`

2. File `.env` có đúng URL không?
   ```env
   # Dùng Production API (khuyến nghị)
   VITE_API_BASE_URL=https://ne6pw5hqej.execute-api.ap-southeast-1.amazonaws.com/prod
   
   # Hoặc Local API (nếu có backend)
   # VITE_API_BASE_URL=http://localhost:15155
   ```

3. Sau khi sửa `.env`, phải restart dev server:
   ```powershell
   # Nhấn Ctrl+C để dừng
   # Rồi chạy lại
   npm run dev
   ```

### 5. Lỗi: `Port 5173 already in use`

**Nguyên nhân**: Đã có ứng dụng khác chạy ở port 5173.

**Giải pháp 1**: Tắt ứng dụng đang chạy ở port đó.

**Giải pháp 2**: Dùng port khác:
```powershell
npm run dev -- --port 3000
```

### 6. Lỗi CORS khi gọi API

**Triệu chứng**: Console báo lỗi CORS policy.

**Giải pháp**:
- Đảm bảo backend đã enable CORS cho `http://localhost:5173`
- Kiểm tra trong `Program.cs` của backend:
  ```csharp
  builder.Services.AddCors(options => {
      options.AddPolicy("AllowFrontend", policy => {
          policy.WithOrigins("http://localhost:5173")
                .AllowAnyMethod()
                .AllowAnyHeader();
      });
  });
  ```

### 7. Lỗi: `npm ERR! code ENOENT`

**Nguyên nhân**: Đang ở sai thư mục.

**Giải pháp**:
```powershell
# Đảm bảo đang ở đúng thư mục
cd D:\projectAWS\taskhub_frontend

# Kiểm tra có file package.json không
Get-ChildItem package.json
```

### 8. Tailwind CSS không hoạt động

**Triệu chứng**: Các class Tailwind không có style.

**Kiểm tra**:
1. File `tailwind.config.js` có đúng content paths:
   ```javascript
   content: [
     "./index.html",
     "./src/**/*.{js,ts,jsx,tsx}",
   ],
   ```
2. File `src/index.css` có import Tailwind:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
3. Restart dev server

---

## 🎯 Tính năng chính của ứng dụng

- ✅ **Đăng nhập/Đăng ký** - Với AWS Cognito & Google OAuth
- ✅ **Dashboard** - Tổng quan dự án và thống kê
- ✅ **Quản lý Dự án** - CRUD operations cho projects
- ✅ **Quản lý Task** - Kanban board với drag & drop
- ✅ **Phân quyền** - Role-based: Admin, Manager, Member
- ✅ **Upload files** - Đính kèm file vào task
- ✅ **Thông báo** - Real-time toast notifications
- ✅ **Responsive** - Hoạt động tốt trên mobile/tablet/desktop

---

## 📞 Hỗ trợ

Nếu gặp vấn đề không thể tự giải quyết:

1. **Chụp màn hình** terminal với lỗi đỏ
2. **Copy toàn bộ** thông báo lỗi
3. **Ghi rõ** bước nào đang làm và lỗi xảy ra
4. Liên hệ team để được hỗ trợ

---

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

**Chúc bạn code vui vẻ! 🚀**
