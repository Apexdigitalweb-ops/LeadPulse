import React, { useState, useMemo } from 'react'
import { Lead, LeadStatus } from '../types'
import { STATUS_LIST } from '../constants/brazil'
import {
  IconSearch,
  IconFilter,
  IconGlobe,
  IconMapPin,
  IconWhatsApp,
  IconExternalLink,
  IconTrash2,
  IconFlame,
  IconMail,
  IconCopy,
  IconCheck,
} from './Icons'

interface LeadsViewProps {
  leads: Lead[]
  onUpdateLead: (lead: Lead, updates: Partial<Lead>) => Promise<void>
  onDeleteLead?: (lead: Lead) => Promise<void>
  onExtractEmail?: (lead: Lead) => Promise<void>
  initialStatusFilter?: string
}

const formatDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

export function LeadsView({
  leads,
  onUpdateLead,
  onDeleteLead,
  onExtractEmail,
  initialStatusFilter,
}: LeadsViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || '')
  const [nichoFilter, setNichoFilter] = useState('')
  const [siteFilter, setSiteFilter] = useState<'all' | 'nosite' | 'hassite'>('all')
  const [sortField, setSortField] = useState<'data' | 'nome'>('data')
  const [sortAsc, setSortAsc] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(15)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Extrai lista única de nichos
  const uniqueNichos = useMemo(() => {
    const set = new Set<string>()
    leads.forEach((l) => {
      if (l.nicho) set.add(l.nicho)
    })
    return Array.from(set).sort()
  }, [leads])

  // Filtra e ordena leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Filtro de status
        if (statusFilter && lead.status !== statusFilter) return false

        // Filtro de nicho
        if (nichoFilter && lead.nicho !== nichoFilter) return false

        // Filtro de site
        if (siteFilter === 'nosite' && lead.site) return false
        if (siteFilter === 'hassite' && !lead.site) return false

        // Busca textual
        if (searchTerm) {
          const q = searchTerm.toLowerCase()
          const combined = `${lead.nome} ${lead.nicho} ${lead.cidade} ${lead.uf} ${lead.telefone || ''} ${lead.anotacoes || ''}`.toLowerCase()
          if (!combined.includes(q)) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortField === 'nome') {
          return sortAsc ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)
        }
        // Ordena por data de captura
        const da = new Date(a.capturado_em).getTime()
        const db = new Date(b.capturado_em).getTime()
        return sortAsc ? da - db : db - da
      })
  }, [leads, searchTerm, statusFilter, nichoFilter, siteFilter, sortField, sortAsc])

  // Paginação
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1
  const paginatedLeads = filteredLeads.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  const handleCopyLeadInfo = (lead: Lead) => {
    const text = `${lead.nome}\nNicho: ${lead.nicho}\nCidade: ${lead.cidade}/${lead.uf}\nTelefone: ${lead.telefone || 'N/A'}\nSite: ${lead.site || 'Sem site'}`
    navigator.clipboard.writeText(text)
    setCopiedId(lead.id || lead.place_id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const buildWhatsAppLink = (lead: Lead) => {
    if (!lead.telefone) return null
    const cleanPhone = lead.telefone.replace(/\D/g, '').replace(/^55/, '')
    const msg = encodeURIComponent(
      `Olá! Me chamo Carlos, vi o perfil da *${lead.nome}* no Google e notei uma grande oportunidade de atrair mais clientes na região de ${lead.cidade || 'sua cidade'}. Como está a prospecção de vocês atualmente?`
    )
    return `https://wa.me/55${cleanPhone}?text=${msg}`
  }

  return (
    <div className="card leads-view-container">
      {/* Header com Filtros e Busca */}
      <div className="leads-top-bar">
        <div className="leads-search-input-box">
          <IconSearch size={18} className="search-icon-inside" />
          <input
            type="text"
            className="leads-search-input"
            placeholder="Buscar por nome, nicho, cidade ou anotação..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(0)
            }}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(0)
              }}
            >
              ×
            </button>
          )}
        </div>

        <div className="leads-filters-group">
          {/* Filtro de Status */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(0)
            }}
          >
            <option value="">Todos os Status ({leads.length})</option>
            {STATUS_LIST.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} ({leads.filter((l) => l.status === s.id).length})
              </option>
            ))}
          </select>

          {/* Filtro de Nicho */}
          <select
            className="filter-select"
            value={nichoFilter}
            onChange={(e) => {
              setNichoFilter(e.target.value)
              setCurrentPage(0)
            }}
          >
            <option value="">Todos os Nichos</option>
            {uniqueNichos.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {/* Filtro de Site */}
          <select
            className="filter-select"
            value={siteFilter}
            onChange={(e: any) => {
              setSiteFilter(e.target.value)
              setCurrentPage(0)
            }}
          >
            <option value="all">Site: Todos</option>
            <option value="nosite">Apenas Sem Site</option>
            <option value="hassite">Com Site</option>
          </select>

          {/* Ordenação */}
          <button
            className="btn btn-secondary btn-sort"
            onClick={() => setSortAsc(!sortAsc)}
            title="Alternar ordem ascendente/descendente"
          >
            Data {sortAsc ? '↑ Mais antigos' : '↓ Recentes'}
          </button>
        </div>
      </div>

      {/* Contador de Resultados */}
      <div className="leads-count-bar">
        <span>
          Exibindo <b>{filteredLeads.length}</b> leads encontrados
        </span>
        {(statusFilter || nichoFilter || siteFilter !== 'all' || searchTerm) && (
          <button
            className="btn-clear-all-filters"
            onClick={() => {
              setStatusFilter('')
              setNichoFilter('')
              setSiteFilter('all')
              setSearchTerm('')
              setCurrentPage(0)
            }}
          >
            Limpar todos os filtros
          </button>
        )}
      </div>

      {/* Tabela de Leads */}
      {filteredLeads.length === 0 ? (
        <div className="table-empty-box">
          <p>Nenhum lead encontrado com os filtros selecionados.</p>
          <span className="empty-sub">Tente ajustar o termo de busca ou limpar os filtros.</span>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="leads-table">
            <thead>
              <tr>
                <th
                  className="th-sortable"
                  onClick={() => {
                    setSortField('nome')
                    setSortAsc(!sortAsc)
                  }}
                >
                  Empresa & Localidade ↕
                </th>
                <th>Presença Digital</th>
                <th>Status do Funil</th>
                <th>Contato & Abordagem</th>
                <th>Anotações Rápidas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map((lead) => {
                const waLink = buildWhatsAppLink(lead)
                const isCopied = copiedId === (lead.id || lead.place_id)
                return (
                  <tr key={lead.id || lead.place_id}>
                    {/* Empresa & Nicho */}
                    <td className="lead-main-cell">
                      <div className="lead-name-cell">
                        <span className="lead-avatar-letter">
                          {lead.nome.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong className="lead-company-name">{lead.nome}</strong>
                          <div className="lead-meta-sub">
                            <span className="nicho-tag-pill-sm">{lead.nicho}</span>
                            <span>
                              {lead.cidade}/{lead.uf}
                            </span>
                            <span className="date-sub">{formatDate(lead.capturado_em)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Presença Digital */}
                    <td>
                      {lead.site ? (
                        <div className="site-cell">
                          <a
                            href={lead.site}
                            target="_blank"
                            rel="noreferrer"
                            className="site-badge has-site"
                          >
                            <IconGlobe size={13} /> Visitar Site
                          </a>
                          {lead.email ? (
                            <span className="lead-email-text">{lead.email}</span>
                          ) : onExtractEmail ? (
                            <button
                              className="btn-extract-email"
                              onClick={() => onExtractEmail(lead)}
                              title="Tenta extrair e-mail do site via servidor"
                            >
                              <IconMail size={12} /> Buscar e-mail
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        <span className="site-badge no-site">
                          <IconFlame size={13} /> Sem Site Cadastrado
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <select
                        className={`status-select status-${lead.status}`}
                        value={lead.status}
                        onChange={(e) =>
                          onUpdateLead(lead, { status: e.target.value as LeadStatus })
                        }
                      >
                        {STATUS_LIST.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Contato & Abordagem */}
                    <td>
                      <div className="contact-cell">
                        {lead.telefone ? (
                          <span className="lead-phone-text">{lead.telefone}</span>
                        ) : (
                          <span className="text-muted">Sem tel</span>
                        )}
                        <div className="action-buttons-group">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-action-pill wa"
                              title="Abrir WhatsApp com mensagem pronta"
                            >
                              <IconWhatsApp size={13} /> WhatsApp
                            </a>
                          )}
                          <a
                            href={lead.maps_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-action-pill maps"
                            title="Ver no Google Maps"
                          >
                            <IconMapPin size={13} /> Maps
                          </a>
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(
                              lead.nome + ' ' + (lead.cidade || '') + ' site'
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-action-pill google"
                            title="Conferir no Google"
                          >
                            <IconExternalLink size={13} /> Conferir
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Anotações */}
                    <td>
                      <textarea
                        className="inline-notes-input"
                        placeholder="Adicione notas (ex: falou com dona Maria, ligar terça)..."
                        defaultValue={lead.anotacoes || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (lead.anotacoes || '')) {
                            onUpdateLead(lead, { anotacoes: e.target.value })
                          }
                        }}
                      />
                    </td>

                    {/* Ações */}
                    <td>
                      <div className="row-actions-group">
                        <button
                          className="btn-icon-subtle"
                          onClick={() => handleCopyLeadInfo(lead)}
                          title="Copiar dados deste lead"
                        >
                          {isCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </button>
                        {onDeleteLead && (
                          <button
                            className="btn-icon-subtle text-danger"
                            onClick={() => {
                              if (window.confirm(`Deseja remover "${lead.nome}"?`)) {
                                onDeleteLead(lead)
                              }
                            }}
                            title="Remover lead"
                          >
                            <IconTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="leads-pagination-bar">
          <div className="pagination-info">
            Página <b>{currentPage + 1}</b> de <b>{totalPages}</b>
          </div>
          <div className="pagination-buttons">
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            >
              ← Anterior
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage + 1 >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

