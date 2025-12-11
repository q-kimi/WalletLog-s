'use client'

import { useState } from 'react'
import type { RecurringIncome } from '@/types'
import { Plus, Trash2, Repeat, X } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'
import DateInput from './DateInput'

interface RecurringIncomeProps {
  recurringIncomes: RecurringIncome[]
  onAdd: (income: Omit<RecurringIncome, 'id'>) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export default function RecurringIncome({ 
  recurringIncomes, 
  onAdd, 
  onDelete, 
  onToggle 
}: RecurringIncomeProps) {
  const { formatAmount, currencySymbol } = useCurrency()
  const { t } = useLanguage()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isFormClosing, setIsFormClosing] = useState(false)
  
  const handleToggleForm = () => {
    if (isFormOpen) {
      setIsFormClosing(true)
      setTimeout(() => {
        setIsFormOpen(false)
        setIsFormClosing(false)
      }, 300)
    } else {
      setIsFormOpen(true)
    }
  }
  const [title, setTitle] = useState(t('form.defaultIncomeTitle'))
  const [amount, setAmount] = useState('')
  // On stocke le jour du mois en string pour éviter de passer NaN à l'input quand il est vide
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    onAdd({
      title,
      amount: parseFloat(amount),
      description: description || undefined,
      dayOfMonth: parseInt(dayOfMonth || '1', 10),
      startDate,
      isActive: true,
    })

    setTitle(t('form.defaultIncomeTitle'))
    setAmount('')
    setDayOfMonth('1')
    setStartDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setIsFormOpen(false)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-semibold">{t('recurring.incomes')}</h2>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleToggleForm}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className={`space-y-4 mb-4 ${isFormClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{t('recurring.newIncome')}</h3>
            <button
              type="button"
              onClick={handleToggleForm}
              className="p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('form.title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('form.incomeTitlePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('form.amount')} ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('recurring.dayOfMonth')}</label>
            <input
              type="number"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('recurring.startDate')}</label>
            <DateInput
              value={startDate}
              onChange={(value) => setStartDate(value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('form.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            {t('form.add')}
          </button>
        </form>
      ) : null}

      <div className="space-y-2">
        {recurringIncomes.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">
            {t('recurring.noIncomes')}
          </p>
        ) : (
          recurringIncomes.map(income => {
            return (
              <div
                key={income.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                  income.isActive 
                    ? 'border-green-500/30 bg-green-500/10 hover:border-green-500/50 hover:shadow-md' 
                    : 'border-border/50 bg-secondary/20 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-xl">
                    💰
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{income.title}</p>
                      {!income.isActive && (
                        <span className="text-xs text-muted-foreground">{t('recurring.disabled')}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatAmount(income.amount)} • {t('recurring.monthly')} • {t('recurring.dayOfMonth')} {income.dayOfMonth}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggle(income.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      income.isActive 
                        ? 'hover:bg-yellow-500/10 text-yellow-500' 
                        : 'hover:bg-green-500/10 text-green-500'
                    }`}
                    title={income.isActive ? t('recurring.deactivate') : t('recurring.activate')}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(income.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
