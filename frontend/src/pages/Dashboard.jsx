import Navbar from "../components/Navbar";

function Dashboard() {
  return (
    <>
      <Navbar />

      <div className="container">
        <h1>Dashboard</h1>

        <p>🎉 Welcome! You are logged in.</p>

        <p>This is your Palmistry & Tarot Dashboard.</p>
      </div>
    </>
  );
}

export default Dashboard;