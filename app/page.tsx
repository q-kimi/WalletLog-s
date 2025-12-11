'use client'

import { useState, useEffect, useMemo } from 'react'
import Dashboard from '@/components/Dashboard'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import IncomeList from '@/components/IncomeList'
import RecurringPaymentForm from '@/components/RecurringPaymentForm'
import IncomeForm from '@/components/IncomeForm'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Profile from '@/components/Profile'
import Calendar from '@/components/Calendar'
import SavingsModal from '@/components/SavingsModal'
import { Expense, RecurringPayment, Income, RecurringIncome as RecurringIncomeType, UserActionLogEntry, UserActionType, SavingsAccount } from '@/types'
import ActionLog from '@/components/ActionLog'
import { useLanguage } from '@/components/LanguageProvider'

// Constantes pour les clés localStorage
const STORAGE_KEYS = {
  EXPENSES: 'budgstat-expenses',
  INCOMES: 'budgstat-incomes',
  RECURRING: 'budgstat-recurring',
  RECURRING_INCOMES: 'budgstat-recurring-incomes',
  SAVINGS: 'budgstat-savings',
  SAVINGS_ACCOUNTS: 'budgstat-savings-accounts',
  ACTIVE_SAVINGS_ACCOUNT_ID: 'budgstat-active-savings-account-id',
  INITIAL_BALANCE: 'budgstat-initial-balance',
  INITIAL_SAVINGS: 'budgstat-initial-savings',
  ACTIONS_LOG: 'budgstat-actions-log',
} as const

export default function Home() {
  const { t } = useLanguage()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([])
  const [recurringIncomes, setRecurringIncomes] = useState<RecurringIncomeType[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false)
  const [isRecurringPaymentFormOpen, setIsRecurringPaymentFormOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isActionLogOpen, setIsActionLogOpen] = useState(false)
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false)
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([])
  const [activeSavingsAccountId, setActiveSavingsAccountId] = useState<string | null>(null)
  const [initialBalance, setInitialBalance] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [actionsLog, setActionsLog] = useState<UserActionLogEntry[]>([])

  // Charger les données
  useEffect(() => {
    const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES)
    const savedIncomes = localStorage.getItem(STORAGE_KEYS.INCOMES)
    const savedRecurring = localStorage.getItem(STORAGE_KEYS.RECURRING)
    const savedRecurringIncomes = localStorage.getItem(STORAGE_KEYS.RECURRING_INCOMES)
    const savedSavings = localStorage.getItem(STORAGE_KEYS.SAVINGS)
    const savedInitialBalance = localStorage.getItem(STORAGE_KEYS.INITIAL_BALANCE)
    const savedActions = localStorage.getItem(STORAGE_KEYS.ACTIONS_LOG)
    
    // Charger les dépenses
    if (savedExpenses) {
      try {
        const parsed = JSON.parse(savedExpenses)
        // Vérifier que c'est bien un tableau
        if (Array.isArray(parsed)) {
          // Filtrer les données de test
          const withoutFake = parsed.filter((exp: Expense) => !exp.id?.startsWith('fake-'))
          setExpenses(withoutFake)
          if (withoutFake.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(withoutFake))
          }
        } else {
          setExpenses([])
        }
      } catch (e) {
        // Erreur silencieuse en production, log en développement
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du chargement des dépenses:', e)
        }
        setExpenses([])
      }
    } else {
      setExpenses([])
    }
    
    // Charger les revenus
    if (savedIncomes) {
      try {
        const parsed = JSON.parse(savedIncomes)
        if (Array.isArray(parsed)) {
          // Filtrer les données de test
          const withoutFake = parsed.filter((inc: Income) => !inc.id?.startsWith('fake-income-'))
          setIncomes(withoutFake)
          if (withoutFake.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(withoutFake))
          }
        } else {
          setIncomes([])
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du chargement des revenus:', e)
        }
        setIncomes([])
      }
    } else {
      setIncomes([])
    }
    
    // Charger les paiements récurrents
    if (savedRecurring) {
      try {
        const parsed = JSON.parse(savedRecurring)
        if (Array.isArray(parsed)) {
          // Filtrer les données de test
          const withoutFake = parsed.filter((p: RecurringPayment) => !p.id?.startsWith('fake-recurring-'))
          setRecurringPayments(withoutFake)
          if (withoutFake.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(withoutFake))
          }
        } else {
          setRecurringPayments([])
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du chargement des paiements récurrents:', e)
        }
        setRecurringPayments([])
      }
    } else {
      setRecurringPayments([])
    }
    
    // Charger les revenus récurrents
    if (savedRecurringIncomes) {
      try {
        const parsed = JSON.parse(savedRecurringIncomes)
        // Filtrer les données de test
        const withoutFake = Array.isArray(parsed) 
          ? parsed.filter((i: RecurringIncomeType) => !i.id?.startsWith('fake-recurring-income-'))
          : []
        setRecurringIncomes(withoutFake)
        if (withoutFake.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEYS.RECURRING_INCOMES, JSON.stringify(withoutFake))
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du chargement des revenus récurrents:', e)
        }
        setRecurringIncomes([])
      }
    } else {
      setRecurringIncomes([])
    }
    
    // Charger les comptes épargnes
    const savedSavingsAccounts = localStorage.getItem(STORAGE_KEYS.SAVINGS_ACCOUNTS)
    const savedActiveSavingsAccountId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SAVINGS_ACCOUNT_ID)
    
    if (savedSavingsAccounts) {
      try {
        const parsed = JSON.parse(savedSavingsAccounts)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavingsAccounts(parsed)
          if (savedActiveSavingsAccountId && parsed.find((acc: SavingsAccount) => acc.id === savedActiveSavingsAccountId)) {
            setActiveSavingsAccountId(savedActiveSavingsAccountId)
          } else {
            setActiveSavingsAccountId(parsed[0].id)
          }
        } else {
          // Migration depuis l'ancien système
          const savedInitialSavings = localStorage.getItem(STORAGE_KEYS.INITIAL_SAVINGS)
          const initialSavings = savedInitialSavings ? parseFloat(savedInitialSavings) || 0 : 0
          const oldSavings = savedSavings ? parseFloat(savedSavings) || 0 : 0
          const savingsValue = oldSavings > 0 ? oldSavings : initialSavings
          
          const defaultAccount: SavingsAccount = {
            id: `savings-${Date.now()}`,
            name: 'Compte épargne',
            balance: savingsValue,
            createdAt: new Date().toISOString(),
          }
          setSavingsAccounts([defaultAccount])
          setActiveSavingsAccountId(defaultAccount.id)
          localStorage.setItem(STORAGE_KEYS.SAVINGS_ACCOUNTS, JSON.stringify([defaultAccount]))
          localStorage.setItem(STORAGE_KEYS.ACTIVE_SAVINGS_ACCOUNT_ID, defaultAccount.id)
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du chargement des comptes épargnes:', e)
        }
        const defaultAccount: SavingsAccount = {
          id: `savings-${Date.now()}`,
          name: 'Compte épargne',
          balance: 0,
          createdAt: new Date().toISOString(),
        }
        setSavingsAccounts([defaultAccount])
        setActiveSavingsAccountId(defaultAccount.id)
      }
    } else {
      // Migration depuis l'ancien système
      const savedInitialSavings = localStorage.getItem(STORAGE_KEYS.INITIAL_SAVINGS)
      const initialSavings = savedInitialSavings ? parseFloat(savedInitialSavings) || 0 : 0
      const oldSavings = savedSavings ? parseFloat(savedSavings) || 0 : 0
      const savingsValue = oldSavings > 0 ? oldSavings : initialSavings
      
      const defaultAccount: SavingsAccount = {
        id: `savings-${Date.now()}`,
        name: 'Compte épargne',
        balance: savingsValue,
        createdAt: new Date().toISOString(),
      }
      setSavingsAccounts([defaultAccount])
      setActiveSavingsAccountId(defaultAccount.id)
      localStorage.setItem(STORAGE_KEYS.SAVINGS_ACCOUNTS, JSON.stringify([defaultAccount]))
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SAVINGS_ACCOUNT_ID, defaultAccount.id)
    }

    // Charger le solde initial (utilisé dans le Dashboard)
    if (savedInitialBalance) {
      const parsedInitialBalance = parseFloat(savedInitialBalance)
      setInitialBalance(isNaN(parsedInitialBalance) ? 0 : parsedInitialBalance)
    } else {
      setInitialBalance(0)
    }

    if (savedActions) {
      try {
        const parsed = JSON.parse(savedActions)
        setActionsLog(Array.isArray(parsed) ? parsed : [])
      } catch {
        setActionsLog([])
      }
    }
  }, [])

  // Sauvegarder les dépenses
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
    }
  }, [expenses])

  // Sauvegarder les revenus
  useEffect(() => {
    if (incomes.length > 0) {
      localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes))
    }
  }, [incomes])

  // Sauvegarder les paiements récurrents
  useEffect(() => {
    if (recurringPayments.length > 0) {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringPayments))
    }
  }, [recurringPayments])

  // Sauvegarder les revenus récurrents
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING_INCOMES, JSON.stringify(recurringIncomes))
  }, [recurringIncomes])

  // Sauvegarder les comptes épargnes
  useEffect(() => {
    if (savingsAccounts.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SAVINGS_ACCOUNTS, JSON.stringify(savingsAccounts))
    }
  }, [savingsAccounts])

  // Sauvegarder le compte actif
  useEffect(() => {
    if (activeSavingsAccountId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SAVINGS_ACCOUNT_ID, activeSavingsAccountId)
    }
  }, [activeSavingsAccountId])

  // Sauvegarder le carnet d'actions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIONS_LOG, JSON.stringify(actionsLog))
  }, [actionsLog])

  const addAction = (type: UserActionType, payload: { targetId: string; title: string; amount?: number; date: string; time?: string }) => {
    // Utiliser l'heure saisie si disponible, sinon l'heure actuelle
    let actionDate = new Date()
    if (payload.time) {
      // Si une heure a été saisie, l'utiliser avec la date de l'action
      const [hours, minutes] = payload.time.split(':').map(Number)
      const baseDate = new Date(payload.date)
      actionDate = new Date(baseDate)
      actionDate.setHours(hours, minutes, 0, 0)
    }
    
    const newAction: UserActionLogEntry = {
      id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      targetId: payload.targetId,
      title: payload.title,
      amount: payload.amount,
      date: actionDate.toISOString(),
    }
    setActionsLog(prev => [newAction, ...prev])
  }

  // Écouter les changements de solde initial et épargne initiale
  useEffect(() => {
    const handleInitialBalanceChanged = (e: CustomEvent) => {
      const newInitialBalance = e.detail ?? 0
      setInitialBalance(typeof newInitialBalance === 'number' ? newInitialBalance : 0)
    }

    const handleInitialSavingsChanged = (e: CustomEvent) => {
      const newInitialSavings = e.detail || 0
      
      // Définir directement le solde du compte épargne actif à la nouvelle valeur
      setSavingsAccounts(prev => {
        const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SAVINGS_ACCOUNT_ID)
        if (activeId) {
          return prev.map(acc => 
            acc.id === activeId 
              ? { ...acc, balance: Math.max(0, newInitialSavings) }
              : acc
          )
        }
        // Si aucun compte actif, créer un compte par défaut
        if (prev.length === 0) {
          const defaultAccount: SavingsAccount = {
            id: `savings-${Date.now()}`,
            name: 'Compte épargne',
            balance: Math.max(0, newInitialSavings),
            createdAt: new Date().toISOString(),
          }
          localStorage.setItem(STORAGE_KEYS.ACTIVE_SAVINGS_ACCOUNT_ID, defaultAccount.id)
          return [defaultAccount]
        }
        return prev
      })
    }

    window.addEventListener('initialBalanceChanged', handleInitialBalanceChanged as EventListener)
    window.addEventListener('initialSavingsChanged', handleInitialSavingsChanged as EventListener)

    return () => {
      window.removeEventListener('initialBalanceChanged', handleInitialBalanceChanged as EventListener)
      window.removeEventListener('initialSavingsChanged', handleInitialSavingsChanged as EventListener)
    }
  }, [])

  // Détecter automatiquement le mois actuel et changer si nécessaire
  useEffect(() => {
    const checkAndUpdateMonth = () => {
      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      setSelectedMonth(prev => {
        const prevMonth = new Date(prev.getFullYear(), prev.getMonth(), 1)
        // Si le mois sélectionné est différent du mois actuel, changer automatiquement
        if (prevMonth.getTime() !== currentMonth.getTime()) {
          return currentMonth
        }
        return prev
      })
    }

    // Vérifier immédiatement au montage
    checkAndUpdateMonth()
    
    // Vérifier toutes les minutes pour détecter un changement de mois
    const interval = setInterval(checkAndUpdateMonth, 60000) // 60000ms = 1 minute
    
    return () => clearInterval(interval)
  }, [])

  // Générer les revenus récurrents pour le mois sélectionné
  useEffect(() => {
    const generateRecurringIncomes = () => {
      const activeIncomes = recurringIncomes.filter(i => i.isActive)
      if (activeIncomes.length === 0) return

      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth()
      const newIncomes: Income[] = []
      
      activeIncomes.forEach(income => {
        const startDate = new Date(income.startDate)
        const endDate = income.endDate ? new Date(income.endDate) : null
        
        if (startDate.getTime() > new Date(year, month + 1, 0).getTime()) return
        if (endDate && endDate.getTime() < new Date(year, month, 1).getTime()) return

        const incomeDate = new Date(year, month, Math.min(income.dayOfMonth, new Date(year, month + 1, 0).getDate()))

        const incomeId = `recurring-income-${income.id}-${year}-${month}`
        const existingIncome = incomes.find(
          inc => inc.recurringIncomeId === income.id && 
          new Date(inc.date).getFullYear() === year &&
          new Date(inc.date).getMonth() === month
        )

        if (!existingIncome) {
          newIncomes.push({
            id: incomeId,
            title: income.title,
            amount: income.amount,
            description: income.description,
            date: incomeDate.toISOString(),
            time: income.time,
            isRecurring: true,
            recurringIncomeId: income.id,
          })
        }
      })

      if (newIncomes.length > 0) {
        setIncomes(prev => [...prev, ...newIncomes])
      }
    }

    generateRecurringIncomes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurringIncomes, selectedMonth])

  // Générer les dépenses récurrentes pour le mois sélectionné
  useEffect(() => {
    const generateRecurringExpenses = () => {
      const activePayments = recurringPayments.filter(p => p.isActive)
      if (activePayments.length === 0) return

      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth()
      const newExpenses: Expense[] = []
      
      activePayments.forEach(payment => {
        // Pour les paiements en plusieurs fois ou prêts, utiliser les dates d'échéance
        const effectiveStartDate = (payment.paymentType === 'installment' || payment.paymentType === 'loan') && payment.installmentStartDate
          ? new Date(payment.installmentStartDate)
          : new Date(payment.startDate)
        const effectiveEndDate = (payment.paymentType === 'installment' || payment.paymentType === 'loan') && payment.installmentEndDate
          ? new Date(payment.installmentEndDate)
          : (payment.endDate ? new Date(payment.endDate) : null)
        
        // Vérifier si le paiement doit être généré pour ce mois
        if (effectiveStartDate.getTime() > new Date(year, month + 1, 0).getTime()) return
        if (effectiveEndDate && effectiveEndDate.getTime() < new Date(year, month, 1).getTime()) return

        let expenseDate: Date | null = null

        if (payment.recurrenceType === 'monthly') {
          expenseDate = new Date(year, month, Math.min(payment.dayOfMonth, new Date(year, month + 1, 0).getDate()))
          // Vérifier que la date est dans la plage d'échéance
          if (expenseDate < effectiveStartDate || (effectiveEndDate && expenseDate > effectiveEndDate)) {
            expenseDate = null
          }
        } else if (payment.recurrenceType === 'weekly') {
          // Pour hebdomadaire, on génère pour la première occurrence du mois
          const firstDay = new Date(year, month, 1)
          const lastDay = new Date(year, month + 1, 0)
          const startDay = effectiveStartDate.getDay()
          
          for (let day = 1; day <= lastDay.getDate(); day++) {
            const currentDate = new Date(year, month, day)
            if (currentDate.getDay() === startDay && currentDate >= effectiveStartDate) {
              if (effectiveEndDate && currentDate > effectiveEndDate) break
              expenseDate = currentDate
              break
            }
          }
        } else if (payment.recurrenceType === 'yearly') {
          if (effectiveStartDate.getMonth() === month) {
            expenseDate = new Date(year, month, Math.min(effectiveStartDate.getDate(), new Date(year, month + 1, 0).getDate()))
            // Vérifier que la date est dans la plage d'échéance
            if (expenseDate < effectiveStartDate || (effectiveEndDate && expenseDate > effectiveEndDate)) {
              expenseDate = null
            }
          }
        }

        if (expenseDate) {
          const expenseId = `recurring-${payment.id}-${year}-${month}`
          const existingExpense = expenses.find(
            exp => exp.recurringPaymentId === payment.id && 
            new Date(exp.date).getFullYear() === year &&
            new Date(exp.date).getMonth() === month
          )

          if (!existingExpense) {
            newExpenses.push({
              id: expenseId,
              title: payment.title,
              amount: payment.amount,
              category: payment.category,
              description: payment.description,
              date: expenseDate.toISOString(),
              time: payment.time,
              isRecurring: true,
              recurringPaymentId: payment.id,
            })
          }
        }
      })

      if (newExpenses.length > 0) {
        setExpenses(prev => [...prev, ...newExpenses])
      }
    }

    generateRecurringExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurringPayments, selectedMonth])

  // Filtrer les dépenses par mois sélectionné
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date)
      return expDate.getFullYear() === selectedMonth.getFullYear() &&
             expDate.getMonth() === selectedMonth.getMonth()
    })
  }, [expenses, selectedMonth])

  // Filtrer les revenus par mois sélectionné
  const filteredIncomes = useMemo(() => {
    return incomes.filter(inc => {
      const incDate = new Date(inc.date)
      return incDate.getFullYear() === selectedMonth.getFullYear() &&
             incDate.getMonth() === selectedMonth.getMonth()
    })
  }, [incomes, selectedMonth])

  // Calculer le total des revenus du mois
  const totalIncomes = useMemo(() => {
    return filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0)
  }, [filteredIncomes])

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const id = Date.now().toString()
    const newExpense: Expense = {
      ...expense,
      id,
    }
    setExpenses([newExpense, ...expenses])
    addAction('expense_added', {
      targetId: id,
      title: newExpense.title,
      amount: newExpense.amount,
      date: newExpense.date,
      time: newExpense.time,
    })
    setIsAnimating(true)
    setTimeout(() => {
      setIsFormOpen(false)
      setIsAnimating(false)
    }, 300)
  }

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id))
  }

  const deleteIncome = (id: string) => {
    setIncomes(incomes.filter(inc => inc.id !== id))
  }

  const addIncome = (income: Omit<Income, 'id'>) => {
    const id = Date.now().toString()
    const newIncome: Income = {
      ...income,
      id,
    }
    setIncomes([newIncome, ...incomes])
    addAction('income_added', {
      targetId: id,
      title: newIncome.title,
      amount: newIncome.amount,
      date: newIncome.date,
      time: newIncome.time,
    })
    setIsAnimating(true)
    setTimeout(() => {
      setIsIncomeFormOpen(false)
      setIsAnimating(false)
    }, 300)
  }

  const handleOpenExpenseForm = () => {
    if (isIncomeFormOpen || isRecurringPaymentFormOpen) {
      setIsAnimating(true)
      setTimeout(() => {
        setIsIncomeFormOpen(false)
        setIsRecurringPaymentFormOpen(false)
        setIsAnimating(false)
        setTimeout(() => {
          setIsFormOpen(true)
        }, 50)
      }, 300)
    } else {
      setIsFormOpen(true)
    }
  }

  const handleOpenIncomeForm = () => {
    if (isFormOpen || isRecurringPaymentFormOpen) {
      setIsAnimating(true)
      setTimeout(() => {
        setIsFormOpen(false)
        setIsRecurringPaymentFormOpen(false)
        setIsAnimating(false)
        setTimeout(() => {
          setIsIncomeFormOpen(true)
        }, 50)
      }, 300)
    } else {
      setIsIncomeFormOpen(true)
    }
  }

  const handleCloseExpenseForm = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsFormOpen(false)
      setIsAnimating(false)
    }, 300)
  }

  const handleCloseIncomeForm = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsIncomeFormOpen(false)
      setIsAnimating(false)
    }, 300)
  }

  const handleOpenRecurringPaymentForm = () => {
    if (isFormOpen || isIncomeFormOpen) {
      setIsAnimating(true)
      setTimeout(() => {
        setIsFormOpen(false)
        setIsIncomeFormOpen(false)
        setIsAnimating(false)
        setTimeout(() => {
          setIsRecurringPaymentFormOpen(true)
        }, 50)
      }, 300)
    } else {
      setIsRecurringPaymentFormOpen(true)
    }
  }

  const handleCloseRecurringPaymentForm = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsRecurringPaymentFormOpen(false)
      setIsAnimating(false)
    }, 300)
  }

  const addRecurringIncome = (income: Omit<RecurringIncomeType, 'id'>) => {
    const id = Date.now().toString()
    const newIncome: RecurringIncomeType = {
      ...income,
      id,
    }
    setRecurringIncomes([...recurringIncomes, newIncome])
    addAction('recurring_income_added', {
      targetId: id,
      title: newIncome.title,
      amount: newIncome.amount,
      date: newIncome.startDate,
      time: newIncome.time,
    })
  }

  const deleteRecurringIncome = (id: string) => {
    setRecurringIncomes(recurringIncomes.filter(i => i.id !== id))
    setIncomes(incomes.filter(inc => inc.recurringIncomeId !== id))
  }

  const toggleRecurringIncome = (id: string) => {
    setRecurringIncomes(recurringIncomes.map(i => 
      i.id === id ? { ...i, isActive: !i.isActive } : i
    ))
  }

  const addRecurringPayment = (payment: Omit<RecurringPayment, 'id'>) => {
    const id = Date.now().toString()
    const newPayment: RecurringPayment = {
      ...payment,
      id,
    }
    setRecurringPayments([...recurringPayments, newPayment])
    addAction('recurring_payment_added', {
      targetId: id,
      title: newPayment.title,
      amount: newPayment.amount,
      date: newPayment.startDate,
      time: newPayment.time,
    })
    setIsAnimating(true)
    setTimeout(() => {
      setIsRecurringPaymentFormOpen(false)
      setIsAnimating(false)
    }, 300)
  }

  const deleteRecurringPayment = (id: string) => {
    setRecurringPayments(recurringPayments.filter(p => p.id !== id))
    // Supprimer aussi les dépenses générées
    setExpenses(expenses.filter(exp => exp.recurringPaymentId !== id))
  }

  const toggleRecurringPayment = (id: string) => {
    setRecurringPayments(recurringPayments.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ))
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  // Fonctions de gestion des comptes épargnes
  const createSavingsAccount = (name: string) => {
    const newAccount: SavingsAccount = {
      id: `savings-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      balance: 0,
      createdAt: new Date().toISOString(),
    }
    setSavingsAccounts(prev => [...prev, newAccount])
    setActiveSavingsAccountId(newAccount.id)
  }

  const deleteSavingsAccount = (accountId: string) => {
    if (savingsAccounts.length <= 1) return
    
    setSavingsAccounts(prev => {
      const filtered = prev.filter(acc => acc.id !== accountId)
      if (activeSavingsAccountId === accountId && filtered.length > 0) {
        setActiveSavingsAccountId(filtered[0].id)
      }
      return filtered
    })
  }

  const selectSavingsAccount = (accountId: string) => {
    if (savingsAccounts.find(acc => acc.id === accountId)) {
      setActiveSavingsAccountId(accountId)
    }
  }

  const renameSavingsAccount = (accountId: string, newName: string) => {
    if (!newName.trim()) return
    setSavingsAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, name: newName.trim() }
        : acc
    ))
  }

  const toggleFavoriteAccount = (accountId: string) => {
    setSavingsAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        // Si on active le favori, désactiver tous les autres
        const newIsFavorite = !(acc.isFavorite === true)
        if (newIsFavorite) {
          // Désactiver tous les autres favoris
          return { ...acc, isFavorite: true }
        } else {
          return { ...acc, isFavorite: false }
        }
      } else if (acc.isFavorite === true) {
        // Désactiver les autres favoris si on en active un nouveau
        return { ...acc, isFavorite: false }
      }
      return acc
    }))
  }
  
  // Calculer le compte épargne à afficher : favori en priorité, sinon actif
  const favoriteAccount = savingsAccounts.find(acc => acc.isFavorite)
  const displayAccount = favoriteAccount || savingsAccounts.find(acc => acc.id === activeSavingsAccountId) || savingsAccounts[0]
  const currentSavings = displayAccount?.balance ?? 0

  // Fonctions de gestion de l'épargne
  const addToSavings = (amount: number, accountId: string) => {
    if (!accountId) return
    setSavingsAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, balance: acc.balance + amount }
        : acc
    ))
  }

  const removeFromSavings = (amount: number, accountId: string) => {
    if (!accountId) return
    setSavingsAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, balance: Math.max(0, acc.balance - amount) }
        : acc
    ))
  }

  const transferToSavings = (amount: number, accountId: string) => {
    // Transférer du solde vers l'épargne
    if (!accountId) return
    setSavingsAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, balance: acc.balance + amount }
        : acc
    ))
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    
    const transferToTitle = t('savings.transferTo')
    const transferFromTitle = t('savings.transferFrom')
    
    // Chercher un transfert existant du même type pour aujourd'hui
    const existingTransferIndex = expenses.findIndex(exp => {
      const expDate = new Date(exp.date)
      expDate.setHours(0, 0, 0, 0)
      const expDateStr = expDate.toISOString().split('T')[0]
      return exp.title === transferToTitle && expDateStr === todayStr
    })
    
    // Chercher un transfert dans le sens opposé (revenu) pour aujourd'hui
    const existingOppositeTransferIndex = incomes.findIndex(inc => {
      const incDate = new Date(inc.date)
      incDate.setHours(0, 0, 0, 0)
      const incDateStr = incDate.toISOString().split('T')[0]
      return inc.title === transferFromTitle && incDateStr === todayStr
    })
    
    if (existingOppositeTransferIndex !== -1) {
      // Il y a un transfert dans le sens opposé, on diminue son montant
      const oppositeTransfer = incomes[existingOppositeTransferIndex]
      const newAmount = oppositeTransfer.amount - amount
      
      if (newAmount > 0) {
        // Mettre à jour le montant du transfert opposé
        setIncomes(incomes.map((inc, idx) => 
          idx === existingOppositeTransferIndex 
            ? { ...inc, amount: newAmount }
            : inc
        ))
      } else if (newAmount === 0) {
        // Supprimer le transfert opposé si le montant devient 0
        setIncomes(incomes.filter((_, idx) => idx !== existingOppositeTransferIndex))
      } else {
        // Le montant devient négatif, on crée un nouveau transfert dans le bon sens
        setIncomes(incomes.filter((_, idx) => idx !== existingOppositeTransferIndex))
        const newExpense: Expense = {
          id: Date.now().toString(),
          title: transferToTitle,
          amount: Math.abs(newAmount),
          category: 'autre',
          date: today.toISOString(),
        }
        setExpenses([newExpense, ...expenses])
      }
    } else if (existingTransferIndex !== -1) {
      // Il y a déjà un transfert du même type, on augmente son montant
      setExpenses(expenses.map((exp, idx) => 
        idx === existingTransferIndex 
          ? { ...exp, amount: exp.amount + amount }
          : exp
      ))
    } else {
      // Aucun transfert existant, on crée une nouvelle dépense
      const newExpense: Expense = {
        id: Date.now().toString(),
        title: transferToTitle,
        amount: amount,
        category: 'autre',
        date: today.toISOString(),
      }
      setExpenses([newExpense, ...expenses])
    }
  }

  const transferFromSavings = (amount: number, accountId: string) => {
    // Transférer de l'épargne vers le solde
    if (!accountId) return
    setSavingsAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, balance: Math.max(0, acc.balance - amount) }
        : acc
    ))
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    
    const transferToTitle = t('savings.transferTo')
    const transferFromTitle = t('savings.transferFrom')
    
    // Chercher un transfert existant du même type pour aujourd'hui
    const existingTransferIndex = incomes.findIndex(inc => {
      const incDate = new Date(inc.date)
      incDate.setHours(0, 0, 0, 0)
      const incDateStr = incDate.toISOString().split('T')[0]
      return inc.title === transferFromTitle && incDateStr === todayStr
    })
    
    // Chercher un transfert dans le sens opposé (dépense) pour aujourd'hui
    const existingOppositeTransferIndex = expenses.findIndex(exp => {
      const expDate = new Date(exp.date)
      expDate.setHours(0, 0, 0, 0)
      const expDateStr = expDate.toISOString().split('T')[0]
      return exp.title === transferToTitle && expDateStr === todayStr
    })
    
    if (existingOppositeTransferIndex !== -1) {
      // Il y a un transfert dans le sens opposé, on diminue son montant
      const oppositeTransfer = expenses[existingOppositeTransferIndex]
      const newAmount = oppositeTransfer.amount - amount
      
      if (newAmount > 0) {
        // Mettre à jour le montant du transfert opposé
        setExpenses(expenses.map((exp, idx) => 
          idx === existingOppositeTransferIndex 
            ? { ...exp, amount: newAmount }
            : exp
        ))
      } else if (newAmount === 0) {
        // Supprimer le transfert opposé si le montant devient 0
        setExpenses(expenses.filter((_, idx) => idx !== existingOppositeTransferIndex))
      } else {
        // Le montant devient négatif, on crée un nouveau transfert dans le bon sens
        setExpenses(expenses.filter((_, idx) => idx !== existingOppositeTransferIndex))
        const newIncome: Income = {
          id: Date.now().toString(),
          title: transferFromTitle,
          amount: Math.abs(newAmount),
          date: today.toISOString(),
        }
        setIncomes([newIncome, ...incomes])
      }
    } else if (existingTransferIndex !== -1) {
      // Il y a déjà un transfert du même type, on augmente son montant
      setIncomes(incomes.map((inc, idx) => 
        idx === existingTransferIndex 
          ? { ...inc, amount: inc.amount + amount }
          : inc
      ))
    } else {
      // Aucun transfert existant, on crée un nouveau revenu
      const newIncome: Income = {
        id: Date.now().toString(),
        title: transferFromTitle,
        amount: amount,
        date: today.toISOString(),
      }
      setIncomes([newIncome, ...incomes])
    }
  }

  const resetAllData = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
      // Vider tous les états
      setExpenses([])
      setIncomes([])
      setRecurringPayments([])
      setRecurringIncomes([])
      setActionsLog([])
      const defaultAccount: SavingsAccount = {
        id: `savings-${Date.now()}`,
        name: 'Compte épargne',
        balance: 0,
        createdAt: new Date().toISOString(),
      }
      setSavingsAccounts([defaultAccount])
      setActiveSavingsAccountId(defaultAccount.id)
      setInitialBalance(0)
      
      // Vider le localStorage
      localStorage.removeItem('budgstat-expenses')
      localStorage.removeItem('budgstat-incomes')
      localStorage.removeItem('budgstat-recurring')
      localStorage.removeItem('budgstat-recurring-incomes')
      localStorage.removeItem('budgstat-savings')
      localStorage.removeItem('budgstat-savings-accounts')
      localStorage.removeItem('budgstat-active-savings-account-id')
      localStorage.removeItem('budgstat-initial-balance')
      localStorage.removeItem('budgstat-initial-savings')
      localStorage.removeItem('budgstat-actions-log')
      
      // Supprimer le flag de réinitialisation pour permettre le rechargement des données de test
      localStorage.removeItem('budgstat-reset')
    }
  }

  const handleImport = (data: {
    expenses: Expense[]
    incomes: Income[]
    recurringPayments: RecurringPayment[]
    recurringIncomes: RecurringIncomeType[]
  }) => {
    // Mettre à jour les états
    setExpenses(data.expenses || [])
    setIncomes(data.incomes || [])
    setRecurringPayments(data.recurringPayments || [])
    setRecurringIncomes(data.recurringIncomes || [])
    setActionsLog([])
    
    // Sauvegarder dans le localStorage (même si vide pour nettoyer)
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses || []))
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(data.incomes || []))
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(data.recurringPayments || []))
    localStorage.setItem(STORAGE_KEYS.RECURRING_INCOMES, JSON.stringify(data.recurringIncomes || []))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        onProfileOpen={() => setIsProfileOpen(true)}
        onActionLogOpen={() => setIsActionLogOpen(true)}
      />
      <main className="container mx-auto px-4 py-8 max-w-7xl flex-1">
        {/* Section 1: Vue d'ensemble - Dashboard */}
        <section className="mb-8">
          <Dashboard 
            expenses={expenses}
            incomes={incomes}
            filteredExpenses={filteredExpenses}
            filteredIncomes={filteredIncomes}
            savings={currentSavings}
            savingsAccounts={savingsAccounts}
            activeSavingsAccountId={activeSavingsAccountId}
            onSelectSavingsAccount={selectSavingsAccount}
            onCreateSavingsAccount={createSavingsAccount}
            onDeleteSavingsAccount={deleteSavingsAccount}
            onRenameSavingsAccount={renameSavingsAccount}
            onToggleFavorite={toggleFavoriteAccount}
            initialBalance={initialBalance}
            selectedMonth={selectedMonth}
            onMonthChange={changeMonth}
            onSavingsClick={() => setIsSavingsModalOpen(true)}
          />
        </section>

        {/* Section 2: Actions rapides - Ajout de transactions */}
        <section className="mb-8">
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{t('actions.quickActions')}</h2>
            {isFormOpen ? (
              <div className={isAnimating ? 'animate-fade-out-down' : 'animate-fade-in-up'}>
                <ExpenseForm 
                  onSubmit={addExpense}
                  onCancel={handleCloseExpenseForm}
                />
              </div>
            ) : isIncomeFormOpen ? (
              <div className={isAnimating ? 'animate-fade-out-down' : 'animate-fade-in-up'}>
                <IncomeForm 
                  onSubmit={addIncome}
                  onCancel={handleCloseIncomeForm}
                />
              </div>
            ) : isRecurringPaymentFormOpen ? (
              <div className={isAnimating ? 'animate-fade-out-down' : 'animate-fade-in-up'}>
                <RecurringPaymentForm 
                  onSubmit={addRecurringPayment}
                  onCancel={handleCloseRecurringPaymentForm}
                />
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isAnimating ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <button
                  onClick={handleOpenIncomeForm}
                  className="p-6 rounded-lg border-2 border-dashed border-border hover:border-foreground hover:bg-secondary/30 transition-all duration-200 bg-card text-card-foreground hover:shadow-lg active:scale-95"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl transition-transform duration-200 group-hover:scale-110">+</span>
                    <span className="text-sm font-medium">{t('actions.addIncome')}</span>
                  </div>
                </button>
                <button
                  onClick={handleOpenRecurringPaymentForm}
                  className="p-6 rounded-lg border-2 border-dashed border-border hover:border-foreground hover:bg-secondary/30 transition-all duration-200 bg-card text-card-foreground hover:shadow-lg active:scale-95"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl transition-transform duration-200 group-hover:scale-110">+</span>
                    <span className="text-sm font-medium">{t('actions.addRecurringPayment')}</span>
                  </div>
                </button>
                <button
                  onClick={handleOpenExpenseForm}
                  className="p-6 rounded-lg border-2 border-dashed border-border hover:border-foreground hover:bg-secondary/30 transition-all duration-200 bg-card text-card-foreground hover:shadow-lg active:scale-95"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl transition-transform duration-200 group-hover:scale-110">+</span>
                    <span className="text-sm font-medium">{t('actions.addExpense')}</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Calendrier - Planification */}
        <section id="calendar-section" className="mb-8">
          <Calendar
            expenses={expenses}
            incomes={incomes}
            recurringPayments={recurringPayments}
            recurringIncomes={recurringIncomes}
            selectedMonth={selectedMonth}
            onMonthChange={changeMonth}
            onAddExpense={addExpense}
            onAddIncome={addIncome}
            onAddRecurringPayment={addRecurringPayment}
            onAddRecurringIncome={addRecurringIncome}
          />
        </section>

        {/* Section 4: Transactions du mois */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeList 
              incomes={filteredIncomes} 
              onDelete={deleteIncome}
            />
            <ExpenseList 
              expenses={filteredExpenses} 
              onDelete={deleteExpense}
            />
          </div>
        </section>

      </main>
      <Footer />
      <Profile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onImport={handleImport}
        onReset={resetAllData}
      />
      <ActionLog
        isOpen={isActionLogOpen}
        onClose={() => setIsActionLogOpen(false)}
        actions={actionsLog}
        onDeleteLinkedItem={(action) => {
          if (action.type === 'expense_added') {
            setExpenses(prev => prev.filter(exp => exp.id !== action.targetId))
          } else if (action.type === 'income_added') {
            setIncomes(prev => prev.filter(inc => inc.id !== action.targetId))
          } else if (action.type === 'recurring_payment_added') {
            setRecurringPayments(prev => prev.filter(p => p.id !== action.targetId))
            setExpenses(prev => prev.filter(exp => exp.recurringPaymentId !== action.targetId))
          } else if (action.type === 'recurring_income_added') {
            setRecurringIncomes(prev => prev.filter(i => i.id !== action.targetId))
            setIncomes(prev => prev.filter(inc => inc.recurringIncomeId !== action.targetId))
          }
          setActionsLog(prev => prev.filter(a => a.id !== action.id))
        }}
      />
      <SavingsModal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
        savings={currentSavings}
        savingsAccounts={savingsAccounts}
        activeSavingsAccountId={activeSavingsAccountId}
        balance={(() => {
          // Pour la validation dans le modal, on utilise le balance réel (avec transferts)
          // car les transferts affectent réellement le solde disponible
          const transferToTitle = t('savings.transferTo')
          const transferFromTitle = t('savings.transferFrom')
          const expensesWithoutTransfers = filteredExpenses.filter(exp => exp.title !== transferToTitle)
          const incomesWithoutTransfers = filteredIncomes.filter(inc => inc.title !== transferFromTitle)
          const totalExpenses = expensesWithoutTransfers.reduce((sum, exp) => sum + exp.amount, 0)
          const totalIncomes = incomesWithoutTransfers.reduce((sum, inc) => sum + inc.amount, 0)
          return totalIncomes - totalExpenses + initialBalance
        })()}
        onAddToSavings={addToSavings}
        onRemoveFromSavings={removeFromSavings}
        onTransferToSavings={transferToSavings}
        onTransferFromSavings={transferFromSavings}
      />
    </div>
  )
}
