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

import {
  detectTrendInsights,
  detectPersistentPatterns,
  buildTimeAwareInsight,
  buildPersistentInsight,
} from "../utils/shisIntelligence";

// ============================================================
// DATE HELPERS
// ============================================================

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

function getMonthLabel(monthValue) {
  const date = new Date(
    `${monthValue}-01T00:00:00`
  );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );
}

function getPreviousMonth(monthValue) {
  const [year, month] =
    monthValue.split("-").map(Number);

  const date = new Date(
    year,
    month - 2,
    1
  );

  const previousYear =
    date.getFullYear();

  const previousMonth = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  return `${previousYear}-${previousMonth}`;
}

// ============================================================
// RECORD HELPERS
// ============================================================

function groupRecordsByDate(records) {
  return records.reduce(
    (groups, record) => {
      if (!groups[record.checkin_date]) {
        groups[record.checkin_date] = [];
      }

      groups[record.checkin_date].push(
        record
      );

      return groups;
    },
    {}
  );
}

function getRecordByType(records, type) {
  return records.find(
    (record) =>
      record.checkin_type === type
  );
}

function getNumericValues(
  records,
  field
) {
  return records
    .map((record) =>
      Number(record[field])
    )
    .filter(
      (value) => !Number.isNaN(value)
    );
}

function getAverage(records, field) {
  const values = getNumericValues(
    records,
    field
  );

  if (!values.length) {
    return null;
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  return total / values.length;
}

function getMostCommonValue(
  records,
  field
) {
  const values = records
    .map((record) => record[field])
    .filter(Boolean);

  if (!values.length) {
    return "Not enough data";
  }

  const counts = {};

  values.forEach((value) => {
    counts[value] =
      (counts[value] || 0) + 1;
  });

  return Object.entries(counts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
}

// ============================================================
// MONTHLY REPORT CALCULATION
// ============================================================

function calculateReport(records) {
  const morningRecords =
    records.filter(
      (record) =>
        record.checkin_type ===
        "morning"
    );

  const eveningRecords =
    records.filter(
      (record) =>
        record.checkin_type ===
        "evening"
    );

  const nightRecords =
    records.filter(
      (record) =>
        record.checkin_type ===
        "night"
    );

  const grouped =
    groupRecordsByDate(records);

  return {
    totalCheckins: records.length,

    activeDays:
      Object.keys(grouped).length,

    morningCount:
      morningRecords.length,

    eveningCount:
      eveningRecords.length,

    nightCount:
      nightRecords.length,

    energyAverage:
      getAverage(
        eveningRecords,
        "energy_level"
      ),

    stressAverage:
      getAverage(
        eveningRecords,
        "stress_level"
      ),

    academicPressureAverage:
      getAverage(
        eveningRecords,
        "academic_pressure"
      ),

    dayRatingAverage:
      getAverage(
        nightRecords,
        "day_rating"
      ),

    mostCommonSleepQuality:
      getMostCommonValue(
        morningRecords,
        "sleep_quality"
      ),
  };
}

// ============================================================
// CENTRAL SHIS INTELLIGENCE
// ============================================================

function buildReportPatterns(records) {
  const insights =
    detectTrendInsights(records);

  return insights.map((insight) => ({
    icon: insight.icon,
    title: insight.title,
    description: insight.message,
    type: insight.type,
  }));
}

// ============================================================
// DAILY TREND DATA
// ============================================================

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

// ============================================================
// MONTH COMPARISON
// ============================================================

function compareValues(
  currentValue,
  previousValue
) {
  if (
    currentValue === null ||
    currentValue === undefined ||
    previousValue === null ||
    previousValue === undefined
  ) {
    return null;
  }

  const current =
    Number(currentValue);

  const previous =
    Number(previousValue);

  if (
    Number.isNaN(current) ||
    Number.isNaN(previous)
  ) {
    return null;
  }

  const difference =
    current - previous;

  if (
    Math.abs(difference) <= 0.05
  ) {
    return {
      difference: 0,
      direction: "similar",
      label: "Remained similar",
    };
  }

  if (difference > 0) {
    return {
      difference,
      direction: "increased",
      label: "Increased",
    };
  }

  return {
    difference,
    direction: "decreased",
    label: "Decreased",
  };
}

function getComparisonData(
  currentReport,
  previousReport
) {
  return [
    {
      key: "energy",
      label: "Energy",
      current:
        currentReport.energyAverage,
      previous:
        previousReport.energyAverage,
    },

    {
      key: "stress",
      label: "Stress",
      current:
        currentReport.stressAverage,
      previous:
        previousReport.stressAverage,
    },

    {
      key: "academicPressure",
      label: "Academic Pressure",
      current:
        currentReport.academicPressureAverage,
      previous:
        previousReport.academicPressureAverage,
    },

    {
      key: "dayRating",
      label: "Day Rating",
      current:
        currentReport.dayRatingAverage,
      previous:
        previousReport.dayRatingAverage,
    },
  ].map((item) => ({
    ...item,
    comparison:
      compareValues(
        item.current,
        item.previous
      ),
  }));
}

// ============================================================
// LONG-TERM MONTHLY HISTORY
// ============================================================

function buildMonthlyHistory(records) {
  const grouped = {};

  records.forEach((record) => {
    const month =
      record.checkin_date.slice(0, 7);

    if (!grouped[month]) {
      grouped[month] = [];
    }

    grouped[month].push(record);
  });

  return Object.keys(grouped)
    .sort()
    .map((month) => {
      const monthReport =
        calculateReport(
          grouped[month]
        );

      const date = new Date(
        `${month}-01T00:00:00`
      );

      return {
        month,

        label:
          date.toLocaleDateString(
            "en-US",
            {
              month: "short",
              year: "numeric",
            }
          ),

        energy:
          monthReport.energyAverage,

        stress:
          monthReport.stressAverage,

        academicPressure:
          monthReport.academicPressureAverage,

        dayRating:
          monthReport.dayRatingAverage,
      };
    });
}

// ============================================================
// REPORT COMPONENT
// ============================================================

function Report() {
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [allCheckins, setAllCheckins] =
    useState([]);

  const [selectedMonth, setSelectedMonth] =
    useState("");

  useEffect(() => {
    loadReportData();
  }, []);

  async function loadReportData() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        setError(
          "Please log in to view your report."
        );

        setLoading(false);
        return;
      }

      const now = new Date();

      const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 11,
        1
      );

      const startDateString =
        formatDateForDatabase(
          startDate
        );

      const { data, error } =
        await supabase
          .from("daily_checkins")
          .select("*")
          .eq("user_id", user.id)
          .gte(
            "checkin_date",
            startDateString
          )
          .order("checkin_date", {
            ascending: true,
          });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setAllCheckins(data || []);

      const currentMonth =
        `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}`;

      setSelectedMonth(
        currentMonth
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load monthly report."
      );
    }

    setLoading(false);
  }

  const monthOptions = Array.from(
    { length: 12 },
    (_, index) => {
      const now = new Date();

      const date = new Date(
        now.getFullYear(),
        now.getMonth() - index,
        1
      );

      const value =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

      return {
        value,
        label:
          getMonthLabel(value),
      };
    }
  );

  const monthRecords =
    allCheckins.filter(
      (record) =>
        record.checkin_date.startsWith(
          selectedMonth
        )
    );

  const previousMonth =
    selectedMonth
      ? getPreviousMonth(
          selectedMonth
        )
      : "";

  const previousMonthRecords =
    allCheckins.filter(
      (record) =>
        record.checkin_date.startsWith(
          previousMonth
        )
    );

  const report =
    calculateReport(
      monthRecords
    );

  const previousReport =
    calculateReport(
      previousMonthRecords
    );

  const patterns =
    buildReportPatterns(
      monthRecords
    );

  const trendData =
    buildTrendData(
      monthRecords
    );

  const monthlyHistory =
    buildMonthlyHistory(
      allCheckins
    );

  // Central intelligence engine
  const persistentPatterns =
    detectPersistentPatterns(
      allCheckins
    );

  const persistentInsight =
    buildPersistentInsight(
      persistentPatterns
    );

  const contextPatterns =
    persistentPatterns.filter(
      (pattern) =>
        pattern.category === "context"
    );

  const timeAwareInsight =
    buildTimeAwareInsight(
      allCheckins,
      persistentPatterns
    );

  const comparisonData =
    getComparisonData(
      report,
      previousReport
    );

  const hasPreviousMonthData =
    previousMonthRecords.length > 0;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="report-page">
        <div className="content-card">
          <p>
            Loading your monthly report...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="report-page">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN REPORT
  // ==========================================================

  return (
    <div className="report-page">

      {/* HEADER */}

      <div className="report-header">
        <div>
          <span className="eyebrow">
            SHIS REPORT
          </span>

          <h1>
            Monthly Report
          </h1>

          <p className="page-subtitle">
            A summary of your recorded
            wellbeing patterns over time.
          </p>
        </div>

        <div className="report-month-selector">
          <label htmlFor="report-month">
            View month
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
                  key={month.value}
                  value={month.value}
                >
                  {month.label}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {monthRecords.length === 0 ? (
        <div className="content-card report-empty-state">
          <div className="report-empty-icon">
            📊
          </div>

          <h2>
            No check-ins recorded
          </h2>

          <p>
            There is no wellbeing data
            available for{" "}
            {getMonthLabel(
              selectedMonth
            )}
            .
          </p>

          <span>
            Complete your daily check-ins
            to build your health history.
          </span>
        </div>
      ) : (
        <>
          {/* REPORT OVERVIEW */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Monthly Overview
                </h2>

                <p className="card-description">
                  Your recorded activity
                  during{" "}
                  {getMonthLabel(
                    selectedMonth
                  )}
                  .
                </p>
              </div>
            </div>

            <div className="report-period">
              <div>
                <span>
                  Active days
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

          {/* METRICS */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Wellbeing Snapshot
                </h2>

                <p className="card-description">
                  Monthly averages from
                  your recorded check-ins.
                </p>
              </div>
            </div>

            <div className="report-metrics-grid">

              <div className="report-metric">
                <span>
                  Energy
                </span>

                <strong>
                  {report.energyAverage !==
                  null
                    ? report.energyAverage.toFixed(
                        1
                      )
                    : "—"}
                </strong>

                <small>
                  out of 5
                </small>
              </div>

              <div className="report-metric">
                <span>
                  Stress
                </span>

                <strong>
                  {report.stressAverage !==
                  null
                    ? report.stressAverage.toFixed(
                        1
                      )
                    : "—"}
                </strong>

                <small>
                  out of 4
                </small>
              </div>

              <div className="report-metric">
                <span>
                  Academic Pressure
                </span>

                <strong>
                  {report.academicPressureAverage !==
                  null
                    ? report.academicPressureAverage.toFixed(
                        1
                      )
                    : "—"}
                </strong>

                <small>
                  out of 4
                </small>
              </div>

              <div className="report-metric">
                <span>
                  Day Rating
                </span>

                <strong>
                  {report.dayRatingAverage !==
                  null
                    ? report.dayRatingAverage.toFixed(
                        1
                      )
                    : "—"}
                </strong>

                <small>
                  out of 5
                </small>
              </div>

            </div>
          </div>

          {/* MONTH TO MONTH COMPARISON */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Month-to-Month Comparison
                </h2>

                <p className="card-description">
                  How your recorded averages
                  changed compared with the
                  previous month.
                </p>
              </div>
            </div>

            {!hasPreviousMonthData ? (
              <div className="report-comparison-empty">
                <div className="report-comparison-empty-icon">
                  📅
                </div>

                <div>
                  <strong>
                    No comparable data yet
                  </strong>

                  <p>
                    There is no recorded data
                    available for{" "}
                    {getMonthLabel(
                      previousMonth
                    )}
                    .
                  </p>
                </div>
              </div>
            ) : (
              <div className="report-comparison-grid">
                {comparisonData.map(
                  (item) => {
                    const comparison =
                      item.comparison;

                    return (
                      <div
                        className="report-comparison-card"
                        key={item.key}
                      >
                        <div className="report-comparison-title">
                          <span>
                            {item.label}
                          </span>
                        </div>

                        <div className="report-comparison-values">
                          <div>
                            <small>
                              Previous
                            </small>

                            <strong>
                              {item.previous !==
                              null
                                ? Number(
                                    item.previous
                                  ).toFixed(
                                    1
                                  )
                                : "—"}
                            </strong>
                          </div>

                          <div>
                            <small>
                              Current
                            </small>

                            <strong>
                              {item.current !==
                              null
                                ? Number(
                                    item.current
                                  ).toFixed(
                                    1
                                  )
                                : "—"}
                            </strong>
                          </div>
                        </div>

                        {comparison ? (
                          <div
                            className={`report-comparison-change ${comparison.direction}`}
                          >
                            <strong>
                              {comparison.difference >
                              0
                                ? "+"
                                : ""}

                              {comparison.difference.toFixed(
                                1
                              )}
                            </strong>

                            <span>
                              {comparison.label}
                            </span>
                          </div>
                        ) : (
                          <div className="report-comparison-change similar">
                            <strong>
                              —
                            </strong>

                            <span>
                              Not enough data
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* LONG-TERM HISTORY */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Long-Term Wellbeing History
                </h2>

                <p className="card-description">
                  Monthly wellbeing averages
                  across your recorded history.
                </p>
              </div>
            </div>

            {monthlyHistory.length ===
            0 ? (
              <div className="report-comparison-empty">
                <div className="report-comparison-empty-icon">
                  📈
                </div>

                <div>
                  <strong>
                    More history is needed
                  </strong>

                  <p>
                    Continue completing
                    your daily check-ins
                    to build a longer-term
                    wellbeing history.
                  </p>
                </div>
              </div>
            ) : (
              <div className="report-long-term-chart">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={monthlyHistory}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="label"
                    />

                    <YAxis
                      domain={[1, 5]}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="energy"
                      name="Energy"
                      strokeWidth={3}
                      connectNulls={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="dayRating"
                      name="Day Rating"
                      strokeWidth={3}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* PERSISTENT PATTERNS */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Persistent Patterns
                </h2>

                <p className="card-description">
                  Patterns that appeared
                  across multiple months
                  of recorded wellbeing
                  data.
                </p>
              </div>
            </div>

            {persistentPatterns.length ===
            0 ? (
              <div className="report-highlight">
                <span>
                  SHIS observation
                </span>

                <strong>
                  No persistent pattern
                  detected yet
                </strong>
              </div>
            ) : (
              <div className="report-pattern-list">
                {persistentPatterns.map(
                  (pattern, index) => (
                    <div
                      className="report-pattern-card"
                      key={index}
                    >
                      <div className="report-pattern-icon">
                        {pattern.icon}
                      </div>

                      <div>
                        <h3>
                          {pattern.title}
                        </h3>

                        <p>
                          {pattern.description}
                        </p>

                        <small className="report-pattern-months">
                          Observed across{" "}
                          {pattern.months.length}{" "}
                          month
                          {pattern.months.length !==
                          1
                            ? "s"
                            : ""}
                        </small>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* CONTEXT-AWARE INTELLIGENCE */}

          <div className="dashboard-insights-section">
            <div className="report-section-header">
              <div>
                <h2>
                  🔗 Context-Aware Patterns
                </h2>

                <p className="card-description">
                  SHIS looks at related
                  wellbeing signals together,
                  rather than viewing each
                  measure separately.
                </p>
              </div>
            </div>

            {contextPatterns.length ===
            0 ? (
              <div className="dashboard-note">
                <strong>
                  No recurring relationship
                  detected yet
                </strong>

                <p>
                  SHIS needs more repeated
                  monthly data before it can
                  identify relationships
                  between different wellbeing
                  signals.
                </p>
              </div>
            ) : (
              <div className="report-pattern-list">
                {contextPatterns.map(
                  (pattern, index) => (
                    <div
                      className="report-pattern-card"
                      key={index}
                    >
                      <div className="report-pattern-icon">
                        {pattern.icon}
                      </div>

                      <div>
                        <h3>
                          {pattern.title}
                        </h3>

                        <p>
                          {pattern.description}
                        </p>

                        <small className="report-pattern-months">
                          Observed across{" "}
                          {pattern.months.length}{" "}
                          month
                          {pattern.months.length !==
                          1
                            ? "s"
                            : ""}
                        </small>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* TREND CHARTS */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Wellbeing Trends
                </h2>

                <p className="card-description">
                  Daily recorded values across
                  the selected month.
                </p>
              </div>
            </div>

            <div className="report-charts-grid">

              {/* ENERGY */}

              <div className="report-chart-card">
                <div className="report-chart-header">
                  <h3>
                    Energy
                  </h3>

                  <span>
                    Daily evening check-ins
                  </span>
                </div>

                <div className="report-chart">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
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
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* STRESS */}

              <div className="report-chart-card">
                <div className="report-chart-header">
                  <h3>
                    Stress
                  </h3>

                  <span>
                    Daily evening check-ins
                  </span>
                </div>

                <div className="report-chart">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
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
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ACADEMIC PRESSURE */}

              <div className="report-chart-card">
                <div className="report-chart-header">
                  <h3>
                    Academic Pressure
                  </h3>

                  <span>
                    Daily evening check-ins
                  </span>
                </div>

                <div className="report-chart">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
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
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* DAY RATING */}

              <div className="report-chart-card">
                <div className="report-chart-header">
                  <h3>
                    Day Rating
                  </h3>

                  <span>
                    Daily night check-ins
                  </span>
                </div>

                <div className="report-chart">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
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
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* CENTRAL SHIS REPEATED PATTERNS */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Repeated Wellbeing Patterns
                </h2>

                <p className="card-description">
                  Patterns detected by the
                  central SHIS intelligence
                  engine.
                </p>
              </div>
            </div>

            {patterns.length === 0 ? (
              <div className="report-highlight">
                <span>
                  SHIS observation
                </span>

                <strong>
                  No repeated concern
                  detected
                </strong>
              </div>
            ) : (
              <div className="report-pattern-list">
                {patterns.map(
                  (pattern, index) => (
                    <div
                      className="report-pattern-card"
                      key={index}
                    >
                      <div className="report-pattern-icon">
                        {pattern.icon}
                      </div>

                      <div>
                        <h3>
                          {pattern.title}
                        </h3>

                        <p>
                          {pattern.description}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* SLEEP */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Sleep Snapshot
                </h2>

                <p className="card-description">
                  Most frequently recorded
                  sleep quality during the
                  selected month.
                </p>
              </div>
            </div>

            <div className="report-highlight">
              <span>
                Most common sleep quality
              </span>

              <strong>
                {report.mostCommonSleepQuality}
              </strong>
            </div>
          </div>

          {/* TIME-AWARE INTELLIGENCE */}

          <div className="dashboard-insights-section">
            <div className="report-section-header">
              <div>
                <h2>
                  ⏱️ What SHIS is noticing recently
                </h2>

                <p className="card-description">
                  SHIS looks at your most recent
                  recorded days and compares them
                  with earlier data when enough
                  information is available.
                </p>
              </div>
            </div>

            <div className="dashboard-note">
              <strong>
                {timeAwareInsight.title}
              </strong>

              <p>
                {timeAwareInsight.description}
              </p>
            </div>

            <div className="report-highlight">
              <span>
                Suggested next step
              </span>

              <strong>
                {timeAwareInsight.nextStep}
              </strong>
            </div>
          </div>

          {/* SHIS INTELLIGENCE */}

          <div className="dashboard-insights-section">
            <div className="report-section-header">
              <div>
                <h2>
                  🧠 SHIS Intelligence
                </h2>

                <p className="card-description">
                  SHIS combines repeated
                  patterns, their relationships,
                  and recent changes to build
                  a longer-term picture.
                </p>
              </div>
            </div>

            <div className="dashboard-note">
              <strong>
                {persistentInsight.title}
              </strong>

              <p>
                {persistentInsight.description}
              </p>
            </div>

            {contextPatterns.length >
              0 && (
                <div className="report-highlight">
                  <span>
                    Context-aware observation
                  </span>

                  <strong>
                    {contextPatterns.length}{" "}
                    recurring{" "}
                    {contextPatterns.length ===
                    1
                      ? "relationship"
                      : "relationships"}{" "}
                    detected
                  </strong>
                </div>
              )}

            {persistentPatterns.length >
              0 && (
                <div className="report-highlight">
                  <span>
                    Long-term observation
                  </span>

                  <strong>
                    {persistentPatterns.length}{" "}
                    recurring{" "}
                    {persistentPatterns.length ===
                    1
                      ? "pattern"
                      : "patterns"}{" "}
                    detected
                  </strong>
                </div>
              )}

            <div className="dashboard-note">
              <strong>
                How SHIS interprets this
              </strong>

              <p>
                These observations are based
                on repeated responses recorded
                over time. When two signals
                appear together repeatedly,
                SHIS reports that relationship
                without assuming that one
                factor caused the other.
              </p>
            </div>
          </div>

          {/* NEXT STEP */}

          <div className="content-card">
            <div className="report-section-header">
              <div>
                <h2>
                  Suggested Next Step
                </h2>

                <p className="card-description">
                  Continue recording your
                  wellbeing consistently.
                </p>
              </div>
            </div>

            <div className="report-highlight">
              <span>
                SHIS recommendation
              </span>

              <strong>
                Keep completing your daily
                check-ins
              </strong>
            </div>
          </div>

          {/* DISCLAIMER */}

          <div className="dashboard-note">
            SHIS provides informational
            wellbeing insights based on the
            information you record. It is not
            a diagnostic or medical system.
          </div>
        </>
      )}
    </div>
  );
}

export default Report;