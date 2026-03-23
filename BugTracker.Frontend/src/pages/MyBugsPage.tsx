import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchMyBugs } from '../store/bugsSlice';
import Badge from '../components/Badge';
import './BugsPage.css';

const MyBugsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myBugs, loading } = useAppSelector((s) => s.bugs);

  useEffect(() => { dispatch(fetchMyBugs()); }, [dispatch]);

  return (
    <div className="bugs-page">
      <div className="bugs-header">
        <h1>My Reports</h1>
      </div>

      {loading ? (
        <div className="center-msg">Loading...</div>
      ) : myBugs.length === 0 ? (
        <div className="center-msg">You haven't reported any bugs yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="bugs-table">
            <thead>
              <tr>
                <th>#</th><th>Title</th><th>Severity</th><th>Status</th><th>Assignee</th><th>Created</th>
              </tr>
            </thead>
            <tbody>
              {myBugs.map((bug) => (
                <tr key={bug.id}>
                  <td className="id-cell">{bug.id}</td>
                  <td className="title-cell">{bug.title}</td>
                  <td><Badge label={bug.severity} /></td>
                  <td><Badge label={bug.status} /></td>
                  <td>{bug.assigneeName ?? <span className="unassigned">Unassigned</span>}</td>
                  <td>{new Date(bug.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBugsPage;
