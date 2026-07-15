import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 25px",
        background: "#0077ff",
        color: "white",
      }}
    >
      <h2 style={{ margin: 0 }}>Palmistry & Tarot</h2>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={buttonStyle}
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/profile")}
          style={buttonStyle}
        >
          Profile
        </button>

        <button
          onClick={handleLogout}
          style={buttonStyle}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

const buttonStyle = {
  background: "white",
  color: "#0077ff",
  border: "none",
  padding: "8px 15px",
  cursor: "pointer",
  borderRadius: "5px",
  fontWeight: "bold",
};

export default Navbar;