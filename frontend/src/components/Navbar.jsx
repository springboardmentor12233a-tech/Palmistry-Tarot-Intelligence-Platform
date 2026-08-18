import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/Navbar.css";

function Navbar({
  goHome,
  goToLogin,
  goToAbout,
  goToAboutPalm,
  goToAboutTarot,
  goToCompare,
  goToDailyQuestion,
  goToAIInsights,
  goToOverview,
  goToReadings,
  goToOracleJourney
}) {
  const [userName, setUserName] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showDash, setShowDash] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        const name = data.user.user_metadata?.name;
        setUserName(name || data.user.email?.split("@")[0]);
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const name = session.user.user_metadata?.name;
          setUserName(name || session.user.email?.split("@")[0]);
        } else {
          setUserName(null);
          setShowMenu(false);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setUserName(null);
    setShowMenu(false);

    goHome();
  };

  return (
    <nav className="navbar">

      <div className="navLogo" onClick={goHome}>
        ✦ ORACLE
      </div>

      <div className="navLinks">
        <button onClick={goHome}>Home</button>
      <div className="dropdownWrapper">
      <button onClick={()=> setShowAbout(!showAbout)}>
            About ▾
        </button>
        {showAbout && (
          <div className="dropdown">
            <button onClick={goToAbout}>What is Oracle?</button>
            <button onClick={goToAboutPalm}>How Palmistry Works</button>
            <button onClick={goToAboutTarot}>How Tarot Works</button>
          </div>
        )}
      </div>
      <div className="dropdownWrapper">
      <button onClick={()=> setShowDash(!showDash)}>
            Dashboard ▾
        </button>
        {showDash && (
          <div className="dropdown">
            <button onClick={goToOverview}>
              Overview
            </button>

            <button onClick={goToReadings}>
              My Readings
            </button>

            <button onClick={goToOracleJourney}>
              Oracle Journey
            </button>
          </div>
        )}
        </div>   
        <div className="dropdownWrapper">
        <button onClick={()=> setShowFeatures(!showFeatures)}>
            Features ▾
        </button>
        {showFeatures && (
          <div className="dropdown">
            <button onClick={goToCompare}>
              Compare Readings
            </button>
            <button onClick={goToDailyQuestion}>
              Daily Question
            </button>
            <button onClick={goToAIInsights}>
              AI Insights
            </button>
          </div>
        )}
        </div>     
        
        
      </div>

      {userName ? (
        <div className="profileWrapper">

          <button
            className="profileButton"
            onClick={() => setShowMenu(!showMenu)}
          >
            ✦ {userName} ▾
          </button>

          {showMenu && (
            <div className="profileMenu">
              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}

        </div>
      ) : (
        <button
          className="profileButton"
          onClick={goToLogin}
        >
          Login / Sign Up
        </button>
      )}

    </nav>
  );
}

export default Navbar;