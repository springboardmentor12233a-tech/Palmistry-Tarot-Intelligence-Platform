import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/AdminLogin.css";

function AdminLogin({ onSuccess, goBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
  
    setLoading(true);
    setMessage("");
  
    try {
      // 1. Authenticate with Supabase
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
  
      if (error) {
        throw error;
      }
  
      const user = data?.user;
  
      if (!user) {
        throw new Error("Could not verify your account.");
      }
  
      // 2. Check whether this user is an admin
      const { data: admin, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
  
      if (adminError) {
        console.error(
          "ADMIN VERIFICATION ERROR:",
          adminError
        );
  
        throw new Error(
          "Could not verify administrator access."
        );
      }
  
      // 3. User exists but isn't an admin
      if (!admin) {
        await supabase.auth.signOut();
  
        throw new Error(
          "You are not authorized to access the administration portal."
        );
      }
  
      // 4. Successfully authenticated AND authorized
      setMessage("Admin access granted ✦");
  
      onSuccess();
  
    } catch (error) {
      console.error(
        "ADMIN LOGIN ERROR:",
        error
      );
  
      setMessage(
        error.message ||
        "Admin login failed."
      );
  
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminLoginPage">

      <div className="adminLoginCard">

        {/* BACK */}

        <button
          className="adminBackButton"
          onClick={goBack}
        >
          ← Back to Oracle
        </button>


        {/* HEADER */}

        <div className="adminLoginIcon">
          🛡️
        </div>

        <h1>
          Oracle Administration
        </h1>

        <p className="adminLoginSubtitle">
          Authorized access only
        </p>


        {/* FORM */}

        <form onSubmit={handleAdminLogin}>

          <label>
            Admin Email
          </label>

          <input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />


          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />


          <button
            type="submit"
            className="adminLoginButton"
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Enter Administration"}
          </button>

        </form>


        {/* MESSAGE */}

        {message && (
          <p className="adminLoginMessage">
            {message}
          </p>
        )}


        <p className="adminSecurityNote">
          ✦ This portal is restricted to
          authorized administrators.
        </p>

      </div>

    </div>
  );
}

export default AdminLogin;