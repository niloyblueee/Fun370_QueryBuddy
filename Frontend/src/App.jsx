import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import ModeSelector from './components/ModeSelector'
import Quiz from './components/Quiz'
import Results from './components/Results'
import questionsData from '../Question.json'
import answersData from '../Answer.json'

function App() {
  const [quizResults, setQuizResults] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)

  // Prepare questions based on selected mode
  const prepareQuestions = (mode) => {
    const difficulties = {
      'easy': ['Easy'],
      'medium': ['Medium'],
      'hard': ['Hard'],
      'complicated': ['Complicated'],
      'flow': ['Easy', 'Medium', 'Hard', 'Complicated']
    }

    const selectedDifficulties = difficulties[mode] || ['Easy']
    const questions = []

    selectedDifficulties.forEach(difficulty => {
      const difficultyQuestions = questionsData[difficulty]
      const difficultyAnswers = answersData[difficulty]

      if (difficultyQuestions && difficultyAnswers) {
        const questionKeys = Object.keys(difficultyQuestions)
        const questionsToSelect = mode === 'flow' ? 5 : Math.min(questionKeys.length, 5)

        // Get random questions from this difficulty
        const selectedKeys = questionKeys
          .sort(() => Math.random() - 0.5)
          .slice(0, questionsToSelect)

        selectedKeys.forEach(key => {
          const answerKey = key.replace('Q', 'A')
          questions.push({
            id: key,
            difficulty: difficulty,
            question: difficultyQuestions[key],
            answer: difficultyAnswers[answerKey]
          })
        })
      }
    })

    return questions
  }

  const handleQuizComplete = (results) => {
    setQuizResults(results)
  }

  const handleRestart = () => {
    setQuizResults(null)
    setSelectedMode(null)
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<ModeSelector onSelectMode={setSelectedMode} />} />
        <Route 
          path="/quiz/:mode" 
          element={
            selectedMode ? (
              <Quiz
                mode={selectedMode}
                questions={prepareQuestions(selectedMode)}
                onComplete={handleQuizComplete}
              />
            ) : (
              <ModeSelector onSelectMode={setSelectedMode} />
            )
          } 
        />
        <Route 
          path="/results" 
          element={
            quizResults ? (
              <Results
                results={quizResults}
                onRestart={handleRestart}
              />
            ) : (
              <ModeSelector onSelectMode={setSelectedMode} />
            )
          } 
        />
      </Routes>
      
      <a href="https://github.com/NiloyBlueee">Made with ❤️ by NiloyBlueee</a>
    </div>
  )
}

export default App
