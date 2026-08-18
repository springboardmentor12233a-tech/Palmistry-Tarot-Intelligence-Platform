import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Auth.css";

import CosmicBackground from "../components/CosmicBackground";

import {
  loginUser,
  saveAuthData,
} from "../services/api";


function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // =========================================================
  // SHOW / HIDE PASSWORD
  // =========================================================

  const [showPassword, setShowPassword] = useState(false);


  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    try {

      const response = await loginUser(
        email,
        password
      );

      // Save token + user information
      saveAuthData(response);


      // =====================================================
      // ROLE-BASED REDIRECT
      // =====================================================

      if (response.user?.role === "admin") {

        navigate("/admin");

      } else {

        navigate("/dashboard");

      }

    } catch (error) {

      alert(error.message);

    }
  };


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
            AUTH CONTAINER
        ================================================= */}

        <div className="auth-container">


          {/* =================================================
              INTRO
          ================================================= */}

          <div className="auth-intro">

            <span className="auth-label">
              WELCOME BACK
            </span>

            <h1>
              Continue your
              <span> journey.</span>
            </h1>

            <p>
              Sign in to access your palm readings,
              tarot insights and personal journey.
            </p>

          </div>


          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div className="auth-card">

            <h2>
              Sign in
            </h2>

            <p className="auth-card-description">
              Enter your details to continue.
            </p>


            <form onSubmit={handleSubmit}>


              {/* =================================================
                  EMAIL
              ================================================= */}

              <div className="form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>


              {/* =================================================
                  PASSWORD
              ================================================= */}

              <div className="form-group">

                <label htmlFor="password">
                  Password
                </label>

                <div className="password-input-wrapper">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
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
                  OPTIONS
              ================================================= */}

              <div className="form-options">

                <label className="remember-option">

                  <input
                    type="checkbox"
                  />

                  <span>
                    Remember me
                  </span>

                </label>


                <Link to="/forgot-password">
                  Forgot password?
                </Link>

              </div>


              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                type="submit"
                className="auth-submit"
              >
                Sign In →
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
                REGISTER
            ================================================= */}

            <p className="auth-switch">

              Don't have an account?

              <Link to="/register">
                Create one
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


export default Login;