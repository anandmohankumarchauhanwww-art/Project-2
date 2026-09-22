import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Dashboard({ setActivePage }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [studentName, setStudentName] = useState("Student");

  // --------------------------------
  // Load dashboard data
  // --------------------------------

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setErrorMessage("");

    // Get logged-in student
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage(
        "Your session has expired. Please login again."
      );

      setLoading(false);
      return;
    }

    // Get student's name from Supabase
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Student";

    setStudentName(name);

    // Get this student's health records
    const { data, error } = await supabase
      .from("health_checkins")
      .select("*")
      .eq("student_id", user.id)
      .order("checkin_date", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error loading dashboard:",
        error
      );

      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setRecords(data || []);
    setLoading(false);
  }

  // --------------------------------
  // Loading state
  // --------------------------------

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-icon">
          📊
        </div>

        <h2>Preparing your dashboard...</h2>

        <p>
          We're bringing together your latest
          health information.
        </p>
      </div>
    );
  }

  // --------------------------------
  // Error state
  // --------------------------------

  if (errorMessage) {
    return (
      <div className="dashboard-error">
        <h2>Could not load your dashboard</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }

  // --------------------------------
  // No health records yet
  // --------------------------------

  if (records.length === 0) {
    return (
      <div className="dashboard-empty">
        <div className="dashboard-empty-icon">
          🌱
        </div>

        <div className="small-heading">
          YOUR HEALTH JOURNEY
        </div>

        <h1>
          Welcome to your health dashboard
        </h1>

        <p className="page-subtitle">
          Complete your first health check-in
          to start building your personal health
          history.
        </p>

        <button
          className="primary-button"
          onClick={() => setActivePage("checkin")}
        >
          + Start Your First Check-in
        </button>

        <div className="empty-info-grid">
          <div className="content-card">
            <div className="stat-icon">
              📋
            </div>

            <h2>Start checking in</h2>

            <p className="card-description">
              Share a few details about your
              sleep, activity, mood and wellbeing.
            </p>
          </div>

          <div className="content-card">
            <div className="stat-icon">
              📈
            </div>

            <h2>Build your baseline</h2>

            <p className="card-description">
              As you complete more check-ins,
              SHIS will show changes over time.
            </p>
          </div>

          <div className="content-card">
            <div className="stat-icon">
              💡
            </div>

            <h2>Understand your patterns</h2>

            <p className="card-description">
              Your dashboard will gradually show
              useful personal trends.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------
  // Latest records
  // --------------------------------

  const latestRecord = records[0];

  const previousRecord =
    records.length > 1
      ? records[1]
      : null;

  // --------------------------------
  // Average calculation
  // --------------------------------

  function calculateAverage(field) {
    const values = records
      .map((record) => Number(record[field]))
      .filter((value) => !Number.isNaN(value));

    if (values.length === 0) {
      return "—";
    }

    const total = values.reduce(
      (sum, value) => sum + value,
      0
    );

    return (total / values.length).toFixed(1);
  }

  const averageSleep =
    calculateAverage("sleep_hours");

  const averageExercise =
    calculateAverage("exercise_days");

  const averageWater =
    calculateAverage("water_intake");

  // --------------------------------
  // Trend calculation
  // --------------------------------

  function getTrend(field) {
    if (!previousRecord) {
      return {
        text: "Need another check-in to compare",
        type: "neutral",
      };
    }

    const latest = Number(
      latestRecord[field]
    );

    const previous = Number(
      previousRecord[field]
    );

    if (
      Number.isNaN(latest) ||
      Number.isNaN(previous)
    ) {
      return {
        text: "Not enough data to compare",
        type: "neutral",
      };
    }

    const difference =
      latest - previous;

    if (difference === 0) {
      return {
        text: "No change from your previous check-in",
        type: "neutral",
      };
    }

    if (difference > 0) {
      return {
        text: `↑ ${difference.toFixed(
          1
        )} from previous check-in`,
        type: "positive",
      };
    }

    return {
      text: `↓ ${Math.abs(
        difference
      ).toFixed(1)} from previous check-in`,
      type: "warning",
    };
  }

  const sleepTrend =
    getTrend("sleep_hours");

  const exerciseTrend =
    getTrend("exercise_days");

  const waterTrend =
    getTrend("water_intake");

  // --------------------------------
  // Date formatting
  // --------------------------------

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  // --------------------------------
  // Dashboard UI
  // --------------------------------

  return (
    <div className="dashboard-page">

      {/* Welcome section */}

      <div className="welcome-section">
        <div>

          <div className="small-heading">
            STUDENT HEALTH INTELLIGENCE SYSTEM
          </div>

          <h1>
            Welcome back, {studentName} 👋
          </h1>

          <p className="page-subtitle">
            Here's a simple look at your
            recent wellbeing data.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            setActivePage("checkin")
          }
        >
          + New Check-in
        </button>
      </div>

      {/* Statistics */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            📋
          </div>

          <p>Check-ins completed</p>

          <h2>{records.length}</h2>

          <span className="positive-text">
            Your health history
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            😴
          </div>

          <p>Average sleep</p>

          <h2>
            {averageSleep === "—"
              ? "—"
              : `${averageSleep} hrs`}
          </h2>

          <span
            className={
              sleepTrend.type === "warning"
                ? "warning-text"
                : "positive-text"
            }
          >
            {sleepTrend.text}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            🏃
          </div>

          <p>Average exercise</p>

          <h2>
            {averageExercise === "—"
              ? "—"
              : `${averageExercise} days`}
          </h2>

          <span
            className={
              exerciseTrend.type === "warning"
                ? "warning-text"
                : "positive-text"
            }
          >
            {exerciseTrend.text}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            🧠
          </div>

          <p>Latest stress</p>

          <h2>
            {latestRecord.stress_level ||
              "—"}
          </h2>

          <span className="warning-text">
            Latest check-in
          </span>
        </div>

      </div>

      {/* Main dashboard area */}

      <div className="dashboard-grid">

        {/* Wellbeing snapshot */}

        <div className="content-card">

          <h2>
            🌿 Your latest wellbeing snapshot
          </h2>

          <p className="card-description">
            Based on your most recent
            check-in.
          </p>

          <div className="dashboard-detail-grid">

            <div className="dashboard-detail">
              <span>😴 Sleep</span>

              <strong>
                {latestRecord.sleep_hours ??
                  "—"}{" "}
                hours
              </strong>
            </div>

            <div className="dashboard-detail">
              <span>⭐ Sleep quality</span>

              <strong>
                {latestRecord.sleep_quality ||
                  "—"}
              </strong>
            </div>

            <div className="dashboard-detail">
              <span>💧 Water</span>

              <strong>
                {latestRecord.water_intake ??
                  "—"}{" "}
                L/day
              </strong>
            </div>

            <div className="dashboard-detail">
              <span>⚡ Energy</span>

              <strong>
                {latestRecord.energy_level ||
                  "—"}
              </strong>
            </div>

            <div className="dashboard-detail">
              <span>😊 Mood</span>

              <strong>
                {latestRecord.mood || "—"}
              </strong>
            </div>

            <div className="dashboard-detail">
              <span>
                📚 Academic pressure
              </span>

              <strong>
                {latestRecord.academic_pressure ||
                  "—"}
              </strong>
            </div>

          </div>

          <div className="latest-checkin">
            Last check-in:{" "}

            <strong>
              {formatDate(
                latestRecord.checkin_date
              )}
            </strong>
          </div>

        </div>

        {/* Trends */}

        <div className="content-card">

          <h2>
            📈 Your trends
          </h2>

          <p className="card-description">
            Changes based on your previous
            check-ins.
          </p>

          <div className="trend-list">

            <div className="trend-item">
              <div>

                <span>😴 Sleep</span>

                <strong>
                  {averageSleep === "—"
                    ? "No data"
                    : `${averageSleep} hrs average`}
                </strong>

              </div>

              <div
                className={`trend-value ${sleepTrend.type}`}
              >
                {previousRecord
                  ? sleepTrend.text.split(
                      " from"
                    )[0]
                  : "—"}
              </div>

            </div>

            <div className="trend-item">
              <div>

                <span>🏃 Exercise</span>

                <strong>
                  {averageExercise === "—"
                    ? "No data"
                    : `${averageExercise} days average`}
                </strong>

              </div>

              <div
                className={`trend-value ${exerciseTrend.type}`}
              >
                {previousRecord
                  ? exerciseTrend.text.split(
                      " from"
                    )[0]
                  : "—"}
              </div>

            </div>

            <div className="trend-item">
              <div>

                <span>💧 Water</span>

                <strong>
                  {averageWater === "—"
                    ? "No data"
                    : `${averageWater} L/day average`}
                </strong>

              </div>

              <div
                className={`trend-value ${waterTrend.type}`}
              >
                {previousRecord
                  ? waterTrend.text.split(
                      " from"
                    )[0]
                  : "—"}
              </div>

            </div>

          </div>

          {!previousRecord && (
            <div className="trend-info">
              💡 Complete another check-in
              to start seeing personal
              changes over time.
            </div>
          )}

        </div>

      </div>

      {/* Latest check-in */}

      <div className="content-card dashboard-current">

        <div className="current-header">

          <div>

            <h2>
              📝 Latest check-in
            </h2>

            <p className="card-description">
              {formatDate(
                latestRecord.checkin_date
              )}
            </p>

          </div>

          <span className="history-badge">
            Completed
          </span>

        </div>

        <div className="current-summary">

          <div>
            <span>Stress</span>

            <strong>
              {latestRecord.stress_level ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Mood</span>

            <strong>
              {latestRecord.mood || "—"}
            </strong>
          </div>

          <div>
            <span>Energy</span>

            <strong>
              {latestRecord.energy_level ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Symptoms</span>

            <strong>
              {latestRecord.has_symptoms ||
                "—"}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;