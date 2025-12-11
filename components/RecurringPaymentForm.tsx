'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { RecurringPayment, Category, categories, RecurrenceType, PaymentType } from '@/types'
import { X, ChevronDown } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'
import DateInput from './DateInput'

interface RecurringPaymentFormProps {
  onSubmit: (payment: Omit<RecurringPayment, 'id'>) => void
  onCancel: () => void
}

export default function RecurringPaymentForm({ onSubmit, onCancel }: RecurringPaymentFormProps) {
  const { currencySymbol } = useCurrency()
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('factures')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('monthly')
  // On stocke le jour du mois en string pour éviter de passer NaN au DOM quand l'input est vide
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isCategoryClosing, setIsCategoryClosing] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const categoryButtonRef = useRef<HTMLButtonElement>(null)
  const lastKeyPressTime = useRef<number>(0)
  
  // Filtrer les catégories selon la lettre tapée
  const filteredCategories = useMemo(() => {
    if (!categoryFilter) return Object.entries(categories)
    
    const filterLower = categoryFilter.toLowerCase()
    return Object.entries(categories).filter(([key, { label }]) => {
      const categoryLabel = label.toLowerCase()
      return categoryLabel.startsWith(filterLower)
    })
  }, [categoryFilter])
  
  // Réinitialiser le filtre quand le menu se ferme
  useEffect(() => {
    if (!isCategoryOpen) {
      setCategoryFilter('')
    }
  }, [isCategoryOpen])
  
  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Si c'est une lettre (a-z, A-Z) ou un caractère accentué
    if (e.key.length === 1 && /[a-zA-Zàâäéèêëïîôùûüÿç]/.test(e.key)) {
      e.preventDefault()
      const now = Date.now()
      
      // Si la dernière touche a été pressée il y a moins de 500ms, on accumule les lettres
      if (now - lastKeyPressTime.current < 500) {
        setCategoryFilter(prev => prev + e.key.toLowerCase())
      } else {
        // Sinon, on commence un nouveau filtre
        setCategoryFilter(e.key.toLowerCase())
      }
      
      lastKeyPressTime.current = now
      
      // Ouvrir le menu si ce n'est pas déjà fait
      if (!isCategoryOpen) {
        setIsCategoryOpen(true)
      }
      
      // Sélectionner la première catégorie correspondante
      if (filteredCategories.length > 0) {
        const firstMatch = filteredCategories[0][0] as Category
        setCategory(firstMatch)
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      // Réinitialiser le filtre avec Backspace
      setCategoryFilter('')
    } else if (e.key === 'Escape') {
      // Fermer le menu avec Escape
      handleCloseCategory()
    }
  }
  
  const handleToggleCategory = () => {
    if (isCategoryOpen) {
      setIsCategoryClosing(true)
      setTimeout(() => {
        setIsCategoryOpen(false)
        setIsCategoryClosing(false)
      }, 300)
    } else {
      setIsCategoryOpen(true)
    }
  }
  
  const handleCloseCategory = () => {
    setIsCategoryClosing(true)
    setTimeout(() => {
      setIsCategoryOpen(false)
      setIsCategoryClosing(false)
      setCategoryFilter('')
    }, 300)
  }
  const [paymentType, setPaymentType] = useState<PaymentType>('normal')
  const [installmentStartDate, setInstallmentStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [installmentEndDate, setInstallmentEndDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    onSubmit({
      title,
      amount: parseFloat(amount),
      category,
      description: description || undefined,
      recurrenceType,
      dayOfMonth: parseInt(dayOfMonth || '1', 10),
      startDate,
      time: time || undefined,
      isActive: true,
      paymentType: paymentType !== 'normal' ? paymentType : undefined,
      installmentStartDate: paymentType !== 'normal' && installmentStartDate ? installmentStartDate : undefined,
      installmentEndDate: paymentType !== 'normal' && installmentEndDate ? installmentEndDate : undefined,
    })

    setTitle('')
    setAmount('')
    setCategory('factures')
    setRecurrenceType('monthly')
    setDayOfMonth('1')
    setStartDate(new Date().toISOString().split('T')[0])
    setTime('')
    setDescription('')
    setPaymentType('normal')
    setInstallmentStartDate(new Date().toISOString().split('T')[0])
    setInstallmentEndDate('')
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t('recurring.newPayment')}</h2>
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
          placeholder={t('form.paymentTitlePlaceholder')}
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

      <div className="relative">
        <label className="block text-sm font-medium mb-2">{t('form.category')}</label>
        <button
          ref={categoryButtonRef}
          type="button"
          onClick={handleToggleCategory}
          onKeyDown={handleCategoryKeyDown}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{categories[category].icon}</span>
            <span>{t(`category.${category}`)}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isCategoryOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={handleCloseCategory}
            />
            <div className={`absolute z-20 w-full bottom-full mb-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto ${isCategoryClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}>
              {filteredCategories.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  Aucune catégorie trouvée
                </div>
              ) : (
                filteredCategories.map(([key, { label, icon, color }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setCategory(key as Category)
                    handleCloseCategory()
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary transition-colors ${
                    category === key ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-lg`}>
                    {icon}
                  </div>
                  <span className="flex-1 text-left">{t(`category.${key}`)}</span>
                  {category === key && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
              ))
              )}
            </div>
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('recurring.frequency')}</label>
        <select
          value={recurrenceType}
          onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="monthly">{t('recurring.monthly')}</option>
          <option value="weekly">{t('recurring.weekly')}</option>
          <option value="yearly">{t('recurring.yearly')}</option>
        </select>
      </div>

      {recurrenceType === 'monthly' && (
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
      )}

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
        <label className="block text-sm font-medium mb-2">{t('recurring.paymentType')}</label>
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value as PaymentType)}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="normal">{t('recurring.paymentTypeNormal')}</option>
          <option value="installment">{t('recurring.paymentTypeInstallment')}</option>
          <option value="loan">{t('recurring.paymentTypeLoan')}</option>
        </select>
      </div>

      {(paymentType === 'installment' || paymentType === 'loan') && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">{t('recurring.installmentStartDate')}</label>
            <DateInput
              value={installmentStartDate}
              onChange={(value) => setInstallmentStartDate(value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('recurring.installmentEndDate')}</label>
            <DateInput
              value={installmentEndDate}
              onChange={(value) => setInstallmentEndDate(value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </>
      )}

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
          rows={2}
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
