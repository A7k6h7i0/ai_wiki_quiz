/**
 * Modal component for displaying quiz details from history
 */
import React, { useEffect } from 'react';
import QuizDisplay from './QuizDisplay';
import '../styles/Modal.css';

const QuizModal = ({ quizData, onClose }) => {
  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden'; // Prevent background scroll

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-body">
          <QuizDisplay quizData={quizData} />
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
