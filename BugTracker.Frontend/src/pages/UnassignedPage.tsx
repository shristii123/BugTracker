import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchUnassigned, assignToMe } from '../store/bugsSlice';
import Badge from '../components/Badge';
import './BugsPage.css';

const UnassignedPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { unassigned, loading } = useAppSelector((s) => s.bugs);
  const [search, setSearch] = useState('');
  const [assigning, setAssigning] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchUnassigned(search || undefined)), 300);
    return () => clearTimeout(t);
  }, [search, dispatch]);

  const handleAssign = async (id: number) => {
    setAssigning(id);
    await dispatch(assignToMe(id));
    setAssigning(null);
  };

  return (
    <div className="bugs-page">
      <div className="bugs-header">
        <h1>Unassigned Bugs</h1>
        <div className="search-wrap">
          <span className="s-icon">⌕</span>
          <input
            className="search-inp"
            placeholder="Search by title, severity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="s-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      {loading ? (
        <div className="center-msg">Loading...</div>
      ) : unassigned.length === 0 ? (
        <div className="center-msg">No unassigned bugs. 🎉</div>
      ) : (
        <div className="table-wrap">
          <table className="bugs-table">
            <thead>
              <tr>
                <th>#</th><th>Title</th><th>Severity</th><th>Reporter</th><th>Created</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {unassigned.map((bug) => (
                <tr key={bug.id}>
                  <td className="id-cell">{bug.id}</td>
                  <td className="title-cell">{bug.title}</td>
                  <td><Badge label={bug.severity} /></td>
                  <td>{bug.reporterName}</td>
                  <td>{new Date(bug.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="assign-btn"
                      onClick={() => handleAssign(bug.id)}
                      disabled={assigning === bug.id}
                    >
                      {assigning === bug.id ? 'Assigning...' : 'Assign to Me'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UnassignedPage;
