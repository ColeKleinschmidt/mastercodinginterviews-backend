import './App.css';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading your account...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const ProtectedLayout = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/practice', label: 'Practice' },
    { path: '/session', label: 'Session' },
    { path: '/history', label: 'History' },
  ];

  const userInitial = user?.name?.[0] ?? user?.email?.[0] ?? '?';

  return (
    <div className="page-card">
      <header className="page-header">
        <div>
          <p className="eyebrow">Master Coding Interviews</p>
          <h1 className="page-title">{title}</h1>
          <p className="page-description">{description}</p>
        </div>
        <div className="user-controls">
          <div className="user-avatar">{userInitial.toUpperCase()}</div>
          <div>
            <p className="user-name">{user?.name ?? 'Anonymous'}</p>
            <p className="user-email">{user?.email}</p>
          </div>
          <button className="secondary-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <nav className="page-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <section className="page-content">{children}</section>
    </div>
  );
};

const Dashboard = () => (
  <ProtectedLayout title="Dashboard" description="Track your interview readiness at a glance.">
    <div className="grid">
      <div className="stat-card">
        <p className="stat-label">Recent streak</p>
        <p className="stat-value">4 days</p>
        <p className="stat-helper">Keep the momentum going!</p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Sessions completed</p>
        <p className="stat-value">12</p>
        <p className="stat-helper">Consistency builds confidence.</p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Upcoming focus</p>
        <p className="stat-value">System Design</p>
        <p className="stat-helper">Schedule a deep-dive this week.</p>
      </div>
    </div>
  </ProtectedLayout>
);

const Practice = () => (
  <ProtectedLayout title="Practice" description="Choose a track and sharpen your answers.">
    <div className="practice-list">
      <div className="list-item">
        <div>
          <p className="item-title">Algorithms</p>
          <p className="item-subtitle">Data structures, complexity, and problem solving.</p>
        </div>
        <button className="primary-button" type="button">
          Start practice
        </button>
      </div>
      <div className="list-item">
        <div>
          <p className="item-title">System Design</p>
          <p className="item-subtitle">Architecture tradeoffs and communication drills.</p>
        </div>
        <button className="primary-button" type="button">
          Start practice
        </button>
      </div>
      <div className="list-item">
        <div>
          <p className="item-title">Behavioral</p>
          <p className="item-subtitle">STAR stories and leadership principles.</p>
        </div>
        <button className="primary-button" type="button">
          Start practice
        </button>
      </div>
    </div>
  </ProtectedLayout>
);

const Session = () => (
  <ProtectedLayout title="Session" description="Kick off a focused interview simulation.">
    <div className="session-card">
      <p className="session-title">Ready to start?</p>
      <p className="session-subtitle">Launch a timed session and capture your notes.</p>
      <div className="session-actions">
        <button className="primary-button" type="button">
          Begin new session
        </button>
        <button className="secondary-button" type="button">
          View templates
        </button>
      </div>
    </div>
  </ProtectedLayout>
);

const History = () => (
  <ProtectedLayout title="History" description="Review how your practice evolved over time.">
    <div className="history-list">
      {[1, 2, 3].map((item) => (
        <div className="history-row" key={item}>
          <div>
            <p className="item-title">Mock Interview #{item}</p>
            <p className="item-subtitle">Reflection notes and next steps</p>
          </div>
          <span className="status-pill">Completed</span>
        </div>
      ))}
    </div>
  </ProtectedLayout>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <div className="background-blur" />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <Practice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/session"
              element={
                <ProtectedRoute>
                  <Session />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
