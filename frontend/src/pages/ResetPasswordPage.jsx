import {
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router";

import {
  resetPassword,
} from "../services/authApi";


function ResetPasswordPage() {
  const [
    searchParams,
  ] = useSearchParams();


  const token =
    searchParams.get(
      "token"
    ) || "";


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    isLoading,
    setIsLoading,
  ] = useState(false);


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");


      if (!token) {
        setError(
          (
            "This password reset link "
            + "is missing its reset token."
          )
        );

        return;
      }


      if (
        password.length < 8
      ) {
        setError(
          (
            "Password must contain "
            + "at least 8 characters."
          )
        );

        return;
      }


      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        return;
      }


      setIsLoading(true);


      try {
        const response =
          await resetPassword(
            token,
            password
          );


        setMessage(
          response?.message ||
          (
            "Your password has been "
            + "reset successfully."
          )
        );


        setPassword("");
        setConfirmPassword("");

      } catch (resetError) {
        setError(
          resetError?.message ||
          (
            "Password reset failed."
          )
        );

      } finally {
        setIsLoading(false);
      }
    };


  // =========================================================
  // INVALID LINK
  // =========================================================

  if (!token) {
    return (
      <main className="auth-page">

        <section className="auth-card">

          <div className="auth-brand">

            <p className="eyebrow">
              ACCOUNT RECOVERY
            </p>

            <h1>
              Invalid Reset Link
            </h1>

            <p>
              This password reset link
              does not contain a valid
              reset token.
            </p>

          </div>


          <div
            className="error-message"
            role="alert"
          >
            Please request a new
            password reset link.
          </div>


          <p className="auth-switch">

            <Link to="/forgot-password">
              Request New Reset Link
            </Link>

          </p>

        </section>

      </main>
    );
  }


  // =========================================================
  // SUCCESS
  // =========================================================

  if (message) {
    return (
      <main className="auth-page">

        <section className="auth-card">

          <div className="auth-brand">

            <p className="eyebrow">
              PASSWORD UPDATED
            </p>

            <h1>
              Password Reset
            </h1>

            <p>
              Your account password has
              been updated successfully.
            </p>

          </div>


          <div
            style={{
              marginTop: "24px",
              padding: "18px",
              borderRadius: "12px",
              background:
                "rgba(108, 211, 159, 0.10)",
              border:
                "1px solid rgba(108, 211, 159, 0.35)",
              lineHeight: "1.6",
            }}
          >
            {message}
          </div>


          <Link
            to="/login"
            style={{
              display: "block",
              textDecoration: "none",
              marginTop: "24px",
            }}
          >
            <button
              className="generate-button"
              type="button"
              style={{
                width: "100%",
              }}
            >
              Sign In
            </button>
          </Link>

        </section>

      </main>
    );
  }


  // =========================================================
  // RESET FORM
  // =========================================================

  return (
    <main className="auth-page">

      <section className="auth-card">

        <div className="auth-brand">

          <p className="eyebrow">
            ACCOUNT RECOVERY
          </p>

          <h1>
            Create New Password
          </h1>

          <p>
            Choose a new password for
            your account.
          </p>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
        >

          <div className="form-group">

            <label
              htmlFor="new-password"
            >
              New Password
            </label>

            <input
              id="new-password"
              type="password"
              value={password}
              onChange={
                (event) =>
                  setPassword(
                    event.target.value
                  )
              }
              autoComplete="new-password"
              minLength={8}
              required
            />

          </div>


          <div className="form-group">

            <label
              htmlFor="confirm-password"
            >
              Confirm New Password
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={
                (event) =>
                  setConfirmPassword(
                    event.target.value
                  )
              }
              autoComplete="new-password"
              minLength={8}
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
                ? "Updating..."
                : "Reset Password"
            }
          </button>

        </form>


        <p className="auth-switch">

          <Link to="/login">
            Back to Sign In
          </Link>

        </p>

      </section>

    </main>
  );
}


export default ResetPasswordPage;