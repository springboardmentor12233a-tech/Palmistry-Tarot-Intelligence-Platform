import { useState } from "react";
import { useNavigate, useLocation, Link, redirect } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMessage = location.state?.message;
  const redirectTo = location.state?.from || "/";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectTo);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Login</h1>

      <div className="upload-card" style={{ maxWidth: "400px", margin: "0 auto" }}>
        {redirectMessage && (
          <div
            style={{
              background: "#fff4e5",
              border: "1px solid #f0c36d",
              color: "#7a5200",
              borderRadius: "6px",
              padding: "10px 14px",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            {redirectMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "15px" }}
          />

          <label>Password</label>
          <div style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", paddingRight: "35px" }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "15px" }}>
          Don't have an account?{" "}
          <Link to="/signup" state={location.state}>Sign up</Link>
        </p>
        
        <p style={{ marginTop: "10px" }}>
        <Link to="/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;