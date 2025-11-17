import React from 'react';
import './ModeSelector.css';

const ModeSelector = ({ onSelectMode }) => {
  const modes = [
    {
      id: 'flow',
      title: 'Go with the Flow',
      description: 'Start from Easy and progress through all difficulty levels',
      icon: '🌊',
      color: '#42a5f5'
    },
    {
      id: 'easy',
      title: 'Easy',
      description: 'Basic SELECT, WHERE, and simple filtering queries',
      icon: '🟢',
      color: '#66bb6a'
    },
    {
      id: 'medium',
      title: 'Medium',
      description: 'Joins, aggregates, and GROUP BY operations',
      icon: '🟡',
      color: '#ffa726'
    },
    {
      id: 'hard',
      title: 'Hard',
      description: 'Complex queries with subqueries and advanced joins',
      icon: '🔴',
      color: '#ef5350'
    },
    {
      id: 'complicated',
      title: 'Complicated',
      description: 'Expert level: CTEs, window functions, and complex analytics',
      icon: '🟣',
      color: '#ab47bc'
    }
  ];

  return (
    <div className="mode-selector">
      <div className="mode-header">
        <h1>MYSQL Query Practice CSE370 LAB</h1>
        <p className="mode-subtitle">Choose your learning path <br /> Also this is just randomly selected questions Not your <ul><b>LAB Suggestions</b></ul></p>
      </div>
      
      <div className="modes-container">
        {modes.map((mode) => (
          <div
            key={mode.id}
            className="mode-card"
            style={{ '--mode-color': mode.color }}
            onClick={() => onSelectMode(mode.id)}
          >
            <div className="mode-icon">{mode.icon}</div>
            <h3 className="mode-title">{mode.title}</h3>
            <p className="mode-description">{mode.description}</p>
            <button className="mode-button">Start</button>
          </div>
        ))}
      </div>

      <div className="info-section">
        <p>
          <strong>Note:</strong> You can attempt 5 questions from each difficulty level.
          Each question gives you 2 chances before revealing the answer.
        </p>
      </div>
    </div>
  );
};

export default ModeSelector;
