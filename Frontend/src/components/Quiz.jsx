import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateSQL, checkBackendHealth } from '../utils/sqlValidator';
import TableSchema from './TableSchema';
import './Quiz.css';

const Quiz = ({ mode, questions, onComplete, onBack }) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [strikes, setStrikes] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState(0);
  const [validationResult, setValidationResult] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Check backend health on component mount
  useEffect(() => {
    checkBackendHealth().then(isHealthy => {
      setBackendConnected(isHealthy);
      if (!isHealthy) {
        setFeedback('⚠️ Backend server not available. Please ensure the backend is running.');
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!backendConnected) {
      setFeedback('⚠️ Backend server not available. Please ensure the backend is running.');
      return;
    }

    if (!userQuery.trim()) {
      setFeedback('⚠️ Please enter a SQL query');
      return;
    }

    // Validate against correct answer via API
    const result = await validateSQL(userQuery, currentQuestion.answer);
    setValidationResult(result);

    if (result.isValid) {
      // Correct answer
      setFeedback(`✅ ${result.feedback}`);
      setScore(score + (strikes === 0 ? 10 : 5)); // Full points if no strikes
      setShowAnswer(true);
      
      setTimeout(() => {
        moveToNextQuestion();
      }, 3000);
    } else {
      // Wrong answer
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      
      if (newStrikes >= 2) {
        // Used both chances
        setFeedback(`❌ ${result.feedback}. Here's the correct answer:`);
        setShowAnswer(true);
        
        setTimeout(() => {
          moveToNextQuestion();
        }, 5000);
      } else {
        setFeedback(`❌ ${result.feedback}. You have 1 more chance! Try again.`);
      }
    }
  };

  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      resetQuestionState();
    } else {
      // Quiz completed
      onComplete({
        totalQuestions: questions.length,
        score: score,
        mode: mode
      });
      navigate('/results');
    }
  };

  const resetQuestionState = () => {
    setUserQuery('');
    setStrikes(0);
    setShowAnswer(false);
    setFeedback('');
    setValidationResult(null);
    setCompletedQuestions(completedQuestions + 1);
  };

  const handleSkip = () => {
    setShowAnswer(true);
    setFeedback('⏭️ Question skipped. Here\'s the answer:');
    
    setTimeout(() => {
      moveToNextQuestion();
    }, 5000);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: '#66bb6a',
      Medium: '#ffa726',
      Hard: '#ef5350',
      Complicated: '#ab47bc'
    };
    return colors[difficulty] || '#64b5f6';
  };

  return (
    <div className="quiz-container">
      {/* Left Column - Schema */}
      <div className="schema-column">
        <TableSchema />
      </div>

      {/* Right Column - Question and Input */}
      <div className="question-column">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-progress">
            <span className="progress-text">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  backgroundColor: getDifficultyColor(currentQuestion.difficulty)
                }}
              />
            </div>
          </div>
          
          <div className="quiz-stats">
            <div className="stat-item">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Strikes</span>
              <span className="stat-value strikes-count">
                {'❌'.repeat(strikes)}
                {'⭕'.repeat(2 - strikes)}
              </span>
            </div>
            <div className="stat-item difficulty-badge" style={{ backgroundColor: getDifficultyColor(currentQuestion.difficulty) }}>
              {currentQuestion.difficulty}
            </div>
          </div>
        </div>

        {/* Question Section */}
        <div className="question-section">
        <div className="question-card">
          <h2 className="question-title">Question {currentQuestionIndex + 1}</h2>
          <p className="question-text">{currentQuestion.question}</p>
        </div>

        {/* Query Input */}
        <div className="query-input-section">
          <label className="input-label">Your SQL Query:</label>
          <textarea
            className="query-textarea"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="SELECT * FROM ..."
            rows={6}
            disabled={showAnswer}
            spellCheck={false}
          />
          
          <div className="button-group">
            <button 
              className="submit-button"
              onClick={handleSubmit}
              disabled={showAnswer}
            >
              Submit Query
            </button>
            <button 
              className="skip-button"
              onClick={handleSkip}
              disabled={showAnswer}
            >
              Skip Question
            </button>
            <button 
              className="back-button"
              onClick={() => navigate('/')}
            >
              ← Back to Modes
            </button>
          </div>
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className={`feedback-section ${validationResult?.isValid ? 'success' : 'error'}`}>
            <p className="feedback-text">{feedback}</p>
            {validationResult && (
              <div className="validation-score">
                Match Score: {validationResult.score}%
              </div>
            )}
          </div>
        )}

        {/* Correct Answer Display */}
        {showAnswer && (
          <div className="answer-section">
            <h3 className="answer-title">Correct Answer:</h3>
            <pre className="answer-code">{currentQuestion.answer}</pre>
            {currentQuestionIndex < questions.length - 1 && (
              <p className="next-question-hint">
                Moving to next question in a moment...
              </p>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
