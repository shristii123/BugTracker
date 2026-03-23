import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './hooks/redux';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import BugsPage from './pages/BugsPage';
import ReportBugPage from './pages/ReportBugPage';
import MyBugsPage from './pages/MyBugsPage';
import UnassignedPage from './pages/UnassignedPage';
import './App.css';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-area">
        <div className="page-wrap">{children}</div>
      </main>
    </div>
  );
};

const DeveloperOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAppSelector((s) => s.auth.user);
  if (user?.role !== 'Developer') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/bugs" element={<ProtectedLayout><BugsPage /></ProtectedLayout>} />
      <Route path="/report" element={<ProtectedLayout><ReportBugPage /></ProtectedLayout>} />
      <Route path="/my-bugs" element={<ProtectedLayout><MyBugsPage /></ProtectedLayout>} />
      <Route path="/unassigned" element={
        <ProtectedLayout><DeveloperOnly><UnassignedPage /></DeveloperOnly></ProtectedLayout>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

const App: React.FC = () => (
  <Provider store={store}>
    <AppRoutes />
  </Provider>
);

export default App;
