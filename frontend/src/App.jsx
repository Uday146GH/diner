import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Owner pages
import Dashboard from './pages/owner/Dashboard';

// Home page
function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">🍽️ DineR</h1>
        <p className="text-xl text-gray-100 mb-8">Multi-tenant Restaurant Menu SaaS</p>
        <div className="space-x-4">
          <a href="/auth/login" className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
            Login
          </a>
          <a href="/auth/register" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
