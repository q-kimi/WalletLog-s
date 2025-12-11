'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Mode = 'simple' | 'advanced'

interface ModeContextType {
  mode: Mode
  setMode: (mode: Mode) => void
  toggleMode: () => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('simple')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('budgstat-mode') as Mode
      if (saved === 'advanced' || saved === 'simple') {
        setModeState(saved)
      } else {
        // Par défaut, mode simple
        setModeState('simple')
        localStorage.setItem('budgstat-mode', 'simple')
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('budgstat-mode', mode)
    }
  }, [mode, mounted])

  const setMode = (newMode: Mode) => {
    setModeState(newMode)
    if (mounted) {
      localStorage.setItem('budgstat-mode', newMode)
    }
  }

  const toggleMode = () => {
    setModeState(prev => {
      const newMode = prev === 'simple' ? 'advanced' : 'simple'
      if (mounted) {
        localStorage.setItem('budgstat-mode', newMode)
      }
      return newMode
    })
  }

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
}

