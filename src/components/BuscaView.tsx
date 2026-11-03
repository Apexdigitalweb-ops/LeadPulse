import React, { useState, useEffect } from 'react'
import {
  IconSearch,
  IconMapPin,
  IconBuilding,
  IconSparkles,
  IconGlobe,
  IconPhone,
  IconExternalLink,
  IconWhatsApp,
  IconCheck,
  IconFlame,
  IconDownload,
} from './Icons'
import { ESTADOS_BRASIL } from '../constants/brazil'
import { NICHOS_SUGESTOES, executeOverpassSearch } from '../services/nicheDictionary'
import { Lead, SearchFilters } from '../types'
import * as XLSX from 'xlsx'

interface BuscaViewProps {
  onSaveLeads: (leads: Lead[]) => Promise<void>
  isDemo?: boolean
}

export function BuscaView({ onSaveLeads, isDemo }: BuscaViewProps) {
  const [ufs] = useState(ESTADOS_BRASIL)
  const [cidades, setCidades] = useState<any[]>([])
  const [loadingCidades, setLoadingCidades] = useState(false)

  const [filters, setFilters] = useState<SearchFilters>({
    uf: 'SP',
    cidade: 'Campinas',
    bairro: '',
    nicho: '',
    semSite: true,
    apenasComSite: false,
    apenasComTelefone: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [results, setResults] = useState<Lead[] | null>(null)
  const [savedCount, setSavedCount] = useState<number | null>(null)

  // Carrega cidades do IBGE ao mudar a UF
  useEffect(() => {
    if (!filters.uf) {
      setCidades([])
      return
    }
    setLoadingCidades(true)
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${filters.uf}/municipios`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCidades(data.sort((a, b) => a.nome.localeCompare(b.nome)))
        }
      })
      .catch(() => {
        // Falha silenciosa se offline, usuário ainda pode digitar a cidade manualmente
      })
      .finally(() => setLoadingCidades(false))
  }, [filters.uf])

  const handleSearch = async () => {
    setErrorMsg('')
    setSuccessMsg('')
    setSavedCount(null)

    if (!filters.uf) {
      setErrorMsg('Por favor, selecione ao menos o Estado (UF).')
      return
    }

    setIsLoading(true)
    try {
      const found = await executeOverpassSearch(filters)
      setResults(found)
      if (found.length === 0) {
        setErrorMsg('Nenhum resultado encontrado com os filtros atuais. Experimente buscar sem o bairro ou com outro termo.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao consultar a base de dados.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAll = async () => {
    if (!results || !results.length) return
    setIsLoading(true)
    try {
      await onSaveLeads(results)
      setSavedCount(results.length)
      setSuccessMsg(`Sucesso! ${results.length} leads foram importados para sua base.`)
    } catch (err: any) {
      setErrorMsg('Erro ao salvar no banco: ' + (err.message || 'Falha na conexão'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportXLSX = () => {
    if (!results || !results.length) return
    const sheetData = results.map((l) => ({
      Nome: l.nome,
      Nicho: l.nicho,
      Cidade: l.cidade,
      UF: l.uf,
      Bairro: l.bairro || '',
      Endereço: l.endereco || '',
      Telefone: l.telefone || '',
      Site: l.site || 'Sem site',
      Email: l.email || '',
      'Google Maps': l.maps_url || '',
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(sheetData)
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados Busca')
    XLSX.writeFile(wb, `leads_${filters.nicho || 'geral'}_${filters.cidade || filters.uf}.xlsx`)
  }

  const buildWhatsAppLink = (lead: Lead) => {
    if (!lead.telefone) return null
    const cleanPhone = lead.telefone.replace(/\D/g, '').replace(/^55/, '')
    const msg = lead.site
      ? encodeURIComponent(
          `Olá, tudo bem? Encontrei a *${lead.nome}* no Google e gostei muito da proposta de vocês. Notei algumas oportunidades para otimizar a conversão e captação de clientes em ${lead.cidade || 'sua região'}. Podemos conversar 5 minutinhos?`
        )
      : encodeURIComponent(
          `Olá, tudo bem? Encontrei o perfil da *${lead.nome}* no Google e gostaria de apresentar uma oportunidade rápida de presença digital e captação de clientes para o negócio de vocês em ${lead.cidade || 'sua região'}.`
        )
    return `https://wa.me/55${cleanPhone}?text=${msg}`
  }

  return (
    <div className="search-view-container">
      {/* Top Banner de Instrução */}
      <div className="card search-hero-card">
        <div className="search-hero-content">
          <div className="search-badge-free">
            Digitação Livre
          </div>
          <h2 className="search-hero-title">Qual nicho ou segmento você quer prospectar?</h2>
          <p className="search-hero-sub">
            Você não precisa se limitar a opções pré-definidas. Digite livremente qualquer termo:
            <b> Pizzarias, Clínicas Odontológicas, Mecânicas, Energia Solar, Estética, Coworking, Pet Shops</b> ou o que sua imaginação mandar.
          </p>
        </div>

        {/* Formulário Principal de Prospecção */}
        <div className="search-form-box">
          {/* Campo Principal: Nicho Livre */}
          <div className="form-group-nicho">
            <label className="form-label">
              <IconBuilding size={16} />
              <span>Digite o Nicho ou Tipo de Negócio</span>
              <span className="label-tag">Campo livre para digitação</span>
            </label>
            <div className="input-with-icon-wrapper">
              <input
                type="text"
                className="input-nicho-prominent"
                placeholder="Ex: Pizzaria, Barbearia, Dentista, Mecânica, Estética, Imobiliária, Energia Solar..."
                value={filters.nicho}
                onChange={(e) => setFilters({ ...filters, nicho: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {filters.nicho && (
                <button
                  type="button"
                  className="clear-input-btn"
                  onClick={() => setFilters({ ...filters, nicho: '' })}
                >
                  ×
                </button>
              )}
            </div>

            {/* Chips de Sugestões de Inspiração (Opcionais) */}
            <div className="suggestions-container">
              <span className="suggestions-title">Ideias de nichos populares (clique para preencher):</span>
              <div className="suggestions-chips">
                {NICHOS_SUGESTOES.slice(0, 10).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`chip-suggestion ${filters.nicho.toLowerCase() === s.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setFilters({ ...filters, nicho: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Linha de Localização e Opções */}
          <div className="form-row-location">
            {/* Estado */}
            <div className="form-col">
              <label className="form-label">
                <IconMapPin size={15} /> Estado (UF)
              </label>
              <select
                className="form-select"
                value={filters.uf}
                onChange={(e) => setFilters({ ...filters, uf: e.target.value, cidade: '' })}
              >
                <option value="">Selecione o Estado</option>
                {ufs.map((u) => (
                  <option key={u.sigla} value={u.sigla}>
                    {u.sigla} — {u.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Cidade */}
            <div className="form-col">
              <label className="form-label">
                Cidade {loadingCidades && <span className="loading-label">(carregando...)</span>}
              </label>
              <input
                type="text"
                list="cidades-ibge-list"
                className="form-input"
                placeholder="Ex: São Paulo, Campinas, Curitiba..."
                value={filters.cidade}
                onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
              />
              <datalist id="cidades-ibge-list">
                {cidades.map((c) => (
                  <option key={c.id} value={c.nome} />
                ))}
              </datalist>
            </div>

            {/* Bairro (Opcional) */}
            <div className="form-col">
              <label className="form-label">Bairro (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Centro, Jardins, Cambuí..."
                value={filters.bairro}
                onChange={(e) => setFilters({ ...filters, bairro: e.target.value })}
              />
            </div>
          </div>

          {/* Toggles de Filtro Inteligente */}
          <div className="search-toggles-row">
            <label className="toggle-checkbox-label">
              <input
                type="checkbox"
                checked={filters.semSite}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    semSite: e.target.checked,
                    apenasComSite: e.target.checked ? false : filters.apenasComSite,
                  })
                }
              />
              <span className="toggle-checkbox-custom" />
              <span className="toggle-text">
                <IconFlame size={15} className="flame-icon" />
                <b>Apenas sem site cadastrado</b>
                <span className="toggle-badge">Maior taxa de conversão</span>
              </span>
            </label>

            <label className="toggle-checkbox-label">
              <input
                type="checkbox"
                checked={filters.apenasComSite || false}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    apenasComSite: e.target.checked,
                    semSite: e.target.checked ? false : filters.semSite,
                  })
                }
              />
              <span className="toggle-checkbox-custom" />
              <span className="toggle-text">
                <IconGlobe size={15} />
                <b>Apenas com site cadastrado</b>
                <span className="toggle-badge badge-blue">Tráfego & Redesign</span>
              </span>
            </label>

            <label className="toggle-checkbox-label">
              <input
                type="checkbox"
                checked={filters.apenasComTelefone || false}
                onChange={(e) => setFilters({ ...filters, apenasComTelefone: e.target.checked })}
              />
              <span className="toggle-checkbox-custom" />
              <span className="toggle-text">
                <IconPhone size={15} /> Apenas com telefone / WhatsApp
              </span>
            </label>
          </div>

          {/* Botão de Busca */}
          <div className="search-action-row">
            <button
              className="btn btn-primary btn-search-big"
              onClick={handleSearch}
              disabled={isLoading}
            >
              <IconSearch size={18} />
              {isLoading ? 'Consultando OpenStreetMap...' : 'Pesquisar Empresas Agora'}
            </button>
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {errorMsg && <div className="alert-box alert-error">{errorMsg}</div>}
        {successMsg && <div className="alert-box alert-success">{successMsg}</div>}
      </div>

      {/* Resultados da Busca */}
      {results !== null && (
        <div className="card search-results-card">
          <div className="results-header">
            <div className="results-title-group">
              <h3 className="results-title">
                {results.length} estabelecimentos encontrados
              </h3>
              <p className="results-sub">
                Nicho: <b>{filters.nicho || 'Todos'}</b> em{' '}
                <b>{filters.cidade || 'Todo o Estado'} ({filters.uf})</b>
              </p>
            </div>

            {results.length > 0 && (
              <div className="results-actions">
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={handleExportXLSX}
                  title="Exportar para Excel"
                >
                  <IconDownload size={16} /> Exportar XLSX
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveAll}
                  disabled={isLoading || savedCount !== null}
                >
                  <IconCheck size={16} />
                  {savedCount !== null ? 'Salvo no Banco!' : `Salvar Todos (${results.length})`}
                </button>
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <div className="results-empty">
              <p>Nenhuma empresa encontrada com os parâmetros informados.</p>
              <span>Experimente buscar por um termo mais amplo ou remover o filtro de bairro.</span>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Empresa & Local</th>
                    <th>Nicho</th>
                    <th>Presença Digital</th>
                    <th>Contato & WhatsApp</th>
                    <th>Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 100).map((lead, idx) => {
                    const waLink = buildWhatsAppLink(lead)
                    return (
                      <tr key={lead.place_id || idx}>
                        <td>
                          <div className="lead-name-cell">
                            <span className="lead-avatar-letter">
                              {lead.nome.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <strong className="lead-company-name">{lead.nome}</strong>
                              <span className="lead-address-sub">
                                {lead.endereco ? `${lead.endereco} · ` : ''}
                                {lead.bairro ? `${lead.bairro} · ` : ''}
                                {lead.cidade}/{lead.uf}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="nicho-tag-pill">{lead.nicho}</span>
                        </td>

                        <td>
                          {lead.site ? (
                            <a
                              href={lead.site}
                              target="_blank"
                              rel="noreferrer"
                              className="site-badge has-site"
                            >
                              <IconGlobe size={13} /> Visitar Site
                            </a>
                          ) : (
                            <span className="site-badge no-site">
                              <IconFlame size={13} /> Sem Site Cadastrado
                            </span>
                          )}
                        </td>

                        <td>
                          {lead.telefone ? (
                            <span className="lead-phone-text">{lead.telefone}</span>
                          ) : (
                            <span className="text-muted">Sem telefone</span>
                          )}
                        </td>

                        <td>
                          <div className="action-buttons-group">
                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-action-pill wa"
                                title="Chamar no WhatsApp com mensagem personalizada"
                              >
                                <IconWhatsApp size={14} /> WhatsApp
                              </a>
                            )}
                            <a
                              href={lead.maps_url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-action-pill maps"
                              title="Ver no Google Maps"
                            >
                              <IconMapPin size={14} /> Maps
                            </a>
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(
                                lead.nome + ' ' + (lead.cidade || '') + ' site'
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-action-pill google"
                              title="Conferir no Google se tem site recente"
                            >
                              <IconExternalLink size={14} /> Conferir
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {results.length > 100 && (
                <div className="table-more-hint">
                  Exibindo os primeiros 100 resultados de {results.length}. Ao clicar em "Salvar Todos", todos os {results.length} serão cadastrados.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

