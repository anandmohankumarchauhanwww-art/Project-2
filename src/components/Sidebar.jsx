function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    {
      id: "dashboard",
      icon: "🏠",
      label: "Dashboard",
    },

    {
      id: "profile",
      icon: "👤",
      label: "Student Profile",
    },

    {
      id: "baseline",
      icon: "📋",
      label: "Health Baseline",
    },

    {
      id: "checkin",
      icon: "📝",
      label: "Daily Check-in",
    },

    {
      id: "history",
      icon: "📊",
      label: "Health History",
    },

    {
      id: "report",
      icon: "📄",
      label: "Monthly Report",
    },
  ];

  return (
    <aside className="sidebar">

      {/* Brand */}

      <div className="brand">
        <div className="brand-logo">
          ❤️
        </div>

        <div>
          <h2>SHIS</h2>
          <span>Student Health</span>
        </div>
      </div>

      {/* Navigation */}

      <nav className="navigation">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${
              activePage === item.id ? "active" : ""
            }`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Sidebar information */}

      <div className="sidebar-bottom">

        <div className="sidebar-status">
          <span className="status-dot"></span>

          <div>
            <strong>System Active</strong>
            <small>Health data protected</small>
          </div>
        </div>

        <div className="sidebar-footer-text">
          Student Health Intelligence System
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;