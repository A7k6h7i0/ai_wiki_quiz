/**
 * BONUS: Take Quiz Component
 * Interactive quiz mode where users answer questions and get scored
 */
import React, { useState } from 'react';
import '../styles/QuizDisplay.css';

const TakeQuiz = ({ quizData }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleOptionSelect = (questionIndex, option) => {
    if (showResults) return; // Prevent changes after submission

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: option
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0;
    quizData.quiz.forEach((question, idx) => {
      if (selectedAnswers[idx] === question.answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
    setCurrentQuestion(0); // Reset to first question
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setCurrentQuestion(0);
  };

  const question = quizData.quiz[currentQuestion];
  const totalQuestions = quizData.quiz.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="take-quiz-container">
      {/* Quiz Header */}
      <div className="quiz-header">
        <h2>{quizData.title} - Interactive Quiz</h2>
        <div className="progress-info">
          <span>Question {currentQuestion + 1} of {totalQuestions}</span>
          <span>Answered: {answeredCount}/{totalQuestions}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Results Screen */}
      {showResults && (
        <div className="results-screen">
          <div className="score-card">
            <h2>🎉 Quiz Complete!</h2>
            <div className="score-display">
              <span className="score-number">{score}/{totalQuestions}</span>
              <span className="score-percentage">
                {Math.round((score / totalQuestions) * 100)}%
              </span>
            </div>
            <p className="score-message">
              {score === totalQuestions && "Perfect score! Excellent work! 🌟"}
              {score >= totalQuestions * 0.8 && score < totalQuestions && "Great job! 👏"}
              {score >= totalQuestions * 0.6 && score < totalQuestions * 0.8 && "Good effort! 👍"}
              {score < totalQuestions * 0.6 && "Keep practicing! 💪"}
            </p>
            <button onClick={handleRetry} className="retry-btn">
              🔄 Try Again
            </button>
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="question-card-interactive">
        <div className="question-header">
          <span className="question-number">Q{currentQuestion + 1}</span>
          <span className={`difficulty-badge ${question.difficulty}`}>
            {question.difficulty}
          </span>
        </div>

        <h3 className="question-text">{question.question}</h3>

        <div className="options-list-interactive">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestion] === option;
            const isCorrect = option === question.answer;
            const showCorrectAnswer = showResults;

            let optionClass = 'option-interactive';
            if (isSelected) optionClass += ' selected';
            if (showCorrectAnswer && isCorrect) optionClass += ' correct';
            if (showCorrectAnswer && isSelected && !isCorrect) optionClass += ' incorrect';

            return (
              <button
                key={idx}
                className={optionClass}
                onClick={() => handleOptionSelect(currentQuestion, option)}
                disabled={showResults}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{option}</span>
                {showResults && isCorrect && <span className="check-icon">✓</span>}
                {showResults && isSelected && !isCorrect && <span className="cross-icon">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Show explanation after submission */}
        {showResults && question.explanation && (
          <div className="explanation shown">
            <strong>💡 Explanation:</strong> {question.explanation}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="quiz-navigation">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="nav-btn"
        >
          ← Previous
        </button>

        <div className="question-dots">
          {quizData.quiz.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${idx === currentQuestion ? 'active' : ''} ${selectedAnswers[idx] ? 'answered' : ''}`}
              onClick={() => setCurrentQuestion(idx)}
            ></span>
          ))}
        </div>

        {currentQuestion < totalQuestions - 1 ? (
          <button onClick={handleNext} className="nav-btn">
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < totalQuestions || showResults}
            className="submit-btn"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
