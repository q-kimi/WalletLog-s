'use client'

import { useMemo, useState } from 'react'
import { UserActionLogEntry, UserActionType } from '@/types'
import { X, Filter, Trash2, Undo2 } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'

interface ActionLogProps {
  isOpen: boolean
  onClose: () => void
  actions: UserActionLogEntry[]
  onDeleteLinkedItem: (action: UserActionLogEntry) => void
}

const typeLabels: Record<UserActionType, string> = {
  expense_added: 'Dépense ajoutée',
  income_added: 'Revenu ajouté',
  recurring_payment_added: 'Paiement récurrent ajouté',
  recurring_income_added: 'Revenu récurrent ajouté',
}

export default function ActionLog({
  isOpen,
  onClose,
  actions,
  onDeleteLinkedItem,
}: ActionLogProps) {
  const { formatAmount, currencySymbol } = useCurrency()
  const [filter, setFilter] = useState<UserActionType | 'all'>('all')

  const filteredActions = useMemo(
    () => (filter === 'all' ? actions : actions.filter(a => a.type === filter)),
    [actions, filter]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Carnet des actions</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filtrer par type</span>
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous</option>
            <option value="expense_added">Dépenses</option>
            <option value="income_added">Revenus</option>
            <option value="recurring_payment_added">Paiements récurrents</option>
            <option value="recurring_income_added">Revenus récurrents</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {filteredActions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aucune action enregistrée pour le moment.
            </p>
          ) : (
            filteredActions.map(action => {
              const date = new Date(action.date)
              const dateTimeLabel = isNaN(date.getTime())
                ? ''
                : date.toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })

              return (
                <div
                  key={action.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-background/80 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground">
                        {typeLabels[action.type]}
                      </span>
                      {dateTimeLabel && (
                        <span className="text-[11px] text-muted-foreground">
                          {dateTimeLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium">{action.title}</p>
                    {typeof action.amount === 'number' && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Montant&nbsp;: {formatAmount(action.amount)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => onDeleteLinkedItem(action)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <Undo2 className="w-3 h-3" />
                      Retirer
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}


