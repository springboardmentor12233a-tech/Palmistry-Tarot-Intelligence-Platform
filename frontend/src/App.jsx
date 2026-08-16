import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import PalmReading from "./pages/PalmReading";
import TarotReading from "./pages/TarotReading";
import CombinedReading from "./pages/CombinedReading";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyReadings from "./pages/MyReadings";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";

import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <main className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
           

           <Route
            path="/dashboard"
            element={
            <ProtectedRoute>
               <Dashboard />
            </ProtectedRoute>
            }
          />
          <Route
          path="/admin"
          element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
          }
          />
          <Route
            path="/palm-reading"
            element={
              <ProtectedRoute>
                <PalmReading />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tarot-reading"
            element={
              <ProtectedRoute>
                <TarotReading />
              </ProtectedRoute>
            }
          />

          <Route
            path="/combined-reading"
            element={
              <ProtectedRoute>
                <CombinedReading />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-readings"
            element={
              <ProtectedRoute>
                <MyReadings />
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
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;