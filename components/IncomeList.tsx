'use client'

import { useState } from 'react'
import { Income } from '@/types'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'

interface IncomeListProps {
  incomes: Income[]
  onDelete: (id: string) => void
}

export default function IncomeList({ incomes, onDelete }: IncomeListProps) {
  const { formatAmount } = useCurrency()
  const { t } = useLanguage()
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

  const sortedIncomes = [...incomes].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t('incomes.title')}</h2>
        <div className="w-8 h-8"></div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {sortedIncomes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">{t('incomes.noIncomes')}</p>
            <p className="text-sm">{t('incomes.startAdding')}</p>
          </div>
        ) : (
          sortedIncomes.map(income => {
            const isDeleting = deletingIds.has(income.id)
            return (
              <div
                key={income.id}
                className={`flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 hover:border-green-500/20 transition-all duration-200 hover:shadow-md min-h-[72px] w-full ${
                  isDeleting ? 'animate-slide-out-left' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 flex items-center justify-center text-2xl leading-none">
                    <span className="emoji-dark">💰</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{income.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{format(new Date(income.date), 'd MMM yyyy')}</span>
                      {income.time && (
                        <>
                          <span>•</span>
                          <span>{income.time}</span>
                        </>
                      )}
                    </div>
                    {income.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {income.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-green-500">
                    +{formatAmount(income.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(income.id)}
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
