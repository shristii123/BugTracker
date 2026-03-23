import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBugs, updateStatus } from '../store/bugsSlice';
import Badge from '../components/Badge';
import './BugsPage.css';

const BugsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((s) => s.bugs);
  const user = useAppSelector((s) => s.auth.user);
  const isDeveloper = user?.role === 'Developer';
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchBugs(search || undefined)), 300);
    return () => clearTimeout(t);
  }, [search, dispatch]);

  const statuses = ['Open', 'InProgress', 'Resolved', 'Closed'];

  return (
    <div className="bugs-page">
      <div className="bugs-header">
        <h1>All Bugs</h1>
        <div className="search-wrap">
          <span className="s-icon">⌕</span>
          <input
            className="search-inp"
            placeholder="Search by title, status, severity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="s-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      {loading ? (
        <div className="center-msg">Loading bugs...</div>
      ) : list.length === 0 ? (
        <div className="center-msg">No bugs found.</div>
      ) : (
        <div className="table-wrap">
          <table className="bugs-table">
            <thead>
              <tr>
                <th>#</th><th>Title</th><th>Severity</th><th>Status</th>
                <th>Reporter</th><th>Assignee</th><th>Created</th>
                {isDeveloper && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {list.map((bug) => (
                <tr key={bug.id}>
                  <td className="id-cell">{bug.id}</td>
                  <td className="title-cell">{bug.title}</td>
                  <td><Badge label={bug.severity} /></td>
                  <td><Badge label={bug.status} /></td>
                  <td>{bug.reporterName}</td>
                  <td>{bug.assigneeName ?? <span className="unassigned">Unassigned</span>}</td>
                  <td>{new Date(bug.createdAt).toLocaleDateString()}</td>
                  {isDeveloper && (
                    <td>
                      {bug.assigneeName ? (
                        <select
                          className="status-select"
                          value={bug.status}
                          onChange={(e) => dispatch(updateStatus({ id: bug.id, status: e.target.value }))}
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className="na-text">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BugsPage;
