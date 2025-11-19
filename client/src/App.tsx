import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PracticeProvider, usePractice } from './context/PracticeContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Practice from './pages/Practice';
import Session from './pages/Session';
import Signup from './pages/Signup';

type LanguageSlug = 'javascript' | 'python' | 'java' | 'cpp' | 'sql';

type ProtectedRouteProps = { children: React.ReactElement };

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading your account...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const normalizeLanguage = (language: string): LanguageSlug => {
  switch (language) {
    case 'JS':
      return 'javascript';
    case 'C++':
      return 'cpp';
    default:
      return language.toLowerCase() as LanguageSlug;
  }
};

const PracticeRoute = () => {
  const navigate = useNavigate();
  const { filters } = usePractice();

  const handleStart = () => {
    const params = new URLSearchParams({
      type: filters.questionType === 'Coding' ? 'coding' : 'code-output',
      difficulty: filters.difficulty.toLowerCase(),
      language: normalizeLanguage(filters.language),
    });

    navigate(`/session?${params.toString()}`);
  };

  return <Practice onStart={handleStart} />;
};

const AppRoutes = () => (
  <Routes>
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
          <PracticeRoute />
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
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <PracticeProvider>
      <AppRoutes />
    </PracticeProvider>
  </AuthProvider>
);

export default App;
