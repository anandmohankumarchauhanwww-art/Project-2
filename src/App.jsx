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

  // -----------------------------------------
  // AUTHENTICATION
  // -----------------------------------------

  useEffect(() => {
    async function initializeApp() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);

      if (!session) {
        setLoading(false);
        return;
      }

      await determineStartPage(session.user.id);

      setLoading(false);
    }

    initializeApp();

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

  // -----------------------------------------
  // CHECK ONBOARDING WHEN SESSION CHANGES
  // -----------------------------------------

  useEffect(() => {
    if (!session) {
      return;
    }

    async function checkOnboarding() {
      await determineStartPage(session.user.id);
    }

    checkOnboarding();
  }, [session]);

  // -----------------------------------------
  // DETERMINE WHERE USER SHOULD GO
  // -----------------------------------------

  async function determineStartPage(userId) {
    try {
      // Check Student Profile
      const { data: profile, error: profileError } =
        await supabase
          .from("student_profiles")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

      if (profileError) {
        console.error(
          "Profile check error:",
          profileError
        );

        return;
      }

      // Profile does not exist
      if (!profile) {
        setActivePage("profile");
        return;
      }

      // Check Baseline
      const { data: baseline, error: baselineError } =
        await supabase
          .from("baseline_assessments")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

      if (baselineError) {
        console.error(
          "Baseline check error:",
          baselineError
        );

        return;
      }

      // Baseline does not exist
      if (!baseline) {
        setActivePage("baseline");
        return;
      }

      // Everything is completed
      setActivePage("dashboard");
    } catch (error) {
      console.error(
        "Onboarding check failed:",
        error
      );
    }
  }

  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------

  async function handleLogout() {
    await supabase.auth.signOut();

    setSession(null);
    setActivePage("dashboard");
  }

  // -----------------------------------------
  // PAGE ROUTING
  // -----------------------------------------

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            setActivePage={setActivePage}
          />
        );

      case "profile":
        return (
          <Profile
            setActivePage={setActivePage}
          />
        );

      case "baseline":
        return (
          <Baseline
            setActivePage={setActivePage}
          />
        );

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

  // -----------------------------------------
  // LOADING SCREEN
  // -----------------------------------------

  if (loading) {
    return (
      <div className="loading-screen">
        Loading Student Health System...
      </div>
    );
  }

  // -----------------------------------------
  // NOT LOGGED IN
  // -----------------------------------------

  if (!session) {
    return <Login />;
  }

  // -----------------------------------------
  // MAIN APPLICATION
  // -----------------------------------------

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