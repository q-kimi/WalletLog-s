export type Category = 
  | 'alimentation'
  | 'restaurants'
  | 'transport'
  | 'logement'
  | 'factures'
  | 'shopping'
  | 'santé'
  | 'sport'
  | 'divertissement'
  | 'voyages'
  | 'voiture'
  | 'abonnements'
  | 'éducation'
  | 'animaux'
  | 'cadeaux'
  | 'beauté'
  | 'impôts'
  | 'autre'

export interface Expense {
  id: string
  title: string
  amount: number
  category: Category
  date: string
  time?: string // Format HH:mm
  description?: string
  isRecurring?: boolean
  recurringPaymentId?: string
}

export type RecurrenceType = 'monthly' | 'weekly' | 'yearly'

export type PaymentType = 'normal' | 'installment' | 'loan' // normal = paiement récurrent normal, installment = paiement en plusieurs fois, loan = prêt

export interface RecurringPayment {
  id: string
  title: string
  amount: number
  category: Category
  description?: string
  recurrenceType: RecurrenceType
  dayOfMonth: number // Jour du mois (1-31)
  startDate: string // Date de début
  endDate?: string // Date de fin (optionnel)
  time?: string // Format HH:mm
  isActive: boolean
  paymentType?: PaymentType // Type de paiement (normal par défaut)
  installmentStartDate?: string // Date de début du paiement en plusieurs fois/prêt
  installmentEndDate?: string // Date de fin du paiement en plusieurs fois/prêt
}

export interface Income {
  id: string
  title: string
  amount: number
  date: string
  time?: string // Format HH:mm
  description?: string
  isRecurring?: boolean
  recurringIncomeId?: string
}

export interface RecurringIncome {
  id: string
  title: string
  amount: number
  description?: string
  dayOfMonth: number // Jour du mois (1-31)
  startDate: string // Date de début
  endDate?: string // Date de fin (optionnel)
  time?: string // Format HH:mm
  isActive: boolean
}

export type UserActionType =
  | 'expense_added'
  | 'income_added'
  | 'recurring_payment_added'
  | 'recurring_income_added'

export interface UserActionLogEntry {
  id: string
  type: UserActionType
  targetId: string
  title: string
  amount?: number
  date: string // ISO
}

export interface SavingsAccount {
  id: string
  name: string
  balance: number
  createdAt: string // ISO
  isFavorite?: boolean // Compte favori à afficher sur l'UI
}

export const categories: Record<Category, { label: string; icon: string; color: string }> = {
  alimentation: { label: 'Alimentation', icon: '🛒', color: 'bg-orange-500' },
  restaurants: { label: 'Restaurants', icon: '🍽️', color: 'bg-orange-600' },
  transport: { label: 'Transport', icon: '🚗', color: 'bg-blue-500' },
  logement: { label: 'Logement', icon: '🏠', color: 'bg-purple-500' },
  factures: { label: 'Factures', icon: '💳', color: 'bg-indigo-500' },
  shopping: { label: 'Shopping', icon: '🛍️', color: 'bg-pink-500' },
  santé: { label: 'Santé', icon: '🏥', color: 'bg-red-500' },
  sport: { label: 'Sport', icon: '⚽', color: 'bg-emerald-500' },
  divertissement: { label: 'Divertissement', icon: '🎬', color: 'bg-yellow-500' },
  voyages: { label: 'Voyages', icon: '✈️', color: 'bg-cyan-500' },
  voiture: { label: 'Voiture', icon: '🚙', color: 'bg-blue-600' },
  abonnements: { label: 'Abonnements', icon: '📱', color: 'bg-violet-500' },
  éducation: { label: 'Éducation', icon: '📚', color: 'bg-green-500' },
  animaux: { label: 'Animaux', icon: '🐾', color: 'bg-amber-500' },
  cadeaux: { label: 'Cadeaux', icon: '🎁', color: 'bg-rose-500' },
  beauté: { label: 'Beauté', icon: '💄', color: 'bg-fuchsia-500' },
  impôts: { label: 'Impôts', icon: '📊', color: 'bg-slate-500' },
  autre: { label: 'Autre', icon: '📦', color: 'bg-gray-500' },
}
