import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Profile() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    course: "",
    yearOfStudy: "",
    studentType: "",
    height: "",
    weight: "",
    waist: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User session not found.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else if (data) {
      setFormData({
        age: data.age ?? "",
        gender: data.gender ?? "",
        course: data.course ?? "",
        yearOfStudy: data.year_of_study ?? "",
        studentType: data.student_type ?? "",
        height: data.height_cm ?? "",
        weight: data.weight_kg ?? "",
        waist: data.waist_cm ?? "",
      });
    }

    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User session not found.");
      setSaving(false);
      return;
    }

    const profileData = {
      user_id: user.id,
      age: Number(formData.age),
      gender: formData.gender,
      course: formData.course,
      year_of_study: Number(formData.yearOfStudy),
      student_type: formData.studentType,
      height_cm: Number(formData.height),
      weight_kg: Number(formData.weight),
      waist_cm: formData.waist
        ? Number(formData.waist)
        : null,
    };

    const { error } = await supabase
      .from("student_profiles")
      .upsert(profileData, {
        onConflict: "user_id",
      });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Profile saved successfully.");
    }

    setSaving(false);
  }

  if (loading) {
    return <div className="content-card">Loading profile...</div>;
  }

  return (
    <section>
      <div className="checkin-header">
        <h1>Student Profile</h1>

        <p className="page-subtitle">
          Tell us a little about yourself. This information
          helps SHIS understand your health profile.
        </p>
      </div>

      <form className="health-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-section-header">
            <div>
              <h2>About You</h2>
              <p className="section-description">
                Basic information about you and your studies.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="15"
                max="100"
                required
              />
            </div>

            <div className="form-field">
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

            <div className="form-field">
              <label>Course / Department</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g. Biomedical Engineering"
                required
              />
            </div>

            <div className="form-field">
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
                <option value="5">5th Year</option>
              </select>
            </div>

            <div className="form-field">
              <label>Student Type</label>
              <select
                name="studentType"
                value={formData.studentType}
                onChange={handleChange}
                required
              >
                <option value="">Select type</option>
                <option value="Hosteller">Hosteller</option>
                <option value="Day Scholar">Day Scholar</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-header">
            <div>
              <h2>Body Measurements</h2>
              <p className="section-description">
                These measurements help SHIS understand your
                body composition.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g. 170"
                min="100"
                max="250"
                step="0.1"
                required
              />
            </div>

            <div className="form-field">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 65"
                min="20"
                max="300"
                step="0.1"
                required
              />
            </div>

            <div className="form-field">
              <label>
                Waist Circumference (cm)
                <span className="optional-label"> Optional</span>
              </label>

              <input
                type="number"
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                placeholder="e.g. 80"
                min="30"
                max="200"
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </form>
    </section>
  );
}

export default Profile;