import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/authSlice';
import './Navbar.css';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const isDeveloper = user?.role === 'Developer';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="navbar">
      <div className="nav-logo">
        <span>🐛</span>
        <span className="nav-logo-text">BugTracker</span>
      </div>

      <nav className="nav-links">
        <p className="nav-section-label">MAIN</p>
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span>⊞</span> Dashboard
        </NavLink>
        <NavLink to="/bugs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span>🐛</span> All Bugs
        </NavLink>
        <NavLink to="/report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span>＋</span> Report Bug
        </NavLink>
        <NavLink to="/my-bugs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span>◎</span> My Reports
        </NavLink>
        {isDeveloper && (
          <>
            <p className="nav-section-label" style={{ marginTop: 16 }}>DEVELOPER</p>
            <NavLink to="/unassigned" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span>📋</span> Unassigned
            </NavLink>
          </>
        )}
      </nav>

      <div className="nav-footer">
        <div className="nav-user">
          <div className="nav-avatar">{user?.fullName?.[0]?.toUpperCase() ?? 'U'}</div>
          <div className="nav-user-info">
            <p className="nav-user-name">{user?.fullName}</p>
            <p className="nav-user-role">{user?.role}</p>
          </div>
        </div>
        <button className="nav-logout" onClick={handleLogout}>Sign Out</button>
      </div>
    </aside>
  );
};

export default Navbar;
