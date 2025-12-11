'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { RecurringPayment, Category, categories, RecurrenceType } from '@/types'
import { Plus, Trash2, Repeat, X, ChevronDown } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'
import DateInput from './DateInput'

interface RecurringPaymentsProps {
  recurringPayments: RecurringPayment[]
  onAdd: (payment: Omit<RecurringPayment, 'id'>) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export default function RecurringPayments({ 
  recurringPayments, 
  onAdd, 
  onDelete, 
  onToggle 
}: RecurringPaymentsProps) {
  const { formatAmount, currencySymbol } = useCurrency()
  const { t } = useLanguage()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('factures')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('monthly')
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [description, setDescription] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isCategoryClosing, setIsCategoryClosing] = useState(false)
  const [isFormClosing, setIsFormClosing] = useState(false)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    onAdd({
      title,
      amount: parseFloat(amount),
      category,
      description: description || undefined,
      recurrenceType,
      dayOfMonth,
      startDate,
      isActive: true,
    })

    setTitle('')
    setAmount('')
    setCategory('factures')
    setRecurrenceType('monthly')
    setDayOfMonth(1)
    setStartDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setIsFormOpen(false)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5" />
          <h2 className="text-xl font-semibold">{t('recurring.payments')}</h2>
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
            <h3 className="font-medium">{t('recurring.newPayment')}</h3>
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
                onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
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
        {recurringPayments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">
            {t('recurring.noPayments')}
          </p>
        ) : (
          recurringPayments.map(payment => {
            const categoryInfo = categories[payment.category]
            return (
              <div
                key={payment.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                  payment.isActive 
                    ? 'border-border bg-secondary/50 hover:border-primary/20 hover:shadow-md' 
                    : 'border-border/50 bg-secondary/20 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl emoji-dark">{categoryInfo.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{payment.title}</p>
                      {!payment.isActive && (
                        <span className="text-xs text-muted-foreground">{t('recurring.disabled')}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatAmount(payment.amount)} • {payment.recurrenceType === 'monthly' ? t('recurring.monthly') : 
                        payment.recurrenceType === 'weekly' ? t('recurring.weekly') : t('recurring.yearly')} • 
                      {payment.recurrenceType === 'monthly' && ` ${t('recurring.dayOfMonth')} ${payment.dayOfMonth}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggle(payment.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      payment.isActive 
                        ? 'hover:bg-yellow-500/10 text-yellow-500' 
                        : 'hover:bg-green-500/10 text-green-500'
                    }`}
                    title={payment.isActive ? t('recurring.deactivate') : t('recurring.activate')}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(payment.id)}
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
