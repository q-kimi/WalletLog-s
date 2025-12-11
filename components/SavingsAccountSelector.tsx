'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, X, Star, Pencil } from 'lucide-react'
import { SavingsAccount } from '@/types'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'

interface SavingsAccountSelectorProps {
  accounts: SavingsAccount[]
  activeAccountId: string | null
  onSelectAccount: (accountId: string) => void
  onCreateAccount: (name: string) => void
  onDeleteAccount: (accountId: string) => void
  onRenameAccount?: (accountId: string, newName: string) => void
  onToggleFavorite?: (accountId: string) => void
}

export default function SavingsAccountSelector({
  accounts,
  activeAccountId,
  onSelectAccount,
  onCreateAccount,
  onDeleteAccount,
  onRenameAccount,
  onToggleFavorite,
}: SavingsAccountSelectorProps) {
  const { formatAmount } = useCurrency()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newAccountName, setNewAccountName] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  const activeAccount = accounts.find(acc => acc.id === activeAccountId) || accounts[0]

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isCreating])

  useEffect(() => {
    if (editingAccountId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingAccountId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (isClosing) return
    setIsOpen(!isOpen)
    setIsCreating(false)
    setNewAccountName('')
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsCreating(false)
      setNewAccountName('')
      setIsClosing(false)
    }, 200)
  }

  const handleSelectAccount = (accountId: string) => {
    onSelectAccount(accountId)
    // Fermer avec animation
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 200)
  }

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAccountName.trim()) {
      onCreateAccount(newAccountName.trim())
      setNewAccountName('')
      setIsCreating(false)
    }
  }

  const handleDeleteAccount = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation()
    if (accounts.length > 1 && confirm('Êtes-vous sûr de vouloir supprimer ce compte épargne ?')) {
      onDeleteAccount(accountId)
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation()
    if (onToggleFavorite) {
      onToggleFavorite(accountId)
    } else {
      console.warn('onToggleFavorite n\'est pas défini')
    }
  }

  const handleStartEdit = (e: React.MouseEvent, account: SavingsAccount) => {
    e.stopPropagation()
    setEditingAccountId(account.id)
    setEditingName(account.name)
  }

  const handleSaveEdit = (e: React.FormEvent, accountId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (editingName.trim() && onRenameAccount) {
      onRenameAccount(accountId, editingName.trim())
      setEditingAccountId(null)
      setEditingName('')
    }
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingAccountId(null)
    setEditingName('')
  }

  if (accounts.length === 0) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Flèche en bas à droite de la carte épargne - apparaît dès qu'il y a plusieurs comptes */}
      {accounts.length > 1 && (
        <button
          onClick={handleToggle}
          className="absolute bottom-2 right-11 z-10 w-6 h-6 rounded-lg bg-primary/10 dark:bg-white/10 text-foreground dark:text-white hover:bg-primary/20 dark:hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Sélectionner un compte épargne"
          title="Sélectionner un compte épargne"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Menu déroulant - s'affiche au-dessus du bouton */}
      {isOpen && (
        <div
          className={`absolute bottom-full right-0 mb-3 w-72 bg-card border border-border rounded-lg shadow-2xl z-50 backdrop-blur-sm ${
            isClosing ? 'animate-fade-out-down' : 'animate-fade-in-up'
          }`}
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          <div className="p-3">
            <div className="mb-2 pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Comptes épargne</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{accounts.length} compte{accounts.length > 1 ? 's' : ''}</p>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {/* Liste des comptes */}
              {accounts.map(account => (
                <div
                  key={account.id}
                  onClick={() => handleSelectAccount(account.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    account.id === activeAccountId
                      ? 'bg-primary/15 border-2 border-primary shadow-md'
                      : 'hover:bg-secondary/70 border-2 border-transparent hover:border-border'
                  }`}
                >
                  <div className="flex-1 text-left min-w-0">
                    {editingAccountId === account.id ? (
                      <form onSubmit={(e) => handleSaveEdit(e, account.id)} className="w-full">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={(e) => {
                            if (editingName.trim()) {
                              handleSaveEdit(e as any, account.id)
                            } else {
                              handleCancelEdit(e as any)
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 rounded-md border-2 border-primary bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                          autoFocus
                        />
                      </form>
                    ) : (
                      <>
                        <p className={`font-medium text-sm truncate ${account.id === activeAccountId ? 'text-primary' : 'text-foreground'}`}>
                          {account.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatAmount(account.balance)}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 ml-2" onClick={(e) => e.stopPropagation()}>
                    {account.id === activeAccountId && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                    {editingAccountId !== account.id && (
                      <>
                        {/* Bouton crayon pour renommer */}
                        {onRenameAccount && (
                          <button
                            onClick={(e) => handleStartEdit(e, account)}
                            className="p-1.5 rounded-md transition-all duration-200 text-muted-foreground hover:bg-secondary/70 hover:text-primary"
                            aria-label="Renommer le compte"
                            title="Renommer le compte"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {/* Bouton étoile pour verrouiller l'affichage (favori) */}
                        <button
                          onClick={(e) => handleToggleFavorite(e, account.id)}
                          className={`p-1.5 rounded-md transition-all duration-200 ${
                            account.isFavorite === true
                              ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
                              : 'text-muted-foreground hover:bg-secondary/70 hover:text-yellow-500/70'
                          }`}
                          aria-label={account.isFavorite === true ? 'Déverrouiller l\'affichage' : 'Verrouiller l\'affichage'}
                          title={account.isFavorite === true ? 'Déverrouiller l\'affichage (ce compte restera affiché même après un rafraîchissement)' : 'Verrouiller l\'affichage (ce compte restera affiché même après un rafraîchissement)'}
                        >
                          <Star className={`w-4 h-4 ${account.isFavorite === true ? 'fill-current' : ''}`} />
                        </button>
                        {/* Bouton croix pour supprimer */}
                        {accounts.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteAccount(e, account.id)}
                            className="p-1.5 rounded-md transition-colors text-red-500 hover:bg-red-500/10 opacity-70 hover:opacity-100"
                            aria-label="Supprimer le compte"
                            title="Supprimer le compte"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton pour créer un nouveau compte */}
            <div className="mt-3 pt-3 border-t border-border">
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-border hover:bg-secondary/50 hover:border-primary/50 transition-all duration-200 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer un nouveau compte</span>
                </button>
              ) : (
                <form onSubmit={handleCreateAccount} className="space-y-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="Nom du compte"
                    className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Créer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false)
                        setNewAccountName('')
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border-2 border-border hover:bg-secondary text-sm font-medium transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
