import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import LandingPage from "./pages/Landingpage";
import LoginSignup from "./pages/LoginSignup";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import HomePage from "./pages/HomePage";
import PalmPage from "./pages/PalmPage";
import TarotPage from "./pages/TarotPage";

import AboutOracle from "./pages/AboutOracle";
import AboutPalm from "./pages/AboutPalm";
import AboutTarot from "./pages/AboutTarot";

import Overview from "./pages/Overview";
import MyReadings from "./pages/MyReadings";
import OracleJourney from "./pages/OracleJourney";

import CompareReadings from "./pages/CompareReadings";
import DailyQuestion from "./pages/DailyQuestion";
import AIInsights from "./pages/AIInsights";

function App() {
  const [page, setPage] = useState("landing");

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      setLoggedIn(!!data?.user);
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(!!session?.user);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const enterOracle = () => {
    if (loggedIn) {
      setPage("home");
    } else {
      setPage("auth");
    }
  };

  // ================= ABOUT PAGES =================

  const goToAbout = () => {
    setPage("about");
  };

  const goToAboutPalm = () => {
    setPage("aboutPalm");
  };

  const goToAboutTarot = () => {
    setPage("aboutTarot");
  };
  const goToCompare = () => {
    setPage("compare");
  };
  const goToDailyQuestion = () => {
    setPage("dailyQuestion");
  };
  const goToAIInsights = () => {
    setPage("aiInsights");
  };
  const goToOverview = () => {
    setPage("overview");
  };
  const goToReadings = () => {
    setPage("myReadings");
  };
  const goToOracleJourney = () => {
    setPage("oracleJourney");
  };

  return (
    <>
      {/* ================= LANDING ================= */}

      {page === "landing" && (
        <LandingPage
          enterOracle={enterOracle}
          goToAbout={goToAbout}
          goToAboutPalm={goToAboutPalm}
          goToAboutTarot={goToAboutTarot}
          goToCompare={goToCompare}
          goToDailyQuestion={goToDailyQuestion}
          goToAIInsights={goToAIInsights}
          goToOverview={goToOverview}
          goToReadings={goToReadings}
          goToOracleJourney={goToOracleJourney}
          
        />
      )}

      {/* ================= ABOUT ORACLE ================= */}

      {page === "about" && (
        <AboutOracle
          goHome={() => setPage("landing")}
        />
      )}

      {/* ================= HOW PALMISTRY WORKS ================= */}

      {page === "aboutPalm" && (
        <AboutPalm
          goHome={() => setPage("landing")}
        />
      )}
      {page === "adminLogin" && (
        <AdminLogin
          goBack={() => setPage("auth")}
          onSuccess={() => setPage("adminDashboard")}
        />
      )}
      {page === "adminDashboard" && (
        <AdminDashboard
          goHome={() => setPage("landing")}
        />
      )}

      {/* ================= HOW TAROT WORKS ================= */}

      {page === "aboutTarot" && (
        <AboutTarot
          goHome={() => setPage("landing")}
        />
      )}
      {page === "compare" && (
        <CompareReadings
          goHome={() => setPage("landing")}
        />
      )}
      {page === "dailyQuestion" && (
        <DailyQuestion
          goHome={() => setPage("landing")}
        />
      )}
      {page === "aiInsights" && (
        <AIInsights
          goHome={() => setPage("landing")}
        />
      )}
      {page === "overview" && (
        <Overview
          goHome={() => setPage("landing")}
          goToReadings={() => setPage("myReadings")}
          goToInsights={() => setPage("aiInsights")}
          goToCompare={goToCompare}
          goToDailyQuestion={goToDailyQuestion}
        />
      )}
      {page === "myReadings" && (
        <MyReadings
          goHome={() => setPage("landing")}
        />
      )}
      {page === "oracleJourney" && (
        <OracleJourney
          goHome={() => setPage("landing")}
        />
      )}

      {/* ================= LOGIN / SIGNUP ================= */}

      {page === "auth" && (
        <LoginSignup
          onSuccess={() => setPage("home")}
          goBack={() => setPage("landing")}
          goToAdminLogin={() => setPage("adminLogin")}
        />
      )}

      {/* ================= ORACLE HOME ================= */}

      {page === "home" && (
        <HomePage
          goHome={() => setPage("landing")}
          goToPalm={() => setPage("palm")}
          goToTarot={() => setPage("tarot")}
        />
      )}

      {/* ================= ACTUAL PALM ANALYSIS ================= */}

      {page === "palm" && (
        <PalmPage
          goHome={() => setPage("home")}
        />
      )}

      {/* ================= ACTUAL TAROT READING ================= */}

      {page === "tarot" && (
        <TarotPage
          goHome={() => setPage("home")}
        />
      )}
    </>
  );
}

export default App;