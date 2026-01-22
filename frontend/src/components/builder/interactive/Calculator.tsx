'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CalculatorProps {
  id?: string
  className?: string
  title?: string
  type?: 'basic' | 'tip' | 'mortgage' | 'bmi'
  showHistory?: boolean
}

export default function Calculator({
  id,
  className,
  title,
  type = 'basic',
  showHistory = false,
}: CalculatorProps) {
  const [display, setDisplay] = useState('0')
  const [history, setHistory] = useState<string[]>([])
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [pendingOperator, setPendingOperator] = useState<string | null>(null)
  const [storedValue, setStoredValue] = useState<number | null>(null)

  // Tip calculator state
  const [billAmount, setBillAmount] = useState('')
  const [tipPercent, setTipPercent] = useState(15)
  const [splitCount, setSplitCount] = useState(1)

  // Mortgage calculator state
  const [principal, setPrincipal] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [loanTerm, setLoanTerm] = useState('30')

  // BMI calculator state
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const handleOperator = (operator: string) => {
    const inputValue = parseFloat(display)

    if (storedValue === null) {
      setStoredValue(inputValue)
    } else if (pendingOperator) {
      const result = calculate(storedValue, inputValue, pendingOperator)
      setDisplay(String(result))
      setStoredValue(result)
      if (showHistory) {
        setHistory([...history, `${storedValue} ${pendingOperator} ${inputValue} = ${result}`])
      }
    }

    setWaitingForOperand(true)
    setPendingOperator(operator)
  }

  const calculate = (left: number, right: number, operator: string): number => {
    switch (operator) {
      case '+': return left + right
      case '-': return left - right
      case '×': return left * right
      case '÷': return right !== 0 ? left / right : 0
      default: return right
    }
  }

  const handleEquals = () => {
    if (pendingOperator && storedValue !== null) {
      const inputValue = parseFloat(display)
      const result = calculate(storedValue, inputValue, pendingOperator)
      if (showHistory) {
        setHistory([...history, `${storedValue} ${pendingOperator} ${inputValue} = ${result}`])
      }
      setDisplay(String(result))
      setStoredValue(null)
      setPendingOperator(null)
      setWaitingForOperand(true)
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setStoredValue(null)
    setPendingOperator(null)
    setWaitingForOperand(false)
  }

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ]

  if (type === 'tip') {
    const bill = parseFloat(billAmount) || 0
    const tipAmount = bill * (tipPercent / 100)
    const total = bill + tipAmount
    const perPerson = total / splitCount

    return (
      <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title || 'Tip Calculator'}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bill Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="w-full pl-7 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tip: {tipPercent}%</label>
            <input
              type="range"
              min="0"
              max="30"
              value={tipPercent}
              onChange={(e) => setTipPercent(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Split Between</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold"
              >
                -
              </button>
              <span className="text-xl font-semibold text-gray-900 dark:text-white w-8 text-center">{splitCount}</span>
              <button
                onClick={() => setSplitCount(splitCount + 1)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tip Amount</span>
              <span className="font-medium text-gray-900 dark:text-white">${tipAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="font-medium text-gray-900 dark:text-white">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-gray-900 dark:text-white">Per Person</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">${perPerson.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'mortgage') {
    const p = parseFloat(principal) || 0
    const r = (parseFloat(interestRate) || 0) / 100 / 12
    const n = parseInt(loanTerm) * 12
    const monthlyPayment = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / n
    const totalPayment = monthlyPayment * n
    const totalInterest = totalPayment - p

    return (
      <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title || 'Mortgage Calculator'}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Home Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full pl-7 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="300,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="6.5"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Loan Term</label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="30">30 years</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                ${isFinite(monthlyPayment) ? monthlyPayment.toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Interest</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${isFinite(totalInterest) ? totalInterest.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Payment</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${isFinite(totalPayment) ? totalPayment.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'bmi') {
    let bmi = 0
    if (unit === 'metric') {
      const w = parseFloat(weight) || 0
      const h = (parseFloat(height) || 0) / 100
      bmi = h > 0 ? w / (h * h) : 0
    } else {
      const w = parseFloat(weight) || 0
      const h = parseFloat(height) || 0
      bmi = h > 0 ? (w / (h * h)) * 703 : 0
    }

    const getCategory = (bmi: number) => {
      if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' }
      if (bmi < 25) return { label: 'Normal', color: 'text-green-500' }
      if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-500' }
      return { label: 'Obese', color: 'text-red-500' }
    }

    const category = getCategory(bmi)

    return (
      <div id={id} className={cn('p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title || 'BMI Calculator'}</h3>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setUnit('metric')}
            className={cn(
              'flex-1 py-2 rounded-lg font-medium transition',
              unit === 'metric' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            Metric
          </button>
          <button
            onClick={() => setUnit('imperial')}
            className={cn(
              'flex-1 py-2 rounded-lg font-medium transition',
              unit === 'imperial' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            Imperial
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Weight ({unit === 'metric' ? 'kg' : 'lbs'})
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder={unit === 'metric' ? '70' : '154'}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Height ({unit === 'metric' ? 'cm' : 'inches'})
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder={unit === 'metric' ? '175' : '69'}
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your BMI</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{bmi.toFixed(1)}</p>
            <p className={cn('text-lg font-medium mt-1', category.color)}>{category.label}</p>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>• Underweight: &lt;18.5</p>
            <p>• Normal: 18.5 - 24.9</p>
            <p>• Overweight: 25 - 29.9</p>
            <p>• Obese: ≥30</p>
          </div>
        </div>
      </div>
    )
  }

  // Basic calculator
  return (
    <div id={id} className={cn('bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden', className)}>
      {(title || showHistory) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
        </div>
      )}

      {showHistory && history.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 max-h-24 overflow-y-auto text-right">
          {history.map((item, i) => (
            <p key={i} className="text-xs text-gray-500 dark:text-gray-400">{item}</p>
          ))}
        </div>
      )}

      <div className="p-4 bg-gray-900 dark:bg-gray-950 text-right">
        <p className="text-3xl font-mono text-white truncate">{display}</p>
      </div>

      <div className="p-3 grid grid-cols-4 gap-2">
        {buttons.map((row, rowIndex) => (
          row.map((btn, btnIndex) => {
            const isOperator = ['÷', '×', '-', '+', '='].includes(btn)
            const isSpecial = ['C', '±', '%'].includes(btn)
            const isZero = btn === '0'

            return (
              <button
                key={`${rowIndex}-${btnIndex}`}
                onClick={() => {
                  if (btn === 'C') handleClear()
                  else if (btn === '±') setDisplay(String(parseFloat(display) * -1))
                  else if (btn === '%') setDisplay(String(parseFloat(display) / 100))
                  else if (btn === '.') handleDecimal()
                  else if (btn === '=') handleEquals()
                  else if (isOperator) handleOperator(btn)
                  else handleDigit(btn)
                }}
                className={cn(
                  'py-4 rounded-lg font-medium text-lg transition active:scale-95',
                  isZero && 'col-span-2',
                  isOperator && 'bg-indigo-600 hover:bg-indigo-700 text-white',
                  isSpecial && 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
                  !isOperator && !isSpecial && 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {btn}
              </button>
            )
          })
        ))}
      </div>
    </div>
  )
}

Calculator.displayName = 'Calculator'

Calculator.config = {
  id: 'calculator',
  name: 'Calculator',
  category: 'interactive',
  description: 'Interactive calculator widget',
  defaultProps: { type: 'basic', showHistory: false },
  editableFields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'type', label: 'Calculator Type', type: 'select', options: ['basic', 'tip', 'mortgage', 'bmi'] },
    { name: 'showHistory', label: 'Show History (Basic only)', type: 'boolean' },
  ],
}
