'use client';

import { useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lineToken, setLineToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, lineToken }),
    });

    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setMessage('Registration successful! You can now track your grades.');
    } else {
      setMessage('Error: ' + data.error);
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h1 className="title">Register for Grade Tracker</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="lineToken">LINE Notify Token</label>
            <input
              id="lineToken"
              type="text"
              placeholder="Enter your LINE Notify token"
              value={lineToken}
              onChange={(e) => setLineToken(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
