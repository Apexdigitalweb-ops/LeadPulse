export type LeadStatus = 'novo' | 'contatado' | 'respondeu' | 'fechado' | 'descartado'

export interface Lead {
  id?: string
  place_id: string
  nome: string
  email?: string | null
  site?: string | null
  telefone?: string | null
  endereco?: string
  bairro?: string
  cidade?: string
  uf: string
  nicho: string
  maps_url?: string
  status: LeadStatus
  anotacoes?: string
  ultimo_contato?: string | null
  capturado_em: string
  contatado_em?: string | null
  respondeu_em?: string | null
  fechado_em?: string | null
  valor_fechado?: number | null
}

export interface SearchFilters {
  uf: string
  cidade: string
  bairro: string
  nicho: string
  semSite: boolean
  apenasComSite?: boolean
  apenasComTelefone?: boolean
  tipoSite?: 'todos' | 'sem_site' | 'com_site'
}

export type TabType = 'dash' | 'busca' | 'leads' | 'kanban' | 'resp' | 'fech' | 'exp'
