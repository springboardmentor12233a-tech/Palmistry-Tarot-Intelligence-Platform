import { useState } from "react";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  Moon,
  Sparkles,
  UserRound,
} from "lucide-react";
import "./AuthPage.css";

const API_URL = "http://127.0.0.1:8000";

function AuthPage({ onAuthenticated, onBack }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    // Name validation
    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      let response;

      if (mode === "register") {
        response = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        });
      } else {
        const body = new URLSearchParams();

        body.append("username", email.trim());
        body.append("password", password);

        response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to complete authentication."
        );
      }

      localStorage.setItem(
        "arcana_access_token",
        data.access_token
      );

      localStorage.setItem(
        "arcana_user",
        JSON.stringify(data.user)
      );

      onAuthenticated(data.user);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (event) => {
    const value = event.target.value;

    setPassword(value);

    // Remove validation message once password becomes valid
    if (value.length >= 8 && error === "Password must be at least 8 characters.") {
      setError("");
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setPassword("");
    setName("");
  };

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <button
        type="button"
        className="auth-back"
        onClick={onBack}
      >
        ← Back
      </button>

      <section className="auth-shell">

        {/* BRAND */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Moon size={21} />
          </div>

          <div>
            <strong>Arcana AI</strong>
            <span>Palmistry & Tarot Intelligence</span>
          </div>
        </div>

        {/* HEADING */}
        <div className="auth-heading">
          <div className="auth-kicker">
            <Sparkles size={14} />
            PERSONAL INTELLIGENCE
          </div>

          <h1>
            {mode === "login"
              ? "Welcome back."
              : "Begin your journey."}
          </h1>

          <p>
            {mode === "login"
              ? "Return to your readings, reflections, and personal insights."
              : "Create your Arcana profile and keep your readings connected."}
          </p>
        </div>

        {/* FORM */}
        <form
          className="auth-card"
          onSubmit={submit}
          noValidate
        >

          {/* NAME */}
          {mode === "register" && (
            <label>
              <span>Name</span>

              <div className="auth-input">
                <UserRound size={17} />

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            </label>
          )}

          {/* EMAIL */}
          <label>
            <span>Email</span>

            <div className="auth-input">
              <Mail size={17} />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          {/* PASSWORD */}
          <label>
            <span>Password</span>

            <div
              className={`auth-input ${
                password.length > 0 && password.length < 8
                  ? "auth-input-invalid"
                  : ""
              } ${
                password.length >= 8
                  ? "auth-input-valid"
                  : ""
              }`}
            >
              <LockKeyhole size={17} />

              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="At least 8 characters"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                required
              />
            </div>

            {/* PASSWORD HINT */}
            {password.length > 0 &&
              password.length < 8 && (
                <small className="auth-field-hint">
                  Password must contain at least 8 characters.
                </small>
              )}

            {password.length >= 8 && (
              <small className="auth-field-success">
                Password length looks good.
              </small>
            )}
          </label>

          {/* ERROR */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Connecting..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}

            {!loading && <ArrowRight size={18} />}
          </button>

          {/* SWITCH */}
          <div className="auth-switch">
            <span>
              {mode === "login"
                ? "New to Arcana AI?"
                : "Already have an account?"}
            </span>

            <button
              type="button"
              onClick={switchMode}
            >
              {mode === "login"
                ? "Create account"
                : "Sign in"}
            </button>
          </div>

        </form>

        {/* DISCLAIMER */}
        <p className="auth-note">
          Arcana AI is designed for reflection and entertainment,
          not guaranteed predictions.
        </p>

      </section>
    </main>
  );
}

export default AuthPage;