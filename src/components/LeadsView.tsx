import React, { useState, useMemo } from 'react'
import { Lead, LeadStatus } from '../types'
import { STATUS_LIST } from '../constants/brazil'
import {
  IconSearch,
  IconGlobe,
  IconMapPin,
  IconWhatsApp,
  IconExternalLink,
  IconTrash2,
  IconFlame,
  IconMail,
  IconCopy,
  IconCheck,
  IconCheckCircle2,
} from './Icons'

interface LeadsViewProps {
  leads: Lead[]
  onUpdateLead: (lead: Lead, updates: Partial<Lead>) => Promise<void>
  onDeleteLead?: (lead: Lead) => Promise<void>
  onDeleteBatchLeads?: (leadIds: string[]) => Promise<void>
  onDeleteNicho?: (nicho: string) => Promise<void>
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
  onDeleteBatchLeads,
  onDeleteNicho,
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
  const [pageSize] = useState(15)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Seleção múltipla para exclusão em lote
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal para excluir nicho específico
  const [isNichoDeleteModalOpen, setIsNichoDeleteModalOpen] = useState(false)
  const [nichoToDelete, setNichoToDelete] = useState('')

  // Extrai lista única de nichos
  const uniqueNichos = useMemo(() => {
    const set = new Set<string>()
    leads.forEach((l) => {
      if (l.nicho) set.add(l.nicho)
    })
    return Array.from(set).sort()
  }, [leads])

  // Métricas financeiras para Fechados / Ganhos
  const isFechadosView = initialStatusFilter === 'fechado' || statusFilter === 'fechado'
  const fechadosLeads = useMemo(() => leads.filter((l) => l.status === 'fechado'), [leads])
  const totalFechadoValor = useMemo(
    () => fechadosLeads.reduce((acc, l) => acc + (Number(l.valor_fechado) || 0), 0),
    [fechadosLeads]
  )
  const ticketMedio = fechadosLeads.length > 0 ? totalFechadoValor / fechadosLeads.length : 0

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

  // Gerenciamento da seleção em lote
  const currentPageIds = paginatedLeads.map((l) => l.id || l.place_id)
  const isAllCurrentPageSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id))

  const handleToggleSelectAll = () => {
    if (isAllCurrentPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])))
    }
  }

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  // Ação de excluir selecionados
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    const confirmMsg = `Tem certeza que deseja excluir os ${selectedIds.length} leads selecionados da sua base?`
    if (!window.confirm(confirmMsg)) return

    if (onDeleteBatchLeads) {
      await onDeleteBatchLeads(selectedIds)
    } else if (onDeleteLead) {
      for (const id of selectedIds) {
        const leadObj = leads.find((l) => (l.id && l.id === id) || l.place_id === id)
        if (leadObj) await onDeleteLead(leadObj)
      }
    }
    setSelectedIds([])
  }

  // Ação de excluir nicho inteiro
  const handleDeleteNichoConfirm = async (targetNicho: string) => {
    const count = leads.filter((l) => l.nicho === targetNicho).length
    if (count === 0) return
    const confirmMsg = `ATENÇÃO: Deseja realmente excluir TODOS os ${count} leads do nicho "${targetNicho}" da sua base?\nEsta ação não poderá ser desfeita.`
    if (!window.confirm(confirmMsg)) return

    if (onDeleteNicho) {
      await onDeleteNicho(targetNicho)
    } else if (onDeleteBatchLeads) {
      const ids = leads.filter((l) => l.nicho === targetNicho).map((l) => l.id || l.place_id)
      await onDeleteBatchLeads(ids)
    }

    if (nichoFilter === targetNicho) {
      setNichoFilter('')
    }
    setIsNichoDeleteModalOpen(false)
  }

  const handleCopyLeadInfo = (lead: Lead) => {
    const text = `${lead.nome}\nNicho: ${lead.nicho}\nCidade: ${lead.cidade}/${lead.uf}\nTelefone: ${lead.telefone || 'N/A'}\nSite: ${lead.site || 'Sem site'}`
    navigator.clipboard.writeText(text)
    setCopiedId(lead.id || lead.place_id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const buildWhatsAppLink = (lead: Lead) => {
    if (!lead.telefone) return null
    const cleanPhone = lead.telefone.replace(/\D/g, '').replace(/^55/, '')
    const msg = lead.site
      ? encodeURIComponent(
          `Olá, tudo bem? Me chamo Carlos, encontrei a *${lead.nome}* no Google e gostei muito da proposta de vocês. Notei algumas oportunidades para otimizar a conversão e captação de clientes em ${lead.cidade || 'sua região'}. Podemos conversar 5 minutinhos?`
        )
      : encodeURIComponent(
          `Olá, tudo bem? Me chamo Carlos, encontrei o perfil da *${lead.nome}* no Google e gostaria de apresentar uma oportunidade rápida de presença digital e captação de clientes para o negócio de vocês em ${lead.cidade || 'sua região'}.`
        )
    return `https://wa.me/55${cleanPhone}?text=${msg}`
  }

  const countInFilteredNicho = nichoFilter ? leads.filter((l) => l.nicho === nichoFilter).length : 0

  return (
    <div className="card leads-view-container">
      {/* 1. Header Financeiro para Clientes Fechados / Ganhos */}
      {isFechadosView && (
        <div className="closed-deals-summary-bar">
          <div className="deal-summary-item">
            <span className="deal-summary-label">Faturamento Total Fechado</span>
            <strong className="deal-summary-value total-revenue">
              R$ {totalFechadoValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
          <div className="deal-summary-divider" />
          <div className="deal-summary-item">
            <span className="deal-summary-label">Contratos Ganhos</span>
            <strong className="deal-summary-value">
              {fechadosLeads.length} contratos
            </strong>
          </div>
          <div className="deal-summary-divider" />
          <div className="deal-summary-item">
            <span className="deal-summary-label">Ticket Médio por Venda</span>
            <strong className="deal-summary-value ticket-medio">
              R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      )}

      {/* 2. Barra Superior com Busca e Filtros */}
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
                {n} ({leads.filter((l) => l.nicho === n).length})
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

          {/* Botão para Excluir Nicho Inteiro */}
          {uniqueNichos.length > 0 && (
            <button
              className="btn btn-secondary btn-delete-nicho-trigger"
              onClick={() => {
                setNichoToDelete(nichoFilter || uniqueNichos[0])
                setIsNichoDeleteModalOpen(true)
              }}
              title="Excluir todos os leads de um nicho específico"
            >
              <IconTrash2 size={14} />
              <span>Excluir Nicho Inteiro</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Atalho de exclusão do nicho filtrado atualmente */}
      {nichoFilter && countInFilteredNicho > 0 && (
        <div className="nicho-active-banner">
          <span>
            Filtrando pelo nicho <b>"{nichoFilter}"</b> ({countInFilteredNicho} leads cadastrados).
          </span>
          <button
            className="btn-link-danger"
            onClick={() => handleDeleteNichoConfirm(nichoFilter)}
          >
            <IconTrash2 size={13} /> Excluir todos os {countInFilteredNicho} leads deste nicho
          </button>
        </div>
      )}

      {/* 4. Barra de Ações em Lote (Quando há itens selecionados) */}
      {selectedIds.length > 0 && (
        <div className="bulk-selection-bar">
          <div className="bulk-info-text">
            <span className="bulk-count-badge">{selectedIds.length}</span>
            <span>lead(s) selecionado(s) para ação</span>
          </div>
          <div className="bulk-actions-buttons">
            <button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
              <IconTrash2 size={14} />
              <span>Excluir Selecionados ({selectedIds.length})</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedIds([])}>
              Desmarcar Todos
            </button>
          </div>
        </div>
      )}

      {/* 5. Contador de Resultados e Limpar Filtros */}
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

      {/* 6. Tabela de Leads */}
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
                <th className="th-checkbox">
                  <input
                    type="checkbox"
                    className="lead-checkbox"
                    checked={isAllCurrentPageSelected}
                    onChange={handleToggleSelectAll}
                    title="Selecionar todos os leads desta página"
                  />
                </th>
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
                {isFechadosView && <th>Valor Negociado (R$)</th>}
                <th>Contato & Abordagem</th>
                <th>Anotações Rápidas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map((lead) => {
                const leadKey = lead.id || lead.place_id
                const isSelected = selectedIds.includes(leadKey)
                const waLink = buildWhatsAppLink(lead)
                const isCopied = copiedId === leadKey

                return (
                  <tr key={leadKey} className={isSelected ? 'row-selected' : ''}>
                    {/* Checkbox de Seleção */}
                    <td className="td-checkbox">
                      <input
                        type="checkbox"
                        className="lead-checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(leadKey)}
                      />
                    </td>

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

                      {/* Campo de valor inline se marcado como fechado fora da view de fechados */}
                      {!isFechadosView && lead.status === 'fechado' && (
                        <div className="lead-deal-inline-box">
                          <span className="currency-label">Valor: R$</span>
                          <input
                            type="number"
                            step="50"
                            className="deal-value-input-compact"
                            placeholder="0,00"
                            defaultValue={lead.valor_fechado ?? ''}
                            onBlur={(e) => {
                              const val = e.target.value ? parseFloat(e.target.value) : null
                              if (val !== lead.valor_fechado) {
                                onUpdateLead(lead, { valor_fechado: val })
                              }
                            }}
                          />
                        </div>
                      )}
                    </td>

                    {/* Coluna de Valor Negociado (View Fechados) */}
                    {isFechadosView && (
                      <td className="deal-value-cell">
                        <div className="deal-value-input-wrapper">
                          <span className="currency-prefix">R$</span>
                          <input
                            type="number"
                            step="50"
                            className="deal-value-input"
                            placeholder="0,00"
                            defaultValue={lead.valor_fechado ?? ''}
                            onBlur={(e) => {
                              const val = e.target.value ? parseFloat(e.target.value) : null
                              if (val !== lead.valor_fechado) {
                                onUpdateLead(lead, { valor_fechado: val })
                              }
                            }}
                          />
                        </div>
                      </td>
                    )}

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

      {/* 7. Paginação */}
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

      {/* 8. Modal de Exclusão de Nicho Inteiro */}
      {isNichoDeleteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card modal-sm">
            <div className="modal-header">
              <div className="modal-title-group">
                <IconTrash2 size={20} className="text-danger" />
                <h3>Excluir Nicho Inteiro de Leads</h3>
              </div>
              <button
                className="btn-close-modal"
                onClick={() => setIsNichoDeleteModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body-pad">
              <p className="modal-desc">
                Selecione o nicho que você deseja remover completamente da sua base de leads:
              </p>
              <div className="form-group">
                <label className="form-label">Escolha o Nicho:</label>
                <select
                  className="form-select"
                  value={nichoToDelete}
                  onChange={(e) => setNichoToDelete(e.target.value)}
                >
                  {uniqueNichos.map((n) => {
                    const c = leads.filter((l) => l.nicho === n).length
                    return (
                      <option key={n} value={n}>
                        {n} ({c} leads)
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="warning-box">
                Esta ação apagará todos os leads salvos pertencentes ao nicho selecionado.
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsNichoDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDeleteNichoConfirm(nichoToDelete)}
              >
                <IconTrash2 size={16} /> Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
