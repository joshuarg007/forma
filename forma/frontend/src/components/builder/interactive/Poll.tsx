'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PollOption {
  id: string
  text: string
  votes: number
}

interface PollProps {
  id?: string
  className?: string
  question?: string
  options?: PollOption[]
  showResults?: boolean
  allowMultiple?: boolean
  showVoteCount?: boolean
  variant?: 'default' | 'compact' | 'card'
}

const defaultOptions: PollOption[] = [
  { id: '1', text: 'React', votes: 45 },
  { id: '2', text: 'Vue', votes: 28 },
  { id: '3', text: 'Angular', votes: 15 },
  { id: '4', text: 'Svelte', votes: 12 },
]

export default function Poll({
  id,
  className,
  question = 'What is your favorite frontend framework?',
  options = defaultOptions,
  showResults: initialShowResults = false,
  allowMultiple = false,
  showVoteCount = true,
  variant = 'default',
}: PollProps) {
  const [votes, setVotes] = useState(options)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(initialShowResults)

  const totalVotes = votes.reduce((sum, opt) => sum + opt.votes, 0)

  const handleSelect = (optionId: string) => {
    if (hasVoted) return

    if (allowMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  const handleVote = () => {
    if (selectedOptions.length === 0) return

    setVotes((prev) =>
      prev.map((opt) => ({
        ...opt,
        votes: selectedOptions.includes(opt.id) ? opt.votes + 1 : opt.votes,
      }))
    )
    setHasVoted(true)
  }

  if (variant === 'compact') {
    return (
      <div id={id} className={cn('p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800', className)}>
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{question}</p>
        <div className="space-y-2">
          {votes.map((option) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
            const isSelected = selectedOptions.includes(option.id)

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={hasVoted}
                className={cn(
                  'w-full relative overflow-hidden rounded text-left transition',
                  !hasVoted && 'hover:bg-gray-100 dark:hover:bg-gray-800',
                  isSelected && !hasVoted && 'ring-2 ring-indigo-500'
                )}
              >
                {hasVoted && (
                  <div
                    className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                )}
                <div className="relative px-3 py-2 flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.text}</span>
                  {hasVoted && showVoteCount && (
                    <span className="text-xs font-medium text-gray-500">{Math.round(percentage)}%</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
        {!hasVoted && (
          <button
            onClick={handleVote}
            disabled={selectedOptions.length === 0}
            className="w-full mt-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded font-medium transition"
          >
            Vote
          </button>
        )}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div id={id} className={cn('bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden', className)}>
        <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-500">
          <p className="text-lg font-semibold text-white">{question}</p>
        </div>
        <div className="p-5 space-y-3">
          {votes.map((option) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
            const isSelected = selectedOptions.includes(option.id)

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={hasVoted}
                className={cn(
                  'w-full relative overflow-hidden rounded-lg border-2 text-left transition',
                  !hasVoted && 'hover:border-indigo-300',
                  !hasVoted && !isSelected && 'border-gray-200 dark:border-gray-700',
                  isSelected && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
                  hasVoted && 'border-gray-200 dark:border-gray-700'
                )}
              >
                {hasVoted && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                )}
                <div className="relative p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'
                    )}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{option.text}</span>
                  </div>
                  {hasVoted && showVoteCount && (
                    <div className="text-right">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{Math.round(percentage)}%</span>
                      <p className="text-xs text-gray-500">{option.votes} votes</p>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
        {!hasVoted && (
          <div className="px-5 pb-5">
            <button
              onClick={handleVote}
              disabled={selectedOptions.length === 0}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-lg font-medium transition"
            >
              Submit Vote
            </button>
          </div>
        )}
        {hasVoted && showVoteCount && (
          <div className="px-5 pb-5 text-center text-sm text-gray-500 dark:text-gray-400">
            {totalVotes} total votes
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{question}</p>
      <div className="space-y-3">
        {votes.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
          const isSelected = selectedOptions.includes(option.id)

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={hasVoted}
              className={cn(
                'w-full relative overflow-hidden rounded-lg text-left transition',
                !hasVoted && 'hover:bg-gray-50 dark:hover:bg-gray-800',
                isSelected && !hasVoted && 'ring-2 ring-indigo-500'
              )}
            >
              {hasVoted && (
                <div
                  className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="relative p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">{option.text}</span>
                {hasVoted && showVoteCount && (
                  <span className="font-medium text-gray-900 dark:text-white">{Math.round(percentage)}%</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
      {!hasVoted && (
        <button
          onClick={handleVote}
          disabled={selectedOptions.length === 0}
          className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
        >
          Vote
        </button>
      )}
      {hasVoted && showVoteCount && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">{totalVotes} total votes</p>
      )}
    </div>
  )
}

Poll.displayName = 'Poll'

Poll.config = {
  id: 'poll',
  name: 'Poll',
  category: 'interactive',
  description: 'Voting poll with results',
  defaultProps: { showResults: false, allowMultiple: false, showVoteCount: true, variant: 'default' },
  editableFields: [
    { name: 'question', label: 'Question', type: 'text' },
    { name: 'options', label: 'Options', type: 'array' },
    { name: 'showResults', label: 'Show Results Initially', type: 'boolean' },
    { name: 'allowMultiple', label: 'Allow Multiple Selections', type: 'boolean' },
    { name: 'showVoteCount', label: 'Show Vote Count', type: 'boolean' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'compact', 'card'] },
  ],
}
