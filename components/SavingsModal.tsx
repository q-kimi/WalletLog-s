'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ArrowDown, ArrowUp, ChevronDown } from 'lucide-react'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'
import { SavingsAccount } from '@/types'

interface SavingsModalProps {
  isOpen: boolean
  onClose: () => void
  savings: number
  balance: number
  savingsAccounts: SavingsAccount[]
  activeSavingsAccountId: string | null
  onAddToSavings: (amount: number, accountId: string) => void
  onRemoveFromSavings: (amount: number, accountId: string) => void
  onTransferToSavings: (amount: number, accountId: string) => void
  onTransferFromSavings: (amount: number, accountId: string) => void
}

export default function SavingsModal({
  isOpen,
  onClose,
  savings,
  balance,
  savingsAccounts,
  activeSavingsAccountId,
  onAddToSavings,
  onRemoveFromSavings,
  onTransferToSavings,
  onTransferFromSavings,
}: SavingsModalProps) {
  const { formatAmount, currencySymbol } = useCurrency()
  const { t } = useLanguage()
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState<'add' | 'remove' | 'transferTo' | 'transferFrom'>('transferTo')
  const [isClosing, setIsClosing] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  // Initialiser le compte sélectionné
  useEffect(() => {
    if (savingsAccounts.length > 0) {
      const favoriteAccount = savingsAccounts.find(acc => acc.isFavorite === true)
      const accountToUse = favoriteAccount || savingsAccounts.find(acc => acc.id === activeSavingsAccountId) || savingsAccounts[0]
      setSelectedAccountId(accountToUse?.id || null)
    }
  }, [savingsAccounts, activeSavingsAccountId, isOpen])

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }

    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountMenuOpen])

  const selectedAccount = savingsAccounts.find(acc => acc.id === selectedAccountId)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      setAmount('')
    }, 300)
  }

  // Fonction pour formater un nombre avec des points comme séparateurs de milliers
  const formatNumberWithDots = (value: string): string => {
    // Retirer tous les points existants et les espaces
    const cleaned = value.replace(/\./g, '').replace(/\s/g, '')
    
    // Si vide ou seulement des caractères non numériques, retourner tel quel
    if (!cleaned || cleaned === '') return value
    
    // Séparer la partie entière et décimale
    const parts = cleaned.split(',')
    let integerPart = parts[0]
    const decimalPart = parts[1]
    
    // Formater la partie entière avec des points tous les 3 chiffres
    if (integerPart) {
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
    
    // Reconstruire avec la partie décimale si elle existe
    return decimalPart !== undefined ? `${integerPart},${decimalPart}` : integerPart
  }

  // Fonction pour parser une valeur formatée en nombre
  const parseFormattedNumber = (value: string): number => {
    // Retirer tous les points et remplacer la virgule par un point pour parseFloat
    const cleaned = value.replace(/\./g, '').replace(',', '.')
    return parseFloat(cleaned) || 0
  }

  const handleAmountFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Si la valeur est "0", vider le champ pour permettre la saisie directe
    const parsed = parseFormattedNumber(e.target.value)
    if (parsed === 0) {
      setAmount('')
    }
  }

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Formater la valeur au blur
    const value = e.target.value.trim()
    const numValue = parseFormattedNumber(value)
    
    if (value === '' || numValue === 0) {
      setAmount('')
    } else {
      // Reformater pour s'assurer que c'est bien formaté
      const cleaned = value.replace(/\./g, '').replace(',', '.')
      const formatted = formatNumberWithDots(cleaned.replace('.', ','))
      setAmount(formatted)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Permettre seulement les chiffres, les points et les virgules
    value = value.replace(/[^\d.,]/g, '')
    
    // Trouver le dernier séparateur décimal (point ou virgule)
    const lastDotIndex = value.lastIndexOf('.')
    const lastCommaIndex = value.lastIndexOf(',')
    const lastSeparatorIndex = Math.max(lastDotIndex, lastCommaIndex)
    
    if (lastSeparatorIndex !== -1) {
      // Il y a un séparateur décimal
      const beforeSeparator = value.substring(0, lastSeparatorIndex).replace(/[.,]/g, '')
      const separator = ',' // Utiliser toujours la virgule comme séparateur décimal
      const afterSeparator = value.substring(lastSeparatorIndex + 1).replace(/[.,]/g, '').substring(0, 2) // Limiter à 2 décimales
      value = beforeSeparator + separator + afterSeparator
    } else {
      // Pas de séparateur décimal, retirer tous les points/virgules
      value = value.replace(/[.,]/g, '')
    }
    
    // Formater avec des points comme séparateurs de milliers
    const formatted = formatNumberWithDots(value)
    setAmount(formatted)
  }

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFormattedNumber(amount)
    if (!numAmount || numAmount <= 0) return

    // Arrondir à 2 décimales pour éviter les problèmes de précision
    const roundedAmount = Math.round(numAmount * 100) / 100
    const roundedBalance = Math.round(balance * 100) / 100
    const selectedAccountBalance = selectedAccount ? Math.round(selectedAccount.balance * 100) / 100 : 0
    const roundedSavings = selectedAccountBalance

    if (!selectedAccountId) return

    switch (action) {
      case 'add':
        onAddToSavings(roundedAmount, selectedAccountId)
        break
      case 'remove':
        if (roundedAmount <= roundedSavings) {
          onRemoveFromSavings(roundedAmount, selectedAccountId)
        }
        break
      case 'transferTo':
        if (roundedAmount <= roundedBalance) {
          onTransferToSavings(roundedAmount, selectedAccountId)
        }
        break
      case 'transferFrom':
        if (roundedAmount <= roundedSavings) {
          onTransferFromSavings(roundedAmount, selectedAccountId)
        }
        break
    }

    setAmount('')
    // Ne pas réinitialiser l'action pour garder le sens de la flèche
  }

  // Arrondir à 2 décimales pour éviter les problèmes de précision des nombres à virgule flottante
  const numAmount = parseFormattedNumber(amount) || 0
  const roundedAmount = Math.round(numAmount * 100) / 100
  const roundedBalance = Math.round(balance * 100) / 100
  const selectedAccountBalance = selectedAccount ? Math.round(selectedAccount.balance * 100) / 100 : 0
  const roundedSavings = selectedAccountBalance
  
  const canTransferTo = action === 'transferTo' && roundedAmount > roundedBalance
  const canTransferFrom = action === 'transferFrom' && roundedAmount > roundedSavings
  const canRemove = action === 'remove' && roundedAmount > roundedSavings

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`bg-card border border-border rounded-lg p-6 shadow-lg w-full max-w-md ${isClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('savings.title')}</h2>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6 space-y-4">
            {/* Solde */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">{t('savings.currentBalance')}</p>
              <p className="text-2xl font-bold text-foreground">{formatAmount(balance)}</p>
            </div>

            {/* Flèche de transfert */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  if (action === 'transferTo') {
                    setAction('transferFrom')
                  } else if (action === 'transferFrom') {
                    setAction('transferTo')
                  } else {
                    setAction('transferTo')
                  }
                }}
                className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
                  action === 'transferTo' || action === 'transferFrom'
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                    : 'border-border hover:bg-secondary hover:border-primary/50'
                }`}
              >
                <div className="relative w-3 h-3 flex items-center justify-center">
                  <ArrowDown 
                    className={`w-3 h-3 absolute inset-0 m-auto transition-opacity duration-300 ${
                      action === 'transferTo' ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <ArrowUp 
                    className={`w-3 h-3 absolute inset-0 m-auto transition-opacity duration-300 ${
                      action === 'transferFrom' ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Épargne */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">{t('savings.currentSavings')}</p>
                {/* Menu déroulant pour choisir le compte épargne */}
                {savingsAccounts.length > 1 && (
                  <div className="relative" ref={accountMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 dark:bg-white/10 text-foreground dark:text-white hover:bg-primary/20 dark:hover:bg-white/20 transition-all duration-200 text-xs"
                    >
                      <span className="max-w-[80px] truncate">{selectedAccount?.name || 'Compte'}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isAccountMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        {savingsAccounts.map(account => (
                          <button
                            key={account.id}
                            type="button"
                            onClick={() => {
                              setSelectedAccountId(account.id)
                              setIsAccountMenuOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                              selectedAccountId === account.id
                                ? 'bg-primary/15 text-primary'
                                : 'hover:bg-secondary/70 text-foreground'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{account.name}</span>
                              {account.isFavorite === true && (
                                <span className="text-yellow-500 text-xs">★</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatAmount(account.balance)}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-primary">{formatAmount(selectedAccountBalance)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('form.amount')} ({currencySymbol})
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  onFocus={handleAmountFocus}
                  onBlur={handleAmountBlur}
                  className="w-full px-4 py-2 pr-12 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('form.amountPlaceholder')}
                  inputMode="decimal"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    if (action === 'transferTo') {
                      const formatted = formatNumberWithDots(balance.toFixed(2).replace('.', ','))
                      setAmount(formatted)
                    } else if (action === 'transferFrom') {
                      const formatted = formatNumberWithDots(selectedAccountBalance.toFixed(2).replace('.', ','))
                      setAmount(formatted)
                    }
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium rounded border border-border hover:bg-secondary transition-colors"
                >
                  Max
                </button>
              </div>
              {(canTransferTo || canTransferFrom || canRemove) && (
                <p className="text-sm text-red-500 mt-1">
                  {canTransferTo && t('savings.insufficientBalance')}
                  {canTransferFrom && t('savings.insufficientSavings')}
                  {canRemove && t('savings.insufficientSavings')}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                {t('form.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg border border-border bg-primary text-primary-foreground font-medium hover:bg-secondary transition-colors"
                disabled={canTransferTo || canTransferFrom || canRemove}
              >
                {t('form.add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
