import NotificationSetup from "../components/NotificationSetup";
import { useEffect, useState } from "react";

import { supabase } from "../lib/supabaseClient";

import {
  detectTrendInsights,
  getPrimaryInsight,
} from "../utils/shisIntelligence";

function Dashboard({ setActivePage }) {
  const [studentName, setStudentName] = useState("Student");
  const [checkins, setCheckins] = useState([]);
  const [primaryInsight, setPrimaryInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage("");

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

    // -----------------------------------------
    // LOAD STUDENT NAME FROM STUDENT PROFILE
    // -----------------------------------------

    const { data: profile, error: profileError } =
      await supabase
        .from("student_profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Profile loading error:",
        profileError
      );
    }

    if (profile?.full_name) {
      setStudentName(profile.full_name);
    } else {
      setStudentName("Student");
    }

    // -----------------------------------------
    // LOAD DAILY CHECK-INS
    // -----------------------------------------

    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("checkin_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Dashboard error:", error);

      setErrorMessage(
        "Could not load your health information."
      );

      setLoading(false);
      return;
    }

    const loadedCheckins = data || [];

    setCheckins(loadedCheckins);

    // -----------------------------------------
    // CENTRAL SHIS INTELLIGENCE
    // -----------------------------------------

    const insights =
      detectTrendInsights(loadedCheckins);

    const primary =
      getPrimaryInsight(insights);

    setPrimaryInsight(primary);

    setLoading(false);
  }

  function getTodayDate() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getTodayCheckins() {
    const today = getTodayDate();

    return {
      morning: checkins.some(
        (record) =>
          record.checkin_date === today &&
          record.checkin_type === "morning"
      ),

      evening: checkins.some(
        (record) =>
          record.checkin_date === today &&
          record.checkin_type === "evening"
      ),

      night: checkins.some(
        (record) =>
          record.checkin_date === today &&
          record.checkin_type === "night"
      ),
    };
  }

  function getLatestRecord(type) {
    return checkins.find(
      (record) =>
        record.checkin_type === type
    );
  }

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

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-icon">📊</div>

        <h2>
          Preparing your dashboard...
        </h2>

        <p>
          Bringing together your latest
          wellbeing information.
        </p>
      </div>
    );
  }

  // -----------------------------------------
  // ERROR
  // -----------------------------------------

  if (errorMessage) {
    return (
      <div className="dashboard-error">
        <h2>
          Could not load your dashboard
        </h2>

        <p>{errorMessage}</p>
      </div>
    );
  }

  const today = getTodayCheckins();

  const completedToday =
    Object.values(today).filter(Boolean).length;

  const morningRecord =
    getLatestRecord("morning");

  const eveningRecord =
    getLatestRecord("evening");

  const nightRecord =
    getLatestRecord("night");

  const latestDate =
    checkins.length > 0
      ? checkins[0].checkin_date
      : null;

  return (
    <div className="dashboard-page">

      {/* HERO / WELCOME */}

      <section className="welcome-section">
        <div>
          <div className="small-heading">
            STUDENT HEALTH INTELLIGENCE SYSTEM
          </div>

          <h1>
            Welcome back, {studentName} 👋
          </h1>

          <p className="page-subtitle">
            Your wellbeing journey, understood over time.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setActivePage("checkin")
          }
        >
          + Today's Check-in
        </button>
      </section>

      <NotificationSetup />


      {/* TODAY'S CHECK-IN JOURNEY */}

      <section className="content-card dashboard-checkin-card">

        <div className="dashboard-section-header">
          <div>
            <h2>
              📋 Today's wellbeing journey
            </h2>

            <p className="card-description">
              Three small check-ins help SHIS understand
              how your day changes from morning to night.
            </p>
          </div>

          <span className="dashboard-progress-badge">
            {completedToday}/3 completed
          </span>
        </div>

        <div className="dashboard-checkin-grid">

          <div
            className={`dashboard-checkin-item ${
              today.morning ? "completed" : ""
            }`}
          >
            <div className="checkin-item-icon">
              {today.morning ? "✓" : "🌅"}
            </div>

            <div>
              <strong>Morning</strong>

              <span>
                {today.morning
                  ? "Completed"
                  : "Start your day"}
              </span>
            </div>
          </div>


          <div
            className={`dashboard-checkin-item ${
              today.evening ? "completed" : ""
            }`}
          >
            <div className="checkin-item-icon">
              {today.evening ? "✓" : "🌇"}
            </div>

            <div>
              <strong>Evening</strong>

              <span>
                {today.evening
                  ? "Completed"
                  : "Check in after your day"}
              </span>
            </div>
          </div>


          <div
            className={`dashboard-checkin-item ${
              today.night ? "completed" : ""
            }`}
          >
            <div className="checkin-item-icon">
              {today.night ? "✓" : "🌙"}
            </div>

            <div>
              <strong>Night</strong>

              <span>
                {today.night
                  ? "Completed"
                  : "Wrap up your day"}
              </span>
            </div>
          </div>

        </div>

        {completedToday < 3 && (
          <button
            className="dashboard-secondary-button"
            onClick={() =>
              setActivePage("checkin")
            }
          >
            Continue today's check-in →
          </button>
        )}

      </section>


      {/* CURRENT WELLBEING */}

      <section className="content-card">

        <div className="dashboard-section-header">

          <div>
            <h2>
              🌿 Your latest wellbeing
            </h2>

            <p className="card-description">
              A quick view of your most recent check-in
              signals.
            </p>
          </div>

          <button
            className="dashboard-text-button"
            onClick={() =>
              setActivePage("history")
            }
          >
            View history →
          </button>

        </div>


        <div className="dashboard-metrics-grid">

          <div className="dashboard-metric">
            <span>⚡ Energy</span>

            <strong>
              {eveningRecord?.energy_level ?? "—"}

              {eveningRecord?.energy_level
                ? " / 5"
                : ""}
            </strong>

            <small>
              Latest evening check-in
            </small>
          </div>


          <div className="dashboard-metric">
            <span>🧠 Stress</span>

            <strong>
              {eveningRecord?.stress_level ?? "—"}

              {eveningRecord?.stress_level
                ? " / 4"
                : ""}
            </strong>

            <small>
              Latest evening check-in
            </small>
          </div>


          <div className="dashboard-metric">
            <span>
              📚 Academic pressure
            </span>

            <strong>
              {eveningRecord?.academic_pressure ?? "—"}

              {eveningRecord?.academic_pressure
                ? " / 4"
                : ""}
            </strong>

            <small>
              Latest evening check-in
            </small>
          </div>


          <div className="dashboard-metric">
            <span>⭐ Day rating</span>

            <strong>
              {nightRecord?.day_rating ?? "—"}

              {nightRecord?.day_rating
                ? " / 5"
                : ""}
            </strong>

            <small>
              Latest night check-in
            </small>
          </div>

        </div>

      </section>


      {/* SHIS INTELLIGENCE */}

      <section className="dashboard-insights-section">

        <div className="dashboard-intelligence-heading">

          <div className="small-heading">
            SHIS INTELLIGENCE
          </div>

          <h2>
            🧠 What SHIS is noticing
          </h2>

          <p>
            SHIS looks for repeated patterns across your
            check-ins rather than judging a single day.
          </p>

        </div>


        {primaryInsight && (

          <div
            className={`dashboard-primary-insight ${
              primaryInsight.type
            }`}
          >

            <div className="dashboard-primary-insight-icon">
              {primaryInsight.icon}
            </div>


            <div className="dashboard-primary-insight-content">

              <div className="dashboard-primary-insight-label">
                Recent SHIS observation
              </div>

              <h3>
                {primaryInsight.title}
              </h3>

              <p>
                {primaryInsight.message}
              </p>

              <button
                className="dashboard-text-button"
                onClick={() =>
                  setActivePage("report")
                }
              >
                View full report →
              </button>

            </div>

          </div>

        )}

      </section>


      {/* SLEEP + ACTIVITY */}

      <section className="dashboard-grid">

        <div className="content-card">

          <h2>😴 Sleep snapshot</h2>

          <p className="card-description">
            Based on your latest morning check-in.
          </p>

          <div className="dashboard-detail-grid">

            <div className="dashboard-detail">
              <span>Sleep duration</span>

              <strong>
                {morningRecord?.sleep_duration || "—"}
              </strong>
            </div>


            <div className="dashboard-detail">
              <span>Sleep quality</span>

              <strong>
                {morningRecord?.sleep_quality || "—"}
              </strong>
            </div>


            <div className="dashboard-detail">
              <span>Feeling rested</span>

              <strong>
                {morningRecord?.rested_feeling || "—"}
              </strong>
            </div>

          </div>

        </div>


        <div className="content-card">

          <h2>📈 Your SHIS activity</h2>

          <p className="card-description">
            Your collected wellbeing information.
          </p>

          <div className="dashboard-activity">

            <div>
              <span>Total check-ins</span>

              <strong>
                {checkins.length}
              </strong>
            </div>


            <div>
              <span>Latest activity</span>

              <strong>
                {formatDate(latestDate)}
              </strong>
            </div>

          </div>

          <button
            className="dashboard-secondary-button"
            onClick={() =>
              setActivePage("history")
            }
          >
            View health history →
          </button>

        </div>

      </section>


      {/* QUICK ACTIONS */}

      <section className="content-card dashboard-actions-card">

        <div>

          <h2>
            ⚡ Continue your SHIS journey
          </h2>

          <p className="card-description">
            Keep your wellbeing history updated so SHIS
            can understand your patterns over time.
          </p>

        </div>


        <div className="dashboard-actions">

          <button
            className="primary-button"
            onClick={() =>
              setActivePage("checkin")
            }
          >
            Complete Check-in
          </button>


          <button
            className="dashboard-secondary-button"
            onClick={() =>
              setActivePage("history")
            }
          >
            View Health History
          </button>


          <button
            className="dashboard-secondary-button"
            onClick={() =>
              setActivePage("profile")
            }
          >
            Update Profile
          </button>

        </div>

      </section>


      {/* DATA EXPLANATION */}

      <div className="dashboard-note">

        <span>ℹ️</span>

        <p>
          SHIS builds understanding from your check-ins
          over time. Individual values are not medical
          diagnoses.
        </p>

      </div>

    </div>
  );
}

export default Dashboard;