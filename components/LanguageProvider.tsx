'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'fr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  getCategoryLabel: (category: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
    // Navigation
    'nav.previousMonth': 'Mois précédent',
    'nav.nextMonth': 'Mois suivant',
    
    // Dashboard
    'dashboard.revenues': 'Revenus',
    'dashboard.expenses': 'Dépenses totales',
    'dashboard.balance': 'Votre Solde',
    'dashboard.savings': 'Votre Épargne',
    'dashboard.today': "Aujourd'hui",
    'form.defaultIncomeTitle': 'Salaire',
    'dashboard.avgPerDay': 'Moyenne/jour',
    'dashboard.categoryBreakdown': 'Répartition par catégorie',
    'dashboard.recentExpenses': 'Dépenses récentes',
    'dashboard.noExpenses': 'Aucune dépense enregistrée',
    'dashboard.recentIncomes': 'Revenus récents',
    'dashboard.noIncomes': 'Aucun revenu enregistré',
    'dashboard.lowBalanceWarning': 'Attention : Votre solde est faible (moins de 100{currency})',
    'dashboard.criticalBalanceWarning': 'Attention : Votre solde est critique ! (moins de 30{currency})',
    
    // Calendar
    'calendar.title': 'Calendrier',
    'calendar.addTransaction': 'Ajouter une transaction',
    'calendar.expense': 'Dépense',
    'calendar.expenseDesc': 'Ajouter une dépense ponctuelle pour ce jour',
    'calendar.income': 'Revenu',
    'calendar.incomeDesc': 'Ajouter un revenu ponctuel pour ce jour',
    'calendar.recurringPayment': 'Paiement récurrent',
    'calendar.recurringPaymentDesc': 'Créer un paiement qui se répète automatiquement',
    'calendar.recurringIncome': 'Revenu récurrent',
    'calendar.recurringIncomeDesc': 'Créer un revenu qui se répète automatiquement',
    'calendar.expenses': 'Dépenses',
    'calendar.incomes': 'Revenus',
    'calendar.dayBalance': 'Solde du jour',
    'calendar.noTransaction': 'Aucune transaction ce jour',
    'calendar.nextRecurringPayment': 'Prochain paiement récurrent',
    'calendar.nextRecurringIncome': 'Prochain revenu récurrent',
    
    // Actions
    'actions.quickActions': 'Actions rapides',
    'actions.addExpense': 'Ajouter une dépense',
    'actions.addIncome': 'Ajouter un revenu',
    'actions.addRecurringPayment': 'Ajouter un paiement récurrent',
    
    // Expense List
    'expenses.title': 'Mes dépenses',
    'expenses.noExpenses': 'Aucune dépense',
    'expenses.startAdding': 'Commencez par ajouter votre première dépense',
    'expenses.all': 'Toutes',
    
    // Income List
    'incomes.title': 'Vos Revenus',
    'incomes.noIncomes': 'Aucun revenu',
    'incomes.startAdding': 'Commencez par ajouter votre premier revenu',
    
    // Recurring
    'recurring.payments': 'Paiements récurrents',
    'recurring.incomes': 'Revenus récurrents',
    'recurring.noPayments': 'Aucun paiement récurrent',
    'recurring.noIncomes': 'Aucun revenu récurrent',
    'recurring.newPayment': 'Nouveau paiement récurrent',
    'recurring.newIncome': 'Nouveau revenu récurrent',
    'recurring.monthly': 'Mensuel',
    'recurring.weekly': 'Hebdomadaire',
    'recurring.yearly': 'Annuel',
    'recurring.dayOfMonth': 'Jour du mois',
    'recurring.startDate': 'Date de début',
    'recurring.endDate': 'Date de fin (optionnel)',
    'recurring.frequency': 'Fréquence',
    'recurring.disabled': '(Désactivé)',
    'recurring.activate': 'Activer',
    'recurring.deactivate': 'Désactiver',
    'recurring.paymentType': 'Type de paiement',
    'recurring.paymentTypeNormal': 'Paiement récurrent normal',
    'recurring.paymentTypeInstallment': 'Paiement en plusieurs fois',
    'recurring.paymentTypeLoan': 'Prêt',
    'recurring.installmentStartDate': 'Date de début du paiement',
    'recurring.installmentEndDate': 'Date de fin du paiement',
    
    // Forms
    'form.title': 'Titre',
    'form.amount': 'Montant',
    'form.date': 'Date',
    'form.time': 'Heure',
    'form.timeOptional': 'optionnel',
    'form.category': 'Catégorie',
    'form.description': 'Description (optionnel)',
    'form.descriptionPlaceholder': 'Notes supplémentaires...',
    'form.add': 'Ajouter',
    'form.cancel': 'Annuler',
    'form.newExpense': 'Nouvelle dépense',
    'form.newIncome': 'Nouveau revenu',
    'form.newRecurringPayment': 'Nouveau paiement récurrent',
    'form.newRecurringIncome': 'Nouveau revenu récurrent',
    'form.titlePlaceholder': 'Ex: Courses',
    'form.incomeTitlePlaceholder': 'Ex: Salaire',
    'form.paymentTitlePlaceholder': 'Ex: Loyer',
    'form.amountPlaceholder': '0.00',
    
    // Profile
    'profile.title': 'Profil',
    'profile.username': 'Prénom',
    'profile.usernameDesc': "C'est quoi votre petit prénom ?",
    'profile.usernamePlaceholder': 'Entrez votre prénom',
    'profile.export': 'Exporter les données',
    'profile.exportDesc': 'Télécharger toutes vos données au format JSON',
    'profile.import': 'Importer les données',
    'profile.importDesc': 'Charger des données depuis un fichier JSON',
    'profile.initialBalance': 'Solde initial',
    'profile.initialBalanceDesc': 'Définissez votre solde de départ sur le compte',
    'profile.initialSavings': 'Épargne initiale',
    'profile.initialSavingsDesc': 'Définissez votre épargne de départ',
    'profile.currency': 'Devise',
    'profile.currencyDesc': 'Choisissez votre devise préférée',
    'profile.language': 'Langue',
    'profile.languageDesc': 'Choisissez votre langue préférée',
    'profile.mode': 'Mode',
    'profile.modeDesc': 'Mode simple ou avancé',
    'profile.modeSimple': 'Mode simple',
    'profile.modeAdvanced': 'Mode avancé',
    'profile.reset': 'Réinitialiser toutes les données',
    'profile.resetDesc': 'Supprimer définitivement toutes vos données',
    'profile.dataStored': 'Les données sont stockées localement dans votre navigateur',
    
    // Days of week
    'weekday.sun': 'Dim',
    'weekday.mon': 'Lun',
    'weekday.tue': 'Mar',
    'weekday.wed': 'Mer',
    'weekday.thu': 'Jeu',
    'weekday.fri': 'Ven',
    'weekday.sat': 'Sam',
    
    // Categories
    'category.alimentation': 'Alimentation',
    'category.restaurants': 'Restaurants',
    'category.transport': 'Transport',
    'category.logement': 'Logement',
    'category.factures': 'Factures',
    'category.shopping': 'Shopping',
    'category.santé': 'Santé',
    'category.sport': 'Sport',
    'category.divertissement': 'Divertissement',
    'category.voyages': 'Voyages',
    'category.voiture': 'Voiture',
    'category.abonnements': 'Abonnements',
    'category.éducation': 'Éducation',
    'category.animaux': 'Animaux',
    'category.cadeaux': 'Cadeaux',
    'category.beauté': 'Beauté',
    'category.impôts': 'Impôts',
    'category.autre': 'Autre',
    
    // Header
    'header.subtitle': 'Votre comptabilité personnelle',
    'header.profileTooltip': 'Profil - Importer/Exporter/Réinitialiser les données',
    
    // Savings
    'savings.title': 'Gérer l\'épargne',
    'savings.currentSavings': 'Épargne actuelle',
    'savings.currentBalance': 'Solde actuel',
    'savings.action': 'Action',
    'savings.add': 'Ajouter',
    'savings.remove': 'Retirer',
    'savings.transferTo': 'Vers épargne',
    'savings.transferFrom': 'Vers solde',
    'savings.insufficientBalance': 'Solde insuffisant',
    'savings.insufficientSavings': 'Épargne insuffisante',
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr') // Toujours 'fr' par défaut
  const [mounted, setMounted] = useState(false)

  // Charger la langue sauvegardée après le montage côté client
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wallet-logs-language')
      if (saved === 'fr') {
        setLanguageState('fr')
      }
      // On ignore 'en' même s'il est sauvegardé, on force 'fr'
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      // Toujours sauvegarder 'fr' même si l'utilisateur essaie de changer
      localStorage.setItem('wallet-logs-language', 'fr')
    }
  }, [mounted])

  const setLanguage = (newLanguage: Language) => {
    // Ne permettre que le français pour l'instant
    if (newLanguage === 'fr') {
      setLanguageState('fr')
      if (mounted) {
        localStorage.setItem('wallet-logs-language', 'fr')
      }
    }
    // Ignorer les tentatives de changement vers 'en'
  }

  const t = (key: string): string => {
    return translations[key as keyof typeof translations] || key
  }

  const getCategoryLabel = (category: string): string => {
    const categoryKey = `category.${category}` as keyof typeof translations
    return translations[categoryKey] || category
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getCategoryLabel,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage doit être utilisé dans un LanguageProvider')
  }
  return context
}
