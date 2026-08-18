import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Protected({ children }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
