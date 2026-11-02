import React from 'react'
import {
  IconUsers,
  IconGlobe,
  IconMessageSquare,
  IconCheckCircle2,
  IconTrendingUp,
  IconPhone,
  IconArrowUpRight,
} from './Icons'
import { Lead } from '../types'

interface KpiCardsProps {
  leads: Lead[]
}

export function KpiCards({ leads }: KpiCardsProps) {
  const total = leads.length
  const semSite = leads.filter((l) => !l.site).length
  const contatados = leads.filter((l) => ['contatado', 'respondeu', 'fechado'].includes(l.status)).length
  const responderam = leads.filter((l) => ['respondeu', 'fechado'].includes(l.status)).length
  const fechados = leads.filter((l) => l.status === 'fechado').length

  const taxaResposta = contatados > 0 ? Math.round((responderam / contatados) * 100) : 0
  const taxaFechamento = responderam > 0 ? Math.round((fechados / responderam) * 100) : 0

  const cards = [
    {
      title: 'Total de Leads',
      subtitle: 'Capturados no sistema',
      value: total,
      trend: '+12.4%',
      trendUp: true,
      icon: <IconUsers size={22} />,
      colorTheme: 'blue',
      badge: 'Base ativa',
    },
    {
      title: 'Sem Site (Alta Conversão)',
      subtitle: 'Oportunidades quentes',
      value: semSite,
      trend: `${total > 0 ? Math.round((semSite / total) * 100) : 0}% da base`,
      trendUp: true,
      icon: <IconGlobe size={22} />,
      colorTheme: 'orange',
      badge: 'Oportunidade',
    },
    {
      title: 'Contatados no Funil',
      subtitle: 'Abordagens iniciadas',
      value: contatados,
      trend: `${total > 0 ? Math.round((contatados / total) * 100) : 0}% contactados`,
      trendUp: true,
      icon: <IconPhone size={22} />,
      colorTheme: 'purple',
      badge: 'Em prospecção',
    },
    {
      title: 'Responderam',
      subtitle: 'Demonstraram interesse',
      value: responderam,
      trend: `${taxaResposta}% taxa resposta`,
      trendUp: true,
      icon: <IconMessageSquare size={22} />,
      colorTheme: 'teal',
      badge: 'Conversão inicial',
    },
    {
      title: 'Clientes Fechados',
      subtitle: 'Vendas concretizadas',
      value: fechados,
      trend: `${taxaFechamento}% dos respondidos`,
      trendUp: true,
      icon: <IconCheckCircle2 size={22} />,
      colorTheme: 'green',
      badge: 'Sucesso',
    },
    {
      title: 'Taxa Global de Conversão',
      subtitle: 'Fechados / Contatados',
      value: contatados > 0 ? `${Math.round((fechados / contatados) * 100)}%` : '0%',
      trend: '+3.8% este mês',
      trendUp: true,
      icon: <IconTrendingUp size={22} />,
      colorTheme: 'emerald',
      badge: 'Performance',
    },
  ]

  return (
    <div className="kpi-grid">
      {cards.map((card, i) => (
        <div key={i} className={`card kpi-card theme-${card.colorTheme}`}>
          <div className="kpi-top">
            <div className={`kpi-icon-pill ${card.colorTheme}`}>
              {card.icon}
            </div>
            <div className="kpi-trend-pill">
              <IconArrowUpRight size={13} />
              <span>{card.trend}</span>
            </div>
          </div>

          <div className="kpi-body">
            <span className="kpi-value">{card.value}</span>
            <span className="kpi-title">{card.title}</span>
            <span className="kpi-sub">{card.subtitle}</span>
          </div>

          <div className="kpi-footer-bar">
            <div className="kpi-progress-bar">
              <div
                className={`kpi-progress-fill ${card.colorTheme}`}
                style={{
                  width:
                    typeof card.value === 'number'
                      ? `${Math.min(100, Math.max(15, (card.value / (total || 1)) * 100))}%`
                      : '75%',
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

