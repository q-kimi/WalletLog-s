'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Expense, Category, categories } from '@/types'
import { X, ChevronDown } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'
import DateInput from './DateInput'

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id'>) => void
  onCancel: () => void
  defaultDate?: string
}

export default function ExpenseForm({ onSubmit, onCancel, defaultDate }: ExpenseFormProps) {
  const { currencySymbol } = useCurrency()
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('autre')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => {
    if (defaultDate) return defaultDate
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [time, setTime] = useState('')
  
  // Mettre à jour la date si defaultDate change
  useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate)
    }
  }, [defaultDate])
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    const selectedDate = new Date(date)
    selectedDate.setHours(12, 0, 0, 0) // Évite les problèmes de fuseau horaire

    onSubmit({
      title,
      amount: parseFloat(amount),
      category,
      description: description || undefined,
      date: selectedDate.toISOString(),
      time: time || undefined,
    })

    setTitle('')
    setAmount('')
    setCategory('autre')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setTime('')
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t('form.newExpense')}</h2>
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
            placeholder={t('form.titlePlaceholder')}
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
