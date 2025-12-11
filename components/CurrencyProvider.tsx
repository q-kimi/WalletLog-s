'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'CAD' | 'JPY'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatAmount: (amount: number) => string
  currencySymbol: string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
  CAD: 'C$',
  JPY: '¥',
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wallet-logs-currency')
      if (saved && (saved === 'EUR' || saved === 'USD' || saved === 'GBP' || saved === 'CHF' || saved === 'CAD' || saved === 'JPY')) {
        return saved as Currency
      }
    }
    return 'EUR'
  })

  useEffect(() => {
    localStorage.setItem('wallet-logs-currency', currency)
  }, [currency])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
  }

  // Fonction pour formater un nombre avec des points comme séparateurs de milliers
  const formatNumberWithDots = (num: number, decimals: number = 2): string => {
    const absNum = Math.abs(num)
    const fixed = absNum.toFixed(decimals)
    
    // Séparer la partie entière et décimale
    const parts = fixed.split('.')
    let integerPart = parts[0]
    const decimalPart = parts[1]
    
    // Formater la partie entière avec des points tous les 3 chiffres
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    
    // Reconstruire avec la partie décimale
    return decimalPart ? `${integerPart},${decimalPart}` : integerPart
  }

  const formatAmount = (amount: number): string => {
    const symbol = currencySymbols[currency]
    
    // Pour le yen, pas de décimales
    if (currency === 'JPY') {
      const formatted = formatNumberWithDots(Math.abs(amount), 0)
      return `${formatted} ${symbol}`
    }
    
    const formatted = formatNumberWithDots(Math.abs(amount), 2)
    
    // Position du symbole selon la devise
    if (currency === 'USD' || currency === 'CAD') {
      return `${symbol}${formatted}`
    }
    
    return `${formatted} ${symbol}`
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        currencySymbol: currencySymbols[currency],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency doit être utilisé dans un CurrencyProvider')
  }
  return context
}
