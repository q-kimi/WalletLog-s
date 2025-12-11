'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, X, TrendingDown, TrendingUp, Repeat, ChevronDown } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Expense, Income, RecurringPayment, RecurringIncome, Category, categories, RecurrenceType, PaymentType } from '@/types'
import ExpenseForm from './ExpenseForm'
import IncomeForm from './IncomeForm'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'
import DateInput from './DateInput'

interface CalendarProps {
  expenses: Expense[]
  incomes: Income[]
  recurringPayments: RecurringPayment[]
  recurringIncomes: RecurringIncome[]
  selectedMonth: Date
  onMonthChange: (direction: 'prev' | 'next') => void
  onAddExpense: (expense: Omit<Expense, 'id'>) => void
  onAddIncome: (income: Omit<Income, 'id'>) => void
  onAddRecurringPayment: (payment: Omit<RecurringPayment, 'id'>) => void
  onAddRecurringIncome: (income: Omit<RecurringIncome, 'id'>) => void
}

export default function Calendar({
  expenses,
  incomes,
  recurringPayments,
  recurringIncomes,
  selectedMonth,
  onMonthChange,
  onAddExpense,
  onAddIncome,
  onAddRecurringPayment,
  onAddRecurringIncome,
}: CalendarProps) {
  const { formatAmount } = useCurrency()
  const { t } = useLanguage()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [actionType, setActionType] = useState<'expense' | 'income' | 'recurringPayment' | 'recurringIncome' | null>(null)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [isDateMenuClosing, setIsDateMenuClosing] = useState(false)
  const [isFormClosing, setIsFormClosing] = useState(false)
  
  const handleCloseDateMenu = () => {
    setIsDateMenuClosing(true)
    setTimeout(() => {
      setSelectedDate(null)
      setActionType(null)
      setIsDateMenuClosing(false)
    }, 300)
  }
  
  const handleCloseForm = () => {
    setIsFormClosing(true)
    setTimeout(() => {
      setActionType(null)
      setIsFormClosing(false)
    }, 300)
  }
  
  const handleDateClick = (date: Date) => {
    if (selectedDate && !isSameDay(selectedDate, date) && !actionType) {
      // Changement de date : fermer d'abord avec animation, puis ouvrir la nouvelle
      setIsDateMenuClosing(true)
      setTimeout(() => {
        setSelectedDate(date)
        setActionType(null)
        setIsDateMenuClosing(false)
      }, 300)
    } else if (!selectedDate) {
      // Première sélection
      setSelectedDate(date)
    } else if (selectedDate && isSameDay(selectedDate, date)) {
      // Même date : ne rien faire
    } else {
      // Si on a un formulaire ouvert, on change juste la date
      setSelectedDate(date)
    }
  }

  // Générer toutes les dates de paiements récurrents pour le mois sélectionné
  const generateRecurringDates = () => {
    const dates: { date: Date; type: 'expense' | 'income'; amount: number; title: string; id: string; time?: string }[] = []
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    const monthStart = startOfMonth(selectedMonth)
    const monthEnd = endOfMonth(selectedMonth)

    // Générer les dépenses récurrentes
    recurringPayments
      .filter(p => p.isActive)
      .forEach(payment => {
        // Pour les paiements en plusieurs fois ou prêts, utiliser les dates d'échéance
        const effectiveStartDate = (payment.paymentType === 'installment' || payment.paymentType === 'loan') && payment.installmentStartDate
          ? new Date(payment.installmentStartDate)
          : new Date(payment.startDate)
        const effectiveEndDate = (payment.paymentType === 'installment' || payment.paymentType === 'loan') && payment.installmentEndDate
          ? new Date(payment.installmentEndDate)
          : (payment.endDate ? new Date(payment.endDate) : null)

        // Vérifier si le paiement doit être généré pour ce mois
        if (effectiveEndDate && effectiveEndDate < monthStart) return
        if (effectiveStartDate > monthEnd) return

        if (payment.recurrenceType === 'monthly') {
          const paymentDate = new Date(year, month, Math.min(payment.dayOfMonth, new Date(year, month + 1, 0).getDate()))
          if (paymentDate >= effectiveStartDate && (!effectiveEndDate || paymentDate <= effectiveEndDate)) {
            dates.push({
              date: paymentDate,
              type: 'expense',
              amount: payment.amount,
              title: payment.title,
              id: `recurring-${payment.id}-${year}-${month}`,
              time: payment.time,
            })
          }
        } else if (payment.recurrenceType === 'weekly') {
          const startDay = effectiveStartDate.getDay()
          for (let day = 1; day <= monthEnd.getDate(); day++) {
            const currentDate = new Date(year, month, day)
            if (currentDate.getDay() === startDay && currentDate >= effectiveStartDate) {
              if (effectiveEndDate && currentDate > effectiveEndDate) break
              dates.push({
                date: currentDate,
                type: 'expense',
                amount: payment.amount,
                title: payment.title,
                id: `recurring-${payment.id}-${year}-${month}-${day}`,
                time: payment.time,
              })
            }
          }
        } else if (payment.recurrenceType === 'yearly') {
          if (effectiveStartDate.getMonth() === month) {
            const paymentDate = new Date(year, month, Math.min(effectiveStartDate.getDate(), new Date(year, month + 1, 0).getDate()))
            if (paymentDate >= effectiveStartDate && (!effectiveEndDate || paymentDate <= effectiveEndDate)) {
              dates.push({
                date: paymentDate,
                type: 'expense',
                amount: payment.amount,
                title: payment.title,
                id: `recurring-${payment.id}-${year}-${month}`,
                time: payment.time,
              })
            }
          }
        }
      })

    // Générer les revenus récurrents
    recurringIncomes
      .filter(i => i.isActive)
      .forEach(income => {
        const startDate = new Date(income.startDate)
        const endDate = income.endDate ? new Date(income.endDate) : null

        // Vérifier si le revenu doit être généré pour ce mois
        if (endDate && endDate < monthStart) return
        if (startDate > monthEnd) return

        const incomeDate = new Date(year, month, Math.min(income.dayOfMonth, new Date(year, month + 1, 0).getDate()))
        if (incomeDate >= startDate && (!endDate || incomeDate <= endDate)) {
          dates.push({
            date: incomeDate,
            type: 'income',
            amount: income.amount,
            title: income.title,
            id: `recurring-income-${income.id}-${year}-${month}`,
            time: income.time,
          })
        }
      })

    return dates
  }

  const recurringDates = generateRecurringDates()

  // Réduire toutes les dates étendues lors du changement de mois
  const monthKey = format(selectedMonth, 'yyyy-MM')
  useEffect(() => {
    setExpandedDates(new Set())
  }, [monthKey])

  // Prochain paiement récurrent (dans le mois affiché, à partir d'aujourd'hui)
  const upcomingRecurringExpense = (() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const futureExpenses = recurringDates.filter(
      (rd) => rd.type === 'expense' && rd.date >= today
    )
    if (futureExpenses.length === 0) return null
    return futureExpenses.sort((a, b) => a.date.getTime() - b.date.getTime())[0]
  })()

  // Prochain revenu récurrent (dans le mois affiché, à partir d'aujourd'hui)
  const upcomingRecurringIncome = (() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const futureIncomes = recurringDates.filter(
      (rd) => rd.type === 'income' && rd.date >= today
    )
    if (futureIncomes.length === 0) return null
    return futureIncomes.sort((a, b) => a.date.getTime() - b.date.getTime())[0]
  })()
  const monthStart = startOfMonth(selectedMonth)
  const monthEnd = endOfMonth(selectedMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Obtenir les jours de la semaine précédant le premier jour du mois
  const firstDayOfWeek = getDay(monthStart)
  const daysBeforeMonth = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - (firstDayOfWeek - i))
    return date
  })

  // Obtenir les jours après le mois pour compléter la grille
  const daysAfterMonth = Array.from({ length: 42 - daysInMonth.length - daysBeforeMonth.length }, (_, i) => {
    const date = new Date(monthEnd)
    date.setDate(date.getDate() + i + 1)
    return date
  })

  const getDayData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // Dépenses du jour (exclure celles générées par des paiements récurrents car elles sont dans recurringDates)
    const dayExpenses = expenses.filter(exp => {
      const expDate = format(new Date(exp.date), 'yyyy-MM-dd')
      return expDate === dateStr && !exp.recurringPaymentId
    })

    // Revenus du jour (exclure ceux générés par des revenus récurrents car ils sont dans recurringDates)
    const dayIncomes = incomes.filter(inc => {
      const incDate = format(new Date(inc.date), 'yyyy-MM-dd')
      return incDate === dateStr && !inc.recurringIncomeId
    })

    // Paiements récurrents du jour
    const dayRecurringExpenses = recurringDates.filter(rd => 
      rd.type === 'expense' && format(rd.date, 'yyyy-MM-dd') === dateStr
    )

    // Revenus récurrents du jour
    const dayRecurringIncomes = recurringDates.filter(rd => 
      rd.type === 'income' && format(rd.date, 'yyyy-MM-dd') === dateStr
    )

    const totalExpenses = [...dayExpenses, ...dayRecurringExpenses].reduce((sum, e) => sum + e.amount, 0)
    const totalIncomes = [...dayIncomes, ...dayRecurringIncomes].reduce((sum, i) => sum + i.amount, 0)

    return {
      expenses: dayExpenses,
      incomes: dayIncomes,
      recurringExpenses: dayRecurringExpenses,
      recurringIncomes: dayRecurringIncomes,
      totalExpenses,
      totalIncomes,
      balance: totalIncomes - totalExpenses,
    }
  }

  const weekDays = [
    t('weekday.sun'),
    t('weekday.mon'),
    t('weekday.tue'),
    t('weekday.wed'),
    t('weekday.thu'),
    t('weekday.fri'),
    t('weekday.sat'),
  ]

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t('calendar.title')}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMonthChange('prev')}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label={t('nav.previousMonth')}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-medium capitalize min-w-[150px] text-center">
            {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
          </span>
          <button
            onClick={() => onMonthChange('next')}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label={t('nav.nextMonth')}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 items-start">
        {/* En-têtes des jours de la semaine */}
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Jours avant le mois */}
        {daysBeforeMonth.map((date, idx) => {
          const dayData = getDayData(date)
          const isOtherMonth = true
          return (
            <div
              key={`before-${idx}`}
              className={`p-2 min-h-[80px] border border-border rounded-lg ${
                isOtherMonth ? 'opacity-30' : ''
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1">
                {format(date, 'd')}
              </div>
              <div className="space-y-0.5">
                {/* Paiements récurrents avec noms */}
                {dayData.recurringExpenses.map((exp, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="text-red-500 font-medium truncate" title={exp.title}>
                      {exp.title}
                    </div>
                    <div className="text-red-500/70 text-[10px] font-bold underline decoration-2">
                      -{formatAmount(exp.amount)}
                    </div>
                  </div>
                ))}
                {/* Dépenses uniques */}
                {dayData.expenses.map((exp, idx) => (
                  <div key={`exp-${idx}`} className="text-xs">
                    <div className="text-red-500 font-medium truncate" title={exp.title}>
                      {exp.title}
                    </div>
                    <div className="text-red-500/70 text-[10px] font-bold underline decoration-2">
                      -{formatAmount(exp.amount)}
                    </div>
                  </div>
                ))}
                {/* Revenus récurrents avec noms */}
                {dayData.recurringIncomes.map((inc, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="text-green-500 font-medium truncate" title={inc.title}>
                      {inc.title}
                    </div>
                    <div className="text-green-500/70 text-[10px] font-bold underline decoration-2">
                      +{formatAmount(inc.amount)}
                    </div>
                  </div>
                ))}
                {/* Revenus uniques */}
                {dayData.incomes.map((inc, idx) => (
                  <div key={`inc-${idx}`} className="text-xs">
                    <div className="text-green-500 font-medium truncate" title={inc.title}>
                      {inc.title}
                    </div>
                    <div className="text-green-500/70 text-[10px] font-bold underline decoration-2">
                      +{formatAmount(inc.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Jours du mois */}
        {daysInMonth.map(date => {
          const dayData = getDayData(date)
          const isToday = isSameDay(date, new Date())
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const dateStr = format(date, 'yyyy-MM-dd')
          const isExpanded = expandedDates.has(dateStr)
          
          // Combiner toutes les transactions
          const allTransactions = [
            ...dayData.recurringExpenses.map(exp => ({ ...exp, type: 'expense' as const })),
            ...dayData.expenses.map(exp => ({ ...exp, type: 'expense' as const })),
            ...dayData.recurringIncomes.map(inc => ({ ...inc, type: 'income' as const })),
            ...dayData.incomes.map(inc => ({ ...inc, type: 'income' as const })),
          ]
          
          const MAX_VISIBLE = 1
          const visibleTransactions = isExpanded ? allTransactions : allTransactions.slice(0, MAX_VISIBLE)
          const remainingCount = allTransactions.length - MAX_VISIBLE
          
          const toggleExpand = (e: React.MouseEvent) => {
            e.stopPropagation()
            // Ajouter ou retirer cette date du Set des dates étendues
            const newExpandedDates = new Set(expandedDates)
            if (isExpanded) {
              newExpandedDates.delete(dateStr)
            } else {
              newExpandedDates.add(dateStr)
            }
            setExpandedDates(newExpandedDates)
          }
          
          return (
            <div
              key={dateStr}
              onClick={() => {
                handleDateClick(date)
                // Ne pas réduire les dates étendues lorsqu'on sélectionne une date
                // L'utilisateur peut maintenant avoir plusieurs cases ouvertes en même temps
              }}
              style={isExpanded ? { minHeight: '200px', zIndex: 10 } : undefined}
              className={`p-2 border rounded-lg cursor-pointer transition-all hover:bg-secondary/50 relative self-start ${
                isToday ? 'border-primary bg-primary/10' : 'border-border'
              } ${isSelected ? 'ring-2 ring-primary' : ''} ${
                isExpanded ? '' : 'min-h-[80px]'
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                {format(date, 'd')}
              </div>
              <div className="space-y-0.5">
                {visibleTransactions.map((transaction, idx) => {
                  const transferToTitle = t('savings.transferTo')
                  const transferFromTitle = t('savings.transferFrom')
                  const isTransferTo = transaction.title === transferToTitle
                  const isTransferFrom = transaction.title === transferFromTitle
                  const displayTitle = isTransferTo ? 'Solde → Epargne' : isTransferFrom ? 'Epargne → Solde' : transaction.title
                  
                  return (
                    <div key={idx} className="text-xs">
                      <div className={`font-medium truncate ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`} title={transaction.title}>
                        {displayTitle}
                      </div>
                      <div className="text-[10px]">
                        <span className={`font-bold underline decoration-2 ${transaction.type === 'expense' ? 'text-red-500/70' : 'text-green-500/70'}`}>
                          {transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}
                        </span>
                        {transaction.time && <span className="ml-1 text-foreground">• {transaction.time}</span>}
                      </div>
                    </div>
                  )
                })}
                {/* Solde du jour si pas de transactions */}
                {allTransactions.length === 0 && dayData.balance !== 0 && (
                  <div className={`text-xs font-semibold ${dayData.balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dayData.balance > 0 ? '+' : ''}{formatAmount(dayData.balance)}
                  </div>
                )}
              </div>
              {/* Indicateur +X en bas à droite */}
              {remainingCount > 0 && !isExpanded && (
                <button
                  onClick={toggleExpand}
                  className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-bold flex items-center justify-center transition-colors"
                  title={`${remainingCount} transaction${remainingCount > 1 ? 's' : ''} supplémentaire${remainingCount > 1 ? 's' : ''}`}
                >
                  +{remainingCount}
                </button>
              )}
              {/* Bouton - pour réduire */}
              {isExpanded && (
                <button
                  onClick={toggleExpand}
                  className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-bold flex items-center justify-center transition-colors"
                  title="Réduire"
                >
                  −
                </button>
              )}
            </div>
          )
        })}

        {/* Jours après le mois */}
        {daysAfterMonth.map((date, idx) => {
          const dayData = getDayData(date)
          const isOtherMonth = true
          return (
            <div
              key={`after-${idx}`}
              className={`p-2 min-h-[80px] border border-border rounded-lg ${
                isOtherMonth ? 'opacity-30' : ''
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1">
                {format(date, 'd')}
              </div>
              <div className="space-y-0.5">
                {/* Paiements récurrents avec noms */}
                {dayData.recurringExpenses.map((exp, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="text-red-500 font-medium truncate" title={exp.title}>
                      {exp.title}
                    </div>
                    <div className="text-red-500/70 text-[10px] font-bold underline decoration-2">
                      -{formatAmount(exp.amount)}
                    </div>
                  </div>
                ))}
                {/* Dépenses uniques */}
                {dayData.expenses.map((exp, idx) => (
                  <div key={`exp-${idx}`} className="text-xs">
                    <div className="text-red-500 font-medium truncate" title={exp.title}>
                      {exp.title}
                    </div>
                    <div className="text-red-500/70 text-[10px] font-bold underline decoration-2">
                      -{formatAmount(exp.amount)}
                    </div>
                  </div>
                ))}
                {/* Revenus récurrents avec noms */}
                {dayData.recurringIncomes.map((inc, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="text-green-500 font-medium truncate" title={inc.title}>
                      {inc.title}
                    </div>
                    <div className="text-green-500/70 text-[10px] font-bold underline decoration-2">
                      +{formatAmount(inc.amount)}
                    </div>
                  </div>
                ))}
                {/* Revenus uniques */}
                {dayData.incomes.map((inc, idx) => (
                  <div key={`inc-${idx}`} className="text-xs">
                    <div className="text-green-500 font-medium truncate" title={inc.title}>
                      {inc.title}
                    </div>
                    <div className="text-green-500/70 text-[10px] font-bold underline decoration-2">
                      +{formatAmount(inc.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Menu d'action ou formulaire pour le jour sélectionné */}
      {selectedDate && !actionType && (
        <div className={`mt-6 p-6 bg-card rounded-lg border border-border shadow-lg ${isDateMenuClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`} key={selectedDate.toISOString()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground capitalize">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </h3>
            <button
              onClick={handleCloseDateMenu}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Transactions existantes */}
          {(() => {
            const dayData = getDayData(selectedDate)
            const allExpenses = [...dayData.expenses, ...dayData.recurringExpenses]
            const allIncomes = [...dayData.incomes, ...dayData.recurringIncomes]

            return (
              <div className="space-y-4">
                {allExpenses.length > 0 && (
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <p className="text-sm font-semibold text-red-500 mb-2">{t('calendar.expenses')}</p>
                    <div className="space-y-2">
                      {allExpenses.map((exp, idx) => {
                        const transferToTitle = t('savings.transferTo')
                        const isTransferTo = exp.title === transferToTitle
                        const displayTitle = isTransferTo ? 'Solde → Epargne' : exp.title
                        return (
                          <div key={idx} className="text-sm flex justify-between items-center py-1.5">
                            <span className="text-foreground">
                              {displayTitle}
                              {exp.time && <span className="text-muted-foreground ml-2">• {exp.time}</span>}
                            </span>
                            <span className="text-red-500 font-bold underline decoration-2">-{formatAmount(exp.amount)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {allIncomes.length > 0 && (
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <p className="text-sm font-semibold text-green-500 mb-2">{t('calendar.incomes')}</p>
                    <div className="space-y-2">
                      {allIncomes.map((inc, idx) => {
                        const transferFromTitle = t('savings.transferFrom')
                        const isTransferFrom = inc.title === transferFromTitle
                        const displayTitle = isTransferFrom ? 'Epargne → Solde' : inc.title
                        return (
                          <div key={idx} className="text-sm flex justify-between items-center py-1.5">
                            <span className="text-foreground">
                              {displayTitle}
                              {inc.time && <span className="text-muted-foreground ml-2">• {inc.time}</span>}
                            </span>
                            <span className="text-green-500 font-bold underline decoration-2">+{formatAmount(inc.amount)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {(allExpenses.length > 0 || allIncomes.length > 0) && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                      <span className="text-sm font-semibold text-foreground">{t('calendar.dayBalance')}</span>
                      <span className={`text-lg font-bold ${dayData.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {dayData.balance >= 0 ? '+' : ''}{formatAmount(dayData.balance)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Menu d'actions */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-semibold mb-3 text-foreground">{t('calendar.addTransaction')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* 1. Revenu */}
                    <button
                      onClick={() => setActionType('income')}
                      className="flex items-center gap-3 p-4 rounded-lg border-2 border-border bg-background hover:bg-secondary hover:border-green-500/50 transition-all duration-200 text-left group"
                    >
                      <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t('calendar.income')}</p>
                        <p className="text-xs text-muted-foreground">{t('calendar.incomeDesc')}</p>
                      </div>
                    </button>
                    {/* 2. Revenu récurrent */}
                    <button
                      onClick={() => setActionType('recurringIncome')}
                      className="flex items-center gap-3 p-4 rounded-lg border-2 border-border bg-background hover:bg-secondary hover:border-green-500/50 transition-all duration-200 text-left group"
                    >
                      <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                        <Repeat className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t('calendar.recurringIncome')}</p>
                        <p className="text-xs text-muted-foreground">{t('calendar.recurringIncomeDesc')}</p>
                      </div>
                    </button>
                    {/* 3. Paiement récurrent */}
                    <button
                      onClick={() => setActionType('recurringPayment')}
                      className="flex items-center gap-3 p-4 rounded-lg border-2 border-border bg-background hover:bg-secondary hover:border-red-500/50 transition-all duration-200 text-left group"
                    >
                      <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                        <Repeat className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t('calendar.recurringPayment')}</p>
                        <p className="text-xs text-muted-foreground">{t('calendar.recurringPaymentDesc')}</p>
                      </div>
                    </button>
                    {/* 4. Dépense */}
                    <button
                      onClick={() => setActionType('expense')}
                      className="flex items-center gap-3 p-4 rounded-lg border-2 border-border bg-background hover:bg-secondary hover:border-red-500/50 transition-all duration-200 text-left group"
                    >
                      <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t('calendar.expense')}</p>
                        <p className="text-xs text-muted-foreground">{t('calendar.expenseDesc')}</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Formulaire de dépense */}
      {selectedDate && actionType === 'expense' && (
        <div className={`mt-6 ${isFormClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}>
          <ExpenseForm
            onSubmit={(expense) => {
              // S'assurer qu'on a toujours une date valide
              let expenseDate: Date
              if (expense.date) {
                expenseDate = new Date(expense.date)
              } else if (selectedDate) {
                expenseDate = new Date(selectedDate)
              } else {
                // Fallback ultime : date actuelle
                expenseDate = new Date()
              }
              
              expenseDate.setHours(12, 0, 0, 0)
              
              // Vérifier que les données sont valides avant d'ajouter
              if (expense.title && expense.amount && !isNaN(expenseDate.getTime())) {
                onAddExpense({
                  ...expense,
                  date: expenseDate.toISOString(),
                })
                
                // Fermer le formulaire après un court délai pour s'assurer que la transaction est ajoutée
                setTimeout(() => {
                  setSelectedDate(null)
                  setActionType(null)
                }, 100)
              }
            }}
            onCancel={handleCloseForm}
            defaultDate={format(selectedDate, 'yyyy-MM-dd')}
          />
        </div>
      )}

      {/* Formulaire de revenu */}
      {selectedDate && actionType === 'income' && (
        <div className={`mt-6 ${isFormClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}>
          <IncomeForm
            onSubmit={(income) => {
              // S'assurer qu'on a toujours une date valide
              let incomeDate: Date
              if (income.date) {
                incomeDate = new Date(income.date)
              } else if (selectedDate) {
                incomeDate = new Date(selectedDate)
              } else {
                // Fallback ultime : date actuelle
                incomeDate = new Date()
              }
              
              incomeDate.setHours(12, 0, 0, 0)
              
              // Vérifier que les données sont valides avant d'ajouter
              if (income.title && income.amount && !isNaN(incomeDate.getTime())) {
                onAddIncome({
                  ...income,
                  date: incomeDate.toISOString(),
                })
                
                // Fermer le formulaire après un court délai pour s'assurer que la transaction est ajoutée
                setTimeout(() => {
                  setSelectedDate(null)
                  setActionType(null)
                }, 100)
              }
            }}
            onCancel={handleCloseForm}
            defaultDate={format(selectedDate, 'yyyy-MM-dd')}
          />
        </div>
      )}

      {/* Formulaire de paiement récurrent */}
      {selectedDate && actionType === 'recurringPayment' && (
        <div className={`mt-6 ${isFormClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}>
          <RecurringPaymentFormCalendar
            selectedDate={selectedDate}
            onSubmit={(payment) => {
              onAddRecurringPayment(payment)
              setSelectedDate(null)
              setActionType(null)
            }}
            onCancel={handleCloseForm}
          />
        </div>
      )}

      {/* Formulaire de revenu récurrent */}
      {selectedDate && actionType === 'recurringIncome' && (
        <div className={`mt-6 ${isFormClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}>
          <RecurringIncomeFormCalendar
            selectedDate={selectedDate}
            onSubmit={(income) => {
              onAddRecurringIncome(income)
              setSelectedDate(null)
              setActionType(null)
            }}
            onCancel={handleCloseForm}
          />
        </div>
      )}
    </div>
  )
}

// Composant formulaire pour paiement récurrent depuis le calendrier
function RecurringPaymentFormCalendar({
  selectedDate,
  onSubmit,
  onCancel,
}: {
  selectedDate: Date
  onSubmit: (payment: Omit<RecurringPayment, 'id'>) => void
  onCancel: () => void
}) {
  const { currencySymbol } = useCurrency()
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('factures')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('monthly')
  const [dayOfMonth, setDayOfMonth] = useState(selectedDate.getDate())
  const [startDate, setStartDate] = useState(format(selectedDate, 'yyyy-MM-dd'))
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isCategoryClosing, setIsCategoryClosing] = useState(false)
  const [paymentType, setPaymentType] = useState<PaymentType>('normal')
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
  const [installmentStartDate, setInstallmentStartDate] = useState(format(selectedDate, 'yyyy-MM-dd'))
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
      dayOfMonth,
      startDate,
      time: time || undefined,
      isActive: true,
      paymentType: paymentType !== 'normal' ? paymentType : undefined,
      installmentStartDate: paymentType !== 'normal' && installmentStartDate ? installmentStartDate : undefined,
      installmentEndDate: paymentType !== 'normal' && installmentEndDate ? installmentEndDate : undefined,
    })
  }

  return (
    <div className="mt-6 bg-card border border-border rounded-lg p-6 shadow-lg animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t('form.newRecurringPayment')}</h2>
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
          <label className="block text-sm font-medium mb-2">Catégorie</label>
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

  // Composant formulaire pour revenu récurrent depuis le calendrier
  function RecurringIncomeFormCalendar({
  selectedDate,
  onSubmit,
  onCancel,
}: {
  selectedDate: Date
  onSubmit: (income: Omit<RecurringIncome, 'id'>) => void
  onCancel: () => void
}) {
  const { currencySymbol } = useCurrency()
  const { t } = useLanguage()
  const [title, setTitle] = useState(t('form.defaultIncomeTitle'))
  const [amount, setAmount] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState(selectedDate.getDate())
  const [startDate, setStartDate] = useState(format(selectedDate, 'yyyy-MM-dd'))
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    onSubmit({
      title,
      amount: parseFloat(amount),
      description: description || undefined,
      dayOfMonth,
      startDate,
      time: time || undefined,
      isActive: true,
    })
  }

  return (
    <div className="mt-6 bg-card border border-border rounded-lg p-6 shadow-lg animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t('form.newRecurringIncome')}</h2>
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
            onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
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
