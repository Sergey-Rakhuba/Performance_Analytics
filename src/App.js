import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import UserEntry from './components/UserEntry';
import Analytics from './components/Analytics';
import Organizations from './components/Organizations';
import './App.css';

const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">Performance Analytics</div>

      <button className={`hamburger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        {currentUser.role === 'admin' && (
          <Link to="/admin" onClick={() => setIsOpen(false)}>Администрирование</Link>
        )}
        <Link to="/analytics" onClick={() => setIsOpen(false)}>Аналитика</Link>
        <Link to="/entry" onClick={() => setIsOpen(false)}>Ввод данных</Link>
        <Link to="/organizations" onClick={() => setIsOpen(false)}>Организации</Link>
        <button onClick={() => { logout(); setIsOpen(false); }} className="btn-logout">Выйти ({currentUser.name})</button>
      </div>
    </nav>
  );
};

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return <Navigate to="/login" />;
  if (adminOnly && currentUser.role !== 'admin') return <Navigate to="/entry" />;
  
  return children;
};

const AppContent = () => {
  return (
    <div className="app-container">
      <Navigation />
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}>
              <AdminPanel />
            </PrivateRoute>
          } />
          
          <Route path="/entry" element={
            <PrivateRoute>
              <UserEntry />
            </PrivateRoute>
          } />

          <Route path="/organizations" element={
            <PrivateRoute>
              <Organizations />
            </PrivateRoute>
          } />
          
          <Route path="/analytics" element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <DataProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </DataProvider>
  );
};

export default App;
