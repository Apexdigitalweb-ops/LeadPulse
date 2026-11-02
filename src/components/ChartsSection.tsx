import React, { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts'
import { Lead } from '../types'
import { IconTrendingUp } from './Icons'

interface ChartsSectionProps {
  leads: Lead[]
  onSelectPeriodFilter?: (filter: { date?: string; nicho?: string } | null) => void
  activeFilter?: { date?: string; nicho?: string } | null
}

const formatDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

export function ChartsSection({ leads, onSelectPeriodFilter, activeFilter }: ChartsSectionProps) {
  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'tudo'>('30d')

  // Filtra período
  const now = Date.now()
  const daysLimit = period === 'hoje' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 9999
  const leadsInPeriod = leads.filter((l) => (now - new Date(l.capturado_em).getTime()) / 864e5 <= daysLimit)

  // Agrupa por dia
  const byDay: Record<string, number> = {}
  leadsInPeriod.forEach((l) => {
    const day = l.capturado_em.slice(0, 10)
    byDay[day] = (byDay[day] || 0) + 1
  })

  const barData = Object.keys(byDay)
    .sort()
    .map((day) => ({
      date: day,
      label: formatDate(day),
      leads: byDay[day],
    }))

  // Agrupa por Nicho
  const byNicho: Record<string, number> = {}
  leads.forEach((l) => {
    const n = l.nicho || 'Outros'
    byNicho[n] = (byNicho[n] || 0) + 1
  })

  const topNichos = Object.entries(byNicho)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Funil de conversão
  const c = (s: string) => leads.filter((l) => l.status === s).length
  const total = leads.length || 1
  const contatados = leads.filter((l) => ['contatado', 'respondeu', 'fechado'].includes(l.status)).length
  const responderam = leads.filter((l) => ['respondeu', 'fechado'].includes(l.status)).length
  const fechados = c('fechado')

  const funnelSteps = [
    { label: 'Novos Capturados', count: total, pct: 100, color: '#3b82f6' },
    {
      label: 'Abordados / Contato',
      count: contatados,
      pct: Math.round((contatados / total) * 100),
      color: '#8b5cf6',
    },
    {
      label: 'Responderam',
      count: responderam,
      pct: Math.round((responderam / total) * 100),
      color: '#10b981',
    },
    {
      label: 'Fechados / Vendas',
      count: fechados,
      pct: Math.round((fechados / total) * 100),
      color: '#059669',
    },
  ]

  return (
    <div className="charts-grid">
      {/* Gráfico Temporal Principal */}
      <div className="card chart-card main-chart">
        <div className="chart-header">
          <div className="chart-title-area">
            <h3 className="card-title">
              <IconTrendingUp size={18} /> Volume de Prospecção Diária
            </h3>
            <p className="card-subtitle">
              Distribuição de leads capturados ao longo do tempo (clique na barra para filtrar)
            </p>
          </div>

          <div className="segmented-control">
            <button
              className={`segment-btn ${period === 'hoje' ? 'active' : ''}`}
              onClick={() => setPeriod('hoje')}
            >
              Hoje
            </button>
            <button
              className={`segment-btn ${period === '7d' ? 'active' : ''}`}
              onClick={() => setPeriod('7d')}
            >
              Semana
            </button>
            <button
              className={`segment-btn ${period === '30d' ? 'active' : ''}`}
              onClick={() => setPeriod('30d')}
            >
              30 Dias
            </button>
            <button
              className={`segment-btn ${period === 'tudo' ? 'active' : ''}`}
              onClick={() => setPeriod('tudo')}
            >
              Geral
            </button>
          </div>
        </div>

        {activeFilter?.date && (
          <div className="filter-active-pill">
            <span>Filtrando pelo dia: <b>{formatDate(activeFilter.date)}</b></span>
            <button onClick={() => onSelectPeriodFilter?.(null)}>Limpar filtro</button>
          </div>
        )}

        <div className="chart-wrapper">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="barSelected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'var(--hover-bg)', opacity: 0.5 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="custom-tooltip">
                          <p className="tooltip-date">{formatDate(data.date)}</p>
                          <p className="tooltip-leads">
                            <b>{data.leads}</b> {data.leads === 1 ? 'lead capturado' : 'leads capturados'}
                          </p>
                          <span className="tooltip-click-hint">Clique para filtrar tabela</span>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="leads"
                  radius={[8, 8, 0, 0]}
                  onClick={(entry) =>
                    onSelectPeriodFilter?.(
                      activeFilter?.date === entry.date ? null : { date: entry.date }
                    )
                  }
                >
                  {barData.map((entry) => (
                    <Cell
                      key={entry.date}
                      fill={activeFilter?.date === entry.date ? 'url(#barSelected)' : 'url(#barGradient)'}
                      cursor="pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty-state">
              <p>Nenhum lead encontrado neste período.</p>
              <span className="sub-hint">Realize uma nova busca na aba "Prospecção".</span>
            </div>
          )}
        </div>
      </div>

      {/* Funil Visual e Nichos Populares */}
      <div className="card chart-card side-funnel-card">
        <h3 className="card-title">Funil de Prospecção</h3>
        <p className="card-subtitle">Taxa de passagem entre etapas</p>

        <div className="funnel-container">
          {funnelSteps.map((step, idx) => (
            <div key={idx} className="funnel-row">
              <div className="funnel-info">
                <span className="funnel-label">{step.label}</span>
                <span className="funnel-count">
                  <b>{step.count}</b> ({step.pct}%)
                </span>
              </div>
              <div className="funnel-track">
                <div
                  className="funnel-bar"
                  style={{ width: `${Math.max(8, step.pct)}%`, backgroundColor: step.color }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="top-nichos-section">
          <h4 className="top-nichos-title">Principais Nichos</h4>
          <div className="nichos-pill-list">
            {topNichos.map(([n, count]) => (
              <div
                key={n}
                className={`nicho-stat-chip ${activeFilter?.nicho === n ? 'active' : ''}`}
                onClick={() =>
                  onSelectPeriodFilter?.(
                    activeFilter?.nicho === n ? null : { nicho: n }
                  )
                }
              >
                <span className="nicho-name">{n}</span>
                <span className="nicho-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

