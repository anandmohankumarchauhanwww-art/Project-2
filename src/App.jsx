import { useEffect, useState } from "react";

import { supabase } from "./lib/supabaseClient";

import "./App.css";

import Sidebar from "./components/Sidebar";

import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";

import Profile from "./pages/Profile";

import Baseline from "./pages/Baseline";

import CheckIn from "./pages/CheckIn";

import History from "./pages/History";

import Report from "./pages/Report";

import Login from "./pages/Login";

function App() {
  const [session, setSession] = useState(null);

  const [loading, setLoading] = useState(true);

  const [activePage, setActivePage] = useState("dashboard");

  // --------------------------------
  // Authentication
  // --------------------------------

  useEffect(() => {
    async function getInitialSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    }

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // --------------------------------
  // Logout
  // --------------------------------

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // --------------------------------
  // Page navigation
  // --------------------------------

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            setActivePage={setActivePage}
          />
        );

      case "profile":
        return <Profile />;

      case "baseline":
        return <Baseline />;

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

  // --------------------------------
  // Loading
  // --------------------------------

  if (loading) {
    return (
      <div className="loading-screen">
        Loading Student Health Intelligence System...
      </div>
    );
  }

  // --------------------------------
  // Not logged in
  // --------------------------------

  if (!session) {
    return <Login />;
  }

  // --------------------------------
  // Logged in
  // --------------------------------

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
        <Topbar />

        <div className="page-content">
          {renderPage()}
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </main>
    </div>
  );
}

export default App;