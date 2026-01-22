'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface QuizOption {
  id: string
  text: string
  isCorrect?: boolean
}

interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  explanation?: string
}

interface QuizProps {
  id?: string
  className?: string
  title?: string
  description?: string
  questions?: QuizQuestion[]
  showProgress?: boolean
  showExplanation?: boolean
  allowRetry?: boolean
}

const defaultQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is the capital of France?',
    options: [
      { id: 'a', text: 'London', isCorrect: false },
      { id: 'b', text: 'Paris', isCorrect: true },
      { id: 'c', text: 'Berlin', isCorrect: false },
      { id: 'd', text: 'Madrid', isCorrect: false },
    ],
    explanation: 'Paris is the capital and largest city of France.',
  },
  {
    id: '2',
    question: 'Which planet is known as the Red Planet?',
    options: [
      { id: 'a', text: 'Venus', isCorrect: false },
      { id: 'b', text: 'Jupiter', isCorrect: false },
      { id: 'c', text: 'Mars', isCorrect: true },
      { id: 'd', text: 'Saturn', isCorrect: false },
    ],
    explanation: 'Mars is called the Red Planet due to its reddish appearance.',
  },
  {
    id: '3',
    question: 'What is 2 + 2?',
    options: [
      { id: 'a', text: '3', isCorrect: false },
      { id: 'b', text: '4', isCorrect: true },
      { id: 'c', text: '5', isCorrect: false },
      { id: 'd', text: '22', isCorrect: false },
    ],
  },
]

export default function Quiz({
  id,
  className,
  title = 'Knowledge Quiz',
  description = 'Test your knowledge with this quick quiz!',
  questions = defaultQuestions,
  showProgress = true,
  showExplanation = true,
  allowRetry = true,
}: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const question = questions[currentQuestion]
  const isAnswered = selectedAnswer !== null
  const selectedOption = question?.options.find((o) => o.id === selectedAnswer)
  const isCorrect = selectedOption?.isCorrect

  const handleSelect = (optionId: string) => {
    if (isAnswered) return
    setSelectedAnswer(optionId)
    setAnswers({ ...answers, [question.id]: optionId })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      setShowResults(true)
    }
  }

  const handleRetry = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setAnswers({})
    setShowResults(false)
  }

  const score = Object.entries(answers).reduce((acc, [qId, aId]) => {
    const q = questions.find((q) => q.id === qId)
    const option = q?.options.find((o) => o.id === aId)
    return acc + (option?.isCorrect ? 1 : 0)
  }, 0)

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div id={id} className={cn('p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{percentage}%</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quiz Complete!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You scored {score} out of {questions.length} questions
          </p>
          {allowRetry && (
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div id={id} className={cn('p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>}
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>}

      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">{question.question}</p>

      <div className="space-y-3 mb-6">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.id
          const showCorrect = isAnswered && option.isCorrect
          const showWrong = isAnswered && isSelected && !option.isCorrect

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={isAnswered}
              className={cn(
                'w-full p-4 text-left rounded-lg border-2 transition-all',
                !isAnswered && 'hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
                !isAnswered && !isSelected && 'border-gray-200 dark:border-gray-700',
                isSelected && !isAnswered && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30',
                showCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/30',
                showWrong && 'border-red-500 bg-red-50 dark:bg-red-900/30',
                isAnswered && !showCorrect && !showWrong && 'border-gray-200 dark:border-gray-700 opacity-50'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  !isAnswered && 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                  showCorrect && 'bg-green-500 text-white',
                  showWrong && 'bg-red-500 text-white'
                )}>
                  {showCorrect ? '✓' : showWrong ? '✗' : option.id.toUpperCase()}
                </span>
                <span className={cn(
                  'text-gray-700 dark:text-gray-300',
                  showCorrect && 'text-green-700 dark:text-green-300 font-medium',
                  showWrong && 'text-red-700 dark:text-red-300'
                )}>
                  {option.text}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {isAnswered && showExplanation && question.explanation && (
        <div className={cn(
          'p-4 rounded-lg mb-4',
          isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
        )}>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>{isCorrect ? 'Correct!' : 'Not quite.'}</strong> {question.explanation}
          </p>
        </div>
      )}

      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
        </button>
      )}
    </div>
  )
}

Quiz.displayName = 'Quiz'

Quiz.config = {
  id: 'quiz',
  name: 'Quiz',
  category: 'interactive',
  description: 'Interactive quiz with scoring',
  defaultProps: { showProgress: true, showExplanation: true, allowRetry: true },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'questions', label: 'Questions', type: 'array' },
    { name: 'showProgress', label: 'Show Progress', type: 'boolean' },
    { name: 'showExplanation', label: 'Show Explanation', type: 'boolean' },
    { name: 'allowRetry', label: 'Allow Retry', type: 'boolean' },
  ],
}
