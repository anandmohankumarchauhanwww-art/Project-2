import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function CheckIn() {
  const [checkinType, setCheckinType] = useState("morning");

  const [morningData, setMorningData] = useState({
    sleepDuration: "",
    sleepQuality: "",
    restedFeeling: "",
  });

  const [eveningData, setEveningData] = useState({
    mood: "",
    stressLevel: "",
    academicPressure: "",
    energyLevel: "",
    physicalDiscomfort: "",
  });

  const [nightData, setNightData] = useState({
    activityLevel: "",
    screenTime: "",
    foodQuality: "",
    waterIntake: "",
    dayRating: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    loadTodayCheckins();
  }, []);

  async function loadTodayCheckins() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User session not found.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("checkin_date", getTodayDate());

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const morning = data?.find(
      (item) => item.checkin_type === "morning"
    );

    const evening = data?.find(
      (item) => item.checkin_type === "evening"
    );

    const night = data?.find(
      (item) => item.checkin_type === "night"
    );

    if (morning) {
      setMorningData({
        sleepDuration: morning.sleep_duration ?? "",
        sleepQuality: morning.sleep_quality ?? "",
        restedFeeling: morning.rested_feeling ?? "",
      });
    }

    if (evening) {
      setEveningData({
        mood: evening.mood ?? "",
        stressLevel: evening.stress_level ?? "",
        academicPressure:
          evening.academic_pressure ?? "",
        energyLevel: evening.energy_level ?? "",
        physicalDiscomfort:
          evening.physical_discomfort ?? "",
      });
    }

    if (night) {
      setNightData({
        activityLevel: night.activity_level ?? "",
        screenTime: night.screen_time ?? "",
        foodQuality: night.food_quality ?? "",
        waterIntake: night.water_intake ?? "",
        dayRating: night.day_rating ?? "",
      });
    }

    setLoading(false);
  }

  function handleMorningChange(event) {
    const { name, value } = event.target;

    setMorningData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSubmitted(false);
    setError("");
  }

  function handleEveningChange(event) {
    const { name, value } = event.target;

    setEveningData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSubmitted(false);
    setError("");
  }

  function handleNightChange(event) {
    const { name, value } = event.target;

    setNightData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSubmitted(false);
    setError("");
  }

  async function handleMorningSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setSubmitted(false);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session has expired. Please login again.");
      setSaving(false);
      return;
    }

    const checkInData = {
      user_id: user.id,
      checkin_date: getTodayDate(),
      checkin_type: "morning",

      sleep_duration:
        morningData.sleepDuration || null,

      sleep_quality:
        morningData.sleepQuality || null,

      rested_feeling:
        morningData.restedFeeling || null,
    };

    const { error } = await supabase
      .from("daily_checkins")
      .upsert(checkInData, {
        onConflict: "user_id,checkin_date,checkin_type",
      });

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }

    setSaving(false);
  }

  async function handleEveningSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setSubmitted(false);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session has expired. Please login again.");
      setSaving(false);
      return;
    }

    const checkInData = {
      user_id: user.id,
      checkin_date: getTodayDate(),
      checkin_type: "evening",

      mood: eveningData.mood || null,

      stress_level: eveningData.stressLevel
        ? Number(eveningData.stressLevel)
        : null,

      academic_pressure:
        eveningData.academicPressure
          ? Number(eveningData.academicPressure)
          : null,

      energy_level: eveningData.energyLevel
        ? Number(eveningData.energyLevel)
        : null,

      physical_discomfort:
        eveningData.physicalDiscomfort || null,
    };

    const { error } = await supabase
      .from("daily_checkins")
      .upsert(checkInData, {
        onConflict: "user_id,checkin_date,checkin_type",
      });

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }

    setSaving(false);
  }

  async function handleNightSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setSubmitted(false);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session has expired. Please login again.");
      setSaving(false);
      return;
    }

    const checkInData = {
      user_id: user.id,
      checkin_date: getTodayDate(),
      checkin_type: "night",

      activity_level:
        nightData.activityLevel || null,

      screen_time:
        nightData.screenTime || null,

      food_quality:
        nightData.foodQuality || null,

      water_intake:
        nightData.waterIntake || null,

      day_rating: nightData.dayRating
        ? Number(nightData.dayRating)
        : null,
    };

    const { error } = await supabase
      .from("daily_checkins")
      .upsert(checkInData, {
        onConflict: "user_id,checkin_date,checkin_type",
      });

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }

    setSaving(false);
  }

  function changeCheckinType(type) {
    setCheckinType(type);
    setSubmitted(false);
    setError("");
  }

  if (loading) {
    return (
      <div className="content-card">
        Loading your daily check-in...
      </div>
    );
  }

  return (
    <section>
      <div className="checkin-header">
        <h1>Daily Check-in 🌿</h1>

        <p className="page-subtitle">
          A quick check-in to help you notice how your
          wellbeing changes throughout the day.
        </p>
      </div>

      {/* Check-in tabs */}

      <div className="checkin-tabs">
        <button
          type="button"
          className={
            checkinType === "morning"
              ? "checkin-tab active"
              : "checkin-tab"
          }
          onClick={() => changeCheckinType("morning")}
        >
          🌅 Morning
        </button>

        <button
          type="button"
          className={
            checkinType === "evening"
              ? "checkin-tab active"
              : "checkin-tab"
          }
          onClick={() => changeCheckinType("evening")}
        >
          🌆 Evening
        </button>

        <button
          type="button"
          className={
            checkinType === "night"
              ? "checkin-tab active"
              : "checkin-tab"
          }
          onClick={() => changeCheckinType("night")}
        >
          🌙 Night
        </button>
      </div>

      {/* =========================
          MORNING
      ========================== */}

      {checkinType === "morning" && (
        <form
          className="health-form"
          onSubmit={handleMorningSubmit}
        >
          <div className="form-section">
            <div className="form-section-header">
              <div>
                <h2>😴 Your Sleep</h2>

                <p className="section-description">
                  Let's start with how you rested last night.
                </p>
              </div>
            </div>

            <div className="form-field">
              <label>About how long did you sleep?</label>

              <select
                name="sleepDuration"
                value={morningData.sleepDuration}
                onChange={handleMorningChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="<5 hours">
                  Less than 5 hours
                </option>

                <option value="5-6 hours">
                  5–6 hours
                </option>

                <option value="6-7 hours">
                  6–7 hours
                </option>

                <option value="7-9 hours">
                  7–9 hours
                </option>

                <option value=">9 hours">
                  More than 9 hours
                </option>
              </select>
            </div>

            <div className="form-field">
              <label>How was your sleep?</label>

              <select
                name="sleepQuality"
                value={morningData.sleepQuality}
                onChange={handleMorningChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="Poor">Poor</option>
                <option value="Okay">Okay</option>
                <option value="Good">Good</option>
                <option value="Great">Great</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div>
                <h2>🌅 Starting Your Day</h2>

                <p className="section-description">
                  How are you feeling right now?
                </p>
              </div>
            </div>

            <div className="form-field">
              <label>How rested do you feel?</label>

              <select
                name="restedFeeling"
                value={morningData.restedFeeling}
                onChange={handleMorningChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="Not rested">
                  Not rested
                </option>

                <option value="A little tired">
                  A little tired
                </option>

                <option value="Fairly rested">
                  Fairly rested
                </option>

                <option value="Fully rested">
                  Fully rested
                </option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Morning Check-in"}
            </button>
          </div>

          {submitted && (
            <div className="success-message">
              ✅ Morning check-in saved.
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </form>
      )}

      {/* =========================
          EVENING
      ========================== */}

      {checkinType === "evening" && (
        <form
          className="health-form"
          onSubmit={handleEveningSubmit}
        >
          <div className="form-section">
            <div className="form-section-header">
              <div>
                <h2>😊 How was your day?</h2>

                <p className="section-description">
                  Take a moment to check in with yourself.
                </p>
              </div>
            </div>

            <div className="form-field">
              <label>How has your mood been today?</label>

              <select
                name="mood"
                value={eveningData.mood}
                onChange={handleEveningChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="Very Low">
                  Very low
                </option>

                <option value="Low">
                  Low
                </option>

                <option value="Okay">
                  Okay
                </option>

                <option value="Good">
                  Good
                </option>

                <option value="Very Good">
                  Very good
                </option>
              </select>
            </div>

            <div className="form-field">
              <label>How stressed have you felt today?</label>

              <select
                name="stressLevel"
                value={eveningData.stressLevel}
                onChange={handleEveningChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="1">Low</option>
                <option value="2">Moderate</option>
                <option value="3">High</option>
                <option value="4">Very high</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div>
                <h2>📚 College & Energy</h2>

                <p className="section-description">
                  How did studies and your energy level feel
                  today?
                </p>
              </div>
            </div>

            <div className="form-field">
              <label>
                How much academic pressure did you feel?
              </label>

              <select
                name="academicPressure"
                value={eveningData.academicPressure}
                onChange={handleEveningChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="1">Low</option>
                <option value="2">Moderate</option>
                <option value="3">High</option>
                <option value="4">Very high</option>
              </select>
            </div>

            <div className="form-field">
              <label>How was your energy today?</label>

              <select
                name="energyLevel"
                value={eveningData.energyLevel}
                onChange={handleEveningChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="1">Very low</option>
                <option value="2">Low</option>
                <option value="3">Moderate</option>
                <option value="4">High</option>
                <option value="5">Very high</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div>
                <h2>🩺 Physical Wellbeing</h2>

                <p className="section-description">
                  Did anything physically bother you today?
                </p>
              </div>
            </div>

            <div className="form-field">
              <label>How is your body feeling?</label>

              <select
                name="physicalDiscomfort"
                value={eveningData.physicalDiscomfort}
                onChange={handleEveningChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="No discomfort">
                  No discomfort
                </option>

                <option value="Mild discomfort">
                  A little uncomfortable
                </option>

                <option value="Moderate discomfort">
                  Moderately uncomfortable
                </option>

                <option value="Severe discomfort">
                  Very uncomfortable
                </option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Evening Check-in"}
            </button>
          </div>

          {submitted && (
            <div className="success-message">
              ✅ Evening check-in saved.
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </form>
      )}

      {/* =========================
          NIGHT
      ========================== */}

      {checkinType === "night" && (
        <form
          className="health-form"
          onSubmit={handleNightSubmit}
        >
          <div className="form-section">
            <div className="form-section-header">
              <div>
                <h2>🌙 Winding Down</h2>

                <p className="section-description">
                  A quick look back at your day before you
                  wind down.
                </p>
              </div>
            </div>

            <div className="form-field">
              <label>
                How active were you today?
              </label>

              <select
                name="activityLevel"
                value={nightData.activityLevel}
                onChange={handleNightChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="Low">
                  Mostly inactive
                </option>

                <option value="Moderate">
                  Moderately active
                </option>

                <option value="High">
                  Very active
                </option>
              </select>
            </div>

            <div className="form-field">
              <label>
                Roughly how much screen/sitting time did you
                have today?
              </label>

              <select
                name="screenTime"
                value={nightData.screenTime}
                onChange={handleNightChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="<4 hours">
                  Less than 4 hours
                </option>

                <option value="4-6 hours">
                  4–6 hours
                </option>

                <option value="6-8 hours">
                  6–8 hours
                </option>

                <option value=">8 hours">
                  More than 8 hours
                </option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div>
                <h2>🍽️ Food & Water</h2>

                <p className="section-description">
                  No detailed food diary — just your overall
                  experience today.
                </p>
              </div>
            </div>

            <div className="form-field">
              <label>
                How would you describe your food choices today?
              </label>

              <select
                name="foodQuality"
                value={nightData.foodQuality}
                onChange={handleNightChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="Poor">
                  Could have been better
                </option>

                <option value="Okay">
                  Okay
                </option>

                <option value="Good">
                  Good
                </option>

                <option value="Very Good">
                  Very good
                </option>
              </select>
            </div>

            <div className="form-field">
              <label>
                How was your water intake today?
              </label>

              <select
                name="waterIntake"
                value={nightData.waterIntake}
                onChange={handleNightChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="Low">
                  Less than usual
                </option>

                <option value="Moderate">
                  About usual
                </option>

                <option value="Good">
                  Good
                </option>

                <option value="High">
                  More than usual
                </option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div>
                <h2>⭐ Your Day</h2>

                <p className="section-description">
                  One final question before you call it a day.
                </p>
              </div>
            </div>

            <div className="form-field">
              <label>
                Overall, how would you rate your day?
              </label>

              <select
                name="dayRating"
                value={nightData.dayRating}
                onChange={handleNightChange}
                required
              >
                <option value="">
                  Select a rating
                </option>

                <option value="1">
                  1 — Very difficult
                </option>

                <option value="2">
                  2 — Difficult
                </option>

                <option value="3">
                  3 — Okay
                </option>

                <option value="4">
                  4 — Good
                </option>

                <option value="5">
                  5 — Great
                </option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Night Check-in"}
            </button>
          </div>

          {submitted && (
            <div className="success-message">
              ✅ Night check-in saved. Good night! 🌙
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </form>
      )}
    </section>
  );
}

export default CheckIn;
