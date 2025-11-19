import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import Practice from './pages/Practice';
import Session from './pages/Session';
import { PracticeProvider } from './context/PracticeContext';
import Dashboard from './pages/Dashboard';
import { NavLink, Route, Routes, useParams } from 'react-router-dom';
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

type Path = '/practice' | '/session';

function normalizePath(pathname: string): Path {
  if (pathname === '/session') {
    return '/session';
  }
  return '/practice';
}

function usePathNavigation() {
  const [path, setPath] = useState<Path>(normalizePath(window.location.pathname));

  useEffect(() => {
    const handler = () => {
      setPath(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = useCallback(
    (nextPath: Path) => {
      if (path === nextPath) return;
      window.history.pushState({}, '', nextPath);
      setPath(nextPath);
    },
    [path],
  );

  useEffect(() => {
    if (window.location.pathname === '/') {
      navigate('/practice');
    }
  }, [navigate]);

  return { path, navigate };
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Master Coding Interviews</p>
          <h1>Practice hub</h1>
          <p className="subtitle">Choose your filters and jump into a focused practice session.</p>
        </div>
      </header>
      <main className="app-main">{children}</main>
    <div className="app-shell">
      <div className="app-frame">
        <Dashboard />
      </div>
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
const apiBaseUrl = import.meta.env.VITE_API_URL;

const Hero = () => (
  <div className="page-card">
    <h1>Master Coding Interviews</h1>
    <p className="muted">
      Build confidence with focused practice sessions, personalized dashboards, and a
      clear history of your progress. All API calls are configured to use{' '}
      <code>{apiBaseUrl}</code> as the base URL.
    </p>
    <div className="cta-row">
      <NavLink to="/dashboard" className="button button-primary">
        Go to dashboard
      </NavLink>
      <NavLink to="/practice" className="button button-secondary">
        Start practicing
      </NavLink>
    </div>
  </div>
);

const Dashboard = () => (
  <div className="page-card">
    <h2>Dashboard</h2>
    <p className="muted">Track your progress, upcoming sessions, and personalized recommendations.</p>
  </div>
);

const Practice = () => (
  <div className="page-card">
    <h2>Practice</h2>
    <p className="muted">Launch curated interview drills tailored to your goals.</p>
  </div>
);

const Session = () => (
  <div className="page-card">
    <h2>Session</h2>
    <p className="muted">Work through an active practice or mock interview session.</p>
  </div>
);

const History = () => (
  <div className="page-card">
    <h2>History</h2>
    <p className="muted">Review past sessions, scores, and insights.</p>
  </div>
);

const HistoryDetail = () => {
  const { id } = useParams();

  return (
    <div className="page-card">
      <h2>History Detail</h2>
      <p className="muted">Session reference: {id}</p>
    </div>
  );
};

const Login = () => (
  <div className="page-card">
    <h2>Login</h2>
    <p className="muted">Sign in to continue your interview prep.</p>
  </div>
);

const Signup = () => (
  <div className="page-card">
    <h2>Signup</h2>
    <p className="muted">Create your account to unlock personalized practice plans.</p>
  </div>
);

const App = () => {
  const isAuthenticated = false;

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="brand">
          <div className="logo-mark">MC</div>
          <span className="brand-name">Master Coding Interviews</span>
        </div>
        <nav className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/practice" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Practice
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            History
          </NavLink>
        </nav>
        <div className="auth-area">
          {isAuthenticated ? (
            <button className="user-menu">
              <span className="user-circle">JS</span>
              <span className="user-name">You</span>
            </button>
          ) : (
            <div className="auth-links">
              <NavLink to="/login" className="nav-link muted">
                Login
              </NavLink>
              <NavLink to="/signup" className="button button-primary">
                Signup
              </NavLink>
            </div>
          )}
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/session" element={<Session />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<HistoryDetail />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  const { path, navigate } = usePathNavigation();

  return (
    <PracticeProvider>
      <Layout>
        {path === '/session' ? (
          <Session onBackToFilters={() => navigate('/practice')} />
        ) : (
          <Practice onStart={() => navigate('/session')} />
        )}
      </Layout>
    </PracticeProvider>
  );
}

export default App;
