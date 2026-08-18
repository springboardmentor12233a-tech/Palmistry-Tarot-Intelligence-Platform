import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/AdminDashboard.css";

function AdminDashboard({ goHome }) {
  const [adminEmail, setAdminEmail] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [readingCount, setReadingCount] = useState(0);
  const [tarotCount, setTarotCount] = useState(0);
  const [palmCount, setPalmCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
  
      // =========================
      // GET CURRENT ADMIN
      // =========================
  
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (user) {
        setAdminEmail(user.email || "");
      }
  
      // =========================
      // GET UNIQUE USERS
      // =========================
      // This counts unique users who have
      // at least one reading.
  
      const { data: userData, error: userError } =
        await supabase
          .from("Palmistry")
          .select("user_id");
  
      if (!userError && userData) {
        const uniqueUsers = new Set(
          userData
            .map((item) => item.user_id)
            .filter(Boolean)
        );
  
        setUserCount(uniqueUsers.size);
      }
  
      // =========================
      // GET TOTAL READINGS
      // =========================
  
      const {
        count: readings,
        error: readingsError,
      } = await supabase
        .from("Palmistry")
        .select("*", {
          count: "exact",
          head: true,
        });
  
      if (!readingsError) {
        setReadingCount(readings || 0);
      }
  
      // =========================
      // GET TAROT READINGS
      // =========================
  
      const {
        count: tarot,
        error: tarotError,
      } = await supabase
        .from("Palmistry")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("type", "tarot");
  
      if (!tarotError) {
        setTarotCount(tarot || 0);
      }
  
      // =========================
      // GET PALM READINGS
      // =========================
  
      const {
        count: palm,
        error: palmError,
      } = await supabase
        .from("Palmistry")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("type", "palm");
  
      if (!palmError) {
        setPalmCount(palm || 0);
      }
  
    } catch (error) {
      console.error(
        "ADMIN DASHBOARD ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    goHome();
  };

  return (
    <div className="adminDashboardPage">

      {/* TOP BAR */}

      <header className="adminTopBar">

        <div className="adminBrand">
          <span className="adminBrandIcon">
            ✦
          </span>

          <div>
            <h1>Oracle Administration</h1>

            <span>
              Control Center
            </span>
          </div>
        </div>

        <div className="adminTopActions">

          <span className="adminStatus">
            <span className="statusDot"></span>
            Administrator
          </span>

          <button
            className="adminLogoutBtn"
            onClick={handleLogout}
          >
            Log Out
          </button>

        </div>

      </header>


      {/* MAIN CONTENT */}

      <main className="adminDashboardContent">

        <div className="adminWelcome">

          <div>
            <span className="adminEyebrow">
              THE ORACLE • ADMIN PORTAL
            </span>

            <h2>
              Welcome to the
              <span> Inner Circle.</span>
            </h2>

            <p>
              Manage your Oracle platform,
              monitor activity, and oversee
              the experience from one place.
            </p>
          </div>

          <div className="adminOrb">
            ✦
          </div>

        </div>


        {/* STATISTICS */}

        <section className="adminStats">

  <div className="adminStatCard">

    <div className="statIcon">
      👤
    </div>

    <div>
      <span>
        Registered Users
      </span>

      <strong>
        {loading ? "..." : userCount}
      </strong>
    </div>

  </div>


  <div className="adminStatCard">

    <div className="statIcon">
      🔮
    </div>

    <div>
      <span>
        Tarot Readings
      </span>

      <strong>
        {loading ? "..." : tarotCount}
      </strong>
    </div>

  </div>


  <div className="adminStatCard">

    <div className="statIcon">
      ✋
    </div>

    <div>
      <span>
        Palm Readings
      </span>

      <strong>
        {loading ? "..." : palmCount}
      </strong>
    </div>

  </div>

</section>


        {/* MANAGEMENT */}

        <section className="adminManagement">

          <div className="sectionHeading">

            <span>
              MANAGEMENT
            </span>

            <h2>
              Oracle Operations
            </h2>

          </div>


          <div className="adminTools">

            <div className="adminToolCard">

              <div className="toolIcon">
                👥
              </div>

              <div>
                <h3>
                  Users
                </h3>

                <p>
                  Monitor registered users
                  and platform activity.
                </p>
              </div>

              <button>
                View Users →
              </button>

            </div>


            <div className="adminToolCard">

              <div className="toolIcon">
                🔮
              </div>

              <div>
                <h3>
                  Tarot Readings
                </h3>

                <p>
                  Review tarot reading
                  activity across the platform.
                </p>
              </div>

              <button>
                View Readings →
              </button>

            </div>


            <div className="adminToolCard">

              <div className="toolIcon">
                ✋
              </div>

              <div>
                <h3>
                  Palm Readings
                </h3>

                <p>
                  Monitor palmistry analysis
                  activity.
                </p>
              </div>

              <button>
                View Readings →
              </button>

            </div>


            <div className="adminToolCard">

              <div className="toolIcon">
                ⚙️
              </div>

              <div>
                <h3>
                  Oracle Settings
                </h3>

                <p>
                  Platform configuration
                  and administration tools.
                </p>
              </div>

              <button>
                Manage →
              </button>

            </div>

          </div>

        </section>


        {/* ADMIN INFORMATION */}

        <section className="adminInfoCard">

          <div className="infoSymbol">
            🛡️
          </div>

          <div>

            <span>
              AUTHENTICATED ADMINISTRATOR
            </span>

            <h3>
              {adminEmail}
            </h3>

            <p>
              Your account has verified
              administrator access to the
              Oracle platform.
            </p>

          </div>

        </section>


        <p className="adminDisclaimer">
          ✦ Administrative access is restricted
          to authorized Oracle personnel.
        </p>

      </main>

    </div>
  );
}

export default AdminDashboard;