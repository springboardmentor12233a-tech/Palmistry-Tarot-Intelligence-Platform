import {
  useState,
} from "react";

import {
  Link,
} from "react-router";

import {
  requestPasswordReset,
} from "../services/authApi";


function ForgotPasswordPage() {
  const [
    email,
    setEmail,
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
      setIsLoading(true);


      try {
        const response =
          await requestPasswordReset(
            email
          );


        setMessage(
          response?.message ||
          (
            "If an eligible account exists "
            + "for that email address, "
            + "password reset instructions "
            + "have been sent."
          )
        );

      } catch (requestError) {
        setError(
          requestError?.message ||
          (
            "Password reset request "
            + "failed."
          )
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
            ACCOUNT RECOVERY
          </p>

          <h1>
            Forgot Password?
          </h1>

          <p>
            Enter your registered email
            address and we will send you
            instructions to reset your
            password.
          </p>

        </div>


        {!message && (

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="form-group">

              <label
                htmlFor="forgot-email"
              >
                Email
              </label>

              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={
                  (event) =>
                    setEmail(
                      event.target.value
                    )
                }
                autoComplete="email"
                placeholder="you@example.com"
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
                  ? "Sending..."
                  : "Send Reset Link"
              }
            </button>

          </form>

        )}


        {message && (

          <div>

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


            <button
              className="generate-button"
              type="button"
              style={{
                marginTop: "22px",
              }}
              onClick={
                () => {
                  setMessage("");
                  setEmail("");
                }
              }
            >
              Try Another Email
            </button>

          </div>

        )}


        <p className="auth-switch">

          Remember your password?{" "}

          <Link to="/login">
            Back to Sign In
          </Link>

        </p>

      </section>

    </main>
  );
}


export default ForgotPasswordPage;