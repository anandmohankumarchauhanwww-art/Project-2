function History() {
  return (
    <section className="page-content">

      <h1>Health History</h1>

      <p className="page-subtitle">
        Review your previous health check-ins.
      </p>

      <div className="content-card">

        <h2>Recent Records</h2>

        <div className="history-row">
          <span>September 2026</span>

          <span className="status good">
            Completed
          </span>
        </div>

        <div className="history-row">
          <span>August 2026</span>

          <span className="status good">
            Completed
          </span>
        </div>

        <div className="history-row">
          <span>July 2026</span>

          <span className="status pending">
            Sample Data
          </span>
        </div>

      </div>

    </section>
  );
}

export default History;