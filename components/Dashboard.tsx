'use client'

import { useState, useMemo } from 'react'
import { Expense, Income, categories, SavingsAccount } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import StatsCard from './StatsCard'
import SavingsAccountSelector from './SavingsAccountSelector'
import { Wallet, TrendingUp, Calendar, Target, ChevronLeft, ChevronRight, TrendingDown, PiggyBank, Plus, X } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'

interface DashboardProps {
  expenses: Expense[]
  incomes: Income[]
  filteredExpenses: Expense[]
  filteredIncomes: Income[]
  savings: number
  savingsAccounts: SavingsAccount[]
  activeSavingsAccountId: string | null
  onSelectSavingsAccount: (accountId: string) => void
  onCreateSavingsAccount: (name: string) => void
  onDeleteSavingsAccount: (accountId: string) => void
  onRenameSavingsAccount?: (accountId: string, newName: string) => void
  onToggleFavorite?: (accountId: string) => void
  selectedMonth: Date
  onMonthChange: (direction: 'prev' | 'next') => void
  onSavingsClick: () => void
  initialBalance: number
}

export default function Dashboard({ 
  expenses, 
  incomes,
  filteredExpenses,
  filteredIncomes,
  savings, 
  savingsAccounts,
  activeSavingsAccountId,
  onSelectSavingsAccount,
  onCreateSavingsAccount,
  onDeleteSavingsAccount,
  onRenameSavingsAccount,
  onToggleFavorite,
  selectedMonth, 
  onMonthChange, 
  onSavingsClick, 
  initialBalance 
}: DashboardProps) {
  const { formatAmount, currencySymbol } = useCurrency()
  const { t } = useLanguage()
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [newAccountName, setNewAccountName] = useState('')
  
  // Trouver le compte favori, le compte actif et le compte de base (premier compte créé)
  const favoriteAccount = savingsAccounts.find(acc => acc.isFavorite === true)
  const activeAccount = savingsAccounts.find(acc => acc.id === activeSavingsAccountId)
  const baseAccount = savingsAccounts.length > 0 
    ? [...savingsAccounts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
    : null
  
  // Déterminer le compte à afficher : favori en priorité (verrouillé), sinon actif
  const displayAccount = favoriteAccount || activeAccount || baseAccount
  
  // Nom par défaut du compte de base
  const defaultBaseAccountName = 'Compte épargne'
  
  // Déterminer le titre :
  // - "Épargne: [Nom]" si le compte affiché est différent du compte de base
  // - "Épargne: [Nom]" si le compte de base a été renommé (nom différent du nom par défaut)
  // - Sinon "Votre Épargne"
  const isBaseAccountRenamed = baseAccount && displayAccount && displayAccount.id === baseAccount.id && baseAccount.name !== defaultBaseAccountName
  const isDifferentFromBase = displayAccount && baseAccount && displayAccount.id !== baseAccount.id
  
  const savingsTitle = (isDifferentFromBase || isBaseAccountRenamed) && displayAccount
    ? `Épargne: ${displayAccount.name}`
    : t('dashboard.savings')
  
  // Filtrer les transferts (ne pas les compter dans les statistiques)
  const transferToTitle = t('savings.transferTo')
  const transferFromTitle = t('savings.transferFrom')
  
  const expensesWithoutTransfers = useMemo(
    () => expenses.filter(exp => exp.title !== transferToTitle),
    [expenses, transferToTitle]
  )
  
  const incomesWithoutTransfers = useMemo(
    () => incomes.filter(inc => inc.title !== transferFromTitle),
    [incomes, transferFromTitle]
  )
  
  const total = useMemo(
    () => expensesWithoutTransfers.reduce((sum, exp) => sum + exp.amount, 0),
    [expensesWithoutTransfers]
  )
  
  const totalIncomes = useMemo(
    () => incomesWithoutTransfers.reduce((sum, inc) => sum + inc.amount, 0),
    [incomesWithoutTransfers]
  )

  // Pour le solde, on inclut aussi les transferts pour refléter la baisse du solde
  const balanceExpenses = useMemo(
    () => expenses.reduce((sum, exp) => sum + exp.amount, 0),
    [expenses]
  )

  const balanceIncomes = useMemo(
    () => incomes.reduce((sum, inc) => sum + inc.amount, 0),
    [incomes]
  )

  // Le solde = revenus - dépenses + solde initial (transferts inclus)
  const balance = useMemo(
    () => balanceIncomes - balanceExpenses + initialBalance,
    [balanceIncomes, balanceExpenses, initialBalance]
  )
  
  // Vérifier si l'utilisateur a déjà défini un solde (a des transactions)
  const hasTransactions = expenses.length > 0 || incomes.length > 0
  
  // Déterminer le niveau d'alerte selon le solde
  const getWarningLevel = (balance: number): 'low' | 'medium' | 'critical' | null => {
    if (balance >= 100) return null // Pas d'alerte (vert)
    if (balance >= 30) return 'low' // Jaune (30-99)
    return 'critical' // Rouge (< 30)
  }
  
  const warningLevel = getWarningLevel(balance)
  // Ne pas afficher l'avertissement si l'utilisateur n'a jamais défini de solde
  const showWarning = hasTransactions && balance < 100 && balance >= 0
  // Ne pas afficher les couleurs d'alerte si l'utilisateur n'a jamais défini de solde
  const shouldShowWarningColors = hasTransactions
  
  // Utiliser format de date-fns avec la locale pour éviter les problèmes d'hydratation
  const monthName = format(selectedMonth, 'MMMM yyyy', { locale: fr })
  
  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate()
  const filteredExpensesForStats = filteredExpenses.filter(exp => exp.title !== transferToTitle)
  const avgPerDay = filteredExpensesForStats.length > 0 
    ? filteredExpensesForStats.reduce((sum, exp) => sum + exp.amount, 0) / daysInMonth 
    : 0
  
  const now = new Date()
  const isCurrentMonth = selectedMonth.getMonth() === now.getMonth() && 
                         selectedMonth.getFullYear() === now.getFullYear()
  
  const today = isCurrentMonth ? filteredExpensesForStats.filter(exp => {
    const expDate = new Date(exp.date)
    return expDate.toDateString() === now.toDateString()
  }) : []
  
  const todayTotal = today.reduce((sum, exp) => sum + exp.amount, 0)

  const categoryTotals = filteredExpensesForStats.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="space-y-6">
      {/* Navigation par mois */}
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4 shadow-lg">
        <button
          onClick={() => onMonthChange('prev')}
          className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label={t('nav.previousMonth')}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold capitalize text-foreground">
          {monthName}
        </h2>
        <button
          onClick={() => onMonthChange('next')}
          className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label={t('nav.nextMonth')}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Aujourd'hui */}
        {isCurrentMonth && (
          <StatsCard
            title={t('dashboard.today')}
            value={todayTotal.toString()}
            unit={currencySymbol}
            icon={Calendar}
            trend="neutral"
            onClick={() => {
              const calendarElement = document.getElementById('calendar-section')
              if (calendarElement) {
                calendarElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }}
          />
        )}
        {!isCurrentMonth && (
          <StatsCard
            title={t('dashboard.avgPerDay')}
            value={avgPerDay.toString()}
            unit={currencySymbol}
            icon={Target}
            trend="neutral"
          />
        )}
        
        {/* 2. Votre Solde */}
        <StatsCard
          title={t('dashboard.balance')}
          value={balance.toString()}
          unit={currencySymbol}
          icon={Wallet}
          trend={balance >= 0 ? 'up' : 'down'}
          showWarning={showWarning}
          warningLevel={shouldShowWarningColors ? warningLevel : null}
        />
        
        {/* 3. Votre Épargne */}
        <div className="relative">
          <StatsCard
            title={savingsTitle}
            value={savings.toString()}
            unit={currencySymbol}
            icon={PiggyBank}
            trend="neutral"
            onClick={onSavingsClick}
          />
          {/* Bouton + pour créer un nouveau compte épargne - en bas à droite */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsCreatingAccount(true)
            }}
            className="absolute bottom-2 right-2 z-10 w-6 h-6 rounded-lg bg-primary/10 dark:bg-white/10 text-foreground dark:text-white hover:bg-primary/20 dark:hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Créer un nouveau compte épargne"
            title="Créer un nouveau compte épargne"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <SavingsAccountSelector
            accounts={savingsAccounts}
            activeAccountId={activeSavingsAccountId}
            onSelectAccount={onSelectSavingsAccount}
            onCreateAccount={onCreateSavingsAccount}
            onDeleteAccount={onDeleteSavingsAccount}
            onRenameAccount={onRenameSavingsAccount}
            onToggleFavorite={onToggleFavorite}
          />
          
          {/* Modal de création de compte */}
          {isCreatingAccount && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => {
                  setIsCreatingAccount(false)
                  setNewAccountName('')
                }}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                  className="bg-card border border-border rounded-lg p-6 shadow-lg w-full max-w-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Créer un nouveau compte épargne</h3>
                    <button
                      onClick={() => {
                        setIsCreatingAccount(false)
                        setNewAccountName('')
                      }}
                      className="p-1 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (newAccountName.trim()) {
                        onCreateSavingsAccount(newAccountName.trim())
                        setNewAccountName('')
                        setIsCreatingAccount(false)
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom du compte</label>
                      <input
                        type="text"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        placeholder="Ex: Livret A, PEL, etc."
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                        required
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingAccount(false)
                          setNewAccountName('')
                        }}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                      >
                        Créer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* 4. Revenus */}
        <StatsCard
          title={t('dashboard.revenues')}
          value={totalIncomes.toString()}
          unit={currencySymbol}
          icon={TrendingUp}
          trend="neutral"
        />
        
        {/* 5. Dépenses Total */}
        <StatsCard
          title={t('dashboard.expenses')}
          value={total.toString()}
          unit={currencySymbol}
          icon={TrendingDown}
          trend="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">{t('dashboard.recentIncomes')}</h2>
          <div className="space-y-3">
            {filteredIncomes.filter(inc => inc.title !== transferFromTitle).slice(0, 3).map(income => {
              return (
                <div key={income.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl emoji-dark">💰</span>
                    <div>
                      <p className="font-medium">{income.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(income.date), 'd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-500">
                    +{formatAmount(income.amount)}
                  </span>
                </div>
              )
            })}
            {filteredIncomes.filter(inc => inc.title !== transferFromTitle).length === 0 && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                {t('dashboard.noIncomes')}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">{t('dashboard.recentExpenses')}</h2>
          <div className="space-y-3">
            {filteredExpenses.filter(exp => exp.title !== transferToTitle).slice(0, 3).map(expense => {
              const category = categories[expense.category]
              const categoryLabel = t(`category.${expense.category}`)
              return (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl emoji-dark">{category.icon}</span>
                    <div>
                      <p className="font-medium">{expense.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(expense.date), 'd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-500">
                    -{formatAmount(expense.amount)}
                  </span>
                </div>
              )
            })}
            {filteredExpenses.filter(exp => exp.title !== transferToTitle).length === 0 && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                {t('dashboard.noExpenses')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
