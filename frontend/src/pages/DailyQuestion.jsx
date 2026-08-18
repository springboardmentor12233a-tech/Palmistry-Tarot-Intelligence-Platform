import { useState } from "react";
import axios from "axios";
import "../styles/DailyQuestion.css";

function DailyQuestion({ goHome }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [reflection, setReflection] = useState("");

  const [questionLoading, setQuestionLoading] = useState(false);
  const [reflectionLoading, setReflectionLoading] = useState(false);

  const getQuestion = async () => {
    try {
      setQuestionLoading(true);
      setReflection("");
      setAnswer("");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/features/daily-question"
      );

      setQuestion(response.data.question);
    } catch (error) {
      console.error("DAILY QUESTION ERROR:", error);
      alert("Could not get today's question.");
    } finally {
      setQuestionLoading(false);
    }
  };

  const getReflection = async () => {
    if (!answer.trim()) {
      alert("Please write your answer first.");
      return;
    }

    try {
      setReflectionLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/features/daily-reflection",
        {
          question,
          answer,
        }
      );

      setReflection(response.data.reflection);
    } catch (error) {
      console.error("REFLECTION ERROR:", error);
      alert("Could not get the Oracle's reflection.");
    } finally {
      setReflectionLoading(false);
    }
  };

  return (
    <div className="dailyQuestionPage">

      <button
        className="dailyBackBtn"
        onClick={goHome}
      >
        ← Back to Home
      </button>

      <div className="dailyQuestionContent">

        <h1>✦ Daily Question</h1>

        <p className="dailySubtitle">
          Take a moment to pause, reflect, and listen to yourself.
        </p>

        {!question && (
          <button
            className="dailyQuestionBtn"
            onClick={getQuestion}
            disabled={questionLoading}
          >
            {questionLoading
              ? "✨ Consulting the Oracle..."
              : "🔮 Get Today's Question"}
          </button>
        )}

        {question && (
          <>
            <div className="questionCard">

              <h2>Today's Question</h2>

              <p>{question}</p>

            </div>

            <div className="answerCard">

              <h2>Your Answer</h2>

              <textarea
                rows="6"
                placeholder="Write whatever comes to your mind..."
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
              />

              <button
                className="reflectionBtn"
                onClick={getReflection}
                disabled={reflectionLoading}
              >
                {reflectionLoading
                  ? "✨ Reading Your Thoughts..."
                  : "✦ Get Oracle's Reflection"}
              </button>

            </div>

            {reflection && (
              <div className="reflectionCard">

                <h2>🔮 Oracle's Reflection</h2>

                <p>{reflection}</p>

              </div>
            )}
          </>
        )}

      </div>

    </div>
  );
}

export default DailyQuestion;