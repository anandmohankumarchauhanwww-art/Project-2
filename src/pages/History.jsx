import TrendInsights from "../components/TrendInsights";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("checkin_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: true,
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

  function formatDate(dateString) {
    if (!dateString) {
      return "";
    }

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatShortDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  function groupRecordsByDate() {
    return records.reduce((groups, record) => {
      if (!groups[record.checkin_date]) {
        groups[record.checkin_date] = [];
      }

      groups[record.checkin_date].push(record);

      return groups;
    }, {});
  }

  function getRecord(type, dateRecords) {
    return dateRecords.find(
      (record) => record.checkin_type === type
    );
  }

  function getStressTrendData() {
    const groupedRecords = groupRecordsByDate();

    return Object.keys(groupedRecords)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => {
        const evening = getRecord(
          "evening",
          groupedRecords[date]
        );

        return {
          date: formatShortDate(date),
          stress: evening?.stress_level
            ? Number(evening.stress_level)
            : null,
        };
      })
      .filter(
        (item) => item.stress !== null
      );
  }

  function getAcademicPressureTrendData() {
    const groupedRecords = groupRecordsByDate();

    return Object.keys(groupedRecords)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => {
        const evening = getRecord(
          "evening",
          groupedRecords[date]
        );

        return {
          date: formatShortDate(date),
          academicPressure:
            evening?.academic_pressure
              ? Number(evening.academic_pressure)
              : null,
        };
      })
      .filter(
        (item) => item.academicPressure !== null
      );
  }

  function getEnergyTrendData() {
    const groupedRecords = groupRecordsByDate();

    return Object.keys(groupedRecords)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => {
        const evening = getRecord(
          "evening",
          groupedRecords[date]
        );

        return {
          date: formatShortDate(date),
          energy: evening?.energy_level
            ? Number(evening.energy_level)
            : null,
        };
      })
      .filter(
        (item) => item.energy !== null
      );
  }

  function getDayRatingTrendData() {
    const groupedRecords = groupRecordsByDate();

    return Object.keys(groupedRecords)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => {
        const night = getRecord(
          "night",
          groupedRecords[date]
        );

        return {
          date: formatShortDate(date),
          dayRating: night?.day_rating
            ? Number(night.day_rating)
            : null,
        };
      })
      .filter(
        (item) => item.dayRating !== null
      );
  }

  function renderMorning(record) {
    if (!record) {
      return (
        <div className="history-not-completed">
          Morning check-in not completed
        </div>
      );
    }

    return (
      <div className="history-checkin">
        <div className="history-checkin-header">
          <div>
            <span className="history-checkin-icon">
              🌅
            </span>

            <div>
              <h3>Morning</h3>
              <span>Completed</span>
            </div>
          </div>

          <span className="history-status">
            ✓ Done
          </span>
        </div>

        <div className="history-grid">
          <div className="history-item">
            <span>😴 Sleep</span>

            <strong>
              {record.sleep_duration || "—"}
            </strong>
          </div>

          <div className="history-item">
            <span>⭐ Sleep quality</span>

            <strong>
              {record.sleep_quality || "—"}
            </strong>
          </div>

          <div className="history-item">
            <span>🌿 Rested feeling</span>

            <strong>
              {record.rested_feeling || "—"}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  function renderEvening(record) {
    if (!record) {
      return (
        <div className="history-not-completed">
          Evening check-in not completed
        </div>
      );
    }

    return (
      <div className="history-checkin">
        <div className="history-checkin-header">
          <div>
            <span className="history-checkin-icon">
              🌆
            </span>

            <div>
              <h3>Evening</h3>
              <span>Completed</span>
            </div>
          </div>

          <span className="history-status">
            ✓ Done
          </span>
        </div>

        <div className="history-grid">
          <div className="history-item">
            <span>😊 Mood</span>

            <strong>
              {record.mood || "—"}
            </strong>
          </div>

          <div className="history-item">
            <span>🧠 Stress</span>

            <strong>
              {record.stress_level
                ? `${record.stress_level}/4`
                : "—"}
            </strong>
          </div>

          <div className="history-item">
            <span>📚 Academic pressure</span>

            <strong>
              {record.academic_pressure
                ? `${record.academic_pressure}/4`
                : "—"}
            </strong>
          </div>

          <div className="history-item">
            <span>⚡ Energy</span>

            <strong>
              {record.energy_level
                ? `${record.energy_level}/5`
                : "—"}
            </strong>
          </div>

          <div className="history-item">
            <span>🩺 Physical wellbeing</span>

            <strong>
              {record.physical_discomfort || "—"}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  function renderNight(record) {
    if (!record) {
      return (
        <div className="history-not-completed">
          Night check-in not completed
        </div>
      );
    }

    return (
      <div className="history-checkin">
        <div className="history-checkin-header">
          <div>
            <span className="history-checkin-icon">
              🌙
            </span>

            <div>
              <h3>Night</h3>
              <span>Completed</span>
            </div>
          </div>

          <span className="history-status">
            ✓ Done
          </span>
        </div>

        <div className="history-grid">
          <div className="history-item">
            <span>🏃 Activity</span>

            <strong>
              {record.activity_level || "—"}
            </strong>
          </div>

          <div className="history-item">
            <span>📱 Screen time</span>

            <strong>
              {record.screen_time || "—"}
            </strong>
          </div>

          <div className="history-item">
            <span>🍽️ Food</span>

            <strong>
              {record.food_quality || "—"}
            </strong>
          </div>

          <div className="history-item">
            <span>💧 Water</span>

            <strong>
              {record.water_intake || "—"}
            </strong>
          </div>

          <div className="history-item">
            <span>⭐ Day rating</span>

            <strong>
              {record.day_rating
                ? `${record.day_rating}/5`
                : "—"}
            </strong>
          </div>
        </div>
      </div>
    );
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

  const groupedRecords = groupRecordsByDate();

  const dates = Object.keys(groupedRecords);

  const stressTrendData = getStressTrendData();

  const academicPressureTrendData =
    getAcademicPressureTrendData();

  const energyTrendData =
    getEnergyTrendData();

  const dayRatingTrendData =
    getDayRatingTrendData();

  return (
    <div className="page-container">

      <div className="page-header">
        <h1>Health History</h1>

        <p>
          Look back at your daily check-ins and notice
          how your wellbeing changes over time.
        </p>
      </div>

      {/* STRESS TREND */}

      {stressTrendData.length > 0 && (
        <div className="history-card">

          <div className="history-card-header">
            <div>
              <h2>Stress Trend</h2>

              <p>
                Your evening stress level across
                recorded days.
              </p>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "320px",
              marginTop: "20px",
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={stressTrendData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis
                  domain={[1, 4]}
                  ticks={[1, 2, 3, 4]}
                  label={{
                    value: "Stress level",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value}/4`,
                    "Stress",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="stress"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ACADEMIC PRESSURE TREND */}

      {academicPressureTrendData.length > 0 && (
        <div className="history-card">

          <div className="history-card-header">
            <div>
              <h2>Academic Pressure Trend</h2>

              <p>
                Your evening academic pressure across
                recorded days.
              </p>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "320px",
              marginTop: "20px",
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={academicPressureTrendData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis
                  domain={[1, 4]}
                  ticks={[1, 2, 3, 4]}
                  label={{
                    value: "Academic pressure",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value}/4`,
                    "Academic pressure",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="academicPressure"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ENERGY TREND */}

      {energyTrendData.length > 0 && (
        <div className="history-card">

          <div className="history-card-header">
            <div>
              <h2>Energy Trend</h2>

              <p>
                Your evening energy level across
                recorded days.
              </p>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "320px",
              marginTop: "20px",
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={energyTrendData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  label={{
                    value: "Energy level",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value}/5`,
                    "Energy",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="energy"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* DAY RATING TREND */}

      {dayRatingTrendData.length > 0 && (
        <div className="history-card">

          <div className="history-card-header">
            <div>
              <h2>Day Rating Trend</h2>

              <p>
                How you rated your overall day across
                recorded days.
              </p>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "320px",
              marginTop: "20px",
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={dayRatingTrendData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  label={{
                    value: "Day rating",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value}/5`,
                    "Day rating",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="dayRating"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* DAY RATING TREND */}

      {dayRatingTrendData.length > 0 && (
        <div className="history-card">
          {/* existing Day Rating chart */}
        </div>
      )}

      <TrendInsights />

      {/* DAILY HISTORY */}

      {dates.length === 0 ? (

        <div className="history-message">

          <h3>No check-ins yet</h3>

          <p>
            Complete your daily check-ins and your
            health history will appear here.
          </p>

        </div>

      ) : (

        <div className="history-list">

          {dates.map((date) => {

            const dateRecords =
              groupedRecords[date];

            const morning = getRecord(
              "morning",
              dateRecords
            );

            const evening = getRecord(
              "evening",
              dateRecords
            );

            const night = getRecord(
              "night",
              dateRecords
            );

            return (
              <div
                className="history-card"
                key={date}
              >

                <div className="history-card-header">

                  <div>
                    <h2>
                      {formatDate(date)}
                    </h2>

                    <p>
                      Daily wellbeing check-ins
                    </p>
                  </div>

                  <div className="history-badge">
                    {dateRecords.length}/3 completed
                  </div>

                </div>

                <div className="history-day-content">

                  {renderMorning(morning)}

                  {renderEvening(evening)}

                  {renderNight(night)}

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default History;