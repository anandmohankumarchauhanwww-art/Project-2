
import { useState } from "react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "profile", label: "Student Profile", icon: "👤" },
    { id: "checkin", label: "Health Check-in", icon: "📝" },
    { id: "history", label: "Health History", icon: "📊" },
    { id: "report", label: "Monthly Report", icon: "📄" },
  ];

  function renderPage() {
    if (activePage === "profile") {
      return (
        <section className="page-content">
          <h1>Student Profile</h1>
          <p className="page-subtitle">
            Manage your basic student information.
          </p>

          <div className="content-card">
            <h2>Profile Information</h2>

            <div className="profile-grid">
              <div>
                <span className="field-label">Student Name</span>
                <strong>Anand Kumar</strong>
              </div>

              <div>
                <span className="field-label">Department</span>
                <strong>Biomedical Engineering</strong>
              </div>

              <div>
                <span className="field-label">Academic Year</span>
                <strong>Second Year</strong>
              </div>

              <div>
                <span className="field-label">Student ID</span>
                <strong>SHIS-001</strong>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (activePage === "checkin") {
      return (
        <section className="page-content">
          <h1>Health Check-in</h1>
          <p className="page-subtitle">
            Record your health and lifestyle information.
          </p>

          <div className="content-card">
            <h2>Today's Check-in</h2>

            <label>Sleep Hours</label>
            <input type="number" placeholder="Enter sleep hours" />

            <label>Stress Level</label>
            <select>
              <option>Select stress level</option>
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>

            <label>Mood</label>
            <select>
              <option>Select your mood</option>
              <option>Very good</option>
              <option>Good</option>
              <option>Okay</option>
              <option>Bad</option>
              <option>Very bad</option>
            </select>

            <label>Additional Notes</label>
            <textarea placeholder="Write any additional information..." />

            <button className="primary-button">Save Check-in</button>
          </div>
        </section>
      );
    }

    if (activePage === "history") {
      return (
        <section className="page-content">
          <h1>Health History</h1>
          <p className="page-subtitle">
            Review your previous health check-ins.
          </p>

          <div className="content-card">
            <h2>Recent Records</h2>

            <div className="history-row">
              <span>September 2026</span>
              <span className="status good">Completed</span>
            </div>

            <div className="history-row">
              <span>August 2026</span>
              <span className="status good">Completed</span>
            </div>

            <div className="history-row">
              <span>July 2026</span>
              <span className="status pending">Sample Data</span>
            </div>
          </div>
        </section>
      );
    }

    if (activePage === "report") {
      return (
        <section className="page-content">
          <h1>Monthly Report</h1>
          <p className="page-subtitle">
            Understand your monthly health patterns.
          </p>

          <div className="content-card">
            <h2>September Summary</h2>
            <p>
              Your monthly report will show changes in sleep, stress, mood,
              physical activity, and other health indicators.
            </p>

            <div className="report-highlight">
              Report analysis will be connected after the database is added.
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="page-content">
        <div className="welcome-section">
          <div>
            <p className="small-heading">STUDENT HEALTH INTELLIGENCE SYSTEM</p>
            <h1>Welcome back, Anand 👋</h1>
            <p className="page-subtitle">
              Track your health, understand your patterns, and build better
              habits.
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
          <div className="stat-card">
            <span className="stat-icon">😴</span>
            <p>Average Sleep</p>
            <h2>7.2 hrs</h2>
            <span className="positive-text">Healthy range</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🧠</span>
            <p>Stress Level</p>
            <h2>Moderate</h2>
            <span className="warning-text">Needs attention</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🏃</span>
            <p>Activity Days</p>
            <h2>4 days</h2>
            <span className="positive-text">This week</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <p>Check-ins</p>
            <h2>12</h2>
            <span className="positive-text">Total records</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="content-card">
            <h2>Health Overview</h2>
            <p className="card-description">
              Your current health indicators.
            </p>

            <div className="progress-item">
              <div className="progress-heading">
                <span>Sleep Quality</span>
                <strong>78%</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "78%" }} />
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-heading">
                <span>Physical Activity</span>
                <strong>65%</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "65%" }} />
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-heading">
                <span>Stress Management</span>
                <strong>52%</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "52%" }} />
              </div>
            </div>
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

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">❤</div>
          <div>
            <h2>SHIS</h2>
            <span>Student Health</span>
          </div>
        </div>

        <nav className="navigation">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p>Project Version</p>
          <strong>Day 1 Prototype</strong>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="topbar-title">Student Portal</span>
          </div>

          <div className="user-info">
            <div className="user-avatar">A</div>
            <div>
              <strong>Anand</strong>
              <span>Student</span>
            </div>
          </div>
        </header>

        {renderPage()}
      </main>
    </div>
  );
}

export default App;