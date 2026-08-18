function ProfilePage({ user, onBack, onLogout }) {
  return (
    <main className="profile-page">

      <nav className="profile-nav">

        <button
          className="profile-brand"
          onClick={onBack}
        >
          <span className="profile-brand-icon">☾</span>

          <span>
            <strong>Arcana AI</strong>
            <small>PALMISTRY & TAROT INTELLIGENCE</small>
          </span>
        </button>

        <button
          className="profile-nav-back"
          onClick={onBack}
        >
          ← Back
        </button>

      </nav>


      <section className="profile-content">

        <div className="profile-heading">

          <p className="profile-eyebrow">
            YOUR ARCANA IDENTITY
          </p>

          <h1>Your Profile</h1>

          <p>
            Your account, your readings, your journey.
          </p>

        </div>


        <section className="profile-card">

          <div className="profile-card-top">

            <div className="profile-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <span className="profile-card-label">
                ACCOUNT
              </span>

              <h2>
                {user?.name || "Arcana User"}
              </h2>

              <p>
                {user?.email || "—"}
              </p>
            </div>

          </div>


          <div className="profile-divider" />


          <div className="profile-details">

            <div className="profile-detail">
              <span>NAME</span>
              <strong>
                {user?.name || "—"}
              </strong>
            </div>

            <div className="profile-detail">
              <span>EMAIL</span>
              <strong>
                {user?.email || "—"}
              </strong>
            </div>

            <div className="profile-detail">
              <span>ACCOUNT TYPE</span>
              <strong className="profile-role">
                {user?.role || "user"}
              </strong>
            </div>

          </div>


          <div className="profile-divider" />


          <button
            className="profile-signout-button"
            onClick={onLogout}
          >
            SIGN OUT
          </button>

        </section>


        <p className="profile-disclaimer">
          Arcana AI is designed for reflection and entertainment,
          not guaranteed predictions.
        </p>

      </section>

    </main>
  );
}

export default ProfilePage;