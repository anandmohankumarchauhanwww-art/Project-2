import { useState } from "react";

import { supabase } from "../lib/supabaseClient";

function Login() {
  const [isSignup, setIsSignup] = useState(false);

  // Account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (isSignup) {
        // Create a new SHIS account
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data.session) {
          setMessage(
            "Account created successfully. Setting up your SHIS profile..."
          );
        } else {
          setMessage(
            "Account created successfully. Please check your email to verify your account."
          );
        }
      } else {
        // Login existing student
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) {
          setError(error.message);
          return;
        }
      }
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsSignup(!isSignup);

    setError("");
    setMessage("");
  }

  return (
    <div className="login-page">

      {/* LEFT SIDE */}

      <div className="login-intro">

        <div className="login-brand">

          <div className="login-brand-icon">
            ❤️
          </div>

          <div>
            <h2>SHIS</h2>

            <span>
              Student Health Intelligence System
            </span>
          </div>

        </div>

        <div className="login-intro-content">

          <span className="login-eyebrow">
            STUDENT WELLBEING
          </span>

          <h1>
            Understand your health.
            <br />
            Build better habits.
          </h1>

          <p>
            A simple space to check in with yourself,
            understand your health patterns and
            follow your wellbeing over time.
          </p>

          <div className="login-features">

            <div className="login-feature">

              <span>📋</span>

              <div>
                <strong>
                  Quick check-ins
                </strong>

                <small>
                  Share how you're doing in just a few
                  moments.
                </small>
              </div>

            </div>

            <div className="login-feature">

              <span>📈</span>

              <div>
                <strong>
                  Understand your patterns
                </strong>

                <small>
                  See how your sleep, stress and
                  lifestyle change.
                </small>
              </div>

            </div>

            <div className="login-feature">

              <span>🔒</span>

              <div>
                <strong>
                  Your data stays protected
                </strong>

                <small>
                  Your health records are linked to
                  your account.
                </small>
              </div>

            </div>

          </div>

        </div>

        <p className="login-footer">
          Track • Analyze • Improve
        </p>

      </div>

      {/* RIGHT SIDE */}

      <div className="login-form-area">

        <div className="login-card">

          <div className="login-card-header">

            <div className="login-card-icon">
              {isSignup ? "✨" : "👋"}
            </div>

            <h2>
              {isSignup
                ? "Create your SHIS account"
                : "Welcome back"}
            </h2>

            <p>
              {isSignup
                ? "Start your wellbeing journey with a simple account."
                : "Let's check in with your wellbeing."}
            </p>

          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {message && (
            <div className="login-success">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="login-field">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                required
              />

            </div>

            {/* PASSWORD */}

            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                minLength="6"
                required
              />

            </div>

            {/* SIGNUP INFORMATION */}

            {isSignup && (
              <p className="signup-note">
                After creating your account, we'll help
                you complete your student profile and
                wellbeing baseline.
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </button>

          </form>

          <div className="login-switch">

            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={switchMode}
            >
              {isSignup
                ? "Login"
                : "Create Account"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;