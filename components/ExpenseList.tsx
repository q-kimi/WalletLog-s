'use client'

import { useState } from 'react'
import { Expense, Category, categories } from '@/types'
import { format } from 'date-fns'
import { Trash2, Filter, Repeat } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => void
}

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const { formatAmount } = useCurrency()
  const { t } = useLanguage()
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const handleDelete = (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      onDelete(id)
      setDeletingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 400)
  }
  
  const handleToggleFilters = () => {
    if (showFilters) {
      setIsClosing(true)
      setTimeout(() => {
        setShowFilters(false)
        setIsClosing(false)
      }, 300)
    } else {
      setShowFilters(true)
    }
  }

  const filteredExpenses = filter === 'all'
    ? expenses
    : expenses.filter(exp => exp.category === filter)

  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t('expenses.title')}</h2>
        <button
          onClick={handleToggleFilters}
          className="p-2 rounded-lg hover:bg-secondary transition-colors w-8 h-8 flex items-center justify-center"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {showFilters && (
        <div className={`mb-4 flex flex-wrap gap-2 ${isClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {t('expenses.all')}
          </button>
          {Object.entries(categories).map(([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => setFilter(key as Category)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filter === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {icon} {t(`category.${key}`)}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">{t('expenses.noExpenses')}</p>
            <p className="text-sm">{t('expenses.startAdding')}</p>
          </div>
        ) : (
          sortedExpenses.map(expense => {
            const category = categories[expense.category]
            const isDeleting = deletingIds.has(expense.id)
            return (
              <div
                key={expense.id}
                className={`flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 hover:border-red-500/20 transition-all duration-200 hover:shadow-md min-h-[72px] w-full ${
                  isDeleting ? 'animate-slide-out-left' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 flex items-center justify-center text-2xl leading-none">
                    <span className="emoji-dark">{category.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{expense.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{format(new Date(expense.date), 'd MMM yyyy')}</span>
                      {expense.time && (
                        <>
                          <span>•</span>
                          <span>{expense.time}</span>
                        </>
                      )}
                    </div>
                    {expense.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {expense.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-red-500">
                    -{formatAmount(expense.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={isDeleting}
                    className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors w-9 h-9 flex items-center justify-center disabled:opacity-50"
                    aria-label={t('form.cancel')}
                  >
                    <Trash2 className="w-5 h-5" />
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
