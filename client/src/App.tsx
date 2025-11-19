import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import Practice from './pages/Practice';
import Session from './pages/Session';
import { PracticeProvider } from './context/PracticeContext';

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
    </div>
  );
}

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
