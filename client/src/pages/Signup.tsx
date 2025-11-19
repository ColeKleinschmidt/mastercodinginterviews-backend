import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractErrorMessage } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { signup, token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="form-title">Create your account</h1>
      <p className="form-subtitle">Join Master Coding Interviews and track your progress.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <label className="input-label" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          type="text"
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alex Developer"
          required
        />

        <label className="input-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="text-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <label className="input-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="text-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a secure password"
          required
        />

        {error ? <div className="form-error">{error}</div> : null}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p className="form-footer">
        Already have an account?{' '}
        <Link to="/login" className="accent-link">
          Sign in instead
        </Link>
      </p>
    </div>
  );
};

export default Signup;
