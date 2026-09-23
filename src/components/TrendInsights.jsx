import { useEffect, useState } from "react";

import { supabase } from "../lib/supabaseClient";

import {
  detectTrendInsights,
  SHIS_INTELLIGENCE_DISCLAIMER,
} from "../utils/shisIntelligence";

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
      setMessage(
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
        ascending: true,
      });

    if (error) {
      console.error(
        "Error loading trend data:",
        error
      );

      setMessage(
        "Could not load enough data to detect trends."
      );

      setLoading(false);

      return;
    }

    const trendInsights =
      detectTrendInsights(data || []);

    setInsights(trendInsights);

    setLoading(false);
  }

  /* --------------------------------------------------
     LOADING STATE
  -------------------------------------------------- */

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

  /* --------------------------------------------------
     ERROR STATE
  -------------------------------------------------- */

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

  /* --------------------------------------------------
     MAIN UI
  -------------------------------------------------- */

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
          {SHIS_INTELLIGENCE_DISCLAIMER}
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