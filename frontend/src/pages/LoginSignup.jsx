import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/LoginSignup.css";

function LoginSignup({ onSuccess, goBack, goToAdminLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        setMessage("Welcome back ✨");
        onSuccess();

      } else {
        const { error } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
              },
            },
          });

        if (error) throw error;

        setMessage(
          "Account created successfully. Please check your email."
        );
      }

    } catch (error) {
      setMessage(error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">

      <div className="authCard">

        {/* BACK */}

        <button
          className="authBack"
          onClick={goBack}
        >
          ← Back
        </button>


        {/* TITLE */}

        <h1>
          {isLogin
            ? "Welcome Back"
            : "Join the Oracle"}
        </h1>

        <p>
          {isLogin
            ? "Enter the mystical realm once again."
            : "Create your account and begin your journey."}
        </p>


        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button
            type="submit"
            className="authButton"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Enter the Oracle"
              : "Create Account"}
          </button>

        </form>


        {/* MESSAGE */}

        {message && (
          <p className="authMessage">
            {message}
          </p>
        )}


        {/* SWITCH LOGIN / SIGNUP */}

        <button
          className="switchAuth"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
          }}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </button>


        {/* DIVIDER */}

        <div className="adminDivider">
          <span>or</span>
        </div>


        {/* ADMIN ACCESS */}

        <button
          type="button"
          className="adminAccessButton"
          onClick={goToAdminLogin}
        >
          ✦ Admin Access
        </button>

      </div>

    </div>
  );
}

export default LoginSignup;