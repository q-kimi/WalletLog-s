'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)
  const [autoThemeEnabled, setAutoThemeEnabled] = useState(true)

  // Fonction pour déterminer le thème automatique selon l'heure
  const getAutoTheme = (): Theme => {
    const hour = new Date().getHours()
    // Mode dark de 17h à 5h59 (heure française)
    return hour >= 17 || hour < 6 ? 'dark' : 'light'
  }

  useEffect(() => {
    setMounted(true)
    const savedAutoTheme = localStorage.getItem('budgstat-auto-theme')
    const savedTheme = localStorage.getItem('budgstat-theme') as Theme
    
    if (savedAutoTheme === 'false') {
      // L'utilisateur a désactivé le thème automatique
      setAutoThemeEnabled(false)
      if (savedTheme) {
        setTheme(savedTheme)
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
      }
    } else {
      // Thème automatique activé
      setAutoThemeEnabled(true)
      const autoTheme = getAutoTheme()
      setTheme(autoTheme)
      localStorage.setItem('budgstat-theme', autoTheme)
    }
  }, [])

  // Vérifier l'heure toutes les minutes pour mettre à jour le thème automatiquement
  useEffect(() => {
    if (!mounted || !autoThemeEnabled) return

    const checkTime = () => {
      const autoTheme = getAutoTheme()
      if (autoTheme !== theme) {
        setTheme(autoTheme)
      }
    }

    // Vérifier immédiatement
    checkTime()

    // Vérifier toutes les minutes
    const interval = setInterval(checkTime, 60000)

    return () => clearInterval(interval)
  }, [mounted, autoThemeEnabled, theme])

  useEffect(() => {
    if (mounted) {
      // Changement instantané sans animation
      document.documentElement.classList.toggle('dark', theme === 'dark')
      localStorage.setItem('budgstat-theme', theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    // Désactiver le thème automatique quand l'utilisateur change manuellement
    setAutoThemeEnabled(false)
    localStorage.setItem('budgstat-auto-theme', 'false')
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('budgstat-theme', newTheme)
      return newTheme
    })
  }

  // Toujours rendre le Provider, même avant le montage
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider')
  }
  return context
}
