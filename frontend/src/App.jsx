import { Routes, Route, Navigate } from "react-router-dom";

import CosmicBackground from "./components/CosmicBackground";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Palmistry from "./pages/Palmistry";
import Tarot from "./pages/Tarot";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import ReadingHistory from "./pages/ReadingHistory";
import Reports from "./pages/Reports";

import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


function App() {
  return (
    <>
      {/* =================================================
          COSMIC OBSERVATORY BACKGROUND
      ================================================= */}

      <CosmicBackground />


      {/* =================================================
          APPLICATION ROUTES
      ================================================= */}

      <Routes>

        {/* =================================================
            PUBLIC PAGES
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>


        {/* =================================================
            PROTECTED USER PAGES
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/palmistry"
          element={
            <ProtectedRoute>
              <Palmistry />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tarot"
          element={
            <ProtectedRoute>
              <Tarot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/readings"
          element={
            <ProtectedRoute>
              <ReadingHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            ADMIN ONLY
        ================================================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />


        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />


      </Routes>
    </>
  );
}


export default App;