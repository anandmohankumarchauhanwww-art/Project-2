import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Topbar() {
  const [studentName, setStudentName] = useState("Student");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Student";

      setStudentName(name);
    }

    loadUser();
  }, []);

  const firstLetter = studentName.charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-title">
        Student Portal
      </div>

      <div className="user-info">
        <div className="user-avatar">
          {firstLetter}
        </div>

        <div>
          <strong>{studentName}</strong>
          <span>Student</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;