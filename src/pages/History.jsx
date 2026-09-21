import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchHealthHistory();
  }, []);

  async function fetchHealthHistory() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("health_checkins")
      .select("*")
      .eq("student_id", "SHIS-001")
      .order("checkin_date", { ascending: false });

    if (error) {
      console.error("Error fetching health history:", error);
      setErrorMessage("Could not load your health history.");
      setLoading(false);
      return;
    }

    setRecords(data || []);
    setLoading(false);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Health History</h1>
        <p>View your previous health check-ins.</p>
      </div>

      {loading && (
        <div className="history-message">
          Loading your health history...
        </div>
      )}

      {errorMessage && (
        <div className="history-error">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && records.length === 0 && (
        <div className="history-message">
          No health check-ins found yet.
        </div>
      )}

      {!loading && !errorMessage && records.length > 0 && (
        <div className="history-list">
          {records.map((record) => (
            <div className="history-card" key={record.id}>
              <div className="history-card-header">
                <div>
                  <h3>
                    Check-in:{" "}
                    {new Date(
                      record.checkin_date
                    ).toLocaleDateString()}
                  </h3>

                  <p>Student ID: {record.student_id}</p>
                </div>

                <span className="history-badge">
                  Completed
                </span>
              </div>

              <div className="history-grid">
                <div className="history-item">
                  <span>Sleep</span>
                  <strong>
                    {record.sleep_hours ?? "—"} hours
                  </strong>
                </div>

                <div className="history-item">
                  <span>Sleep Quality</span>
                  <strong>
                    {record.sleep_quality ?? "—"}
                  </strong>
                </div>

                <div className="history-item">
                  <span>Exercise</span>
                  <strong>
                    {record.exercise_days ?? "—"} days
                  </strong>
                </div>

                <div className="history-item">
                  <span>Water Intake</span>
                  <strong>
                    {record.water_intake ?? "—"} L
                  </strong>
                </div>

                <div className="history-item">
                  <span>Energy</span>
                  <strong>
                    {record.energy_level ?? "—"}
                  </strong>
                </div>

                <div className="history-item">
                  <span>Stress</span>
                  <strong>
                    {record.stress_level ?? "—"}
                  </strong>
                </div>

                <div className="history-item">
                  <span>Mood</span>
                  <strong>
                    {record.mood ?? "—"}
                  </strong>
                </div>

                <div className="history-item">
                  <span>Academic Pressure</span>
                  <strong>
                    {record.academic_pressure ?? "—"}
                  </strong>
                </div>
              </div>

              {record.has_symptoms === "Yes" && (
                <div className="symptom-section">
                  <h4>Symptoms</h4>

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
                  <h4>Additional Notes</h4>
                  <p>{record.notes}</p>
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