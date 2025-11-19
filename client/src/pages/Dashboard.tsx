import { useEffect, useMemo, useState } from 'react';
import { Attempt, HistorySummary, fetchHistorySummary, fetchRecentAttempts } from '../api/history';
import './Dashboard.css';

const formatDate = (value?: string) => {
  if (!value) return 'Date unknown';
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const Dashboard = () => {
  const [summary, setSummary] = useState<HistorySummary | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, attemptData] = await Promise.all([
          fetchHistorySummary(),
          fetchRecentAttempts(5),
        ]);

        setSummary(summaryData);
        setAttempts(attemptData);
        setError(null);
      } catch (err) {
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const difficulties = useMemo(() => summary?.accuracyPerDifficulty ?? [], [summary]);
  const questionTypes = useMemo(() => summary?.accuracyByType ?? [], [summary]);

  return (
    <div className="dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Phase 5 • Practice insights</p>
          <h1>Interview Dashboard</h1>
          <p className="muted">Track practice attempts, see accuracy trends, and revisit recent sessions.</p>
        </div>
        <div className="pill">Live sync</div>
      </header>

      {error && <div className="alert">{error}</div>}

      <section className="grid">
        <article className="card highlight">
          <div className="card-header">
            <p className="muted">Total attempts</p>
          </div>
          <div className="stat-value">{summary?.totalAttempts ?? '—'}</div>
          <p className="muted small">Across all practice sessions</p>
          {summary?.isDemoData && <p className="demo-note">Demo data while API is unavailable.</p>}
        </article>

        <article className="card">
          <div className="card-header">
            <h3>Accuracy by difficulty</h3>
            <span className="muted small">How you perform by level</span>
          </div>
          <div className="segments">
            {loading && <p className="muted">Loading...</p>}
            {!loading && difficulties.length === 0 && <p className="muted">No difficulty data yet.</p>}
            {difficulties.map((segment) => (
              <div className="segment-row" key={segment.label}>
                <div className="segment-meta">
                  <span className="badge badge-difficulty">{segment.label}</span>
                </div>
                <div className="progress">
                  <span style={{ width: `${Math.min(segment.accuracy, 100)}%` }} />
                </div>
                <div className="segment-value">{segment.accuracy}%</div>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <h3>Accuracy by question type</h3>
            <span className="muted small">Where to double down next</span>
          </div>
          <div className="segments">
            {loading && <p className="muted">Loading...</p>}
            {!loading && questionTypes.length === 0 && <p className="muted">No type data yet.</p>}
            {questionTypes.map((segment) => (
              <div className="segment-row" key={segment.label}>
                <div className="segment-meta">
                  <span className="badge badge-type">{segment.label}</span>
                </div>
                <div className="progress">
                  <span style={{ width: `${Math.min(segment.accuracy, 100)}%` }} />
                </div>
                <div className="segment-value">{segment.accuracy}%</div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <div className="card-header space-between">
          <div>
            <h3>Recent attempts</h3>
            <p className="muted small">Last {attempts.length} sessions</p>
          </div>
          <span className="pill soft">Fresh data</span>
        </div>
        <div className="attempt-list">
          {loading && <p className="muted">Loading attempts...</p>}
          {!loading && attempts.length === 0 && <p className="muted">No attempts recorded yet.</p>}
          {attempts.map((attempt) => (
            <article className="attempt" key={attempt.id}>
              <div>
                <p className="attempt-title">{attempt.title}</p>
                <p className="muted small">{formatDate(attempt.createdAt)}</p>
              </div>
              <div className="attempt-tags">
                <span className="badge badge-difficulty">{attempt.difficulty}</span>
                <span className="badge badge-type">{attempt.type}</span>
                {attempt.status && <span className={`status status-${attempt.status.toLowerCase()}`}>{attempt.status}</span>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
