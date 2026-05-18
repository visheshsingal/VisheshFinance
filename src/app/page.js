'use client';
import React, { useState, useEffect } from 'react';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [token, setToken] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Safely check localStorage only after mounting on the browser client
    setToken(localStorage.getItem('token'));
    setMounted(true);
  }, []);

  const onLogin = (t) => {
    localStorage.setItem('token', t);
    setToken(t);
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
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

  return token ? <Dashboard onLogout={onLogout} /> : <Login onLogin={onLogin} />;
}
