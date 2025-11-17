import React from 'react';
import './Results.css';

const Results = ({ results, onRestart }) => {
  const { totalQuestions, score, mode } = results;
  const maxScore = totalQuestions * 10; // 10 points per question
  const percentage = ((score / maxScore) * 100).toFixed(1);

  const getGrade = (percent) => {
    if (percent >= 90) return { grade: 'A+', message: 'Outstanding!', emoji: '🏆' };
    if (percent >= 80) return { grade: 'A', message: 'Excellent!', emoji: '🌟' };
    if (percent >= 70) return { grade: 'B', message: 'Great Job!', emoji: '👏' };
    if (percent >= 60) return { grade: 'C', message: 'Good Effort!', emoji: '👍' };
    if (percent >= 50) return { grade: 'D', message: 'Keep Practicing!', emoji: '💪' };
    return { grade: 'F', message: 'Don\'t Give Up!', emoji: '📚' };
  };

  const gradeInfo = getGrade(percentage);

  return (
    <div className="results-container">
      <div className="results-card">
        <div className="results-header">
          <div className="emoji-large">{gradeInfo.emoji}</div>
          <h1 className="results-title">Quiz Complete!</h1>
          <p className="results-subtitle">{gradeInfo.message}</p>
        </div>

        <div className="results-stats">
          <div className="stat-circle">
            <div className="circle-content">
              <div className="grade-display">{gradeInfo.grade}</div>
              <div className="percentage-display">{percentage}%</div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon">📊</div>
              <div className="stat-label">Total Questions</div>
              <div className="stat-number">{totalQuestions}</div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">⭐</div>
              <div className="stat-label">Your Score</div>
              <div className="stat-number">{score}</div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">🎯</div>
              <div className="stat-label">Max Score</div>
              <div className="stat-number">{maxScore}</div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">📈</div>
              <div className="stat-label">Mode</div>
              <div className="stat-number">{mode.toUpperCase()}</div>
            </div>
          </div>
        </div>

        <div className="results-message">
          <h3>Performance Analysis</h3>
          <p>
            {percentage >= 80 
              ? "You have a strong understanding of SQL! Keep up the great work."
              : percentage >= 60
              ? "You're on the right track! Practice more complex queries to improve."
              : "SQL takes time to master. Review the fundamentals and try again!"}
          </p>
        </div>

        <div className="action-buttons">
          <button className="restart-button" onClick={onRestart}>
            🔄 Try Another Mode
          </button>
        </div>
      </div>

      <div className="confetti">
        {percentage >= 70 && (
          <>
            <div className="confetti-piece" style={{ left: '10%', animationDelay: '0s' }}>🎉</div>
            <div className="confetti-piece" style={{ left: '20%', animationDelay: '0.2s' }}>⭐</div>
            <div className="confetti-piece" style={{ left: '30%', animationDelay: '0.4s' }}>🎊</div>
            <div className="confetti-piece" style={{ left: '40%', animationDelay: '0.1s' }}>✨</div>
            <div className="confetti-piece" style={{ left: '50%', animationDelay: '0.3s' }}>🎉</div>
            <div className="confetti-piece" style={{ left: '60%', animationDelay: '0.5s' }}>⭐</div>
            <div className="confetti-piece" style={{ left: '70%', animationDelay: '0.2s' }}>🎊</div>
            <div className="confetti-piece" style={{ left: '80%', animationDelay: '0.4s' }}>✨</div>
            <div className="confetti-piece" style={{ left: '90%', animationDelay: '0.1s' }}>🎉</div>
          </>
        )}
      </div>
    </div>
  );
};

export default Results;
