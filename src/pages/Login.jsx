import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Login() {
  const [isSignup, setIsSignup] = useState(false);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Student profile fields
  const [fullName, setFullName] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [program, setProgram] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");

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
        // Create new student account
        const { error } = await supabase.auth.signUp({
          email,
          password,

          options: {
            data: {
              full_name: fullName,
              enrollment_number: enrollmentNumber,
              age: Number(age),
              gender,
              program,
              branch,
              year,
            },
          },
        });

        if (error) {
          setError(error.message);
          return;
        }

        setMessage(
          "Account created successfully. Please check your email if verification is required."
        );
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
      setError("Something went wrong. Please try again.");
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
                  Share how you're doing in just a few moments.
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
                  See how your sleep, stress and lifestyle change.
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
                  Your health records are linked to your account.
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
                ? "Create your student account"
                : "Welcome back"}
            </h2>

            <p>
              {isSignup
                ? "Tell us a little about yourself to get started."
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

            {/* SIGNUP DETAILS */}
            {isSignup && (
              <>
                <div className="signup-section-title">
                  Personal information
                </div>

                <div className="login-field">

                  <label htmlFor="fullName">
                    Full name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Enter your full name"
                    required
                  />

                </div>

                <div className="login-field">

                  <label htmlFor="enrollmentNumber">
                    Enrollment number
                  </label>

                  <input
                    id="enrollmentNumber"
                    type="text"
                    value={enrollmentNumber}
                    onChange={(event) =>
                      setEnrollmentNumber(event.target.value)
                    }
                    placeholder="e.g. 23BME001"
                    required
                  />

                </div>

                <div className="signup-two-column">

                  <div className="login-field">

                    <label htmlFor="age">
                      Age
                    </label>

                    <input
                      id="age"
                      type="number"
                      min="15"
                      max="100"
                      value={age}
                      onChange={(event) =>
                        setAge(event.target.value)
                      }
                      placeholder="e.g. 21"
                      required
                    />

                  </div>

                  <div className="login-field">

                    <label htmlFor="gender">
                      Gender
                    </label>

                    <select
                      id="gender"
                      value={gender}
                      onChange={(event) =>
                        setGender(event.target.value)
                      }
                      required
                    >

                      <option value="">
                        Select
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Non-binary">
                        Non-binary
                      </option>

                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>

                    </select>

                  </div>

                </div>

                <div className="signup-section-title">
                  Academic information
                </div>

                <div className="signup-two-column">

                  <div className="login-field">

                    <label htmlFor="program">
                      Program
                    </label>

                    <input
                      id="program"
                      type="text"
                      value={program}
                      onChange={(event) =>
                        setProgram(event.target.value)
                      }
                      placeholder="e.g. B.Tech"
                      required
                    />

                  </div>

                  <div className="login-field">

                    <label htmlFor="branch">
                      Branch
                    </label>

                    <input
                      id="branch"
                      type="text"
                      value={branch}
                      onChange={(event) =>
                        setBranch(event.target.value)
                      }
                      placeholder="e.g. Biomedical Engineering"
                      required
                    />

                  </div>

                </div>

                <div className="login-field">

                  <label htmlFor="year">
                    Current year
                  </label>

                  <select
                    id="year"
                    value={year}
                    onChange={(event) =>
                      setYear(event.target.value)
                    }
                    required
                  >

                    <option value="">
                      Select your year
                    </option>

                    <option value="1st Year">
                      1st Year
                    </option>

                    <option value="2nd Year">
                      2nd Year
                    </option>

                    <option value="3rd Year">
                      3rd Year
                    </option>

                    <option value="4th Year">
                      4th Year
                    </option>

                  </select>

                </div>
              </>
            )}

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