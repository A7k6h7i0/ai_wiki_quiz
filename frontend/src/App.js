/**
 * Main React Application Component
 * Manages tab navigation between Generate Quiz and Past Quizzes
 */
import React, { useState } from 'react';
import GenerateQuiz from './components/GenerateQuiz';
import PastQuizzes from './components/PastQuizzes';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🧠 AI Wiki Quiz Generator</h1>
          <p className="tagline">Transform any Wikipedia article into an interactive quiz using AI</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          🎯 Generate Quiz
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📚 Past Quizzes
        </button>
      </div>

      {/* Tab Content */}
      <main className="app-content">
        {activeTab === 'generate' ? <GenerateQuiz /> : <PastQuizzes />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Powered by FastAPI, React, LangChain & Google Gemini</p>
        <p className="footer-note">Built for DeepKlarity Technologies Assignment</p>
      </footer>
    </div>
  );
}

export default App;
