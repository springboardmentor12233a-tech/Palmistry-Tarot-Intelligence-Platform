import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import SvgDefs from "../components/SvgDefs.jsx";
import AuthSidePanel from "../components/AuthSidePanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream">
      <SvgDefs />
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-3 mb-8">
            <Logo size={34} />
            <span className="font-display text-2xl text-ink">Begin your journey with</span>
            <span className="font-display text-3xl text-ink -mt-2 tracking-wide">LUCEM</span>
            <p className="text-sm text-muted text-center mt-1">
              Palmistry, tarot, and AI intelligence in one place.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted">Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full bg-surface hairline rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold/60"
                placeholder="Ava Sharma"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full bg-surface hairline rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold/60"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full bg-surface hairline rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold/60"
                placeholder="At least 6 characters"
              />
            </div>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-ink text-cream font-medium hover:bg-ink-soft transition-colors disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-gold hover:text-gold-soft font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <AuthSidePanel />
    </div>
  );
}
