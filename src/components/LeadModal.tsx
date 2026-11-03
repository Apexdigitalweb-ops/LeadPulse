import React, { useState } from 'react'
import { Lead, LeadStatus } from '../types'
import { ESTADOS_BRASIL, STATUS_LIST } from '../constants/brazil'
import { IconBuilding, IconX, IconPlus } from './Icons'

interface LeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (lead: Partial<Lead>) => void
}

export function LeadModal({ isOpen, onClose, onSave }: LeadModalProps) {
  const [nome, setNome] = useState('')
  const [nicho, setNicho] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('SP')
  const [bairro, setBairro] = useState('')
  const [telefone, setTelefone] = useState('')
  const [site, setSite] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<LeadStatus>('novo')
  const [valorFechado, setValorFechado] = useState('')
  const [anotacoes, setAnotacoes] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) return

    onSave({
      place_id: `manual/${Date.now()}`,
      nome: nome.trim(),
      nicho: nicho.trim() || 'Geral',
      cidade: cidade.trim(),
      uf,
      bairro: bairro.trim(),
      telefone: telefone.trim() || null,
      site: site.trim() || null,
      email: email.trim() || null,
      status,
      valor_fechado: status === 'fechado' && valorFechado ? parseFloat(valorFechado) : null,
      anotacoes: anotacoes.trim(),
      capturado_em: new Date().toISOString(),
      maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${nome} ${cidade} ${uf}`
      )}`,
    })

    onClose()
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-pill">
              <IconBuilding size={18} />
            </span>
            <h3>Cadastrar Novo Lead</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Nome da Empresa / Estabelecimento *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Ex: Pizzaria Bella Napoli"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Nicho de Atuação (Livre)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Pizzaria, Mecânica, Dentista..."
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status Inicial</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
              >
                {STATUS_LIST.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Estado (UF)</label>
              <select
                className="form-select"
                value={uf}
                onChange={(e) => setUf(e.target.value)}
              >
                {ESTADOS_BRASIL.map((u) => (
                  <option key={u.sigla} value={u.sigla}>
                    {u.sigla}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: São Paulo"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bairro</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Centro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Telefone / WhatsApp</label>
              <input
                type="text"
                className="form-input"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Site (se houver)</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://exemplo.com.br"
                value={site}
                onChange={(e) => setSite(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Anotações Iniciais</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Detalhes sobre abordagem, decisor ou observações..."
              value={anotacoes}
              onChange={(e) => setAnotacoes(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <IconPlus size={16} /> Salvar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

