'use client';

import { useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [lineUserId, setLineUserId] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, lineUserId }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      setMessage('Registration successful! You will start receiving notifications.')
    } else {
      setMessage('Error: ' + data.error)
    }
  }

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
            <label htmlFor="lineUserId">LINE User ID</label>
            <input
              id="lineUserId"
              type="text"
              placeholder="Enter your LINE User ID"
              value={lineUserId}
              onChange={(e) => setLineUserId(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
