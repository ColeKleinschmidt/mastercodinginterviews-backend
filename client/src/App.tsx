import viteLogo from '/vite.svg';
import reactLogo from './assets/react.svg';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-row">
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Master Coding Interviews</h1>
        <p className="subtitle">Frontend scaffold powered by Vite + React + TypeScript</p>
      </header>
      <main className="app-main">
        <p>Start building interview-ready experiences from <code>client/src</code>.</p>
      </main>
    </div>
  );
}

export default App;
