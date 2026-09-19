function Profile() {
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
            <span className="field-label">
              Student Name
            </span>

            <strong>
              Anand Kumar
            </strong>
          </div>

          <div>
            <span className="field-label">
              Department
            </span>

            <strong>
              Biomedical Engineering
            </strong>
          </div>

          <div>
            <span className="field-label">
              Academic Year
            </span>

            <strong>
              Second Year
            </strong>
          </div>

          <div>
            <span className="field-label">
              Student ID
            </span>

            <strong>
              SHIS-001
            </strong>
          </div>

        </div>

      </div>

    </section>
  );
}

export default Profile;