import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBugs } from '../store/bugsSlice';
import Badge from '../components/Badge';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((s) => s.bugs);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => { dispatch(fetchBugs(undefined)); }, [dispatch]);

  const stats = [
    { label: 'Total Bugs', value: list.length, color: '#6366f1' },
    { label: 'Open', value: list.filter(b => b.status === 'Open').length, color: '#60a5fa' },
    { label: 'In Progress', value: list.filter(b => b.status === 'InProgress').length, color: '#a5b4fc' },
    { label: 'Resolved', value: list.filter(b => b.status === 'Resolved').length, color: '#4ade80' },
  ];

  const recent = list.slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Welcome, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="dash-sub">Here's what's happening in your bug tracker today.</p>
        </div>
        <Link to="/report" className="dash-btn">＋ Report Bug</Link>
      </div>

      <div className="stats-row">
        {stats.map((s) => (
          <div className="stat-box" key={s.label}>
            <p className="stat-num" style={{ color: s.color }}>{loading ? '—' : s.value}</p>
            <p className="stat-lbl">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="recent-section">
        <div className="section-head">
          <h2>Recent Bugs</h2>
          <Link to="/bugs" className="see-all">See all →</Link>
        </div>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="muted">No bugs reported yet. <Link to="/report">Report the first one!</Link></p>
        ) : (
          <div className="recent-list">
            {recent.map((bug) => (
              <div className="recent-item" key={bug.id}>
                <div className="recent-main">
                  <p className="recent-title">#{bug.id} — {bug.title}</p>
                  <p className="recent-meta">Reported by {bug.reporterName} · {new Date(bug.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="recent-badges">
                  <Badge label={bug.severity} />
                  <Badge label={bug.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
