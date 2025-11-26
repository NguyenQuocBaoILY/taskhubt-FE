import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { useAuth } from './hooks/useContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import TaskBoard from './pages/TaskBoard';
import TaskPage from './pages/TaskPage';
import Navbar from './components/Navbar';

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route component (redirect if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Temporarily disable redirect for testing
  // if (isAuthenticated) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
}

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/board" element={<TaskBoard />} />
          <Route path="tasks" element={<TaskPage />} />
          <Route
            path="profile"
            element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Profile Page</h2>
                <p className="mt-2 text-gray-600">Trang profile đang được phát triển...</p>
              </div>
            }
          />
          <Route
            path="settings"
            element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Settings Page</h2>
                <p className="mt-2 text-gray-600">Trang settings đang được phát triển...</p>
              </div>
            }
          />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
