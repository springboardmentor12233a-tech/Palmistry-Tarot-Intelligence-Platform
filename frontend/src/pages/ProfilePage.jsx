import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "../auth/AuthContext";

import {
  updateProfile,
} from "../services/authApi";

import "./ProfilePage.css";


// ============================================================
// PROFILE PAGE
// ============================================================

function ProfilePage() {

  const {
    user,
    refreshUser,
  } = useAuth();


  const [
    formData,
    setFormData,
  ] = useState({

    full_name: "",

    age_group: "",

    interests: "",

    spiritual_goal: "",

    reading_preference: "",

  });


  const [
    isSaving,
    setIsSaving,
  ] = useState(false);


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  // ==========================================================
  // LOAD CURRENT USER
  // ==========================================================

  useEffect(() => {

    if (!user) {
      return;
    }


    setFormData({

      full_name:
        user.full_name || "",

      age_group:
        user.age_group || "",

      interests:
        user.interests || "",

      spiritual_goal:
        user.spiritual_goal || "",

      reading_preference:
        user.reading_preference || "",

    });

  }, [user]);


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setFormData(
        (previous) => ({

          ...previous,

          [name]: value,

        })
      );


      setSuccessMessage("");

      setErrorMessage("");
    };


  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSubmit =
    async (event) => {

      event.preventDefault();


      setSuccessMessage("");

      setErrorMessage("");


      if (
        !formData
          .full_name
          .trim()
      ) {

        setErrorMessage(
          "Please enter your full name."
        );

        return;
      }


      setIsSaving(
        true
      );


      try {

        const payload = {

          full_name:
            formData
              .full_name
              .trim(),

          age_group:
            formData.age_group
              || null,

          interests:
            formData
              .interests
              .trim()
              || null,

          spiritual_goal:
            formData
              .spiritual_goal
              .trim()
              || null,

          reading_preference:
            formData
              .reading_preference
              || null,

        };


        await updateProfile(
          payload
        );


        await refreshUser();


        setSuccessMessage(
          "Profile updated successfully."
        );


      } catch (error) {

        console.error(
          "PROFILE UPDATE ERROR:",
          error
        );


        setErrorMessage(
          error?.message ||
          "Your profile could not be updated."
        );


      } finally {

        setIsSaving(
          false
        );

      }
    };


  // ==========================================================
  // USER NOT AVAILABLE
  // ==========================================================

  if (!user) {

    return (
      <div className="profile-page">

        <div className="profile-loading">
          Loading profile...
        </div>

      </div>
    );
  }


  // ==========================================================
  // DISPLAY ROLE
  // ==========================================================

  const readableRole =
    String(
      user.role || "user"
    )
      .replaceAll(
        "_",
        " "
      )
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="profile-page">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="profile-header">

        <div>

          <p className="profile-eyebrow">
            ACCOUNT & PERSONALIZATION
          </p>


          <h1>
            My Profile
          </h1>


          <p className="profile-description">

            Manage your personal details
            and preferences used for
            personalized readings.

          </p>

        </div>


        <div className="profile-avatar">

          {
            user.full_name
              ?.trim()
              ?.charAt(0)
              ?.toUpperCase()
            || "U"
          }

        </div>

      </div>


      {/* ==================================================== */}
      {/* ACCOUNT INFORMATION */}
      {/* ==================================================== */}

      <section className="profile-section">

        <div className="profile-section-header">

          <div>

            <h2>
              Account Information
            </h2>

            <p>
              Authentication and account
              access information.
            </p>

          </div>

        </div>


        <div className="profile-account-grid">


          {/* EMAIL */}

          <article className="profile-info-card">

            <span className="profile-info-label">
              Email
            </span>

            <strong>
              {
                user.email
              }
            </strong>

            <small>
              Your login email cannot be
              changed from this page.
            </small>

          </article>


          {/* ROLE */}

          <article className="profile-info-card">

            <span className="profile-info-label">
              Role
            </span>

            <strong>
              {
                readableRole
              }
            </strong>

            <small>
              Account roles are managed
              by platform administrators.
            </small>

          </article>


          {/* STATUS */}

          <article className="profile-info-card">

            <span className="profile-info-label">
              Account Status
            </span>

            <strong
              className={
                user.is_active
                  ? "profile-status-active"
                  : "profile-status-inactive"
              }
            >

              {
                user.is_active
                  ? "Active"
                  : "Inactive"
              }

            </strong>

            <small>
              Current account access
              status.
            </small>

          </article>

        </div>

      </section>


      {/* ==================================================== */}
      {/* PERSONAL PROFILE */}
      {/* ==================================================== */}

      <section className="profile-section">

        <div className="profile-section-header">

          <div>

            <h2>
              Personalization
            </h2>

            <p>
              These details can be used
              to personalize future
              palmistry and tarot readings.
            </p>

          </div>

        </div>


        <form
          className="profile-form"
          onSubmit={
            handleSubmit
          }
        >

          {/* ================================================= */}
          {/* NAME + AGE */}
          {/* ================================================= */}

          <div className="profile-form-grid">


            <div className="profile-form-group">

              <label htmlFor="full_name">
                Full Name
              </label>

              <input
                id="full_name"
                name="full_name"
                type="text"
                value={
                  formData.full_name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your full name"
                minLength={2}
                maxLength={150}
                required
              />

            </div>


            <div className="profile-form-group">

              <label htmlFor="age_group">
                Age Group
              </label>

              <select
                id="age_group"
                name="age_group"
                value={
                  formData.age_group
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select age group
                </option>

                <option value="Under 18">
                  Under 18
                </option>

                <option value="18-25">
                  18-25
                </option>

                <option value="26-40">
                  26-40
                </option>

                <option value="41-60">
                  41-60
                </option>

                <option value="60+">
                  60+
                </option>

              </select>

            </div>

          </div>


          {/* ================================================= */}
          {/* READING PREFERENCE */}
          {/* ================================================= */}

          <div className="profile-form-group">

            <label htmlFor="reading_preference">
              Reading Preference
            </label>

            <select
              id="reading_preference"
              name="reading_preference"
              value={
                formData
                  .reading_preference
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                Select reading preference
              </option>

              <option value="Concise">
                Concise
              </option>

              <option value="Detailed">
                Detailed
              </option>

              <option value="Practical">
                Practical
              </option>

              <option value="Spiritual">
                Spiritual
              </option>

            </select>


            <small>
              This controls the preferred
              style of your personalized
              reading.
            </small>

          </div>


          {/* ================================================= */}
          {/* INTERESTS */}
          {/* ================================================= */}

          <div className="profile-form-group">

            <label htmlFor="interests">
              Interests
            </label>

            <input
              id="interests"
              name="interests"
              type="text"
              value={
                formData.interests
              }
              onChange={
                handleChange
              }
              placeholder="Example: Career, Business, Family, Personal Growth"
              maxLength={1000}
            />


            <small>
              Separate multiple interests
              with commas.
            </small>

          </div>


          {/* ================================================= */}
          {/* PERSONAL / SPIRITUAL GOAL */}
          {/* ================================================= */}

          <div className="profile-form-group">

            <label htmlFor="spiritual_goal">
              Personal or Spiritual Goal
            </label>

            <textarea
              id="spiritual_goal"
              name="spiritual_goal"
              value={
                formData.spiritual_goal
              }
              onChange={
                handleChange
              }
              placeholder="Describe what you currently want to improve, understand or focus on."
              rows={5}
              maxLength={2000}
            />


            <small>
              This helps the AI connect
              readings to your personal
              priorities.
            </small>

          </div>


          {/* ================================================= */}
          {/* MESSAGES */}
          {/* ================================================= */}

          {successMessage && (

            <div
              className="profile-success"
              role="status"
            >

              <strong>
                Saved
              </strong>

              <p>
                {successMessage}
              </p>

            </div>

          )}


          {errorMessage && (

            <div
              className="profile-error"
              role="alert"
            >

              <strong>
                Update failed
              </strong>

              <p>
                {errorMessage}
              </p>

            </div>

          )}


          {/* ================================================= */}
          {/* SAVE BUTTON */}
          {/* ================================================= */}

          <div className="profile-actions">

            <button
              type="submit"
              className="profile-save-button"
              disabled={
                isSaving
              }
            >

              {
                isSaving
                  ? "Saving Profile..."
                  : "Save Profile"
              }

            </button>

          </div>

        </form>

      </section>


      {/* ==================================================== */}
      {/* HOW PROFILE IS USED */}
      {/* ==================================================== */}

      <section className="profile-section">

        <div className="profile-section-header">

          <div>

            <h2>
              How Your Profile Is Used
            </h2>

            <p>
              Your saved personalization
              information helps create
              more relevant reading context.
            </p>

          </div>

        </div>


        <div className="profile-usage-grid">


          <article className="profile-usage-card">

            <span>
              01
            </span>

            <h3>
              Reading Context
            </h3>

            <p>
              Your interests and goals
              provide context for AI
              interpretations.
            </p>

          </article>


          <article className="profile-usage-card">

            <span>
              02
            </span>

            <h3>
              Personalization
            </h3>

            <p>
              Your reading preference
              controls the preferred
              response style.
            </p>

          </article>


          <article className="profile-usage-card">

            <span>
              03
            </span>

            <h3>
              Saved Sessions
            </h3>

            <p>
              Each completed reading keeps
              its own snapshot of the
              profile context used at
              that time.
            </p>

          </article>

        </div>

      </section>

    </div>
  );
}


export default ProfilePage;