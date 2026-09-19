function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "🏠",
    },
    {
      id: "profile",
      label: "Student Profile",
      icon: "👤",
    },
    {
      id: "checkin",
      label: "Health Check-in",
      icon: "📝",
    },
    {
      id: "history",
      label: "Health History",
      icon: "📊",
    },
    {
      id: "report",
      label: "Monthly Report",
      icon: "📄",
    },
  ];

  return (
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
        <strong>Day 2 Development</strong>
      </div>
    </aside>
  );
}

export default Sidebar;