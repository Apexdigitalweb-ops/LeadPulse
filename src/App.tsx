import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Lead, TabType } from './types'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { DashboardView } from './components/DashboardView'
import { BuscaView } from './components/BuscaView'
import { LeadsView } from './components/LeadsView'
import { KanbanView } from './components/KanbanView'
import { ExportView } from './components/ExportView'
import { LeadModal } from './components/LeadModal'
import { LoginView } from './components/LoginView'
import './styles.css'

const URL_SB = import.meta.env.VITE_SUPABASE_URL
const KEY_SB = import.meta.env.VITE_SUPABASE_ANON_KEY
const sb = createClient(URL_SB || 'https://placeholder.supabase.co', KEY_SB || 'placeholder')

export default function App() {
  const [session, setSession] = useState<any>(undefined)
  const [tab, setTab] = useState<TabType>('dash')
  const [leads, setLeads] = useState<Lead[]>([])
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('leadpulse_theme') === 'dark'
  })
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)

  // Tema Dark / Light
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    localStorage.setItem('leadpulse_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Checa Sessão Supabase
  useEffect(() => {
    if (URL_SB && KEY_SB && URL_SB !== 'https://placeholder.supabase.co') {
      sb.auth.getSession().then(({ data }) => {
        setSession(data.session)
      })
      const { data } = sb.auth.onAuthStateChange((_, s) => {
        setSession(s)
      })
      return () => data.subscription.unsubscribe()
    } else {
      setSession(null)
    }
  }, [])

  // Carrega leads
  const loadLeads = async () => {
    try {
      const { data, error } = await sb
        .from('leads')
        .select('*')
        .order('capturado_em', { ascending: false })
        .limit(5000)

      if (data && !error) {
        setLeads(data)
      } else {
        setLeads([])
      }
    } catch (err) {
      console.error('Erro ao carregar leads:', err)
      setLeads([])
    }
  }

  useEffect(() => {
    if (session) {
      loadLeads()
    }
  }, [session])

  // Atualização de lead
  const handleUpdateLead = async (lead: Lead, updates: Partial<Lead>) => {
    const now = new Date().toISOString()
    const payload: Partial<Lead> = { ...updates }

    if (updates.status === 'contatado') {
      payload.contatado_em = now
      payload.ultimo_contato = now.slice(0, 10)
    }
    if (updates.status === 'respondeu') {
      payload.respondeu_em = now
    }
    if (updates.status === 'fechado') {
      payload.fechado_em = now
    }

    const updatedList = leads.map((item) =>
      (item.id && item.id === lead.id) || item.place_id === lead.place_id
        ? { ...item, ...payload }
        : item
    )

    setLeads(updatedList)

    if (lead.id) {
      await sb.from('leads').update(payload).eq('id', lead.id)
    } else if (lead.place_id) {
      await sb.from('leads').update(payload).eq('place_id', lead.place_id)
    }
  }

  // Deletar lead
  const handleDeleteLead = async (lead: Lead) => {
    const updatedList = leads.filter(
      (item) => (lead.id ? item.id !== lead.id : item.place_id !== lead.place_id)
    )
    setLeads(updatedList)

    if (lead.id) {
      await sb.from('leads').delete().eq('id', lead.id)
    } else if (lead.place_id) {
      await sb.from('leads').delete().eq('place_id', lead.place_id)
    }
  }

  // Salvar novos leads da busca
  const handleSaveBatchLeads = async (newLeads: Lead[]) => {
    const { error } = await sb
      .from('leads')
      .upsert(newLeads, { onConflict: 'place_id', ignoreDuplicates: true })

    if (error) throw error
    await loadLeads()
  }

  // Adicionar lead manual
  const handleAddManualLead = async (leadData: Partial<Lead>) => {
    const newLead: Lead = {
      place_id: leadData.place_id || `manual/${Date.now()}`,
      nome: leadData.nome || 'Empresa',
      nicho: leadData.nicho || 'Geral',
      cidade: leadData.cidade || '',
      uf: leadData.uf || 'SP',
      bairro: leadData.bairro || '',
      telefone: leadData.telefone || null,
      site: leadData.site || null,
      email: leadData.email || null,
      status: leadData.status || 'novo',
      anotacoes: leadData.anotacoes || '',
      capturado_em: new Date().toISOString(),
      maps_url: leadData.maps_url || '',
    }

    const updated = [newLead, ...leads]
    setLeads(updated)

    await sb.from('leads').insert(newLead)
    await loadLeads()
  }

  // Extrair e-mail do site via Supabase Edge Function
  const handleExtractEmail = async (lead: Lead) => {
    if (!lead.site) return
    try {
      const { data } = await sb.functions.invoke('extrair-email', {
        body: { site: lead.site },
      })
      if (data?.email) {
        await handleUpdateLead(lead, { email: data.email })
      } else {
        alert('Nenhum e-mail público foi identificado na página.')
      }
    } catch (err: any) {
      console.warn('Função extrair-email não disponível:', err)
    }
  }

  // Login Supabase
  const handleLogin = async (e: string, p: string) => {
    if (!URL_SB || !KEY_SB || URL_SB === 'https://placeholder.supabase.co') {
      return 'As chaves do Supabase não estão configuradas no arquivo .env.'
    }
    const { data, error } = await sb.auth.signInWithPassword({
      email: e.trim(),
      password: p,
    })
    if (error) return error.message
    setSession(data.session)
    return null
  }

  // Logout
  const handleSignOut = async () => {
    await sb.auth.signOut()
    setSession(null)
  }

  // Se carregando
  if (session === undefined) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Iniciando LeadPulse...</p>
      </div>
    )
  }

  // Se não autenticado
  if (!session) {
    return (
      <LoginView
        onLogin={handleLogin}
      />
    )
  }

  return (
    <div className="app-layout">
      {/* Sidebar Lateral (Desktop) & Barra Inferior (Mobile) */}
      <Sidebar
        currentTab={tab}
        onSelectTab={setTab}
        leads={leads}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onSignOut={handleSignOut}
        userEmail={session?.user?.email}
      />

      {/* Área Principal de Conteúdo */}
      <div className="app-main-viewport">
        {/* Header Superior com Boas-vindas e Ações Rápidas */}
        <Header
          userEmail={session?.user?.email}
          onOpenNewSearch={() => setTab('busca')}
          onOpenNewLead={() => setIsLeadModalOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          totalLeads={leads.length}
        />

        {/* View Renderizada Conforme a Aba */}
        <main className="main-content-area">
          {tab === 'dash' && (
            <DashboardView
              leads={leads}
              onUpdateLead={handleUpdateLead}
              onNavigateToBusca={() => setTab('busca')}
              onExtractEmail={handleExtractEmail}
            />
          )}

          {tab === 'busca' && (
            <BuscaView
              onSaveLeads={handleSaveBatchLeads}
            />
          )}

          {tab === 'leads' && (
            <div className="view-wrapper">
              <div className="view-title-header">
                <div>
                  <h2 className="page-heading">Base de Leads & Prospecção</h2>
                  <p className="page-subheading">
                    Gerencie todos os seus contatos comerciais, acompanhe status e lance anotações em tempo real.
                  </p>
                </div>
              </div>
              <LeadsView
                leads={leads}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                onExtractEmail={handleExtractEmail}
              />
            </div>
          )}

          {tab === 'kanban' && (
            <div className="view-wrapper">
              <div className="view-title-header">
                <div>
                  <h2 className="page-heading">Pipeline & Funil CRM</h2>
                  <p className="page-subheading">
                    Acompanhe cada etapa da negociação comercial até o fechamento.
                  </p>
                </div>
              </div>
              <KanbanView
                leads={leads}
                onUpdateLead={handleUpdateLead}
              />
            </div>
          )}

          {tab === 'resp' && (
            <div className="view-wrapper">
              <div className="view-title-header">
                <div>
                  <h2 className="page-heading">Leads que Responderam</h2>
                  <p className="page-subheading">
                    Contatos que responderam sua mensagem de abordagem.
                  </p>
                </div>
              </div>
              <LeadsView
                leads={leads.filter((l) => l.status === 'respondeu')}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                onExtractEmail={handleExtractEmail}
                initialStatusFilter="respondeu"
              />
            </div>
          )}

          {tab === 'fech' && (
            <div className="view-wrapper">
              <div className="view-title-header">
                <div>
                  <h2 className="page-heading">Clientes Fechados / Ganhos</h2>
                  <p className="page-subheading">
                    Lista de contratos e vendas fechadas com sucesso.
                  </p>
                </div>
              </div>
              <LeadsView
                leads={leads.filter((l) => l.status === 'fechado')}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                onExtractEmail={handleExtractEmail}
                initialStatusFilter="fechado"
              />
            </div>
          )}

          {tab === 'exp' && (
            <ExportView leads={leads} />
          )}
        </main>
      </div>

      {/* Modal de Cadastro Manual */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSave={handleAddManualLead}
      />
    </div>
  )
}
