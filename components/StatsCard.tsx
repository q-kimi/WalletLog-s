'use client'

import { LucideIcon, AlertTriangle } from 'lucide-react'
import { useLanguage } from './LanguageProvider'

interface StatsCardProps {
  title: string
  value: string | number
  unit: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  onClick?: () => void
  showWarning?: boolean
  warningLevel?: 'low' | 'medium' | 'critical' | null
}

export default function StatsCard({ title, value, unit, icon: Icon, trend = 'neutral', onClick, showWarning, warningLevel }: StatsCardProps) {
  const { t } = useLanguage()
  
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
  
  // Convertir la valeur en nombre pour les calculs
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  const isNegative = numericValue < 0
  const trendColor = trend === 'down' ? 'text-red-500' : trend === 'up' ? 'text-green-500' : ''

  // Couleur de l'alerte selon le niveau (icône d'alerte)
  const warningColor = warningLevel === 'critical' 
    ? 'bg-red-500/10 text-red-500' 
    : warningLevel === 'medium' 
    ? 'bg-red-500/10 text-red-500' 
    : warningLevel === 'low'
    ? 'bg-yellow-400/10 text-yellow-400'
    : 'bg-green-500/10 text-green-500'

  // Couleur du texte selon le niveau (uniquement pour le solde avec warningLevel)
  // Si warningLevel est null, on n'applique pas les couleurs d'alerte
  const balanceColor = warningLevel !== undefined && warningLevel !== null
    ? (warningLevel === 'critical'
      ? 'text-red-500'
      : warningLevel === 'medium'
      ? 'text-red-500'
      : warningLevel === 'low'
      ? 'text-yellow-400'
      : 'text-green-500')
    : (isNegative
      ? 'text-red-500'
      : trendColor || 'text-foreground')

  return (
    <div 
      className={`bg-card border border-border rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className="flex items-center gap-0.5">
          {showWarning && warningLevel && (
            <div 
              className={`p-1.5 rounded-lg relative group ${warningColor}`}
            >
              <AlertTriangle className="w-4 h-4" />
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg text-sm text-card-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {warningLevel === 'critical' 
                  ? t('dashboard.criticalBalanceWarning').replace('{currency}', unit)
                  : t('dashboard.lowBalanceWarning').replace('{currency}', unit)}
              </div>
            </div>
          )}
          <div className={`p-2 rounded-lg ${warningLevel !== undefined ? 'bg-primary/10 text-foreground' : trend === 'down' ? 'bg-red-500/10 text-foreground' : trend === 'up' ? 'bg-green-500/10 text-foreground' : 'bg-primary/10 text-foreground'}`}>
            <Icon className="w-4 h-4 opacity-90" />
          </div>
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${balanceColor}`}>
          {isNegative ? '-' : ''}{formatNumberWithDots(Math.abs(numericValue))}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}
