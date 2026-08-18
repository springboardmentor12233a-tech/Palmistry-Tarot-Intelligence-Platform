import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/OracleJourney.css";

function OracleJourney({ goHome }) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJourney = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          alert("Please login first.");
          return;
        }

        const { data, error } = await supabase
          .from("Palmistry")
          .select("type, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("ORACLE JOURNEY ERROR:", error);
          return;
        }

        setReadings(data || []);
      } catch (error) {
        console.error("LOAD JOURNEY ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJourney();
  }, []);

  const palmCount = readings.filter(
    (reading) => reading.type === "palm"
  ).length;

  const tarotCount = readings.filter(
    (reading) => reading.type === "tarot"
  ).length;

  const totalReadings = readings.length;

  const hasBoth =
    palmCount > 0 && tarotCount > 0;

  const firstReading = readings[0]?.created_at;

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const milestones = [
    {
      icon: "✦",
      title: "First Step",
      description: "Complete your first Oracle reading.",
      unlocked: totalReadings >= 1,
    },
    {
      icon: "🔮",
      title: "Tarot Explorer",
      description: "Complete 5 tarot readings.",
      unlocked: tarotCount >= 5,
    },
    {
      icon: "✋",
      title: "Palm Seeker",
      description: "Complete 3 palm readings.",
      unlocked: palmCount >= 3,
    },
    {
      icon: "🌙",
      title: "Two Paths",
      description: "Experience both palmistry and tarot.",
      unlocked: hasBoth,
    },
    {
      icon: "✨",
      title: "Oracle Seeker",
      description: "Complete 10 readings.",
      unlocked: totalReadings >= 10,
    },
  ];

  if (loading) {
    return (
      <div className="oracleJourneyPage">
        <div className="oracleJourneyLoading">
          ✨ Tracing your Oracle journey...
        </div>
      </div>
    );
  }

  return (
    <div className="oracleJourneyPage">

      <button
        className="oracleJourneyBackBtn"
        onClick={goHome}
      >
        ← Back to Home
      </button>

      <div className="oracleJourneyContent">

        {/* HEADER */}

        <header className="journeyHeader">

          <div className="journeyOrb">
            ✦
          </div>

          <h1>Your Oracle Journey</h1>

          <p>
            Every reading is another step in your journey
            of reflection and discovery.
          </p>

        </header>


        {/* STATS */}

        <section className="journeyStats">

          <div className="journeyStat mainStat">
            <span className="statNumber">
              {totalReadings}
            </span>

            <span className="statLabel">
              Total Readings
            </span>
          </div>

          <div className="journeyStat">
            <span className="statNumber">
              {tarotCount}
            </span>

            <span className="statLabel">
              🔮 Tarot
            </span>
          </div>

          <div className="journeyStat">
            <span className="statNumber">
              {palmCount}
            </span>

            <span className="statLabel">
              ✋ Palm
            </span>
          </div>

        </section>


        {/* JOURNEY PATH */}

        <section className="journeyPathSection">

          <div className="sectionHeading">
            <span>✦</span>
            <div>
              <h2>Your Path</h2>
              <p>
                The milestones you've reached along the way.
              </p>
            </div>
          </div>

          <div className="journeyPath">

            {milestones.map((milestone, index) => (
              <div
                className={`journeyMilestone ${
                  milestone.unlocked
                    ? "unlocked"
                    : "locked"
                }`}
                key={milestone.title}
              >

                <div className="milestoneLine">
                  {index !== milestones.length - 1 && (
                    <div
                      className={`journeyConnector ${
                        milestones[index + 1].unlocked
                          ? "active"
                          : ""
                      }`}
                    />
                  )}

                  <div className="milestoneOrb">
                    {milestone.icon}
                  </div>
                </div>

                <div className="milestoneContent">

                  <div className="milestoneStatus">
                    {milestone.unlocked
                      ? "UNLOCKED"
                      : "LOCKED"}
                  </div>

                  <h3>
                    {milestone.title}
                  </h3>

                  <p>
                    {milestone.description}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </section>


        {/* FIRST READING */}

        {firstReading && (
          <section className="journeyBeginning">

            <div className="beginningStar">
              ✦
            </div>

            <div>
              <span>
                YOUR JOURNEY BEGAN
              </span>

              <h2>
                {formatDate(firstReading)}
              </h2>

              <p>
                And this is only the beginning.
              </p>
            </div>

          </section>
        )}


        <p className="journeyDisclaimer">
          ✦ Your Oracle journey is based on your saved
          readings and is designed for reflection and
          entertainment.
        </p>

      </div>

    </div>
  );
}

export default OracleJourney;