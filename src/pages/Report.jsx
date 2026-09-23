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

function Report() {
  const [user, setUser] = useState(null);
  const [allCheckins, setAllCheckins] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReportData();
  }, []);

  async function loadReportData() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Unable to load your account.");
      setLoading(false);
      return;
    }

    setUser(user);

    // Get the last 12 months of check-in data
    const now = new Date();

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1
    );

    const startDateString =
      formatDateForDatabase(startDate);

    const {
      data,
      error: checkinError,
    } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .gte("checkin_date", startDateString)
      .order("checkin_date", {
        ascending: true,
      });

    if (checkinError) {
      setError(checkinError.message);
      setLoading(false);
      return;
    }

    setAllCheckins(data || []);

    // Current month selected by default
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    setSelectedMonth(currentMonth);

    setLoading(false);
  }

  function formatDateForDatabase(date) {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatMonthLabel(monthValue) {
    const [year, month] =
      monthValue.split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      1
    );

    return date.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );
  }

  function getMonthOptions() {
    const options = [];

    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const monthValue = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      options.push(monthValue);
    }

    return options;
  }

  function getMonthRecords() {
    return allCheckins.filter((record) => {
      return record.checkin_date.startsWith(
        selectedMonth
      );
    });
  }

  function groupRecordsByDate(records) {
    const grouped = {};

    records.forEach((record) => {
      if (!grouped[record.checkin_date]) {
        grouped[record.checkin_date] = [];
      }

      grouped[record.checkin_date].push(record);
    });

    return grouped;
  }

  function getRecordByType(records, type) {
    return records.find(
      (record) =>
        record.checkin_type === type
    );
  }

  function getNumericAverage(values) {
    const validValues = values.filter(
      (value) =>
        typeof value === "number" &&
        !Number.isNaN(value)
    );

    if (!validValues.length) {
      return null;
    }

    const total = validValues.reduce(
      (sum, value) => sum + value,
      0
    );

    return (
      total / validValues.length
    ).toFixed(1);
  }

  function getMostCommonValue(values) {
    const validValues =
      values.filter(Boolean);

    if (!validValues.length) {
      return null;
    }

    const frequency = {};

    validValues.forEach((value) => {
      frequency[value] =
        (frequency[value] || 0) + 1;
    });

    return Object.keys(
      frequency
    ).reduce((a, b) =>
      frequency[a] >= frequency[b]
        ? a
        : b
    );
  }

  function calculateReport(records) {
    const grouped =
      groupRecordsByDate(records);

    const dates = Object.keys(grouped);

    const morningRecords = records.filter(
      (record) =>
        record.checkin_type === "morning"
    );

    const eveningRecords = records.filter(
      (record) =>
        record.checkin_type === "evening"
    );

    const nightRecords = records.filter(
      (record) =>
        record.checkin_type === "night"
    );

    const energyAverage =
      getNumericAverage(
        eveningRecords.map(
          (record) =>
            record.energy_level
        )
      );

    const stressAverage =
      getNumericAverage(
        eveningRecords.map(
          (record) =>
            record.stress_level
        )
      );

    const academicPressureAverage =
      getNumericAverage(
        eveningRecords.map(
          (record) =>
            record.academic_pressure
        )
      );

    const dayRatingAverage =
      getNumericAverage(
        nightRecords.map(
          (record) =>
            record.day_rating
        )
      );

    const mostCommonSleepQuality =
      getMostCommonValue(
        morningRecords.map(
          (record) =>
            record.sleep_quality
        )
      );

    return {
      totalCheckins:
        records.length,

      activeDays:
        dates.length,

      morningCount:
        morningRecords.length,

      eveningCount:
        eveningRecords.length,

      nightCount:
        nightRecords.length,

      energyAverage,

      stressAverage,

      academicPressureAverage,

      dayRatingAverage,

      mostCommonSleepQuality,

      grouped,
    };
  }

  function calculatePatterns(records) {
    const grouped =
      groupRecordsByDate(records);

    const dates = Object.keys(
      grouped
    ).sort();

    const eveningRecords =
      dates
        .map((date) =>
          getRecordByType(
            grouped[date],
            "evening"
          )
        )
        .filter(Boolean);

    const nightRecords =
      dates
        .map((date) =>
          getRecordByType(
            grouped[date],
            "night"
          )
        )
        .filter(Boolean);

    const patterns = [];

    // Need enough data before detecting
    // repeated patterns.
    if (eveningRecords.length < 3) {
      return {
        patterns: [],
        message:
          "More check-in data is needed before SHIS can identify repeated patterns.",
      };
    }

    const recentEvening =
      eveningRecords.slice(-3);

    const highStress =
      recentEvening.every(
        (record) =>
          record.stress_level >= 3
      );

    const highAcademicPressure =
      recentEvening.every(
        (record) =>
          record.academic_pressure >= 3
      );

    const lowEnergy =
      recentEvening.every(
        (record) =>
          record.energy_level <= 2
      );

    const recentNight =
      nightRecords.slice(-3);

    const lowDayRating =
      recentNight.length >= 3 &&
      recentNight.every(
        (record) =>
          record.day_rating <= 2
      );

    if (highStress) {
      patterns.push({
        title:
          "Stress has remained elevated",

        description:
          "Higher stress levels were recorded across the most recent evening check-ins.",

        type: "attention",
      });
    }

    if (highAcademicPressure) {
      patterns.push({
        title:
          "Academic pressure has remained elevated",

        description:
          "Academic pressure was repeatedly recorded at a higher level in recent check-ins.",

        type: "attention",
      });
    }

    if (lowEnergy) {
      patterns.push({
        title:
          "Energy has remained low",

        description:
          "Lower energy levels were recorded across the most recent evening check-ins.",

        type: "attention",
      });
    }

    if (lowDayRating) {
      patterns.push({
        title:
          "Day ratings have remained low",

        description:
          "The most recent night check-ins show consistently lower day ratings.",

        type: "attention",
      });
    }

    if (
      highAcademicPressure &&
      lowEnergy
    ) {
      patterns.push({
        title:
          "Academic pressure and low energy appear together",

        description:
          "Recent check-ins show higher academic pressure occurring alongside lower energy.",

        type: "pattern",
      });
    }

    if (
      highStress &&
      lowEnergy
    ) {
      patterns.push({
        title:
          "Stress and low energy appear together",

        description:
          "Recent check-ins show higher stress occurring alongside lower energy.",

        type: "pattern",
      });
    }

    if (
      highStress &&
      lowDayRating
    ) {
      patterns.push({
        title:
          "Stress and lower day ratings appear together",

        description:
          "Recent check-ins show higher stress occurring during days with lower ratings.",

        type: "pattern",
      });
    }

    if (
      highAcademicPressure &&
      lowDayRating
    ) {
      patterns.push({
        title:
          "Academic pressure and lower day ratings appear together",

        description:
          "Recent check-ins show higher academic pressure alongside lower day ratings.",

        type: "pattern",
      });
    }

    // Sleep + energy pattern
    const recentDates =
      dates.slice(-3);

    let poorSleepLowEnergyDays = 0;

    recentDates.forEach((date) => {
      const morning =
        getRecordByType(
          grouped[date],
          "morning"
        );

      const evening =
        getRecordByType(
          grouped[date],
          "evening"
        );

      if (
        morning &&
        evening &&
        morning.sleep_quality ===
          "Poor" &&
        evening.energy_level <= 2
      ) {
        poorSleepLowEnergyDays++;
      }
    });

    if (
      poorSleepLowEnergyDays >= 2
    ) {
      patterns.push({
        title:
          "Poor sleep and low energy appear together",

        description:
          "Recent days include repeated instances where poorer sleep quality was recorded alongside lower energy.",

        type: "pattern",
      });
    }

    let message =
      "No repeated concern was detected in the available monthly data.";

    if (patterns.length > 0) {
      message =
        "SHIS found repeated patterns in your recorded check-ins. These patterns describe your recorded wellbeing signals and are not medical diagnoses.";
    }

    return {
      patterns,
      message,
    };
  }

  // Build daily trend data for charts
  function buildTrendData(records) {
    const grouped =
      groupRecordsByDate(records);

    return Object.keys(grouped)
      .sort()
      .map((date) => {
        const dayRecords =
          grouped[date];

        const evening =
          getRecordByType(
            dayRecords,
            "evening"
          );

        const night =
          getRecordByType(
            dayRecords,
            "night"
          );

        const dateObject = new Date(
          `${date}T00:00:00`
        );

        const label =
          dateObject.toLocaleDateString(
            "en-US",
            {
              day: "numeric",
              month: "short",
            }
          );

        return {
          date: label,

          energy:
            evening?.energy_level ??
            null,

          stress:
            evening?.stress_level ??
            null,

          academicPressure:
            evening?.academic_pressure ??
            null,

          dayRating:
            night?.day_rating ??
            null,
        };
      });
  }

  const monthRecords =
    getMonthRecords();

  const report =
    calculateReport(
      monthRecords
    );

  const intelligence =
    calculatePatterns(
      monthRecords
    );

  const trendData =
    buildTrendData(
      monthRecords
    );

  const monthOptions =
    getMonthOptions();

  const hasSelectedMonthData =
    monthRecords.length > 0;

  if (loading) {
    return (
      <section className="report-page">
        <div className="content-card">
          <p>
            Loading monthly report...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="report-page">
        <div className="content-card">
          <h2>
            Unable to load report
          </h2>

          <p className="error-message">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="report-page">

      {/* HEADER */}

      <div className="report-header">
        <div>
          <span className="section-eyebrow">
            SHIS MONTHLY REPORT
          </span>

          <h1>
            Your wellbeing over time
          </h1>

          <p className="page-subtitle">
            Review your recorded wellbeing
            patterns for a selected month.
          </p>
        </div>

        <div className="report-month-selector">
          <label htmlFor="report-month">
            Report month
          </label>

          <select
            id="report-month"
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(
                event.target.value
              )
            }
          >
            {monthOptions.map(
              (month) => (
                <option
                  key={month}
                  value={month}
                >
                  {formatMonthLabel(
                    month
                  )}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* REPORT PERIOD */}

      <div className="content-card">
        <div className="report-section-header">
          <div>
            <h2>
              {formatMonthLabel(
                selectedMonth
              )}
            </h2>

            <p className="card-description">
              Monthly wellbeing summary
            </p>
          </div>
        </div>

        <div className="report-period">
          <div>
            <span>
              Check-in days
            </span>

            <strong>
              {report.activeDays}
            </strong>
          </div>

          <div>
            <span>
              Total check-ins
            </span>

            <strong>
              {report.totalCheckins}
            </strong>
          </div>
        </div>
      </div>

      {/* NO DATA */}

      {!hasSelectedMonthData && (
        <div className="content-card">
          <div className="report-empty-state">
            <div className="report-empty-icon">
              📅
            </div>

            <h2>
              No check-in data yet
            </h2>

            <p>
              You do not have any recorded
              check-ins for{" "}
              <strong>
                {formatMonthLabel(
                  selectedMonth
                )}
              </strong>
              .
            </p>

            <span>
              Complete your daily check-ins
              to build your wellbeing history.
            </span>
          </div>
        </div>
      )}

      {hasSelectedMonthData && (
        <>

          {/* CHECK-IN OVERVIEW */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Check-in overview
                </h2>

                <p className="card-description">
                  How consistently you recorded
                  your wellbeing this month.
                </p>
              </div>
            </div>

            <div className="report-metrics-grid">

              <div className="report-metric">
                <span>
                  Total check-ins
                </span>

                <strong>
                  {report.totalCheckins}
                </strong>

                <small>
                  All recorded responses
                </small>
              </div>

              <div className="report-metric">
                <span>
                  Active days
                </span>

                <strong>
                  {report.activeDays}
                </strong>

                <small>
                  Days with at least one
                  check-in
                </small>
              </div>

              <div className="report-metric">
                <span>
                  Morning
                </span>

                <strong>
                  {report.morningCount}
                </strong>

                <small>
                  Morning check-ins
                </small>
              </div>

              <div className="report-metric">
                <span>
                  Evening
                </span>

                <strong>
                  {report.eveningCount}
                </strong>

                <small>
                  Evening check-ins
                </small>
              </div>

            </div>

            <div className="report-highlight">
              <span>
                Night check-ins
              </span>

              <strong>
                {report.nightCount}
              </strong>
            </div>
          </div>

          {/* WELLBEING PATTERNS */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Wellbeing patterns
                </h2>

                <p className="card-description">
                  Averages calculated from your
                  recorded check-ins.
                </p>
              </div>
            </div>

            <div className="report-metrics-grid">

              <div className="report-metric">
                <span>
                  Average energy
                </span>

                <strong>
                  {report.energyAverage ??
                    "—"}

                  {report.energyAverage &&
                    "/5"}
                </strong>

                <small>
                  Evening check-ins
                </small>
              </div>

              <div className="report-metric">
                <span>
                  Average stress
                </span>

                <strong>
                  {report.stressAverage ??
                    "—"}

                  {report.stressAverage &&
                    "/4"}
                </strong>

                <small>
                  Evening check-ins
                </small>
              </div>

              <div className="report-metric">
                <span>
                  Academic pressure
                </span>

                <strong>
                  {report.academicPressureAverage ??
                    "—"}

                  {report.academicPressureAverage &&
                    "/4"}
                </strong>

                <small>
                  Evening check-ins
                </small>
              </div>

              <div className="report-metric">
                <span>
                  Average day rating
                </span>

                <strong>
                  {report.dayRatingAverage ??
                    "—"}

                  {report.dayRatingAverage &&
                    "/5"}
                </strong>

                <small>
                  Night check-ins
                </small>
              </div>

            </div>
          </div>

          {/* VISUAL TRENDS */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Wellbeing trends
                </h2>

                <p className="card-description">
                  See how your recorded
                  wellbeing signals changed
                  throughout the selected
                  month.
                </p>
              </div>
            </div>

            <div className="report-charts-grid">

              {/* ENERGY */}

              <div className="report-chart-card">
                <div className="report-chart-header">
                  <div>
                    <h3>
                      Energy
                    </h3>

                    <span>
                      Evening check-ins · 1–5
                    </span>
                  </div>
                </div>

                <div className="report-chart">
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <LineChart
                      data={trendData}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="date"
                      />

                      <YAxis
                        domain={[1, 5]}
                      />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="energy"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* STRESS */}

              <div className="report-chart-card">
                <div className="report-chart-header">
                  <div>
                    <h3>
                      Stress
                    </h3>

                    <span>
                      Evening check-ins · 1–4
                    </span>
                  </div>
                </div>

                <div className="report-chart">
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <LineChart
                      data={trendData}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="date"
                      />

                      <YAxis
                        domain={[1, 4]}
                      />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="stress"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ACADEMIC PRESSURE */}

              <div className="report-chart-card">
                <div className="report-chart-header">
                  <div>
                    <h3>
                      Academic pressure
                    </h3>

                    <span>
                      Evening check-ins · 1–4
                    </span>
                  </div>
                </div>

                <div className="report-chart">
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <LineChart
                      data={trendData}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="date"
                      />

                      <YAxis
                        domain={[1, 4]}
                      />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="academicPressure"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* DAY RATING */}

              <div className="report-chart-card">
                <div className="report-chart-header">
                  <div>
                    <h3>
                      Day rating
                    </h3>

                    <span>
                      Night check-ins · 1–5
                    </span>
                  </div>
                </div>

                <div className="report-chart">
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <LineChart
                      data={trendData}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="date"
                      />

                      <YAxis
                        domain={[1, 5]}
                      />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="dayRating"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* SLEEP */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Sleep pattern
                </h2>

                <p className="card-description">
                  Based on your morning
                  check-ins.
                </p>
              </div>
            </div>

            <div className="report-highlight">
              <span>
                Most frequently recorded
                sleep quality
              </span>

              <strong>
                {report.mostCommonSleepQuality ??
                  "Not enough data"}
              </strong>
            </div>
          </div>

          {/* SHIS INTELLIGENCE */}

          <div className="dashboard-insights-section">
            <div className="dashboard-insights-header">
              <div>
                <span className="section-eyebrow">
                  SHIS INTELLIGENCE
                </span>

                <h2>
                  What SHIS noticed
                </h2>
              </div>
            </div>

            <p className="dashboard-note">
              {intelligence.message}
            </p>

            {intelligence.patterns
              .length > 0 && (
              <div className="report-pattern-list">

                {intelligence.patterns.map(
                  (
                    pattern,
                    index
                  ) => (
                    <div
                      className="content-card report-pattern-card"
                      key={index}
                    >
                      <div className="report-pattern-icon">
                        {pattern.type ===
                        "attention"
                          ? "🔎"
                          : "🔗"}
                      </div>

                      <div>
                        <h3>
                          {pattern.title}
                        </h3>

                        <p>
                          {
                            pattern.description
                          }
                        </p>
                      </div>
                    </div>
                  )
                )}

              </div>
            )}
          </div>

          {/* NEXT STEPS */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Suggested next step
                </h2>

                <p className="card-description">
                  Simple actions that improve
                  the quality of your SHIS
                  history.
                </p>
              </div>
            </div>

            <div className="report-highlight">
              <span>
                Keep building your history
              </span>

              <strong>
                Continue completing your
                daily check-ins consistently.
              </strong>
            </div>
          </div>

          {/* DISCLAIMER */}

          <div className="dashboard-note">
            SHIS monthly reports are intended
            for wellbeing awareness and
            self-reflection. They do not
            diagnose medical or mental health
            conditions.
          </div>

        </>
      )}

    </section>
  );
}

export default Report;