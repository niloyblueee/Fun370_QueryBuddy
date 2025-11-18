import { useState } from 'react'
import './App.css'
import ModeSelector from './components/ModeSelector'
import Quiz from './components/Quiz'
import Results from './components/Results'
import questionsData from '../Question.json'
import answersData from '../Answer.json'

function App() {
  const [currentScreen, setCurrentScreen] = useState('mode-select') // mode-select, quiz, results
  const [selectedMode, setSelectedMode] = useState(null)
  const [quizResults, setQuizResults] = useState(null)

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

  const handleModeSelect = (mode) => {
    setSelectedMode(mode)
    setCurrentScreen('quiz')
  }

  const handleQuizComplete = (results) => {
    setQuizResults(results)
    setCurrentScreen('results')
  }

  const handleRestart = () => {
    setCurrentScreen('mode-select')
    setSelectedMode(null)
    setQuizResults(null)
  }

  const handleBackToModeSelect = () => {
    setCurrentScreen('mode-select')
    setSelectedMode(null)
  }

  const handleBackToQuiz = () => {
    setCurrentScreen('quiz')
  }

  return (
    <div className="app">
      {currentScreen === 'mode-select' && (
        <ModeSelector onSelectMode={handleModeSelect} />
      )}

      {currentScreen === 'quiz' && (
        <Quiz
          mode={selectedMode}
          questions={prepareQuestions(selectedMode)}
          onComplete={handleQuizComplete}
          onBack={handleBackToModeSelect}
        />
      )}

      {currentScreen === 'results' && (
        <Results
          results={quizResults}
          onRestart={handleRestart}
          onBack={handleBackToModeSelect}
        />
      )}
      
      <a href="https://github.com/NiloyBlueee">Made with ❤️ by NiloyBlueee</a>
    </div>
  )
}

export default App
