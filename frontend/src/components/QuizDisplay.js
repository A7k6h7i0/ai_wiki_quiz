/**
 * Reusable component to display quiz questions and information.
 * Used in both Tab 1 (Generate) and Tab 2 (History Modal).
 */
import React from 'react';
import '../styles/QuizDisplay.css';

const QuizDisplay = ({ quizData }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#666';
    }
  };

  return (
    <div className="quiz-display">
      {/* Article Information */}
      <div className="article-info">
        <h2>{quizData.title}</h2>
        <a href={quizData.url} target="_blank" rel="noopener noreferrer" className="wiki-link">
          View on Wikipedia →
        </a>
        
        {quizData.summary && (
          <div className="summary-section">
            <h3>Summary</h3>
            <p>{quizData.summary}</p>
          </div>
        )}
      </div>

      {/* Key Entities */}
      {quizData.key_entities && (
        <div className="entities-section">
          <h3>Key Entities</h3>
          <div className="entities-grid">
            {quizData.key_entities.people.length > 0 && (
              <div className="entity-group">
                <h4>👤 People</h4>
                <div className="entity-tags">
                  {quizData.key_entities.people.map((person, idx) => (
                    <span key={idx} className="entity-tag">{person}</span>
                  ))}
                </div>
              </div>
            )}
            
            {quizData.key_entities.organizations.length > 0 && (
              <div className="entity-group">
                <h4>🏢 Organizations</h4>
                <div className="entity-tags">
                  {quizData.key_entities.organizations.map((org, idx) => (
                    <span key={idx} className="entity-tag">{org}</span>
                  ))}
                </div>
              </div>
            )}
            
            {quizData.key_entities.locations.length > 0 && (
              <div className="entity-group">
                <h4>📍 Locations</h4>
                <div className="entity-tags">
                  {quizData.key_entities.locations.map((loc, idx) => (
                    <span key={idx} className="entity-tag">{loc}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Article Sections */}
      {quizData.sections && quizData.sections.length > 0 && (
        <div className="sections-section">
          <h3>Article Sections</h3>
          <div className="sections-list">
            {quizData.sections.map((section, idx) => (
              <span key={idx} className="section-tag">{section}</span>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Questions */}
      <div className="questions-section">
        <h3>Quiz Questions ({quizData.quiz.length})</h3>
        {quizData.quiz.map((question, idx) => (
          <div key={idx} className="question-card">
            <div className="question-header">
              <span className="question-number">Q{idx + 1}</span>
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(question.difficulty) }}
              >
                {question.difficulty}
              </span>
            </div>
            
            <h4 className="question-text">{question.question}</h4>
            
            <div className="options-list">
              {question.options.map((option, optIdx) => (
                <div 
                  key={optIdx} 
                  className={`option ${option === question.answer ? 'correct-option' : ''}`}
                >
                  <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                  <span className="option-text">{option}</span>
                  {option === question.answer && (
                    <span className="correct-indicator">✓ Correct</span>
                  )}
                </div>
              ))}
            </div>
            
            {question.explanation && (
              <div className="explanation">
                <strong>💡 Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Related Topics */}
      {quizData.related_topics && quizData.related_topics.length > 0 && (
        <div className="related-topics-section">
          <h3>Related Topics to Explore</h3>
          <div className="topics-grid">
            {quizData.related_topics.map((topic, idx) => (
              <a
                key={idx}
                href={`https://en.wikipedia.org/wiki/${topic.replace(/ /g, '_')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="topic-card"
              >
                <span className="topic-icon">📚</span>
                <span className="topic-name">{topic}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDisplay;
