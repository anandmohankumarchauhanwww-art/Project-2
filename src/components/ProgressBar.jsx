function ProgressBar({ title, percentage }) {
  return (
    <div className="progress-item">
      <div className="progress-heading">
        <span>{title}</span>
        <strong>{percentage}%</strong>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;