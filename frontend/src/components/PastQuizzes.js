/**
 * Tab 2: Past Quizzes (History) Component
 * Displays table of all previously generated quizzes
 */
import React, { useState, useEffect } from 'react';
import { getQuizHistory, getQuizDetails, deleteQuiz } from '../services/api';
import QuizModal from './QuizModal';
import Loader from './Loader';
import '../styles/PastQuizzes.css';

const PastQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuizHistory();
      setQuizzes(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (quizId) => {
    setModalLoading(true);
    try {
      const data = await getQuizDetails(quizId);
      setSelectedQuiz(data);
    } catch (err) {
      alert(`Failed to load quiz details: ${err}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (quizId, e) => {
    e.stopPropagation(); // Prevent row click
    
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (err) {
      alert(`Failed to delete quiz: ${err}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loader message="Loading quiz history..." />;
  }

  return (
    <div className="past-quizzes-container">
      <div className="history-header">
        <h2>📚 Past Quizzes</h2>
        <button onClick={fetchHistory} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>No quizzes yet</h3>
          <p>Generate your first quiz from the "Generate Quiz" tab!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="quiz-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>URL</th>
                <th>Questions</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="quiz-row">
                  <td className="id-cell">{quiz.id}</td>
                  <td className="title-cell">
                    <strong>{quiz.title}</strong>
                  </td>
                  <td className="url-cell">
                    <a 
                      href={quiz.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Article →
                    </a>
                  </td>
                  <td className="count-cell">{quiz.question_count}</td>
                  <td className="date-cell">{formatDate(quiz.created_at)}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleViewDetails(quiz.id)}
                      className="details-btn"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => handleDelete(quiz.id, e)}
                      className="delete-btn"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for viewing quiz details */}
      {selectedQuiz && !modalLoading && (
        <QuizModal
          quizData={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
        />
      )}

      {modalLoading && (
        <div className="modal-overlay">
          <Loader message="Loading quiz details..." />
        </div>
      )}
    </div>
  );
};

export default PastQuizzes;
