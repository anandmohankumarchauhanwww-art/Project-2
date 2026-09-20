import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function CheckIn() {
  const [formData, setFormData] = useState({
    sleepHours: "",
    sleepQuality: "",
    exerciseDays: "",
    waterIntake: "",
    energyLevel: "",
    stressLevel: "",
    mood: "",
    academicPressure: "",
    hasSymptoms: "",
    symptomFrequency: "",
    symptomSeverity: "",
    symptomDuration: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setSubmitted(false);

    const healthRecord = {
      student_id: "SHIS-001",
      checkin_date: new Date().toISOString().split("T")[0],
      sleep_hours: formData.sleepHours ? Number(formData.sleepHours) : null,
      sleep_quality: formData.sleepQuality || null,
      exercise_days: formData.exerciseDays ? Number(formData.exerciseDays) : null,
      water_intake: formData.waterIntake ? Number(formData.waterIntake) : null,
      energy_level: formData.energyLevel || null,
      stress_level: formData.stressLevel || null,
      mood: formData.mood || null,
      academic_pressure: formData.academicPressure || null,
      has_symptoms: formData.hasSymptoms || null,
      symptom_frequency: formData.symptomFrequency || null,
      symptom_severity: formData.symptomSeverity || null,
      symptom_duration: formData.symptomDuration || null,
      notes: formData.notes || null,
    };

    try {
      const { error } = await supabase
        .from("health_checkins")
        .insert([healthRecord]);

      if (error) {
        console.error("Error saving health check-in:", error);
        alert("Could not save your health check-in.\n\n" + error.message);
        return;
      }

      console.log("Health check-in saved successfully!");
      setSubmitted(true);

      setFormData({
        sleepHours: "",
        sleepQuality: "",
        exerciseDays: "",
        waterIntake: "",
        energyLevel: "",
        stressLevel: "",
        mood: "",
        academicPressure: "",
        hasSymptoms: "",
        symptomFrequency: "",
        symptomSeverity: "",
        symptomDuration: "",
        notes: "",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Something went wrong while saving your check-in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkin-page">
      <div className="checkin-container">
        <h1>Health Check-In</h1>
        <p>
          Complete your daily health check-in to help monitor your overall wellbeing.
        </p>

        {submitted && (
          <div className="success-message">
            ✅ Health check-in saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Sleep */}
          <section>
            <h2>Sleep & Rest</h2>

            <label htmlFor="sleepHours">Sleep Hours</label>
            <input
              id="sleepHours"
              type="number"
              name="sleepHours"
              min="0"
              max="24"
              step="0.5"
              value={formData.sleepHours}
              onChange={handleChange}
              placeholder="e.g. 7.5"
            />

            <label htmlFor="sleepQuality">Sleep Quality</label>
            <select
              id="sleepQuality"
              name="sleepQuality"
              value={formData.sleepQuality}
              onChange={handleChange}
            >
              <option value="">Select sleep quality</option>
              <option value="Poor">Poor</option>
              <option value="Average">Average</option>
              <option value="Good">Good</option>
              <option value="Excellent">Excellent</option>
            </select>
          </section>

          {/* Physical Health */}
          <section>
            <h2>Physical Health</h2>

            <label htmlFor="exerciseDays">Exercise Days Per Week</label>
            <input
              id="exerciseDays"
              type="number"
              name="exerciseDays"
              min="0"
              max="7"
              value={formData.exerciseDays}
              onChange={handleChange}
              placeholder="e.g. 4"
            />

            <label htmlFor="waterIntake">Water Intake (Litres)</label>
            <input
              id="waterIntake"
              type="number"
              name="waterIntake"
              min="0"
              max="20"
              step="0.1"
              value={formData.waterIntake}
              onChange={handleChange}
              placeholder="e.g. 2.5"
            />

            <label htmlFor="energyLevel">Energy Level</label>
            <select
              id="energyLevel"
              name="energyLevel"
              value={formData.energyLevel}
              onChange={handleChange}
            >
              <option value="">Select energy level</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </section>

          {/* Mental Wellbeing */}
          <section>
            <h2>Mental Wellbeing</h2>

            <label htmlFor="stressLevel">Stress Level</label>
            <select
              id="stressLevel"
              name="stressLevel"
              value={formData.stressLevel}
              onChange={handleChange}
            >
              <option value="">Select stress level</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Very High">Very High</option>
            </select>

            <label htmlFor="mood">Mood</label>
            <select
              id="mood"
              name="mood"
              value={formData.mood}
              onChange={handleChange}
            >
              <option value="">Select your mood</option>
              <option value="Very Sad">Very Sad</option>
              <option value="Sad">Sad</option>
              <option value="Neutral">Neutral</option>
              <option value="Happy">Happy</option>
              <option value="Very Happy">Very Happy</option>
            </select>

            <label htmlFor="academicPressure">Academic Pressure</label>
            <select
              id="academicPressure"
              name="academicPressure"
              value={formData.academicPressure}
              onChange={handleChange}
            >
              <option value="">Select academic pressure</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Very High">Very High</option>
            </select>
          </section>

          {/* Symptoms */}
          <section>
            <h2>Symptoms</h2>

            <label htmlFor="hasSymptoms">Are you experiencing any symptoms?</label>
            <select
              id="hasSymptoms"
              name="hasSymptoms"
              value={formData.hasSymptoms}
              onChange={handleChange}
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            <label htmlFor="symptomFrequency">Symptom Frequency</label>
            <select
              id="symptomFrequency"
              name="symptomFrequency"
              value={formData.symptomFrequency}
              onChange={handleChange}
            >
              <option value="">Select frequency</option>
              <option value="Rarely">Rarely</option>
              <option value="Sometimes">Sometimes</option>
              <option value="Often">Often</option>
              <option value="Always">Always</option>
            </select>

            <label htmlFor="symptomSeverity">Symptom Severity</label>
            <select
              id="symptomSeverity"
              name="symptomSeverity"
              value={formData.symptomSeverity}
              onChange={handleChange}
            >
              <option value="">Select severity</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>

            <label htmlFor="symptomDuration">Symptom Duration</label>
            <input
              id="symptomDuration"
              type="text"
              name="symptomDuration"
              value={formData.symptomDuration}
              onChange={handleChange}
              placeholder="e.g. 2 days"
            />
          </section>

          {/* Additional Notes */}
          <section>
            <h2>Additional Information</h2>

            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows="5"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Anything else you would like to mention..."
            />
          </section>

          {/* Submit */}
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Submit Health Check-In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckIn;