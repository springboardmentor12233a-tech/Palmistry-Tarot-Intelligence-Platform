import {
  useState,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router";

import {
  useAuth,
} from "../auth/AuthContext";

import GoogleSignInButton
  from "../components/auth/GoogleSignInButton";


function RegisterPage() {
  const {
    register,
    loginWithGoogle,
    isAuthenticated,
  } = useAuth();


  const navigate =
    useNavigate();


  // =========================================================
  // REGISTRATION FORM
  // =========================================================

  const [
    formData,
    setFormData,
  ] = useState({
    full_name: "",
    email: "",
    password: "",
    age_group: "18-25",
  });


  const [
    error,
    setError,
  ] = useState("");


  const [
    isLoading,
    setIsLoading,
  ] = useState(false);


  // =========================================================
  // ALREADY LOGGED IN
  // =========================================================

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;


      setFormData(
        (previous) => ({
          ...previous,

          [name]:
            value,
        })
      );
    };


  // =========================================================
  // PASSWORD REGISTRATION
  // =========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      setIsLoading(true);


      try {
        await register({
          full_name:
            formData
              .full_name
              .trim(),

          email:
            formData
              .email
              .trim(),

          password:
            formData.password,

          age_group:
            formData.age_group,
        });


        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );

      } catch (
        registrationError
      ) {
        setError(
          registrationError
            ?.message ||
          "Registration failed."
        );

      } finally {
        setIsLoading(
          false
        );
      }
    };


  // =========================================================
  // GOOGLE REGISTRATION / LOGIN
  // =========================================================

  const handleGoogleCredential =
    async (credential) => {
      setError("");

      setIsLoading(true);


      try {
        await loginWithGoogle(
          credential
        );


        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );

      } catch (googleError) {
        setError(
          googleError?.message ||
          "Google sign-in failed."
        );

      } finally {
        setIsLoading(
          false
        );
      }
    };


  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="auth-page">

      <section
        className="auth-card auth-card-wide"
      >

        <p className="eyebrow">
          CREATE YOUR ACCOUNT
        </p>


        <h1>
          Join the Platform
        </h1>


        <p className="section-note">
          Create your account to access
          personalized palmistry and tarot
          intelligence features.
        </p>


        <GoogleSignInButton
          onCredential={
            handleGoogleCredential
          }
          disabled={
            isLoading
          }
        />


        <div className="auth-divider">
          <span>
            or
          </span>
        </div>


        <form
          onSubmit={
            handleSubmit
          }
        >

          <div className="form-grid">


            <div className="form-group">

              <label
                htmlFor="full_name"
              >
                Full name
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
                minLength={2}
                maxLength={120}
                autoComplete="name"
                required
              />

            </div>


            <div className="form-group">

              <label
                htmlFor="register-email"
              >
                Email
              </label>

              <input
                id="register-email"
                name="email"
                type="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                autoComplete="email"
                required
              />

            </div>


            <div className="form-group">

              <label
                htmlFor="register-password"
              >
                Password
              </label>

              <input
                id="register-password"
                name="password"
                type="password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                required
              />

              <small className="section-note">
                Minimum 8 characters.
              </small>

            </div>


            <div className="form-group">

              <label
                htmlFor="register-age"
              >
                Age group
              </label>

              <select
                id="register-age"
                name="age_group"
                value={
                  formData.age_group
                }
                onChange={
                  handleChange
                }
              >

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


          {error && (
            <div
              className="error-message"
              role="alert"
            >

              <strong>
                Registration failed
              </strong>

              <p>
                {error}
              </p>

            </div>
          )}


          <button
            className="generate-button"
            type="submit"
            disabled={
              isLoading
            }
          >
            {
              isLoading
                ? "Creating Account..."
                : "Create Account"
            }
          </button>

        </form>


        <p className="auth-switch">
          Already registered?{" "}

          <Link to="/login">
            Sign in
          </Link>
        </p>

      </section>

    </main>
  );
}


export default RegisterPage;