'use client'

import { useState, useRef, useEffect } from 'react'
import { User, Download, Upload, X, Trash2, DollarSign, Languages, Camera } from 'lucide-react'
import { Expense, RecurringPayment, Income, RecurringIncome } from '@/types'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'

interface ProfileProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: {
    expenses: Expense[]
    incomes: Income[]
    recurringPayments: RecurringPayment[]
    recurringIncomes: RecurringIncome[]
    savings?: number
  }) => void
  onReset?: () => void
}

export default function Profile({ isOpen, onClose, onImport, onReset }: ProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [username, setUsername] = useState('')
  const [initialBalance, setInitialBalance] = useState('')
  const [initialSavings, setInitialSavings] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  
  useEffect(() => {
    // Charger le pseudo au montage du composant
    const savedUsername = localStorage.getItem('budgstat-username') || ''
    setUsername(savedUsername)
  }, [])
  
  useEffect(() => {
    // Charger la photo de profil au montage
    const savedImage = localStorage.getItem('budgstat-profile-image')
    if (savedImage) {
      setProfileImage(savedImage)
    }
  }, [])

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

  useEffect(() => {
    // Recharger le pseudo et les soldes quand le modal s'ouvre
    if (isOpen) {
      const savedUsername = localStorage.getItem('budgstat-username') || ''
      setUsername(savedUsername)
      
      const savedInitialBalance = localStorage.getItem('budgstat-initial-balance') || '0'
      const savedInitialSavings = localStorage.getItem('budgstat-initial-savings') || '0'
      
      // Formater les valeurs avec des points
      const formattedBalance = formatNumberWithDots(savedInitialBalance.replace('.', ','))
      const formattedSavings = formatNumberWithDots(savedInitialSavings.replace('.', ','))
      
      setInitialBalance(formattedBalance)
      setInitialSavings(formattedSavings)

      const savedImage = localStorage.getItem('budgstat-profile-image')
      if (savedImage) {
        setProfileImage(savedImage)
      }
    }
  }, [isOpen])
  
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }
  
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value
    setUsername(newUsername)
    localStorage.setItem('budgstat-username', newUsername)
    // Déclencher un événement personnalisé pour mettre à jour le header
    window.dispatchEvent(new CustomEvent('usernameChanged', { detail: newUsername }))
  }

  // Fonction pour parser une valeur formatée en nombre
  const parseFormattedNumber = (value: string): number => {
    // Retirer tous les points et remplacer la virgule par un point pour parseFloat
    const cleaned = value.replace(/\./g, '').replace(',', '.')
    return parseFloat(cleaned) || 0
  }

  const handleInitialBalanceFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Si la valeur est "0", vider le champ pour permettre la saisie directe
    const parsed = parseFormattedNumber(e.target.value)
    if (parsed === 0) {
      setInitialBalance('')
    }
  }

  const handleInitialBalanceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Formater la valeur au blur
    const value = e.target.value.trim()
    const numValue = parseFormattedNumber(value)
    
    if (value === '' || numValue === 0) {
      setInitialBalance('0')
      localStorage.setItem('budgstat-initial-balance', '0')
      window.dispatchEvent(new CustomEvent('initialBalanceChanged', { detail: 0 }))
    } else {
      // Reformater pour s'assurer que c'est bien formaté
      const cleaned = value.replace(/\./g, '').replace(',', '.')
      const formatted = formatNumberWithDots(cleaned.replace('.', ','))
      setInitialBalance(formatted)
      localStorage.setItem('budgstat-initial-balance', numValue.toString())
      window.dispatchEvent(new CustomEvent('initialBalanceChanged', { detail: numValue }))
    }
  }

  const handleInitialBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const afterSeparator = value.substring(lastSeparatorIndex + 1).replace(/[.,]/g, '')
      value = beforeSeparator + separator + afterSeparator
    } else {
      // Pas de séparateur décimal, retirer tous les points/virgules
      value = value.replace(/[.,]/g, '')
    }
    
    // Formater avec des points comme séparateurs de milliers
    const formatted = formatNumberWithDots(value)
    setInitialBalance(formatted)
    
    // Sauvegarder la valeur numérique
    const numValue = parseFormattedNumber(formatted)
    localStorage.setItem('budgstat-initial-balance', numValue.toString())
    window.dispatchEvent(new CustomEvent('initialBalanceChanged', { detail: numValue }))
  }

  const handleInitialSavingsFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Si la valeur est "0", vider le champ pour permettre la saisie directe
    const parsed = parseFormattedNumber(e.target.value)
    if (parsed === 0) {
      setInitialSavings('')
    }
  }

  const handleInitialSavingsBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Formater la valeur au blur
    const value = e.target.value.trim()
    const numValue = parseFormattedNumber(value)
    
    if (value === '' || numValue === 0) {
      setInitialSavings('0')
      localStorage.setItem('budgstat-initial-savings', '0')
      window.dispatchEvent(new CustomEvent('initialSavingsChanged', { detail: 0 }))
    } else {
      // Reformater pour s'assurer que c'est bien formaté
      const cleaned = value.replace(/\./g, '').replace(',', '.')
      const formatted = formatNumberWithDots(cleaned.replace('.', ','))
      setInitialSavings(formatted)
      localStorage.setItem('budgstat-initial-savings', numValue.toString())
      window.dispatchEvent(new CustomEvent('initialSavingsChanged', { detail: numValue }))
    }
  }

  const handleInitialSavingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const afterSeparator = value.substring(lastSeparatorIndex + 1).replace(/[.,]/g, '')
      value = beforeSeparator + separator + afterSeparator
    } else {
      // Pas de séparateur décimal, retirer tous les points/virgules
      value = value.replace(/[.,]/g, '')
    }
    
    // Formater avec des points comme séparateurs de milliers
    const formatted = formatNumberWithDots(value)
    setInitialSavings(formatted)
    
    // Sauvegarder la valeur numérique
    const numValue = parseFormattedNumber(formatted)
    localStorage.setItem('budgstat-initial-savings', numValue.toString())
    window.dispatchEvent(new CustomEvent('initialSavingsChanged', { detail: numValue }))
  }

  const handleProfileImageClick = () => {
    profileImageInputRef.current?.click()
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image')
        return
      }
      
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('L\'image est trop grande. Taille maximale : 2MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setProfileImage(result)
        localStorage.setItem('budgstat-profile-image', result)
        // Déclencher un événement pour mettre à jour le header
        window.dispatchEvent(new CustomEvent('profileImageChanged', { detail: result }))
      }
      reader.readAsDataURL(file)
    }
    
    // Réinitialiser l'input pour permettre de sélectionner la même image
    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = ''
    }
  }
  
  const { currency, setCurrency } = useCurrency()
  const { language, setLanguage, t } = useLanguage()
  
  // Forcer la langue à 'fr' si elle change vers 'en'
  useEffect(() => {
    if (language === 'en') {
      setLanguage('fr')
    }
  }, [language, setLanguage])
  
  const currencies = [
    { code: 'EUR' as const, name: 'Euro', symbol: '€', available: true },
    { code: 'USD' as const, name: 'Dollar US - Disponible Prochainement', symbol: '$', available: false },
  ]

  const languages = [
    { code: 'fr' as const, name: 'Français', available: true },
    { code: 'en' as const, name: 'English - Disponible Prochainement', available: false },
  ]

  const handleExport = () => {
    const data = {
      expenses: JSON.parse(localStorage.getItem('budgstat-expenses') || '[]'),
      incomes: JSON.parse(localStorage.getItem('budgstat-incomes') || '[]'),
      recurringPayments: JSON.parse(localStorage.getItem('budgstat-recurring') || '[]'),
      recurringIncomes: JSON.parse(localStorage.getItem('budgstat-recurring-incomes') || '[]'),
      savings: parseFloat(localStorage.getItem('budgstat-savings') || '0'),
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budgstat-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        
        if (
          Array.isArray(data.expenses) &&
          Array.isArray(data.incomes) &&
          Array.isArray(data.recurringPayments) &&
          Array.isArray(data.recurringIncomes)
        ) {
                      if (confirm('Voulez-vous remplacer toutes vos données actuelles par les données importées ?')) {
            onImport({
              expenses: data.expenses,
              incomes: data.incomes,
              recurringPayments: data.recurringPayments,
              recurringIncomes: data.recurringIncomes,
              savings: typeof data.savings === 'number' ? data.savings : 0,
            })
            onClose()
          }
        } else {
                      alert('Le fichier importé n\'a pas le bon format.')
        }
      } catch (error) {
        alert('Erreur lors de la lecture du fichier. Vérifiez que c\'est un fichier JSON valide.')
      }
    }
    reader.readAsText(file)
    
    // Réinitialiser l'input pour permettre de réimporter le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full ${isClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}>
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={handleProfileImageClick}
                className="relative p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer group"
                title="Cliquez pour changer votre photo de profil"
              >
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Photo de profil" 
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </button>
              <h2 className="text-xl font-semibold">{t('profile.title')}</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-3">
              {/* Champ prénom */}
              <div className="p-4 rounded-lg border border-border bg-secondary/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{t('profile.username')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('profile.usernameDesc')}
                    </p>
                  </div>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder={t('profile.usernamePlaceholder')}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              {/* Export et Import côte à côte */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{t('profile.export')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('profile.exportDesc')}
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{t('profile.import')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('profile.importDesc')}
                    </p>
                  </div>
                </button>
              </div>

              {/* Solde initial et Épargne initiale côte à côte */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border bg-secondary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium">{t('profile.initialBalance')}</p>
                  </div>
                  <input
                    type="text"
                    value={initialBalance}
                    onChange={handleInitialBalanceChange}
                    onFocus={handleInitialBalanceFocus}
                    onBlur={handleInitialBalanceBlur}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="0"
                    inputMode="decimal"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('profile.initialBalanceDesc')}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-secondary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium">{t('profile.initialSavings')}</p>
                  </div>
                  <input
                    type="text"
                    value={initialSavings}
                    onChange={handleInitialSavingsChange}
                    onFocus={handleInitialSavingsFocus}
                    onBlur={handleInitialSavingsBlur}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="0"
                    inputMode="decimal"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('profile.initialSavingsDesc')}
                  </p>
                </div>
              </div>

              {/* Devise et Langue côte à côte */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border bg-secondary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium">{t('profile.currency')}</p>
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => {
                      const newCurrency = e.target.value
                      const selectedCurrency = currencies.find(c => c.code === newCurrency)
                      if (selectedCurrency && selectedCurrency.available) {
                        setCurrency(newCurrency as typeof currency)
                      } else {
                        e.target.value = currency
                        setCurrency('EUR')
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    {currencies.map((curr) => (
                      <option 
                        key={curr.code} 
                        value={curr.code}
                        disabled={!curr.available}
                        style={!curr.available ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {curr.symbol} - {curr.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('profile.currencyDesc')}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-secondary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                      <Languages className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium">{t('profile.language')}</p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => {
                      const newLang = e.target.value as 'fr' | 'en'
                      if (newLang === 'fr') {
                        setLanguage('fr')
                      } else {
                        e.target.value = 'fr'
                        setLanguage('fr')
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {languages.map((lang) => (
                      <option 
                        key={lang.code} 
                        value={lang.code}
                        disabled={!lang.available}
                        style={!lang.available ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('profile.languageDesc')}
                  </p>
                </div>
              </div>

              {onReset && (
                <button
                  onClick={() => {
                    if (confirm(t('profile.resetDesc') + ' Cette action est irréversible.')) {
                      // Mettre à jour immédiatement les champs locaux pour afficher 0
                      setInitialBalance('0')
                      setInitialSavings('0')
                      localStorage.setItem('budgstat-initial-balance', '0')
                      localStorage.setItem('budgstat-initial-savings', '0')
                      localStorage.setItem('budgstat-savings', '0')
                      // Notifier le reste de l'app que les soldes ont été remis à zéro
                      window.dispatchEvent(new CustomEvent('initialBalanceChanged', { detail: 0 }))
                      window.dispatchEvent(new CustomEvent('initialSavingsChanged', { detail: 0 }))

                      onReset()
                      onClose()
                    }
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-red-500">{t('profile.reset')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('profile.resetDesc')}
                    </p>
                  </div>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Input file caché pour l'import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Input file caché pour la photo de profil */}
      <input
        ref={profileImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfileImageChange}
        className="hidden"
      />
    </>
  )
}
