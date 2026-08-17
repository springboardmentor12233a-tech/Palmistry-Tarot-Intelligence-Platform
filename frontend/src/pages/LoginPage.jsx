import {
  useCallback,
  useState,
} from "react";

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router";

import {
  useAuth,
} from "../auth/AuthContext";

import GoogleSignInButton
  from "../components/auth/GoogleSignInButton";


function LoginPage() {
  const {
    login,
    loginWithGoogle,
    isAuthenticated,
  } = useAuth();


  const navigate =
    useNavigate();

  const location =
    useLocation();


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    isLoading,
    setIsLoading,
  ] = useState(false);


  // =========================================================
  // DESTINATION
  // =========================================================

  const getDestination =
    useCallback(
      () => (
        location.state?.from ||
        "/dashboard"
      ),
      [
        location.state,
      ]
    );


  // =========================================================
  // ALREADY AUTHENTICATED
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
  // PASSWORD LOGIN
  // =========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      setIsLoading(true);


      try {
        await login(
          email,
          password
        );


        navigate(
          getDestination(),
          {
            replace: true,
          }
        );

      } catch (loginError) {
        setError(
          loginError?.message ||
          "Login failed."
        );

      } finally {
        setIsLoading(false);
      }
    };


  // =========================================================
  // GOOGLE LOGIN
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
          getDestination(),
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
        setIsLoading(false);
      }
    };


  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="auth-page">

      <section className="auth-card">

        <div className="auth-brand">

          <p className="eyebrow">
            SPIRITUAL INTELLIGENCE
          </p>

          <h1>
            Welcome Back
          </h1>

          <p>
            Sign in to access your
            personalized palmistry
            and tarot dashboard.
          </p>

        </div>


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

          <div className="form-group">

            <label
              htmlFor="login-email"
            >
              Email
            </label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={
                (event) =>
                  setEmail(
                    event.target.value
                  )
              }
              autoComplete="email"
              required
            />

          </div>


          <div className="form-group">

            <label
              htmlFor="login-password"
            >
              Password
            </label>

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={
                (event) =>
                  setPassword(
                    event.target.value
                  )
              }
              autoComplete="current-password"
              required
            />

          </div>


          {error && (
            <div
              className="error-message"
              role="alert"
            >
              {error}
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
                ? "Signing In..."
                : "Sign In"
            }
          </button>

        </form>


        <p className="auth-switch">
          New to the platform?{" "}

          <Link to="/register">
            Create an account
          </Link>
        </p>

      </section>

    </main>
  );
}


export default LoginPage;