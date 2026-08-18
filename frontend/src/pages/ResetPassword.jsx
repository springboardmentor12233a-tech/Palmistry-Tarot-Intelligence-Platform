import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

import "./Auth.css";
import CosmicBackground from "../components/CosmicBackground";

import { resetPassword } from "../services/api";


function ResetPassword() {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");


  // =========================================================
  // STATE
  // =========================================================

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [success, setSuccess] = useState(false);


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setMessage("");

    setSuccess(false);


    if (!token) {

      setMessage(
        "Password reset token is missing."
      );

      return;
    }


    if (password !== confirmPassword) {

      setMessage(
        "Passwords do not match."
      );

      return;
    }


    setLoading(true);


    try {

      const response = await resetPassword(
        token,
        password
      );

      setMessage(
        response.message
      );

      setSuccess(true);

      setPassword("");

      setConfirmPassword("");

    } catch (error) {

      setMessage(
        error.message
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="auth-page">

      <CosmicBackground />

      <div className="auth-content">

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="auth-brand">

          <Link
            to="/"
            className="auth-logo"
          >
            <span>✦</span>
            P&T Intelligence
          </Link>

        </div>


        {/* =================================================
            MAIN
        ================================================= */}

        <div className="auth-container">

          {/* =================================================
              INTRO
          ================================================= */}

          <div className="auth-intro">

            <span className="auth-label">
              PASSWORD RESET
            </span>

            <h1>
              Choose a new
              <span> password.</span>
            </h1>

            <p>
              Create a new password
              to secure your account.
            </p>

          </div>


          {/* =================================================
              CARD
          ================================================= */}

          <div className="auth-card">

            <h2>
              Reset password
            </h2>

            <p className="auth-card-description">
              Enter your new password below.
            </p>


            {!success && (

              <form onSubmit={handleSubmit}>

                {/* =================================================
                    NEW PASSWORD
                ================================================= */}

                <div className="form-group">

                  <label htmlFor="new-password">
                    New password
                  </label>

                  <div className="password-input-wrapper">

                    <input
                      id="new-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Create a new password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      minLength={6}
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>

                  </div>

                </div>


                {/* =================================================
                    CONFIRM PASSWORD
                ================================================= */}

                <div className="form-group">

                  <label htmlFor="confirm-new-password">
                    Confirm new password
                  </label>

                  <div className="password-input-wrapper">

                    <input
                      id="confirm-new-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      minLength={6}
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword
                        ? "🙈"
                        : "👁"}
                    </button>

                  </div>

                </div>


                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading
                    ? "Updating..."
                    : "Update Password →"}
                </button>

              </form>

            )}


            {/* =================================================
                MESSAGE
            ================================================= */}

            {message && (

              <div
                className={
                  success
                    ? "auth-success"
                    : "auth-error"
                }
                style={{
                  marginTop: "18px",
                }}
              >
                {message}
              </div>

            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (

              <button
                type="button"
                className="auth-submit"
                style={{
                  marginTop: "18px",
                }}
                onClick={() =>
                  navigate("/login")
                }
              >
                Go to Sign In →
              </button>

            )}


            {/* =================================================
                DIVIDER
            ================================================= */}

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


        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <p className="auth-disclaimer">
          ✦ For self-reflection and
          entertainment purposes
        </p>

      </div>

    </div>
  );
}


export default ResetPassword;