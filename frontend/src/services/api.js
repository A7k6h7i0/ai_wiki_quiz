/**
 * API service for backend communication.
 * Centralizes all API calls for easy maintenance.
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for LLM processing
});

/**
 * Generate a new quiz from Wikipedia URL
 */
export const generateQuiz = async (url) => {
  try {
    const response = await api.post('/api/quiz/generate', { url });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to generate quiz';
  }
};

/**
 * Get list of all past quizzes
 */
export const getQuizHistory = async () => {
  try {
    const response = await api.get('/api/quiz/history');
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to fetch history';
  }
};

/**
 * Get details of a specific quiz
 */
export const getQuizDetails = async (quizId) => {
  try {
    const response = await api.get(`/api/quiz/${quizId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to fetch quiz details';
  }
};

/**
 * Delete a quiz
 */
export const deleteQuiz = async (quizId) => {
  try {
    await api.delete(`/api/quiz/${quizId}`);
    return true;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to delete quiz';
  }
};

export default api;
