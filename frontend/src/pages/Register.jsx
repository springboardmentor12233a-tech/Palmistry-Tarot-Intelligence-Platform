import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Auth.css";

import CosmicBackground from "../components/CosmicBackground";

import {
  registerUser,
  saveAuthData,
} from "../services/api";


function Register() {

  const navigate = useNavigate();


  // =========================================================
  // FORM STATE
  // =========================================================

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");


  // =========================================================
  // SHOW / HIDE PASSWORD
  // =========================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  // =========================================================
  // REGISTER
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();


    // -------------------------------------------------------
    // CHECK PASSWORDS
    // -------------------------------------------------------

    if (password !== confirmPassword) {

      alert("Passwords do not match.");

      return;
    }


    // -------------------------------------------------------
    // API REQUEST
    // -------------------------------------------------------

    try {

      const response = await registerUser(
        name,
        email,
        password
      );


      // Save token + user information
      saveAuthData(response);


      alert(
        "Account created successfully!"
      );


      navigate("/dashboard");


    } catch (error) {

      alert(error.message);

    }
  };


  return (

    <div className="auth-page">

      {/* =================================================
          COSMIC BACKGROUND
      ================================================= */}

      <CosmicBackground />


      {/* =================================================
          CONTENT
      ================================================= */}

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
            MAIN CONTENT
        ================================================= */}

        <div className="auth-container">


          {/* =================================================
              INTRO
          ================================================= */}

          <div className="auth-intro">

            <span className="auth-label">
              BEGIN YOUR JOURNEY
            </span>

            <h1>
              Create your
              <span> account.</span>
            </h1>

            <p>
              Create an account to save readings,
              explore insights and track your journey.
            </p>

          </div>


          {/* =================================================
              REGISTER CARD
          ================================================= */}

          <div className="auth-card">

            <h2>
              Create account
            </h2>

            <p className="auth-card-description">
              Enter your details to get started.
            </p>


            <form onSubmit={handleSubmit}>


              {/* =================================================
                  FULL NAME
              ================================================= */}

              <div className="form-group">

                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  required
                />

              </div>


              {/* =================================================
                  EMAIL
              ================================================= */}

              <div className="form-group">

                <label htmlFor="register-email">
                  Email address
                </label>

                <input
                  id="register-email"
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


              {/* =================================================
                  PASSWORD
              ================================================= */}

              <div className="form-group">

                <label htmlFor="register-password">
                  Password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
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

                    {showPassword
                      ? "🙈"
                      : "👁"}

                  </button>

                </div>

              </div>


              {/* =================================================
                  CONFIRM PASSWORD
              ================================================= */}

              <div className="form-group">

                <label htmlFor="confirm-password">
                  Confirm password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="confirm-password"
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
                  TERMS
              ================================================= */}

              <label className="terms-option">

                <input
                  type="checkbox"
                  required
                />

                <span>

                  I agree to the platform terms and
                  understand that readings are for
                  self-reflection and entertainment.

                </span>

              </label>


              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                type="submit"
                className="auth-submit"
              >
                Create Account →
              </button>

            </form>


            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="auth-divider">

              <span>
                OR
              </span>

            </div>


            {/* =================================================
                LOGIN
            ================================================= */}

            <p className="auth-switch">

              Already have an account?

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

          ✦ For self-reflection and entertainment purposes

        </p>

      </div>

    </div>
  );
}


export default Register;