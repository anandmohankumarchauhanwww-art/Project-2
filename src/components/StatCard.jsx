function StatCard({ icon, title, value, message, messageType }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>

      <p>{title}</p>

      <h2>{value}</h2>

      <span className={messageType}>
        {message}
      </span>
    </div>
  );
}

export default StatCard;