import { NavLink, Route, Routes, useParams } from 'react-router-dom';
import './App.css';

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

export default App;
