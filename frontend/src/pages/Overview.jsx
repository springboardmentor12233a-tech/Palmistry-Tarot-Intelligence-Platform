import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/Overview.css";

function Overview({
  goHome,
  goToReadings,
  goToInsights,
  goToCompare,
  goToDailyQuestion,
}) {
  const [userName, setUserName] = useState("Explorer");
  const [palmCount, setPalmCount] = useState(0);
  const [tarotCount, setTarotCount] = useState(0);

  useEffect(() => {
    const loadOverview = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const name =
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Explorer";

      setUserName(name);

      const { data, error } = await supabase
        .from("Palmistry")
        .select("type")
        .eq("user_id", user.id);

      if (error) {
        console.error("OVERVIEW ERROR:", error);
        return;
      }

      setPalmCount(
        data?.filter((reading) => reading.type === "palm").length || 0
      );

      setTarotCount(
        data?.filter((reading) => reading.type === "tarot").length || 0
      );
    };

    loadOverview();
  }, []);

  return (
    <div className="overviewPage">

      <button
        className="overviewBackBtn"
        onClick={goHome}
      >
        ← Back to Home
      </button>

      <div className="overviewContent">

        <div className="overviewHeader">
          <div className="overviewIcon">✦</div>

          <h1>Welcome back, {userName}</h1>

          <p>
            Your personal Oracle space — explore your readings,
            discover patterns, and reflect on your journey.
          </p>
        </div>

        <div className="overviewStats">

          <div className="overviewStatCard">
            <span>✋</span>
            <h2>{palmCount}</h2>
            <p>Palm Readings</p>
          </div>

          <div className="overviewStatCard">
            <span>🔮</span>
            <h2>{tarotCount}</h2>
            <p>Tarot Readings</p>
          </div>

          <div className="overviewStatCard">
            <span>✨</span>
            <h2>{palmCount + tarotCount}</h2>
            <p>Total Readings</p>
          </div>

        </div>

        <div className="overviewActions">

          <div
            className="overviewActionCard"
            onClick={goToReadings}
          >
            <span className="actionIcon">📜</span>

            <h2>My Readings</h2>

            <p>
              View your previous palm and tarot readings.
            </p>

            <span className="actionLink">
              Explore Readings →
            </span>
          </div>

          <div
            className="overviewActionCard"
            onClick={goToInsights}
          >
            <span className="actionIcon">✨</span>

            <h2>My Insights</h2>

            <p>
              Discover patterns and themes across your readings.
            </p>

            <span className="actionLink">
              Explore Insights →
            </span>
          </div>

          <div
            className="overviewActionCard"
            onClick={goToCompare}
          >
            <span className="actionIcon">☯</span>

            <h2>Compare Readings</h2>

            <p>
              Find connections between your palm and tarot readings.
            </p>

            <span className="actionLink">
              Compare →
            </span>
          </div>

          <div
            className="overviewActionCard"
            onClick={goToDailyQuestion}
          >
            <span className="actionIcon">🌙</span>

            <h2>Daily Question</h2>

            <p>
              Take a moment to pause and reflect on yourself.
            </p>

            <span className="actionLink">
              Reflect →
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Overview;