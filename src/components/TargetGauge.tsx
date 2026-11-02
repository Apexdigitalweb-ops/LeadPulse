import React from 'react'
import { IconFlame, IconTarget } from './Icons'

interface TargetGaugeProps {
  current: number
  target?: number
  label?: string
}

export function TargetGauge({ current, target = 25, label = 'Metas de Prospecção' }: TargetGaugeProps) {
  const percentage = Math.min(Math.round((current / (target || 1)) * 100), 100)
  
  // Cálculo do arco SVG (semi-círculo de 180 graus, de 180° a 0°)
  // Raio 80, Centro (100, 100)
  const radius = 75
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Cor dinâmica baseada no progresso
  const arcColor = percentage >= 80 ? '#10b981' : percentage >= 50 ? '#3b82f6' : '#f59e0b'

  return (
    <div className="card gauge-card">
      <div className="gauge-header">
        <div className="gauge-title-group">
          <span className="gauge-icon-wrapper">
            <IconTarget size={18} />
          </span>
          <div>
            <h4 className="gauge-title">{label}</h4>
            <p className="gauge-sub">Progresso de leads contatados</p>
          </div>
        </div>
        <span className="badge-pill">
          <IconFlame size={14} /> Meta: {target}
        </span>
      </div>

      <div className="gauge-visual-container">
        <svg viewBox="0 0 200 115" className="gauge-svg">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="gaugeShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={arcColor} floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Fundo do arco */}
          <path
            d="M 25 100 A 75 75 0 0 1 175 100"
            fill="none"
            stroke="var(--gauge-track)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Arco preenchido */}
          <path
            d="M 25 100 A 75 75 0 0 1 175 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#gaugeShadow)"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />

          {/* Ponteiro central decorativo */}
          <circle cx="100" cy="100" r="7" fill="var(--card-bg)" stroke={arcColor} strokeWidth="3" />
        </svg>

        <div className="gauge-center-text">
          <span className="gauge-percent-num">{percentage}%</span>
          <span className="gauge-ratio-text">
            {current} de {target} leads
          </span>
        </div>
      </div>

      <div className="gauge-footer-tip">
        {percentage >= 100 ? (
          <p className="tip-success">Parabéns! Meta alcançada com sucesso neste ciclo.</p>
        ) : (
          <p className="tip-normal">
            Você completou <b>{percentage}%</b> da sua meta mensal. Faltam apenas {Math.max(0, target - current)} leads para fechar 100%!
          </p>
        )}
      </div>
    </div>
  )
}

