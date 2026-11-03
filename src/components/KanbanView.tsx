import React from 'react'
import { Lead, LeadStatus } from '../types'
import { STATUS_LIST } from '../constants/brazil'
import {
  IconGlobe,
  IconFlame,
  IconWhatsApp,
  IconMapPin,
  IconCheck,
  IconArrowUpRight,
} from './Icons'

interface KanbanViewProps {
  leads: Lead[]
  onUpdateLead: (lead: Lead, updates: Partial<Lead>) => Promise<void>
}

export function KanbanView({ leads, onUpdateLead }: KanbanViewProps) {
  const columns: { id: LeadStatus; label: string; color: string; bg: string }[] = [
    { id: 'novo', label: 'Novos Leads', color: '#3b82f6', bg: '#eff6ff' },
    { id: 'contatado', label: 'Contatados', color: '#f59e0b', bg: '#fffbeb' },
    { id: 'respondeu', label: 'Responderam', color: '#10b981', bg: '#ecfdf5' },
    { id: 'fechado', label: 'Fechados / Ganhos', color: '#047857', bg: '#d1fae5' },
    { id: 'descartado', label: 'Descartados', color: '#ef4444', bg: '#fef2f2' },
  ]

  const getNextStatus = (current: LeadStatus): LeadStatus | null => {
    switch (current) {
      case 'novo':
        return 'contatado'
      case 'contatado':
        return 'respondeu'
      case 'respondeu':
        return 'fechado'
      default:
        return null
    }
  }

  const buildWhatsAppLink = (lead: Lead) => {
    if (!lead.telefone) return null
    const cleanPhone = lead.telefone.replace(/\D/g, '').replace(/^55/, '')
    const msg = encodeURIComponent(
      `Olá! Vi o perfil da *${lead.nome}* no Google e gostaria de conversar sobre novos clientes em ${lead.cidade || 'sua região'}.`
    )
    return `https://wa.me/55${cleanPhone}?text=${msg}`
  }

  return (
    <div className="kanban-board-container">
      <div className="kanban-columns-row">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.id)
          const colRevenue = col.id === 'fechado'
            ? colLeads.reduce((acc, l) => acc + (Number(l.valor_fechado) || 0), 0)
            : 0

          return (
            <div key={col.id} className="kanban-column">
              <div className="kanban-column-header">
                <div className="column-title-box">
                  <span className="column-dot" style={{ backgroundColor: col.color }} />
                  <strong className="column-title">{col.label}</strong>
                </div>
                <div className="column-header-badges">
                  {colRevenue > 0 && (
                    <span className="column-revenue-badge">
                      R$ {colRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  )}
                  <span className="column-badge-count">{colLeads.length}</span>
                </div>
              </div>

              <div className="kanban-cards-list">
                {colLeads.map((lead) => {
                  const next = getNextStatus(lead.status)
                  const waLink = buildWhatsAppLink(lead)
                  return (
                    <div key={lead.id || lead.place_id} className="card kanban-card">
                      <div className="kanban-card-top">
                        <strong className="kanban-lead-name">{lead.nome}</strong>
                        <span className="nicho-tag-pill-sm">{lead.nicho}</span>
                      </div>

                      <div className="kanban-card-location">
                        <IconMapPin size={13} />
                        <span>
                          {lead.cidade}/{lead.uf} {lead.bairro ? `· ${lead.bairro}` : ''}
                        </span>
                      </div>

                      <div className="kanban-card-tags">
                        {lead.valor_fechado && (
                          <span className="deal-valor-pill">
                            R$ {Number(lead.valor_fechado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                        {lead.site ? (
                          <span className="site-badge has-site-sm">
                            <IconGlobe size={11} /> Com Site
                          </span>
                        ) : (
                          <span className="site-badge no-site-sm">
                            <IconFlame size={11} /> Sem Site
                          </span>
                        )}
                        {lead.telefone && (
                          <span className="phone-pill-sm">{lead.telefone}</span>
                        )}
                      </div>

                      {lead.anotacoes && (
                        <p className="kanban-card-notes">"{lead.anotacoes}"</p>
                      )}

                      <div className="kanban-card-actions">
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-action-pill wa"
                            title="Chamar WhatsApp"
                          >
                            <IconWhatsApp size={13} /> WA
                          </a>
                        )}

                        <select
                          className="kanban-move-select"
                          value={lead.status}
                          onChange={(e) =>
                            onUpdateLead(lead, { status: e.target.value as LeadStatus })
                          }
                        >
                          {STATUS_LIST.map((s) => (
                            <option key={s.id} value={s.id}>
                              Mover: {s.label}
                            </option>
                          ))}
                        </select>

                        {next && (
                          <button
                            className="btn-kanban-next"
                            onClick={() => onUpdateLead(lead, { status: next })}
                            title={`Avançar para ${next}`}
                          >
                            Avançar →
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {colLeads.length === 0 && (
                  <div className="kanban-empty-placeholder">Nenhum lead nesta etapa</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

