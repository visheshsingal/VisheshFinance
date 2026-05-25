'use client';
import React, { useState, useEffect } from 'react';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import UserDashboard from '@/components/UserDashboard';

export default function Home() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Safely check localStorage only after mounting on the browser client
    setToken(localStorage.getItem('token'));
    setRole(localStorage.getItem('role'));
    setMounted(true);
  }, []);

  const onLogin = ({ token, role }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setToken(token);
    setRole(role);
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Vishesh Academy Portal</h3>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>Securing session context...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Login onLogin={onLogin} />;
  }

  return role === 'user'
    ? <UserDashboard onLogout={onLogout} />
    : <Dashboard onLogout={onLogout} />;
}
