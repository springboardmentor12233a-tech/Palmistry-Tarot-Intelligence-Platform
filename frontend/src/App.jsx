import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import {
  useAuth,
} from "./auth/AuthContext";

import ProtectedRoute from
  "./components/auth/ProtectedRoute";

import DashboardLayout from
  "./layouts/DashboardLayout";

import DashboardPage from
  "./pages/DashboardPage";

import LoginPage from
  "./pages/LoginPage";

import RegisterPage from
  "./pages/RegisterPage";

import ReadingHistoryPage from
  "./pages/ReadingHistoryPage";

import ProfilePage from
  "./pages/ProfilePage";

import AdminDashboardPage from
  "./pages/AdminDashboardPage";

import TarotReaderDashboardPage from
  "./pages/TarotReaderDashboardPage";

import SpiritualConsultantDashboardPage from
  "./pages/SpiritualConsultantDashboardPage";

import PalmAnalysisPage from
  "./pages/PalmAnalysisPage";

import TarotReadingPage from
  "./pages/TarotReadingPage";

import AIInsightsPage from
  "./pages/AIInsightsPage";

import PersonalityPage from
  "./pages/PersonalityPage";

import LifeTrendsPage from
  "./pages/LifeTrendsPage";

import GuidanceScoresPage from
  "./pages/GuidanceScoresPage";

import RecommendationsPage from
  "./pages/RecommendationsPage";

import NotificationsPage from
  "./pages/NotificationsPage";

import ReportsPage from
  "./pages/ReportsPage";

import ReadingStudio from
  "./ReadingStudio";


// ============================================================
// HOME REDIRECT
// ============================================================

function HomeRedirect() {

  const {
    isAuthenticated,
    isAuthLoading,
  } = useAuth();


  if (
    isAuthLoading
  ) {

    return (
      <div className="auth-loading">

        Loading...

      </div>
    );

  }


  return (
    <Navigate
      to={
        isAuthenticated
          ? "/dashboard"
          : "/login"
      }
      replace
    />
  );
}


// ============================================================
// APP
// ============================================================

function App() {

  return (
    <Routes>

      {/* ==================================================== */}
      {/* HOME */}
      {/* ==================================================== */}

      <Route
        path="/"
        element={
          <HomeRedirect />
        }
      />


      {/* ==================================================== */}
      {/* PUBLIC AUTH */}
      {/* ==================================================== */}

      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />


      <Route
        path="/register"
        element={
          <RegisterPage />
        }
      />


      {/* ==================================================== */}
      {/* AUTHENTICATED PLATFORM */}
      {/* ==================================================== */}

      <Route
        element={
          <ProtectedRoute>

            <DashboardLayout />

          </ProtectedRoute>
        }
      >

        {/* ================================================== */}
        {/* USER DASHBOARD */}
        {/* ================================================== */}

        <Route
          path="/dashboard"
          element={
            <DashboardPage />
          }
        />


        {/* ================================================== */}
        {/* READING STUDIO */}
        {/* ================================================== */}

        <Route
          path="/reading"
          element={
            <ReadingStudio />
          }
        />


        {/* ================================================== */}
        {/* PALM ANALYSIS */}
        {/* ================================================== */}

        <Route
          path="/palm"
          element={
            <PalmAnalysisPage />
          }
        />


        {/* ================================================== */}
        {/* TAROT READING */}
        {/* ================================================== */}

        <Route
          path="/tarot"
          element={
            <TarotReadingPage />
          }
        />


        {/* ================================================== */}
        {/* AI INSIGHTS */}
        {/* ================================================== */}

        <Route
          path="/insights"
          element={
            <AIInsightsPage />
          }
        />


        {/* ================================================== */}
        {/* PERSONALITY */}
        {/* ================================================== */}

        <Route
          path="/personality"
          element={
            <PersonalityPage />
          }
        />


        {/* ================================================== */}
        {/* LIFE TRENDS */}
        {/* ================================================== */}

        <Route
          path="/trends"
          element={
            <LifeTrendsPage />
          }
        />


        {/* ================================================== */}
        {/* GUIDANCE SCORES */}
        {/* ================================================== */}

        <Route
          path="/guidance"
          element={
            <GuidanceScoresPage />
          }
        />


        {/* ================================================== */}
        {/* RECOMMENDATIONS */}
        {/* ================================================== */}

        <Route
          path="/recommendations"
          element={
            <RecommendationsPage />
          }
        />


        {/* ================================================== */}
        {/* READING HISTORY */}
        {/* ================================================== */}

        <Route
          path="/history"
          element={
            <ReadingHistoryPage />
          }
        />


        {/* ================================================== */}
        {/* REPORTS */}
        {/* ================================================== */}

        <Route
          path="/reports"
          element={
            <ReportsPage />
          }
        />


        {/* ================================================== */}
        {/* NOTIFICATIONS */}
        {/* ================================================== */}

        <Route
          path="/notifications"
          element={
            <NotificationsPage />
          }
        />


        {/* ================================================== */}
        {/* PROFILE */}
        {/* ================================================== */}

        <Route
          path="/profile"
          element={
            <ProfilePage />
          }
        />


        {/* ================================================== */}
        {/* TAROT READER DASHBOARD */}
        {/* ================================================== */}

        <Route
          path="/tarot-reader"
          element={
            <ProtectedRoute
              roles={[
                "tarot_reader",
                "administrator",
              ]}
            >

              <TarotReaderDashboardPage />

            </ProtectedRoute>
          }
        />


        {/* ================================================== */}
        {/* SPIRITUAL CONSULTANT DASHBOARD */}
        {/* ================================================== */}

        <Route
          path="/spiritual-consultant"
          element={
            <ProtectedRoute
              roles={[
                "spiritual_consultant",
                "administrator",
              ]}
            >

              <SpiritualConsultantDashboardPage />

            </ProtectedRoute>
          }
        />


        {/* ================================================== */}
        {/* ADMIN DASHBOARD */}
        {/* ================================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              roles={[
                "administrator",
              ]}
            >

              <AdminDashboardPage />

            </ProtectedRoute>
          }
        />

      </Route>


      {/* ==================================================== */}
      {/* UNKNOWN ROUTE */}
      {/* ==================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}


export default App;