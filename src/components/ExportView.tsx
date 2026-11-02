import React from 'react'
import { Lead } from '../types'
import * as XLSX from 'xlsx'
import { IconDownload, IconGlobe, IconFlame, IconCheckCircle2, IconPhone } from './Icons'

interface ExportViewProps {
  leads: Lead[]
}

const formatDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

export function ExportView({ leads }: ExportViewProps) {
  const exportToSheet = (list: Lead[], filename: string, ext: 'xlsx' | 'csv') => {
    const data = list.map((l) => ({
      'Nome da Empresa': l.nome,
      Nicho: l.nicho,
      'Cidade / UF': `${l.cidade}/${l.uf}`,
      Bairro: l.bairro || '',
      Endereço: l.endereco || '',
      Telefone: l.telefone || '',
      'Status Funil': l.status,
      'Possui Site?': l.site ? 'Sim' : 'NÃO (Oportunidade)',
      'URL do Site': l.site || '',
      'E-mail': l.email || '',
      'Link Google Maps': l.maps_url || '',
      'Data de Captura': formatDate(l.capturado_em),
      'Anotações e Histórico': l.anotacoes || '',
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Leads')
    XLSX.writeFile(wb, `${filename}.${ext}`)
  }

  const semSiteLeads = leads.filter((l) => !l.site)
  const contatadosLeads = leads.filter((l) => ['contatado', 'respondeu', 'fechado'].includes(l.status))
  const fechadosLeads = leads.filter((l) => l.status === 'fechado')

  return (
    <div className="export-view-container">
      <div className="card export-intro-card">
        <h2 className="card-title">Exportar Dados & Relatórios de Prospecção</h2>
        <p className="card-subtitle">
          Baixe suas listas completas de leads em planilhas Excel (.xlsx) ou CSV para importar no seu CRM, discador ou disparador de WhatsApp.
        </p>
      </div>

      <div className="export-cards-grid">
        {/* Card 1: Todos */}
        <div className="card export-card">
          <div className="export-icon-pill blue">
            <IconDownload size={24} />
          </div>
          <strong className="export-card-title">Base Completa de Leads</strong>
          <p className="export-card-desc">
            Contém todos os {leads.length} registros capturados com endereço, telefones, nicho e histórico.
          </p>
          <div className="export-stat-badge">{leads.length} leads totais</div>
          <div className="export-actions-row">
            <button
              className="btn btn-primary"
              onClick={() => exportToSheet(leads, 'todos_os_leads', 'xlsx')}
              disabled={leads.length === 0}
            >
              Baixar Excel (.xlsx)
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => exportToSheet(leads, 'todos_os_leads', 'csv')}
              disabled={leads.length === 0}
            >
              Baixar CSV
            </button>
          </div>
        </div>

        {/* Card 2: Sem Site (Oportunidades Quentes) */}
        <div className="card export-card highlight-opportunity">
          <div className="export-icon-pill orange">
            <IconFlame size={24} />
          </div>
          <div className="opportunity-badge">Alta Conversão</div>
          <strong className="export-card-title">Apenas Empresas Sem Site</strong>
          <p className="export-card-desc">
            Empresas sem presença web cadastrada. A melhor lista para venda de criação de sites, tráfego e SEO.
          </p>
          <div className="export-stat-badge">{semSiteLeads.length} oportunidades sem site</div>
          <div className="export-actions-row">
            <button
              className="btn btn-primary"
              onClick={() => exportToSheet(semSiteLeads, 'leads_sem_site_quentes', 'xlsx')}
              disabled={semSiteLeads.length === 0}
            >
              Baixar Oportunidades (.xlsx)
            </button>
          </div>
        </div>

        {/* Card 3: Leads em Andamento */}
        <div className="card export-card">
          <div className="export-icon-pill purple">
            <IconPhone size={24} />
          </div>
          <strong className="export-card-title">Leads em Negociação</strong>
          <p className="export-card-desc">
            Leads que já foram contatados ou que responderam suas mensagens no funil comercial.
          </p>
          <div className="export-stat-badge">{contatadosLeads.length} leads em negociação</div>
          <div className="export-actions-row">
            <button
              className="btn btn-secondary"
              onClick={() => exportToSheet(contatadosLeads, 'leads_em_negociacao', 'xlsx')}
              disabled={contatadosLeads.length === 0}
            >
              Baixar Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* Card 4: Clientes Fechados */}
        <div className="card export-card">
          <div className="export-icon-pill green">
            <IconCheckCircle2 size={24} />
          </div>
          <strong className="export-card-title">Clientes Fechados</strong>
          <p className="export-card-desc">
            Lista de contratos ganhos e vendas efetuadas para pós-venda ou renovação contratual.
          </p>
          <div className="export-stat-badge">{fechadosLeads.length} clientes ganhos</div>
          <div className="export-actions-row">
            <button
              className="btn btn-secondary"
              onClick={() => exportToSheet(fechadosLeads, 'clientes_fechados', 'xlsx')}
              disabled={fechadosLeads.length === 0}
            >
              Baixar Relatório (.xlsx)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

