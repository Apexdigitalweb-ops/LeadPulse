import React, { useState } from 'react'
import { Lead } from '../types'
import { KpiCards } from './KpiCards'
import { TargetGauge } from './TargetGauge'
import { ChartsSection } from './ChartsSection'
import { LeadsView } from './LeadsView'
import { IconFlame, IconSparkles, IconArrowUpRight, IconBuilding } from './Icons'

interface DashboardViewProps {
  leads: Lead[]
  onUpdateLead: (lead: Lead, updates: Partial<Lead>) => Promise<void>
  onNavigateToBusca: () => void
  onExtractEmail?: (lead: Lead) => Promise<void>
}

export function DashboardView({
  leads,
  onUpdateLead,
  onNavigateToBusca,
  onExtractEmail,
}: DashboardViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<{ date?: string; nicho?: string } | null>(null)

  const semSiteCount = leads.filter((l) => !l.site).length
  const contatadosCount = leads.filter((l) => ['contatado', 'respondeu', 'fechado'].includes(l.status)).length

  // Filtra lista de leads para o preview da tabela
  const previewLeads = selectedFilter
    ? leads.filter((l) => {
        if (selectedFilter.date && l.capturado_em.slice(0, 10) !== selectedFilter.date) return false
        if (selectedFilter.nicho && l.nicho !== selectedFilter.nicho) return false
        return true
      })
    : leads

  return (
    <div className="dashboard-content-flow">
      {/* 1. KPIs no Topo (Estilo Image 1 e Image 2) */}
      <KpiCards leads={leads} />

      {/* 2. Grid Intermediário: Speedometer Gauge + Card Destaque de Oportunidade */}
      <div className="dash-hero-grid">
        {/* Velocímetro de Metas (Inspirado diretamente na Imagem 1) */}
        <TargetGauge
          current={contatadosCount}
          target={Math.max(20, Math.ceil((leads.length || 10) * 0.7))}
          label="Meta de Contatos & Abordagens"
        />

        {/* Card de Destaque / High-Impact Banner (Inspirado na Imagem 2 Quixotic) */}
        <div className="card opportunity-banner-card">
          <div className="banner-glow-effect" />
          <div className="banner-top-badge">
            Inteligência de Oportunidades
          </div>
          <div className="banner-body">
            <h3 className="banner-title">
              Existem <span className="highlight-number">{semSiteCount}</span> empresas na sua base sem site cadastrado!
            </h3>
            <p className="banner-desc">
              Empresas sem site no Google têm <b>3.8x mais probabilidade</b> de contratar serviços de desenvolvimento web, marketing e presença online.
            </p>
          </div>
          <div className="banner-actions">
            <button className="btn btn-primary btn-banner" onClick={onNavigateToBusca}>
              <span>Prospectar Novos Nichos</span>
              <IconArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Seção de Gráficos Recharts (Volume Diário + Funil + Nichos) */}
      <ChartsSection
        leads={leads}
        activeFilter={selectedFilter}
        onSelectPeriodFilter={setSelectedFilter}
      />

      {/* 4. Tabela de Leads Recentes Interativa */}
      <div className="dash-table-section">
        <div className="dash-section-header">
          <div>
            <h3 className="card-title">Base de Leads & Histórico Recente</h3>
            <p className="card-subtitle">
              Altere status em tempo real, anote observações e inicie conversas no WhatsApp com 1 clique
            </p>
          </div>
        </div>

        <LeadsView
          leads={previewLeads}
          onUpdateLead={onUpdateLead}
          onExtractEmail={onExtractEmail}
        />
      </div>
    </div>
  )
}

