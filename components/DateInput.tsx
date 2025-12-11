'use client'

import { useState, useEffect } from 'react'

interface DateInputProps {
  value: string // Format ISO: yyyy-MM-dd
  onChange: (value: string) => void // Retourne format ISO: yyyy-MM-dd
  required?: boolean
  className?: string
}

export default function DateInput({ value, onChange, required, className }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Convertir ISO (yyyy-MM-dd) vers format d'affichage français (DD/MM/YYYY)
  const isoToDisplay = (isoDate: string): string => {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    return `${day}/${month}/${year}`
  }

  // Convertir format d'affichage français (DD/MM/YYYY) vers ISO (yyyy-MM-dd)
  const displayToIso = (displayDate: string): string | null => {
    if (!displayDate) return null
    
    // Format DD/MM/YYYY
    const parts = displayDate.split('/')
    if (parts.length !== 3) return null
    const [day, month, year] = parts

    // Validation
    const dayNum = parseInt(day, 10)
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return null
    if (dayNum < 1 || dayNum > 31) return null
    if (monthNum < 1 || monthNum > 12) return null
    if (yearNum < 1900 || yearNum > 2100) return null

    // Formater en ISO
    const formattedDay = day.padStart(2, '0')
    const formattedMonth = month.padStart(2, '0')
    const formattedYear = year.padStart(4, '0')

    return `${formattedYear}-${formattedMonth}-${formattedDay}`
  }

  // Initialiser l'affichage depuis la valeur ISO
  useEffect(() => {
    if (value) {
      setDisplayValue(isoToDisplay(value))
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayValue(inputValue)

    // Convertir vers ISO
    const isoDate = displayToIso(inputValue)
    if (isoDate) {
      onChange(isoDate)
    }
  }

  const handleBlur = () => {
    // Valider et corriger le format à la perte de focus
    const isoDate = displayToIso(displayValue)
    if (isoDate) {
      setDisplayValue(isoToDisplay(isoDate))
      onChange(isoDate)
    } else if (displayValue) {
      // Si le format est invalide, réinitialiser
      setDisplayValue(isoToDisplay(value || ''))
    }
  }

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="JJ/MM/AAAA"
      className={className}
      required={required}
      pattern="\d{2}/\d{2}/\d{4}"
    />
  )
}
