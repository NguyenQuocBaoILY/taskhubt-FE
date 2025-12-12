# TaskHub Frontend

A web application for task and project management **TaskHub**, built with **React 19 + Vite + Tailwind CSS**.

This README is written for beginners with step-by-step instructions to run the project.

---

## Table of Contents

1. [Technologies Used](#technologies-used)
2. [System Requirements](#system-requirements)
3. [Installation and Running](#installation-and-running)
4. [Environment Configuration](#environment-configuration)
5. [Project Structure](#project-structure)
6. [Common Commands](#common-commands)
7. [Troubleshooting](#troubleshooting)

---

## Technologies Used

This project uses the following technologies and libraries:

### Core Technologies
- **React 19** - JavaScript library for building user interfaces
- **Vite** - Fast build tool and dev server
- **JavaScript (ES6+)** - Main programming language

### Styling & UI
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **@tailwindcss/forms** - Form styling plugin for Tailwind
- **Heroicons** - SVG icon set from Tailwind Labs
- **Lucide React** - Beautiful and lightweight icon library

### State Management & Routing
- **React Router DOM 7** - Routing and navigation management
- **React Context API** - Global state management

### Data Fetching & Forms
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form management with validation
- **React Hot Toast** - Beautiful and easy-to-use notifications

### Additional Features
- **@dnd-kit** - Drag and drop for Kanban board
- **date-fns** - Date handling utilities
- **Recharts** - Chart library for statistics
- **clsx & tailwind-merge** - Utilities for merging CSS classes

### Backend Integration
- **AWS Cognito** - Authentication and user management
- **Google OAuth** - Sign in with Google
- **AWS API Gateway** - Backend API deployed on AWS
- **ASP.NET Core** - Backend framework (deployed on AWS Lambda)

---

## System Requirements

Before starting, you need to install the following software:

### 1. Node.js (Required)
- **Version**: Node.js 18.x or 20.x (LTS recommended)
- **Download**: https://nodejs.org/en/download
- **Verify installation**:
  ```powershell
  node -v
  # Should see: v20.x.x or v18.x.x
  
  npm -v
  # Should see: 9.x.x or 10.x.x
  ```

### 2. Git (Optional but recommended)
- **Download**: https://git-scm.com/downloads

### 3. Code Editor
- **Visual Studio Code** (recommended): https://code.visualstudio.com/
- Or any editor you prefer

---

## Installation and Running

### Step 1: Open PowerShell

Press `Windows + X` → select **Windows PowerShell** or **Terminal**

### Step 2: Navigate to project directory

```powershell
cd D:\projectAWS\taskhub_frontend
```

### Step 3: Install packages

```powershell
npm install
```

**Notes**: 
- This command takes 1-5 minutes depending on your network and computer speed
- Only needs to run once initially or when `package.json` changes
- After completion, a `node_modules` folder will be created containing all libraries

### Step 4: Check `.env` file

The project has 2 environment files:
- `.env` - For development environment (local)
- `.env.production` - For production environment (AWS)

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

**Important**: 
- Running `npm run dev` uses the `.env` file
- Running `npm run build` uses the `.env.production` file

### Step 5: Run development server

```powershell
npm run dev
```

**Expected output**:
```
  VITE v7.2.2  ready in 500 ms

  -> Local:   http://localhost:5173/
  -> Network: use --host to expose
  -> press h + enter to show help
```

### Step 6: Open browser

Visit: **http://localhost:5173**

You will see the TaskHub homepage.

---

## Environment Configuration

### `.env` file details

| Environment Variable | Purpose | Development | Production |
|---------------------|---------|-------------|------------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:15155` | `https://ne6pw5hqej.execute-api.ap-southeast-1.amazonaws.com/prod` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID for Google OAuth | Same | Same |
| `VITE_COGNITO_REGION` | AWS Cognito Region | `ap-southeast-1` | `ap-southeast-1` |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID | `ap-southeast-1_46xJLc8VB` | Same |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID | `4cjjbi67t2nldlm7od9q24nf9u` | Same |
| `VITE_COGNITO_DOMAIN` | Cognito Domain | AWS Cognito URL | Same |
| `VITE_COGNITO_OAUTH_REDIRECT_URI` | Redirect URL after OAuth | `http://localhost:5173/...` | `https://d3vdjh6xgexs6v.cloudfront.net/...` |
| `VITE_APP_NAME` | Application name | `TaskHub` | `TaskHub` |
| `VITE_APP_VERSION` | Application version | `1.0.0` | `1.0.0` |

**Notes about Vite environment variables**:
- All environment variables must start with `VITE_`
- These variables are embedded into the code during build
- Do not store sensitive information (secret keys) in frontend
- Backend API is deployed on AWS API Gateway, no need to run local backend

---

## Project Structure

```
taskhub_frontend/
├── public/                 # Static assets
├── src/
│   ├── admin/             # Admin pages
│   │   ├── components/    # Admin-specific components
│   │   └── pages/         # Admin-specific pages
│   ├── assets/            # Images, fonts, icons
│   ├── components/        # Shared components
│   │   ├── Layout.jsx     # Layout wrapper
│   │   ├── Navbar.jsx     # Navigation bar
│   │   ├── TaskCard.jsx   # Task display card
│   │   ├── TaskModal.jsx  # Task create/edit modal
│   │   └── ...
│   ├── config/            # Configuration
│   │   └── google.js      # Google OAuth config
│   ├── context/           # React Context
│   │   ├── AuthContext.jsx    # Auth management context
│   │   └── AppContext.jsx     # App state management context
│   ├── hooks/             # Custom React hooks
│   │   └── useContext.js  # Hook for using contexts
│   ├── pages/             # Main pages
│   │   ├── Login.jsx      # Login page
│   │   ├── Signup.jsx     # Signup page
│   │   ├── Dashboard.jsx  # Dashboard page
│   │   ├── ProjectList.jsx    # Project list
│   │   ├── ProjectDetail.jsx  # Project details
│   │   ├── TaskPage.jsx       # Task management page
│   │   └── ...
│   ├── services/          # API services
│   │   ├── api.js         # Axios instance & API calls
│   │   ├── authService.js # Authentication service
│   │   └── googleAuth.js  # Google OAuth service
│   ├── utils/             # Utility functions
│   │   └── authHelper.js  # Auth helper functions
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
└── README.md             # This document
```

---

## Common Commands

### Development

```powershell
# Run dev server (hot reload)
npm run dev

# Run dev server and auto-open browser
npm run dev -- --open

# Run dev server and expose to network (access from other machines)
npm run dev -- --host
```

### Build & Preview

```powershell
# Build for production (creates dist/ folder)
npm run build

# Preview production build before deployment
npm run preview
```

### Code Quality

```powershell
# Check code errors with ESLint
npm run lint

# Auto-fix ESLint errors that can be fixed
npm run lint -- --fix
```

### Package Management

```powershell
# Install new package
npm install <package-name>

# Install package for dev only
npm install -D <package-name>

# Uninstall package
npm uninstall <package-name>

# Update all packages
npm update

# Check outdated packages
npm outdated
```

---

## Backend API

**Important**: This project already has a backend API deployed on AWS, you **do not need to run a local backend**.

### API Endpoints

- **Development**: `http://localhost:15155` (if you have local backend)
- **Production**: `https://ne6pw5hqej.execute-api.ap-southeast-1.amazonaws.com/prod`

### Running with Production API

If you want to test with production API:

```powershell
# Temporarily use production env for dev
npm run dev -- --mode production
```

Or modify the `.env` file to point to production API:
```env
VITE_API_BASE_URL=https://ne6pw5hqej.execute-api.ap-southeast-1.amazonaws.com/prod
```

---

## Troubleshooting

### 1. Error: `'node' is not recognized`

**Cause**: Node.js is not installed or not added to PATH.

**Solution**:
1. Install Node.js from https://nodejs.org
2. Close and reopen PowerShell
3. Verify: `node -v`

### 2. Error: `npm install` fails

**Cause**: Could be network issues or access permissions.

**Solution**:
```powershell
# Delete node_modules folder and lock file
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

### 3. Error: `Cannot find module 'vite'`

**Cause**: Dependencies not installed.

**Solution**:
```powershell
npm install
```

### 4. Error: Frontend runs but cannot call API

**Symptoms**: API requests return 404 or timeout errors.

**Check**:
1. Which API are you using?
   - **Production API** (recommended): `https://ne6pw5hqej.execute-api.ap-southeast-1.amazonaws.com/prod`
   - **Local API** (if you have local backend): `http://localhost:15155`

2. Is the `.env` file URL correct?
   ```env
   # Use Production API (recommended)
   VITE_API_BASE_URL=https://ne6pw5hqej.execute-api.ap-southeast-1.amazonaws.com/prod
   
   # Or Local API (if you have backend)
   # VITE_API_BASE_URL=http://localhost:15155
   ```

3. After modifying `.env`, restart the dev server:
   ```powershell
   # Press Ctrl+C to stop
   # Then run again
   npm run dev
   ```

### 5. Error: `Port 5173 already in use`

**Cause**: Another application is using port 5173.

**Solution 1**: Close the application using that port.

**Solution 2**: Use a different port:
```powershell
npm run dev -- --port 3000
```

### 6. CORS error when calling API

**Symptoms**: Console shows CORS policy error.

**Solution**:
- Ensure backend has CORS enabled for `http://localhost:5173`
- Check in backend's `Program.cs`:
  ```csharp
  builder.Services.AddCors(options => {
      options.AddPolicy("AllowFrontend", policy => {
          policy.WithOrigins("http://localhost:5173")
                .AllowAnyMethod()
                .AllowAnyHeader();
      });
  });
  ```

### 7. Error: `npm ERR! code ENOENT`

**Cause**: You are in the wrong directory.

**Solution**:
```powershell
# Make sure you are in the correct directory
cd D:\projectAWS\taskhub_frontend

# Check if package.json exists
Get-ChildItem package.json
```

### 8. Tailwind CSS not working

**Symptoms**: Tailwind classes have no styles.

**Check**:
1. Does `tailwind.config.js` have correct content paths:
   ```javascript
   content: [
     "./index.html",
     "./src/**/*.{js,ts,jsx,tsx}",
   ],
   ```
2. Does `src/index.css` import Tailwind:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
3. Restart dev server

---

## Main Features

- **Login/Signup** - With AWS Cognito & Google OAuth
- **Dashboard** - Project overview and statistics
- **Project Management** - CRUD operations for projects
- **Task Management** - Kanban board with drag & drop
- **Authorization** - Role-based: Admin, Manager, Member
- **File Upload** - Attach files to tasks
- **Notifications** - Real-time toast notifications
- **Responsive** - Works well on mobile/tablet/desktop

---

## Support

If you encounter issues you cannot resolve:

1. **Take a screenshot** of the terminal with the error
2. **Copy the entire** error message
3. **Describe** which step you were on and what error occurred
4. Contact the team for assistance

---

## References

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

**Happy coding!**
