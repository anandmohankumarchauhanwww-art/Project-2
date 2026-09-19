import { useState } from "react";

import "./App.css";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CheckIn from "./pages/CheckIn";
import History from "./pages/History";
import Report from "./pages/Report";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  function renderPage() {
    switch (activePage) {
      case "profile":
        return <Profile />;

      case "checkin":
        return <CheckIn />;

      case "history":
        return <History />;

      case "report":
        return <Report />;

      default:
        return (
          <Dashboard
            setActivePage={setActivePage}
          />
        );
    }
  }

  return (
    <div className="app-container">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">

        <Topbar />

        {renderPage()}

      </main>

    </div>
  );
}

export default App;