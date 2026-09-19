function CheckIn() {
  return (
    <section className="page-content">

      <h1>Health Check-in</h1>

      <p className="page-subtitle">
        Record your health and lifestyle information.
      </p>

      <div className="content-card">

        <h2>Today's Check-in</h2>

        <label>
          Sleep Hours
        </label>

        <input
          type="number"
          placeholder="Enter sleep hours"
        />

        <label>
          Stress Level
        </label>

        <select>
          <option>
            Select stress level
          </option>

          <option>
            Low
          </option>

          <option>
            Moderate
          </option>

          <option>
            High
          </option>
        </select>

        <label>
          Mood
        </label>

        <select>
          <option>
            Select your mood
          </option>

          <option>
            Very good
          </option>

          <option>
            Good
          </option>

          <option>
            Okay
          </option>

          <option>
            Bad
          </option>

          <option>
            Very bad
          </option>
        </select>

        <label>
          Additional Notes
        </label>

        <textarea
          placeholder="Write any additional information..."
        />

        <button className="primary-button">
          Save Check-in
        </button>

      </div>

    </section>
  );
}

export default CheckIn;