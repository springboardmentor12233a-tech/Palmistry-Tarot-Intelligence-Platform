import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import PalmReading from './pages/PalmReading';
import PalmResults from './pages/PalmResults';
import TarotSelection from './pages/TarotSelection';
import TarotReading from './pages/TarotReading';
import CombinedReading from './pages/CombinedReading';
import ReadingHistory from './pages/ReadingHistory';
import ReadingDetail from './pages/ReadingDetail';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import UserNavbar from './components/user/UserNavbar';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token || user.role !== 'Admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (token) {
    if (user.role === 'Admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  // Hide navbar on landing, login, register, admin-login, and admin-dashboard (it has its own layout)
  const hideNavbarPaths = ['/', '/login', '/register', '/admin/login', '/admin-dashboard'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname) || location.pathname.startsWith('/admin-dashboard');

  return (
    <div className="min-h-screen bg-[#050b14] text-gray-100 flex flex-col font-sans">
      {!shouldHideNavbar && <UserNavbar />}
      <main className="flex-grow flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        
        <Route path="/palm-reading" element={<ProtectedRoute><PalmReading /></ProtectedRoute>} />
        <Route path="/palm-results" element={<ProtectedRoute><PalmResults /></ProtectedRoute>} />
        
        <Route path="/tarot" element={<ProtectedRoute><TarotSelection /></ProtectedRoute>} />
        <Route path="/tarot/read/:id" element={<ProtectedRoute><TarotReading /></ProtectedRoute>} />
        
        <Route path="/combined-reading/:id" element={<ProtectedRoute><CombinedReading /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><ReadingHistory /></ProtectedRoute>} />
        <Route path="/reading/:id" element={<ProtectedRoute><ReadingDetail /></ProtectedRoute>} />
        
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </Router>
  );
}

export default App;
