import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Profile({ setActivePage }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    enrollmentNumber: "",
    age: "",
    gender: "",
    program: "",
    branch: "",
    yearOfStudy: "",
    studentType: "",
    height: "",
    weight: "",
    waist: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data) {
      setFormData({
        fullName: data.full_name || "",
        enrollmentNumber: data.enrollment_number || "",
        age: data.age || "",
        gender: data.gender || "",
        program: data.program || "",
        branch: data.branch || "",
        yearOfStudy: data.year_of_study || "",
        studentType: data.student_type || "",
        height: data.height_cm || "",
        weight: data.weight_kg || "",
        waist: data.waist_cm || "",
      });
    }

    setLoading(false);
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You are not logged in.");
      setSaving(false);
      return;
    }

    const profileData = {
      user_id: user.id,
      full_name: formData.fullName,
      enrollment_number: formData.enrollmentNumber,
      age: Number(formData.age),
      gender: formData.gender,
      program: formData.program,
      branch: formData.branch,
      year_of_study: Number(formData.yearOfStudy),
      student_type: formData.studentType,
      height_cm: Number(formData.height),
      weight_kg: Number(formData.weight),
      waist_cm: formData.waist ? Number(formData.waist) : null,
    };

    const { error } = await supabase
      .from("student_profiles")
      .upsert(profileData, {
        onConflict: "user_id",
      });

    if (error) {
      console.error(error);
      setMessage("Could not save your profile.");
      setSaving(false);
      return;
    }

    setMessage("Profile saved successfully.");
    setTimeout(() => {
      setActivePage("baseline");
    }, 500);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="profile-loading">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* PAGE HEADER */}
      <div className="profile-header">
        <div className="profile-header-icon">👤</div>

        <div>
          <h1>Student Profile</h1>
          <p>
            Tell us a little about yourself. This helps SHIS understand
            your health profile.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">

        {/* PERSONAL INFORMATION */}
        <section className="profile-card">
          <div className="profile-section-header">
            <div className="section-icon personal-icon">👤</div>

            <div>
              <h2>Personal Information</h2>
              <p>Basic information about you and your studies.</p>
            </div>
          </div>

          <div className="profile-grid four-columns">

            <div className="profile-field">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="profile-field">
              <label>Enrollment Number</label>
              <input
                type="text"
                name="enrollmentNumber"
                value={formData.enrollmentNumber}
                onChange={handleChange}
                placeholder="e.g. 23BME001"
                required
              />
            </div>

            <div className="profile-field">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 21"
                required
              />
            </div>

            <div className="profile-field">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">
                  Prefer not to say
                </option>
              </select>
            </div>

          </div>
        </section>

        {/* ACADEMIC INFORMATION */}
        <section className="profile-card">
          <div className="profile-section-header">
            <div className="section-icon academic-icon">🎓</div>

            <div>
              <h2>Academic Information</h2>
              <p>Your academic details at the university.</p>
            </div>
          </div>

          <div className="profile-grid three-columns">

            <div className="profile-field">
              <label>Program</label>
              <input
                type="text"
                name="program"
                value={formData.program}
                onChange={handleChange}
                placeholder="e.g. B.Tech"
                required
              />
            </div>

            <div className="profile-field">
              <label>Branch</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="e.g. Biomedical Engineering"
                required
              />
            </div>

            <div className="profile-field">
              <label>Year of Study</label>
              <select
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleChange}
                required
              >
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

          </div>
        </section>

        {/* STUDENT CONTEXT */}
        <section className="profile-card">
          <div className="profile-section-header">
            <div className="section-icon context-icon">👥</div>

            <div>
              <h2>Student Context</h2>
              <p>Your student type and living situation.</p>
            </div>
          </div>

          <div className="profile-grid one-column">

            <div className="profile-field">
              <label>Student Type</label>
              <select
                name="studentType"
                value={formData.studentType}
                onChange={handleChange}
                required
              >
                <option value="">Select student type</option>
                <option value="Hosteller">Hosteller</option>
                <option value="Day Scholar">Day Scholar</option>
              </select>
            </div>

          </div>
        </section>

        {/* BODY MEASUREMENTS */}
        <section className="profile-card">
          <div className="profile-section-header">
            <div className="section-icon body-icon">❤️</div>

            <div>
              <h2>Body Measurements</h2>
              <p>
                These measurements help SHIS understand your body
                composition.
              </p>
            </div>
          </div>

          <div className="profile-grid three-columns">

            <div className="profile-field">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g. 170"
                required
              />
            </div>

            <div className="profile-field">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 65"
                required
              />
            </div>

            <div className="profile-field">
              <label>
                Waist Circumference (cm)
                <span className="optional-label"> — Optional</span>
              </label>

              <input
                type="number"
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                placeholder="e.g. 80"
              />
            </div>

          </div>
        </section>

        {/* SAVE */}
        <button
          type="submit"
          className="profile-save-button"
          disabled={saving}
        >
          {saving ? "Saving..." : "💾  Save Profile"}
        </button>

        {message && (
          <div className="profile-message">
            {message}
          </div>
        )}

      </form>
    </div>
  );
}

export default Profile;