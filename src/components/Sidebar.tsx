import React from 'react'
import { TabType, Lead } from '../types'
import {
  IconLayoutDashboard,
  IconSearch,
  IconUsers,
  IconColumns,
  IconMessageSquare,
  IconCheckCircle2,
  IconDownload,
  IconSun,
  IconMoon,
  IconLogOut,
} from './Icons'

interface SidebarProps {
  currentTab: TabType
  onSelectTab: (tab: TabType) => void
  leads: Lead[]
  isDark: boolean
  onToggleTheme: () => void
  onSignOut: () => void
  userEmail?: string
}

export function Sidebar({
  currentTab,
  onSelectTab,
  leads,
  isDark,
  onToggleTheme,
  onSignOut,
  userEmail,
}: SidebarProps) {
  const totalLeads = leads.length
  const respondidosCount = leads.filter((l) => l.status === 'respondeu').length
  const fechadosCount = leads.filter((l) => l.status === 'fechado').length

  const navItems: {
    id: TabType
    label: string
    mobileLabel: string
    icon: React.ReactNode
    badge?: number | string
    badgeColor?: string
    mobileOnly?: boolean
    hideOnMobileNav?: boolean
  }[] = [
    {
      id: 'dash',
      label: 'Dashboard',
      mobileLabel: 'Início',
      icon: <IconLayoutDashboard size={20} />,
    },
    {
      id: 'busca',
      label: 'Buscar Nichos',
      mobileLabel: 'Buscar',
      icon: <IconSearch size={20} />,
      badge: 'Livre',
      badgeColor: 'badge-emerald',
    },
    {
      id: 'leads',
      label: 'Base de Leads',
      mobileLabel: 'Leads',
      icon: <IconUsers size={20} />,
      badge: totalLeads,
    },
    {
      id: 'kanban',
      label: 'Funil CRM',
      mobileLabel: 'Funil',
      icon: <IconColumns size={20} />,
    },
    {
      id: 'resp',
      label: 'Respondidos',
      mobileLabel: 'Respostas',
      icon: <IconMessageSquare size={20} />,
      badge: respondidosCount > 0 ? respondidosCount : undefined,
      badgeColor: 'badge-teal',
      hideOnMobileNav: true,
    },
    {
      id: 'fech',
      label: 'Fechados / Ganhos',
      mobileLabel: 'Fechados',
      icon: <IconCheckCircle2 size={20} />,
      badge: fechadosCount > 0 ? fechadosCount : undefined,
      badgeColor: 'badge-green',
      hideOnMobileNav: true,
    },
    {
      id: 'exp',
      label: 'Exportar Listas',
      mobileLabel: 'Exportar',
      icon: <IconDownload size={20} />,
    },
  ]

  return (
    <aside className="app-sidebar">
      {/* Brand Header (sem o ícone de estrela solicitado para remover) */}
      <div className="sidebar-brand-box">
        <div className="brand-text-group">
          <span className="brand-app-title">LeadPulse</span>
          <span className="brand-app-subtitle">Prospecção B2B</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = currentTab === item.id
          return (
            <button
              key={item.id}
              className={`nav-button ${isActive ? 'active' : ''} ${item.hideOnMobileNav ? 'hide-mobile' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label desktop-only">{item.label}</span>
              <span className="nav-label mobile-only">{item.mobileLabel}</span>
              {item.badge !== undefined && (
                <span className={`nav-badge ${item.badgeColor || ''}`}>{item.badge}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer Profile & Theme */}
      <div className="sidebar-footer">
        {/* User Card */}
        <div className="sidebar-user-pill">
          <div className="user-avatar-circle">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info-text">
            <span className="user-display-name">
              {userEmail?.split('@')[0] || 'Usuário'}
            </span>
            <span className="user-role-badge">
              <span className="status-online-dot" /> Conectado
            </span>
          </div>
        </div>

        {/* Actions Controls */}
        <div className="sidebar-actions-row">
          <button
            className="btn-sidebar-control"
            onClick={onToggleTheme}
            title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
          >
            {isDark ? <IconSun size={17} /> : <IconMoon size={17} />}
            <span>{isDark ? 'Claro' : 'Escuro'}</span>
          </button>

          <button
            className="btn-sidebar-control btn-logout"
            onClick={onSignOut}
            title="Sair da conta"
          >
            <IconLogOut size={17} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
