/**
 * Tab 1: Generate Quiz Component
 * Allows users to input Wikipedia URL and generate quiz
 */
import React, { useState } from 'react';
import { generateQuiz } from '../services/api';
import QuizDisplay from './QuizDisplay';
import TakeQuiz from './TakeQuiz';
import Loader from './Loader';
import '../styles/GenerateQuiz.css';

const GenerateQuiz = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [mode, setMode] = useState('display'); // 'display' or 'take'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!url.trim()) {
      setError('Please enter a Wikipedia URL');
      return;
    }
    
    if (!url.includes('wikipedia.org/wiki/')) {
      setError('Please enter a valid Wikipedia article URL');
      return;
    }

    setLoading(true);
    setError(null);
    setQuizData(null);

    try {
      const data = await generateQuiz(url);
      setQuizData(data);
      setMode('display'); // Default to display mode
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setQuizData(null);
    setError(null);
    setMode('display');
  };

  return (
    <div className="generate-quiz-container">
      {/* Input Form */}
      <div className="input-section">
        <h2>🎯 Generate Quiz from Wikipedia</h2>
        <p className="subtitle">Enter any Wikipedia article URL to create an AI-generated quiz</p>
        
        <form onSubmit={handleSubmit} className="url-form">
          <div className="input-group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://en.wikipedia.org/wiki/..."
              className="url-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="generate-btn"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </form>

        {/* Example URLs */}
        <div className="example-urls">
          <p>Try these examples:</p>
          <div className="example-buttons">
            <button 
              onClick={() => setUrl('https://en.wikipedia.org/wiki/Artificial_intelligence')}
              className="example-btn"
            >
              Artificial Intelligence
            </button>
            <button 
              onClick={() => setUrl('https://en.wikipedia.org/wiki/Python_(programming_language)')}
              className="example-btn"
            >
              Python Programming
            </button>
            <button 
              onClick={() => setUrl('https://en.wikipedia.org/wiki/Albert_Einstein')}
              className="example-btn"
            >
              Albert Einstein
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Loader message="🤖 AI is reading the article and generating quiz questions... This may take 30-60 seconds." />
      )}

      {/* Error State */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Quiz Results */}
      {quizData && !loading && (
        <div className="quiz-results">
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'display' ? 'active' : ''}`}
              onClick={() => setMode('display')}
            >
              📖 View Quiz
            </button>
            <button
              className={`mode-btn ${mode === 'take' ? 'active' : ''}`}
              onClick={() => setMode('take')}
            >
              ✍️ Take Quiz
            </button>
            <button
              className="reset-btn"
              onClick={handleReset}
            >
              🔄 Generate New Quiz
            </button>
          </div>

          {/* Display Quiz or Take Quiz Mode */}
          {mode === 'display' ? (
            <QuizDisplay quizData={quizData} />
          ) : (
            <TakeQuiz quizData={quizData} />
          )}
        </div>
      )}
    </div>
  );
};

export default GenerateQuiz;
