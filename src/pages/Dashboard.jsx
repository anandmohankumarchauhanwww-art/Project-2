import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";

function Dashboard({ setActivePage }) {
  return (
    <section className="page-content">

      <div className="welcome-section">
        <div>
          <p className="small-heading">
            STUDENT HEALTH INTELLIGENCE SYSTEM
          </p>

          <h1>
            Welcome back, Anand 👋
          </h1>

          <p className="page-subtitle">
            Track your health, understand your patterns,
            and build better habits.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setActivePage("checkin")}
        >
          + New Check-in
        </button>
      </div>

      <div className="stats-grid">

        <StatCard
          icon="😴"
          title="Average Sleep"
          value="7.2 hrs"
          message="Healthy range"
          messageType="positive-text"
        />

        <StatCard
          icon="🧠"
          title="Stress Level"
          value="Moderate"
          message="Needs attention"
          messageType="warning-text"
        />

        <StatCard
          icon="🏃"
          title="Activity Days"
          value="4 days"
          message="This week"
          messageType="positive-text"
        />

        <StatCard
          icon="📅"
          title="Check-ins"
          value="12"
          message="Total records"
          messageType="positive-text"
        />

      </div>

      <div className="dashboard-grid">

        <div className="content-card">

          <h2>Health Overview</h2>

          <p className="card-description">
            Your current health indicators.
          </p>

          <ProgressBar
            title="Sleep Quality"
            percentage={78}
          />

          <ProgressBar
            title="Physical Activity"
            percentage={65}
          />

          <ProgressBar
            title="Stress Management"
            percentage={52}
          />

        </div>

        <div className="content-card">

          <h2>Quick Actions</h2>

          <p className="card-description">
            Continue managing your health information.
          </p>

          <button
            className="quick-action"
            onClick={() => setActivePage("checkin")}
          >
            📝 Complete health check-in
          </button>

          <button
            className="quick-action"
            onClick={() => setActivePage("history")}
          >
            📊 View health history
          </button>

          <button
            className="quick-action"
            onClick={() => setActivePage("report")}
          >
            📄 Open monthly report
          </button>

        </div>

      </div>

    </section>
  );
}

export default Dashboard;