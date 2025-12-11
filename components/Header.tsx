'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, TrendingUp, User, NotebookPen } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useLanguage } from './LanguageProvider'

interface HeaderProps {
  onProfileOpen?: () => void
  onActionLogOpen?: () => void
}

export default function Header({ onProfileOpen, onActionLogOpen }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const [username, setUsername] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const getGreeting = () => {
    const hour = new Date().getHours()
    // Bonsoir de 17h à 5h59 (heure française)
    return hour >= 17 || hour < 6 ? 'Bonsoir' : 'Bonjour'
  }

  const getEmoji = () => {
    const hour = new Date().getHours()
    // 🌙 pour Bonsoir, 👋 pour Bonjour
    return hour >= 17 || hour < 6 ? '🌙' : '👋'
  }

  useEffect(() => {
    const savedUsername = localStorage.getItem('budgstat-username') || ''
    setUsername(savedUsername)

    const savedImage = localStorage.getItem('budgstat-profile-image')
    if (savedImage) {
      setProfileImage(savedImage)
    }
    
    // Écouter les changements de localStorage (autres onglets)
    const handleStorageChange = () => {
      const newUsername = localStorage.getItem('budgstat-username') || ''
      setUsername(newUsername)
      
      const newImage = localStorage.getItem('budgstat-profile-image')
      setProfileImage(newImage)
    }
    
    // Écouter les changements personnalisés (même onglet)
    const handleUsernameChanged = (e: CustomEvent) => {
      setUsername(e.detail || '')
    }

    const handleProfileImageChanged = (e: CustomEvent) => {
      setProfileImage(e.detail || null)
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('usernameChanged', handleUsernameChanged as EventListener)
    window.addEventListener('profileImageChanged', handleProfileImageChanged as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('usernameChanged', handleUsernameChanged as EventListener)
      window.removeEventListener('profileImageChanged', handleProfileImageChanged as EventListener)
    }
  }, [])

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Wallet-Log's
              </h1>
              <p className="text-sm text-muted-foreground">{t('header.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onProfileOpen && (
              <>
                {username && (
                  <span className="hidden sm:inline text-sm font-medium text-foreground">
                    <span className="username-underline">{getGreeting()} {username}</span> {getEmoji()}
                  </span>
                )}
                <button
                  onClick={onProfileOpen}
                  className="p-1 rounded-lg hover:bg-secondary transition-colors relative"
                  aria-label={t('profile.title')}
                  title={t('header.profileTooltip')}
                >
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Photo de profil" 
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>
              </>
            )}
            {onActionLogOpen && (
              <button
                onClick={onActionLogOpen}
                className="p-1 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Ouvrir le carnet d'actions"
                title="Carnet des actions"
              >
                <NotebookPen className="w-5 h-5" />
              </button>
            )}
            <Sun className={`w-4 h-4 transition-opacity ${theme === 'dark' ? 'opacity-50' : 'opacity-100'}`} />
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-400'
              }`}
              aria-label="Toggle theme"
              role="switch"
              aria-checked={theme === 'dark'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              >
                {theme === 'dark' && (
                  <Moon className="h-3 w-3 m-0.5 text-gray-800" />
                )}
                {theme === 'light' && (
                  <Sun className="h-3 w-3 m-0.5 text-gray-600" />
                )}
              </span>
            </button>
            <Moon className={`w-4 h-4 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-50'}`} />
          </div>
        </div>
      </div>
    </header>
  )
}
