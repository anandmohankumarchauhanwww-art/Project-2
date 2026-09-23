import { useEffect, useState } from "react";

import { supabase } from "../lib/supabaseClient";

function TrendInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTrendData();
  }, []);

  async function loadTrendData() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Your session has expired. Please login again.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("checkin_date", { ascending: true });

    if (error) {
      console.error("Error loading trend data:", error);

      setMessage(
        "Could not load enough data to detect trends."
      );

      setLoading(false);
      return;
    }

    const trendInsights = detectTrends(data || []);

    setInsights(trendInsights);
    setLoading(false);
  }

  /*
    --------------------------------------------------
    GROUP CHECK-INS BY DATE
    --------------------------------------------------
  */

  function groupRecordsByDate(records) {
    const grouped = {};

    records.forEach((record) => {
      if (!grouped[record.checkin_date]) {
        grouped[record.checkin_date] = {
          morning: null,
          evening: null,
          night: null,
        };
      }

      grouped[record.checkin_date][record.checkin_type] =
        record;
    });

    return grouped;
  }

  /*
    --------------------------------------------------
    GET COMPLETE DAILY RECORDS
    --------------------------------------------------
  */

  function getDailyRecords(records) {
    const grouped = groupRecordsByDate(records);

    return Object.entries(grouped)
      .map(([date, day]) => ({
        date,
        morning: day.morning,
        evening: day.evening,
        night: day.night,
      }))
      .sort(
        (a, b) =>
          new Date(a.date) - new Date(b.date)
      );
  }

  /*
    --------------------------------------------------
    TREND HELPERS
    --------------------------------------------------
  */

  function getNumericValues(dailyRecords, field) {
    return dailyRecords
      .map((day) => {
        if (!day.evening) {
          return null;
        }

        const value = Number(day.evening[field]);

        return Number.isNaN(value) ? null : value;
      })
      .filter((value) => value !== null);
  }

  function getDayRatings(dailyRecords) {
    return dailyRecords
      .map((day) => {
        if (!day.night) {
          return null;
        }

        const value = Number(day.night.day_rating);

        return Number.isNaN(value) ? null : value;
      })
      .filter((value) => value !== null);
  }

  /*
    --------------------------------------------------
    MAIN TREND DETECTION
    --------------------------------------------------
  */

  function detectTrends(records) {
    const dailyRecords = getDailyRecords(records);

    /*
      We need at least three evening check-ins
      before identifying meaningful patterns.
    */

    const eveningDays = dailyRecords.filter(
      (day) => day.evening
    );

    if (eveningDays.length < 3) {
      return [
        {
          type: "info",
          icon: "📊",
          title: "More data needed",
          message:
            "Keep completing your daily check-ins. SHIS needs several days of data before it can identify meaningful wellbeing patterns.",
        },
      ];
    }

    const detectedInsights = [];

    /*
      Use the most recent three days that contain
      evening check-ins.
    */

    const recentDays = eveningDays.slice(-3);

    const recentStress = getNumericValues(
      recentDays,
      "stress_level"
    );

    const recentAcademicPressure = getNumericValues(
      recentDays,
      "academic_pressure"
    );

    const recentEnergy = getNumericValues(
      recentDays,
      "energy_level"
    );

    const recentDayRatings = getDayRatings(recentDays);

    /*
      --------------------------------------------------
      1. STRESS
      --------------------------------------------------
    */

    if (recentStress.length === 3) {
      const highStressDays = recentStress.filter(
        (value) => value >= 3
      ).length;

      if (highStressDays === 3) {
        detectedInsights.push({
          type: "attention",
          icon: "🧠",
          title: "Stress has remained elevated",
          message:
            "Your recent evening check-ins show elevated stress levels across several days.",
        });
      }
    }

    /*
      --------------------------------------------------
      2. ACADEMIC PRESSURE
      --------------------------------------------------
    */

    if (recentAcademicPressure.length === 3) {
      const highPressureDays =
        recentAcademicPressure.filter(
          (value) => value >= 3
        ).length;

      if (highPressureDays === 3) {
        detectedInsights.push({
          type: "attention",
          icon: "📚",
          title:
            "Academic pressure has remained elevated",
          message:
            "Your recent check-ins show higher academic pressure across several days.",
        });
      }
    }

    /*
      --------------------------------------------------
      3. ENERGY
      --------------------------------------------------
    */

    if (recentEnergy.length === 3) {
      const lowEnergyDays = recentEnergy.filter(
        (value) => value <= 2
      ).length;

      if (lowEnergyDays === 3) {
        detectedInsights.push({
          type: "attention",
          icon: "⚡",
          title: "Energy levels have been lower",
          message:
            "Your recent evening check-ins show lower energy levels across several days.",
        });
      }
    }

    /*
      --------------------------------------------------
      4. DAY RATING
      --------------------------------------------------
    */

    if (recentDayRatings.length === 3) {
      const lowerRatedDays = recentDayRatings.filter(
        (value) => value <= 2
      ).length;

      if (lowerRatedDays === 3) {
        detectedInsights.push({
          type: "attention",
          icon: "⭐",
          title: "Day ratings have been lower",
          message:
            "Your recent night check-ins show lower overall day ratings across several days.",
        });
      }
    }

    /*
      --------------------------------------------------
      COMBINED DAILY PATTERNS
      --------------------------------------------------
    */

    /*
      PATTERN 1:
      Academic pressure + low energy
    */

    const academicEnergyDays = recentDays.filter(
      (day) =>
        day.evening &&
        Number(day.evening.academic_pressure) >= 3 &&
        Number(day.evening.energy_level) <= 2
    );

    if (academicEnergyDays.length === 3) {
      detectedInsights.push({
        type: "pattern",
        icon: "🔄",
        title:
          "Academic pressure and energy may be connected",
        message:
          "Across your recent evening check-ins, higher academic pressure has appeared alongside lower energy levels.",
      });
    }

    /*
      PATTERN 2:
      Stress + low energy
    */

    const stressEnergyDays = recentDays.filter(
      (day) =>
        day.evening &&
        Number(day.evening.stress_level) >= 3 &&
        Number(day.evening.energy_level) <= 2
    );

    if (stressEnergyDays.length === 3) {
      detectedInsights.push({
        type: "pattern",
        icon: "🧠",
        title:
          "Stress and energy show a repeated pattern",
        message:
          "Your recent check-ins show higher stress appearing alongside lower energy levels.",
      });
    }

    /*
      PATTERN 3:
      Stress + low day rating
    */

    const stressDayRatingDays = recentDays.filter(
      (day) =>
        day.evening &&
        day.night &&
        Number(day.evening.stress_level) >= 3 &&
        Number(day.night.day_rating) <= 2
    );

    if (stressDayRatingDays.length === 3) {
      detectedInsights.push({
        type: "pattern",
        icon: "🌙",
        title:
          "Stress and day rating show a repeated pattern",
        message:
          "Higher stress has appeared alongside lower overall day ratings in your recent check-ins.",
      });
    }

    /*
      PATTERN 4:
      Academic pressure + low day rating
    */

    const academicDayRatingDays =
      recentDays.filter(
        (day) =>
          day.evening &&
          day.night &&
          Number(day.evening.academic_pressure) >= 3 &&
          Number(day.night.day_rating) <= 2
      );

    if (academicDayRatingDays.length === 3) {
      detectedInsights.push({
        type: "pattern",
        icon: "📚",
        title:
          "Academic pressure and day rating show a repeated pattern",
        message:
          "Higher academic pressure has appeared alongside lower overall day ratings in your recent check-ins.",
      });
    }

    /*
      PATTERN 5:
      Multiple signals together
    */

    const multipleSignalDays =
      recentDays.filter(
        (day) =>
          day.evening &&
          Number(day.evening.stress_level) >= 3 &&
          Number(day.evening.academic_pressure) >= 3 &&
          Number(day.evening.energy_level) <= 2
      );

    if (multipleSignalDays.length === 3) {
      detectedInsights.push({
        type: "pattern",
        icon: "🔎",
        title:
          "Several wellbeing signals are appearing together",
        message:
          "Your recent check-ins show higher stress and academic pressure alongside lower energy. SHIS will continue monitoring whether this pattern persists.",
      });
    }

    /*
      --------------------------------------------------
      MORNING SIGNAL
      --------------------------------------------------
    */

    const recentMorningDays = recentDays.filter(
      (day) => day.morning
    );

    const poorSleepDays = recentMorningDays.filter(
      (day) =>
        day.morning.sleep_quality === "Poor" ||
        day.morning.sleep_quality === "Okay"
    ).length;

    const lowRestDays = recentMorningDays.filter(
      (day) =>
        day.morning.rested_feeling ===
          "Not rested" ||
        day.morning.rested_feeling ===
          "A little tired"
    ).length;

    /*
      PATTERN 6:
      Poor sleep + low energy
    */

    const sleepEnergyDays = recentDays.filter(
      (day) =>
        day.morning &&
        day.evening &&
        (
          day.morning.sleep_quality === "Poor" ||
          day.morning.sleep_quality === "Okay"
        ) &&
        (
          day.morning.rested_feeling ===
            "Not rested" ||
          day.morning.rested_feeling ===
            "A little tired"
        ) &&
        Number(day.evening.energy_level) <= 2
    );

    if (
      recentMorningDays.length === 3 &&
      poorSleepDays >= 2 &&
      lowRestDays >= 2 &&
      sleepEnergyDays.length >= 2
    ) {
      detectedInsights.push({
        type: "pattern",
        icon: "💤",
        title: "Sleep and energy may be related",
        message:
          "Recent morning check-ins show poorer rest appearing alongside lower evening energy levels.",
      });
    }

    /*
      --------------------------------------------------
      POSITIVE RESULT
      --------------------------------------------------
    */

    if (detectedInsights.length === 0) {
      detectedInsights.push({
        type: "positive",
        icon: "🌱",
        title: "No repeated concern detected",
        message:
          "Your recent check-ins do not currently show a repeated pattern that needs attention.",
      });
    }

    return detectedInsights;
  }

  /*
    --------------------------------------------------
    LOADING STATE
    --------------------------------------------------
  */

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <div style={styles.titleRow}>
              <span style={styles.headerIcon}>
                ✨
              </span>

              <h2 style={styles.title}>
                Trend Insights
              </h2>
            </div>

            <p style={styles.description}>
              Looking for patterns in your recent
              check-ins.
            </p>
          </div>

          <span style={styles.badge}>
            Analysing
          </span>
        </div>

        <div style={styles.loadingBox}>
          <div style={styles.loadingDot}></div>

          <span>
            Analysing your recent check-ins...
          </span>
        </div>
      </div>
    );
  }

  /*
    --------------------------------------------------
    ERROR STATE
    --------------------------------------------------
  */

  if (message) {
    return (
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <div style={styles.titleRow}>
              <span style={styles.headerIcon}>
                ✨
              </span>

              <h2 style={styles.title}>
                Trend Insights
              </h2>
            </div>
          </div>
        </div>

        <div style={styles.messageBox}>
          {message}
        </div>
      </div>
    );
  }

  /*
    --------------------------------------------------
    MAIN UI
    --------------------------------------------------
  */

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.titleRow}>
            <span style={styles.headerIcon}>
              ✨
            </span>

            <h2 style={styles.title}>
              Trend Insights
            </h2>
          </div>

          <p style={styles.description}>
            SHIS looks at repeated patterns across
            your recent check-ins.
          </p>
        </div>

        <span style={styles.badge}>
          Insight engine
        </span>
      </div>

      <div style={styles.divider}></div>

      <div style={styles.insightList}>
        {insights.map((insight, index) => {
          const theme =
            insight.type === "attention"
              ? styles.attention
              : insight.type === "pattern"
              ? styles.pattern
              : insight.type === "positive"
              ? styles.positive
              : styles.info;

          return (
            <div
              key={index}
              style={{
                ...styles.insight,
                background: theme.background,
                borderColor: theme.border,
              }}
            >
              <div
                style={{
                  ...styles.icon,
                  background:
                    theme.iconBackground,
                }}
              >
                {insight.icon}
              </div>

              <div style={styles.content}>
                <h3 style={styles.insightTitle}>
                  {insight.title}
                </h3>

                <p style={styles.insightMessage}>
                  {insight.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <span>ℹ️</span>

        <span>
          These are patterns in your check-in data,
          not medical diagnoses.
        </span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid #e6eaf0",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow:
      "0 4px 16px rgba(15, 23, 42, 0.05)",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  headerIcon: {
    fontSize: "22px",
  },

  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#172033",
  },

  description: {
    margin: "8px 0 0 32px",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  badge: {
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#f3f6fb",
    color: "#526174",
    fontSize: "12px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  divider: {
    height: "1px",
    background: "#edf0f4",
    margin: "20px 0",
  },

  insightList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  insight: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid",
  },

  icon: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  content: {
    flex: 1,
  },

  insightTitle: {
    margin: "1px 0 5px",
    color: "#172033",
    fontSize: "15px",
    fontWeight: 700,
  },

  insightMessage: {
    margin: 0,
    color: "#5f6b7a",
    fontSize: "14px",
    lineHeight: 1.55,
  },

  loadingBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px",
    padding: "16px",
    borderRadius: "12px",
    background: "#f7f9fc",
    color: "#667085",
    fontSize: "14px",
  },

  loadingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#6b7280",
  },

  messageBox: {
    marginTop: "20px",
    padding: "16px",
    borderRadius: "12px",
    background: "#f7f9fc",
    color: "#667085",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  footer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "18px",
    paddingTop: "16px",
    borderTop: "1px solid #edf0f4",
    color: "#7a8492",
    fontSize: "12px",
    lineHeight: 1.4,
  },

  info: {
    background: "#f7f9fc",
    border: "#e4e9f0",
    iconBackground: "#e9eef5",
  },

  attention: {
    background: "#fff8f3",
    border: "#f5dfce",
    iconBackground: "#ffeadb",
  },

  pattern: {
    background: "#f5f7ff",
    border: "#dfe4f7",
    iconBackground: "#e7ebff",
  },

  positive: {
    background: "#f3faf6",
    border: "#dcefe4",
    iconBackground: "#e3f4e9",
  },
};

export default TrendInsights;