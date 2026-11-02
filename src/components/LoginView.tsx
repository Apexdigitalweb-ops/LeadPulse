import React, { useState } from 'react'

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<string | null>
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email || !password) {
      setErrorMsg('Preencha seu e-mail e senha.')
      return
    }

    setLoading(true)
    const err = await onLogin(email, password)
    if (err) setErrorMsg(err)
    setLoading(false)
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container card">
        <div className="login-header">
          <div className="login-brand-logo">
            <span className="brand-dot" />
            <span className="brand-name">LeadPulse</span>
            <span className="brand-badge">PRO</span>
          </div>
          <h2 className="login-title">Acesse sua Conta</h2>
          <p className="login-subtitle">
            Painel de Prospecção & Inteligência Comercial
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div className="login-input-wrapper">
              <input
                type="email"
                required
                className="form-input"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className="login-input-wrapper">
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {errorMsg && <div className="alert-box alert-error">{errorMsg}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar na Plataforma'}
          </button>
        </form>
      </div>
    </div>
  )
}
