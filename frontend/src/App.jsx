import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PalmUpload from "./pages/PalmUpload";
import TarotSelection from "./pages/TarotSelection";
import History from "./pages/History";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Register */}
      <Route path="/register" element={<Register />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Palm Upload */}
      <Route
        path="/upload-palm"
        element={
          <ProtectedRoute>
            <PalmUpload />
          </ProtectedRoute>
        }
      />

      {/* Tarot Selection */}
      <Route
        path="/tarot"
        element={
          <ProtectedRoute>
            <TarotSelection />
          </ProtectedRoute>
        }
      />

      {/* Reading History */}
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}


export default App;