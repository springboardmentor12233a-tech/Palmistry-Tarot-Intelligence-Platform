import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Auth.css";

import CosmicBackground from "../components/CosmicBackground";

import { forgotPassword } from "../services/api";


function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [resetToken, setResetToken] = useState("");


  const handleSubmit = async (event) => {

    event.preventDefault();

    setLoading(true);

    setMessage("");

    setResetToken("");


    try {

      const response = await forgotPassword(
        email
      );

      setMessage(
        response.message
      );

      /*
       * DEVELOPMENT ONLY
       *
       * Later this token will be
       * sent through email.
       */

      if (response.reset_token) {

        setResetToken(
          response.reset_token
        );
      }

    } catch (error) {

      setMessage(
        error.message
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <div className="auth-page">

      <CosmicBackground />

      <div className="auth-content">

        <div className="auth-brand">

          <Link
            to="/"
            className="auth-logo"
          >
            <span>✦</span>
            P&T Intelligence
          </Link>

        </div>


        <div className="auth-container">

          <div className="auth-intro">

            <span className="auth-label">
              PASSWORD RECOVERY
            </span>

            <h1>
              Recover your
              <span> journey.</span>
            </h1>

            <p>
              Enter your registered email
              address to reset your password.
            </p>

          </div>


          <div className="auth-card">

            <h2>
              Forgot password?
            </h2>

            <p className="auth-card-description">
              Enter your email address
              to continue.
            </p>


            <form
              onSubmit={handleSubmit}
            >

              <div className="form-group">

                <label htmlFor="forgot-email">
                  Email address
                </label>

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  required
                />

              </div>


              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Generating..."
                  : "Reset Password →"}
              </button>

            </form>


            {message && (
              <div
                className="auth-success"
                style={{
                  marginTop: "18px",
                }}
              >
                {message}
              </div>
            )}


            {resetToken && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "14px",
                  border:
                    "1px solid rgba(245,196,81,.25)",
                  borderRadius: "10px",
                  wordBreak: "break-all",
                  fontSize: "10px",
                  color: "#f5c451",
                }}
              >

                <strong>
                  Development reset token:
                </strong>

                <br />

                {resetToken}

                <br />
                <br />

                <button
                  type="button"
                  className="profile-logout-button"
                  onClick={() =>
                    navigate(
                      `/reset-password?token=${encodeURIComponent(
                        resetToken
                      )}`
                    )
                  }
                >
                  Continue to Reset Password
                </button>

              </div>
            )}


            <div className="auth-divider">
              <span>OR</span>
            </div>


            <p className="auth-switch">

              Remember your password?

              <Link to="/login">
                Sign in
              </Link>

            </p>

          </div>

        </div>


        <p className="auth-disclaimer">
          ✦ For self-reflection and
          entertainment purposes
        </p>

      </div>

    </div>
  );
}


export default ForgotPassword;