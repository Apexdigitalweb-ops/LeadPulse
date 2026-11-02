import React from 'react'
import { IconSearch, IconPlus, IconSun, IconMoon } from './Icons'

interface HeaderProps {
  userEmail?: string
  onOpenNewSearch: () => void
  onOpenNewLead: () => void
  isDark: boolean
  onToggleTheme: () => void
  totalLeads: number
}

export function Header({
  userEmail,
  onOpenNewSearch,
  onOpenNewLead,
  isDark,
  onToggleTheme,
  totalLeads,
}: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const username = userEmail?.split('@')[0] || 'Carlos'

  return (
    <header className="app-header">
      <div className="header-top-mobile-row">
        <div className="header-greeting-box">
          <h1 className="header-title">
            Olá, <span className="highlight-username">{username}</span>
          </h1>
          <p className="header-subtitle">
            Painel de Prospecção · <b>{totalLeads}</b> leads ativos
          </p>
        </div>

        {/* Botão de Tema visível no topo no mobile */}
        <button
          className="btn-theme-mobile mobile-only"
          onClick={onToggleTheme}
          title={isDark ? 'Modo Claro' : 'Modo Escuro'}
        >
          {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>
      </div>

      <div className="header-actions-group">
        <div className="header-date-pill desktop-only">
          <span>Hoje, {currentDate}</span>
        </div>

        <button className="btn btn-secondary btn-header-action" onClick={onOpenNewSearch}>
          <IconSearch size={16} />
          <span>Buscar Nicho</span>
        </button>

        <button className="btn btn-primary btn-header-action" onClick={onOpenNewLead}>
          <IconPlus size={16} />
          <span>Novo Lead</span>
        </button>
      </div>
    </header>
  )
}
