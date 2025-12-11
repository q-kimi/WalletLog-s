'use client'

import { useState } from 'react'
import { Income } from '@/types'
import { X } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'
import DateInput from './DateInput'

interface IncomeFormProps {
  onSubmit: (income: Omit<Income, 'id'>) => void
  onCancel: () => void
  defaultDate?: string
}

export default function IncomeForm({ onSubmit, onCancel, defaultDate }: IncomeFormProps) {
  const { currencySymbol } = useCurrency()
  const { t } = useLanguage()
  const [title, setTitle] = useState(t('form.defaultIncomeTitle'))
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => {
    if (defaultDate) return defaultDate
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [time, setTime] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    const selectedDate = new Date(date)
    selectedDate.setHours(12, 0, 0, 0)

    onSubmit({
      title,
      amount: parseFloat(amount),
      description: description || undefined,
      date: selectedDate.toISOString(),
      time: time || undefined,
    })

    setTitle(t('form.defaultIncomeTitle'))
    setAmount('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setTime('')
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t('form.newIncome')}</h2>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder={t('form.amountPlaceholder')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('form.date')}</label>
          <DateInput
            value={date}
            onChange={(value) => setDate(value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('form.time')} ({t('form.timeOptional')})</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('form.description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
            placeholder={t('form.descriptionPlaceholder')}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            {t('form.cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg border border-border bg-primary text-primary-foreground font-medium hover:bg-secondary transition-colors"
          >
            {t('form.add')}
          </button>
        </div>
      </form>
    </div>
  )
}
