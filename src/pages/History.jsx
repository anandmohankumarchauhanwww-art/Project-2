import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    setErrorMessage("");

    /*
      Get the currently logged-in student
    */

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

    /*
      Get only this student's health records
    */

    const { data, error } = await supabase
      .from("health_checkins")
      .select("*")
      .eq("student_id", user.id)
      .order("checkin_date", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error loading health history:",
        error
      );

      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setRecords(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="history-message">
          Loading your health history...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="page-container">
        <div className="history-error">
          <strong>
            Could not load your health history.
          </strong>

          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <h1>Health History</h1>

        <p>
          Look back at your previous check-ins
          and notice changes over time.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="history-message">
          <h3>No check-ins yet</h3>

          <p>
            Complete your first health check-in
            and your history will appear here.
          </p>
        </div>
      ) : (
        <div className="history-list">

          {records.map((record) => (
            <div
              className="history-card"
              key={record.id}
            >

              <div className="history-card-header">

                <div>
                  <h3>
                    Health Check-in
                  </h3>

                  <p>
                    {record.checkin_date}
                  </p>
                </div>

                <div className="history-badge">
                  Completed
                </div>

              </div>

              <div className="history-grid">

                <div className="history-item">
                  <span>😴 Sleep</span>
                  <strong>
                    {record.sleep_hours ?? "—"} hours
                  </strong>
                </div>

                <div className="history-item">
                  <span>⭐ Sleep Quality</span>
                  <strong>
                    {record.sleep_quality ?? "—"}
                  </strong>
                </div>

                <div className="history-item">
                  <span>🏃 Exercise</span>
                  <strong>
                    {record.exercise_days ?? "—"} days
                  </strong>
                </div>

                <div className="history-item">
                  <span>💧 Water</span>
                  <strong>
                    {record.water_intake ?? "—"} L/day
                  </strong>
                </div>

                <div className="history-item">
                  <span>⚡ Energy</span>
                  <strong>
                    {record.energy_level ?? "—"}
                  </strong>
                </div>

                <div className="history-item">
                  <span>🧠 Stress</span>
                  <strong>
                    {record.stress_level ?? "—"}
                  </strong>
                </div>

                <div className="history-item">
                  <span>😊 Mood</span>
                  <strong>
                    {record.mood ?? "—"}
                  </strong>
                </div>

                <div className="history-item">
                  <span>📚 Academic Pressure</span>
                  <strong>
                    {record.academic_pressure ?? "—"}
                  </strong>
                </div>

              </div>

              {record.has_symptoms === "Yes" && (
                <div className="symptom-section">

                  <h4>
                    🩺 Symptoms
                  </h4>

                  <p>
                    <strong>Frequency:</strong>{" "}
                    {record.symptom_frequency ?? "—"}
                  </p>

                  <p>
                    <strong>Severity:</strong>{" "}
                    {record.symptom_severity ?? "—"}
                  </p>

                  <p>
                    <strong>Duration:</strong>{" "}
                    {record.symptom_duration ?? "—"}
                  </p>

                </div>
              )}

              {record.notes && (
                <div className="notes-section">

                  <h4>
                    💬 Notes
                  </h4>

                  <p>
                    {record.notes}
                  </p>

                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default History;