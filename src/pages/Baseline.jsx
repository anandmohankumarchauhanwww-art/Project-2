import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Baseline() {
  const [formData, setFormData] = useState({
    sleepDuration: "",
    physicalActivity: "",
    screenTime: "",
    fruitVegetableIntake: "",
    junkFoodFrequency: "",
    tobaccoUse: "",
    alcoholUse: "",
    wellbeingRating: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadBaseline();
  }, []);

  async function loadBaseline() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User session not found.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("baseline_assessments")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else if (data) {
      setFormData({
        sleepDuration: data.sleep_duration ?? "",
        physicalActivity: data.physical_activity ?? "",
        screenTime: data.screen_time ?? "",
        fruitVegetableIntake:
          data.fruit_vegetable_intake ?? "",
        junkFoodFrequency:
          data.junk_food_frequency ?? "",
        tobaccoUse: data.tobacco_use ?? "",
        alcoholUse: data.alcohol_use ?? "",
        wellbeingRating:
          data.wellbeing_rating ?? "",
      });
    }

    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User session not found.");
      setSaving(false);
      return;
    }

    const baselineData = {
      user_id: user.id,
      sleep_duration: formData.sleepDuration,
      physical_activity: formData.physicalActivity,
      screen_time: formData.screenTime,
      fruit_vegetable_intake:
        formData.fruitVegetableIntake,
      junk_food_frequency:
        formData.junkFoodFrequency,
      tobacco_use: formData.tobaccoUse,
      alcohol_use: formData.alcoholUse,
      wellbeing_rating:
        Number(formData.wellbeingRating),
    };

    const { error } = await supabase
      .from("baseline_assessments")
      .upsert(baselineData, {
        onConflict: "user_id",
      });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Your baseline assessment has been saved."
      );
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="content-card">
        Loading baseline assessment...
      </div>
    );
  }

  return (
    <section>
      <div className="checkin-header">
        <h1>Health & Lifestyle Baseline</h1>

        <p className="page-subtitle">
          This helps SHIS understand your usual habits.
          You only need to complete this once.
        </p>
      </div>

      <form className="health-form" onSubmit={handleSubmit}>

        {/* Sleep */}

        <div className="form-section">
          <div className="form-section-header">
            <div>
              <h2>😴 Sleep</h2>

              <p className="section-description">
                What does your usual sleep routine look like?
              </p>
            </div>
          </div>

          <div className="form-field">
            <label>How much do you usually sleep?</label>

            <select
              name="sleepDuration"
              value={formData.sleepDuration}
              onChange={handleChange}
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
        </div>

        {/* Activity */}

        <div className="form-section">
          <div className="form-section-header">
            <div>
              <h2>🏃 Physical Activity</h2>

              <p className="section-description">
                Think about your usual activity during a week.
              </p>
            </div>
          </div>

          <div className="form-field">
            <label>
              How much physical activity do you usually get?
            </label>

            <select
              name="physicalActivity"
              value={formData.physicalActivity}
              onChange={handleChange}
              required
            >
              <option value="">
                Select an option
              </option>

              <option value="<30 min">
                Less than 30 minutes/week
              </option>

              <option value="30-150 min">
                30–150 minutes/week
              </option>

              <option value=">150 min">
                More than 150 minutes/week
              </option>
            </select>
          </div>

          <div className="form-field">
            <label>Typical daily screen/sitting time</label>

            <select
              name="screenTime"
              value={formData.screenTime}
              onChange={handleChange}
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

        {/* Diet */}

        <div className="form-section">
          <div className="form-section-header">
            <div>
              <h2>🥗 Food Habits</h2>

              <p className="section-description">
                No detailed food diary needed — just your
                usual pattern.
              </p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-field">
              <label>
                Fruits & vegetables per day
              </label>

              <select
                name="fruitVegetableIntake"
                value={formData.fruitVegetableIntake}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="<1 serving">
                  Less than 1 serving
                </option>

                <option value="1-2 servings">
                  1–2 servings
                </option>

                <option value=">=3 servings">
                  3 or more servings
                </option>
              </select>
            </div>

            <div className="form-field">
              <label>
                Fast food / junk food frequency
              </label>

              <select
                name="junkFoodFrequency"
                value={formData.junkFoodFrequency}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="Never">
                  Never
                </option>

                <option value="1-2 times/week">
                  1–2 times/week
                </option>

                <option value="3-5 times/week">
                  3–5 times/week
                </option>

                <option value=">5 times/week">
                  More than 5 times/week
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* Lifestyle */}

        <div className="form-section">
          <div className="form-section-header">
            <div>
              <h2>🌱 Lifestyle</h2>

              <p className="section-description">
                These questions help us understand your
                everyday lifestyle.
              </p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-field">
              <label>Tobacco use</label>

              <select
                name="tobaccoUse"
                value={formData.tobaccoUse}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="Never">
                  Never
                </option>

                <option value="Occasional">
                  Occasional
                </option>

                <option value="Regular">
                  Regular
                </option>
              </select>
            </div>

            <div className="form-field">
              <label>Alcohol use</label>

              <select
                name="alcoholUse"
                value={formData.alcoholUse}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select an option
                </option>

                <option value="Never">
                  Never
                </option>

                <option value="Occasional">
                  Occasional
                </option>

                <option value="Regular">
                  Regular
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* Wellbeing */}

        <div className="form-section">
          <div className="form-section-header">
            <div>
              <h2>🧠 Wellbeing</h2>

              <p className="section-description">
                How would you describe your overall wellbeing
                recently?
              </p>
            </div>
          </div>

          <div className="form-field">
            <label>
              Rate your current wellbeing
            </label>

            <select
              name="wellbeingRating"
              value={formData.wellbeingRating}
              onChange={handleChange}
              required
            >
              <option value="">
                Select a rating
              </option>

              <option value="1">
                1 — Not doing well
              </option>

              <option value="2">
                2 — Could be better
              </option>

              <option value="3">
                3 — Okay
              </option>

              <option value="4">
                4 — Doing well
              </option>

              <option value="5">
                5 — Feeling great
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
            {saving ? "Saving..." : "Save Baseline"}
          </button>
        </div>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

      </form>
    </section>
  );
}

export default Baseline;