import { Lead, SearchFilters } from '../types'

export const NICHOS_SUGESTOES = [
  'Pizzarias',
  'Dentistas & Odonto',
  'Academias & Fitness',
  'Oficinas Mecânicas',
  'Barbearias',
  'Clínicas de Estética',
  'Imobiliárias & Corretores',
  'Advocacia & Direito',
  'Pet Shops & Veterinárias',
  'Hamburguerias & Lanches',
  'Restaurantes & Gastronomia',
  'Farmácias & Drogarias',
  'Contabilidade & Fiscal',
  'Padarias & Confeitarias',
  'Energia Solar & Fotovoltaica',
  'Coworking & Escritórios',
  'Salões de Beleza',
  'Lava Rápido & Estética Auto',
  'Óticas',
  'Marcenaria & Móveis Planejados',
]

export function normalizeStr(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Mapeamento enriquecido de palavras-chave para tags do OpenStreetMap
const NICHE_TAGS_MAP: Record<string, string[]> = {
  // Odonto
  dentista: ['["amenity"="dentist"]', '["healthcare"="dentist"]'],
  odonto: ['["amenity"="dentist"]', '["healthcare"="dentist"]'],
  odontologia: ['["amenity"="dentist"]', '["healthcare"="dentist"]'],
  ortodontia: ['["amenity"="dentist"]', '["healthcare"="dentist"]'],

  // Gastronomia
  pizzaria: ['["amenity"="restaurant"]["cuisine"~"pizza",i]', '["amenity"="fast_food"]["cuisine"~"pizza",i]'],
  pizza: ['["amenity"="restaurant"]["cuisine"~"pizza",i]', '["amenity"="fast_food"]["cuisine"~"pizza",i]'],
  hamburgueria: ['["amenity"="fast_food"]["cuisine"~"burger",i]', '["amenity"="restaurant"]["cuisine"~"burger",i]'],
  burger: ['["amenity"="fast_food"]["cuisine"~"burger",i]', '["amenity"="restaurant"]["cuisine"~"burger",i]'],
  restaurante: ['["amenity"="restaurant"]', '["amenity"="food_court"]'],
  churrascaria: ['["amenity"="restaurant"]["cuisine"~"barbecue|steak|churrasco",i]'],
  padaria: ['["shop"="bakery"]', '["shop"="pastry"]'],
  panificadora: ['["shop"="bakery"]'],
  confeitaria: ['["shop"="pastry"]', '["shop"="bakery"]'],
  cafeteria: ['["amenity"="cafe"]'],
  cafe: ['["amenity"="cafe"]'],
  bar: ['["amenity"="bar"]', '["amenity"="pub"]'],
  cervejaria: ['["amenity"="biergarten"]', '["amenity"="pub"]', '["craft"="brewery"]'],

  // Beleza & Bem-estar
  barbearia: ['["shop"="hairdresser"]'],
  barbeiro: ['["shop"="hairdresser"]'],
  salao: ['["shop"="hairdresser"]', '["shop"="beauty"]'],
  cabeleireiro: ['["shop"="hairdresser"]'],
  estetica: ['["shop"="beauty"]', '["leisure"="spa"]'],
  spa: ['["leisure"="spa"]', '["shop"="beauty"]'],
  manicure: ['["shop"="beauty"]'],
  tatuagem: ['["shop"="tattoo"]'],

  // Saúde & Medicina
  clinica: ['["amenity"="clinic"]', '["amenity"="doctors"]'],
  medico: ['["amenity"="doctors"]', '["amenity"="clinic"]'],
  hospital: ['["amenity"="hospital"]'],
  farmacia: ['["amenity"="pharmacy"]'],
  drogaria: ['["amenity"="pharmacy"]'],
  fisioterapia: ['["healthcare"="physiotherapist"]', '["amenity"="clinic"]'],
  psicologia: ['["healthcare"="psychotherapist"]'],
  psicologo: ['["healthcare"="psychotherapist"]'],
  veterinaria: ['["amenity"="veterinary"]'],
  pet: ['["shop"="pet"]', '["amenity"="veterinary"]'],
  'pet shop': ['["shop"="pet"]', '["amenity"="veterinary"]'],

  // Fitness
  academia: ['["leisure"="fitness_centre"]', '["leisure"="sports_centre"]'],
  crossfit: ['["leisure"="fitness_centre"]'],
  pilates: ['["leisure"="fitness_centre"]'],
  fitness: ['["leisure"="fitness_centre"]'],

  // Automotivo
  oficina: ['["shop"="car_repair"]', '["craft"="car_repair"]'],
  mecanica: ['["shop"="car_repair"]', '["craft"="car_repair"]'],
  mecanico: ['["shop"="car_repair"]'],
  'auto center': ['["shop"="car_repair"]'],
  'lava rapido': ['["amenity"="car_wash"]'],
  'lava jato': ['["amenity"="car_wash"]'],
  'auto pecas': ['["shop"="car_parts"]', '["shop"="tyres"]'],
  pneus: ['["shop"="tyres"]'],

  // Serviços Profissionais & Escritórios
  advocacia: ['["office"="lawyer"]', '["office"="legal"]'],
  advogado: ['["office"="lawyer"]'],
  juridico: ['["office"="lawyer"]'],
  contabilidade: ['["office"="accountant"]', '["office"="tax_advisor"]'],
  contador: ['["office"="accountant"]'],
  imobiliaria: ['["office"="estate_agent"]'],
  corretor: ['["office"="estate_agent"]'],
  imoveis: ['["office"="estate_agent"]'],
  seguros: ['["office"="insurance"]'],
  coworking: ['["amenity"="coworking_space"]', '["office"="coworking"]'],
  arquitetura: ['["office"="architect"]'],
  engenharia: ['["office"="engineer"]'],

  // Educação
  escola: ['["amenity"="school"]', '["amenity"="kindergarten"]'],
  colegio: ['["amenity"="school"]'],
  creche: ['["amenity"="kindergarten"]'],
  cursos: ['["amenity"="language_school"]', '["amenity"="college"]'],
  autoescola: ['["amenity"="driving_school"]'],

  // Comércio & Varejo
  otica: ['["shop"="optician"]'],
  roupas: ['["shop"="clothes"]', '["shop"="boutique"]'],
  calcados: ['["shop"="shoes"]'],
  joalheria: ['["shop"="jewelry"]'],
  floricultura: ['["shop"="florist"]', '["shop"="garden_centre"]'],
  supermercado: ['["shop"="supermarket"]', '["shop"="convenience"]'],
  mercado: ['["shop"="supermarket"]', '["shop"="convenience"]'],
  acougue: ['["shop"="butcher"]'],
  hotel: ['["tourism"="hotel"]', '["tourism"="guest_house"]'],
  pousada: ['["tourism"="guest_house"]', '["tourism"="hotel"]'],

  // Especializados
  marcenaria: ['["craft"="carpenter"]', '["shop"="furniture"]'],
  solar: ['["office"="energy_supplier"]', '["craft"="electrician"]'],
  'energia solar': ['["office"="energy_supplier"]', '["craft"="electrician"]'],
  grafica: ['["shop"="copyshop"]', '["craft"="printer"]'],
  vidracaria: ['["craft"="glaziery"]'],
  gesso: ['["craft"="plasterer"]'],
  serralheria: ['["craft"="blacksmith"]', '["craft"="metal_construction"]'],
  lavanderia: ['["shop"="laundry"]', '["shop"="dry_cleaning"]'],
}

// Gera regex seguro para Overpass
function makeSafeRegex(input: string): string {
  const norm = normalizeStr(input)
  // Divide em palavras significativas ignorando conectivos comuns
  const words = norm
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/gi, ''))
    .filter((w) => w.length >= 3 && !['com', 'para', 'dos', 'das', 'uma', 'seu', 'sua', 'que', 'tipo'].includes(w))

  if (!words.length) return norm.replace(/[^a-z0-9]/gi, '')
  return words.join('|')
}

// Construtor flexível da query Overpass
export function buildOverpassQuery(f: SearchFilters): string {
  const uf = (f.uf || '').trim().toUpperCase()
  const cidade = (f.cidade || '').trim()
  const nicho = (f.nicho || '').trim()

  const areaBase = cidade
    ? `area["ISO3166-2"="BR-${uf}"]->.s;area["name"="${cidade}"]["boundary"="administrative"](area.s)->.a;`
    : `area["ISO3166-2"="BR-${uf}"]->.a;`

  let clauses: string[] = []

  if (!nicho) {
    // Busca geral comercial se o nicho for omitido
    clauses.push('nwr(area.a)["name"]["shop"];')
    clauses.push('nwr(area.a)["name"]["amenity"];')
    clauses.push('nwr(area.a)["name"]["office"];')
  } else {
    const norm = normalizeStr(nicho)
    const matchedTags: string[] = []

    // Procura correspondências no dicionário
    for (const [key, tags] of Object.entries(NICHE_TAGS_MAP)) {
      if (norm.includes(key) || key.includes(norm)) {
        tags.forEach((t) => {
          if (!matchedTags.includes(t)) matchedTags.push(t)
        })
      }
    }

    // Se encontrou tags específicas da categoria, adiciona à query
    matchedTags.slice(0, 4).forEach((tag) => {
      clauses.push(`nwr(area.a)${tag};`)
    })

    // Adiciona busca textual inteligente por nome e tags de categoria
    const regexPattern = makeSafeRegex(nicho)
    if (regexPattern) {
      clauses.push(`nwr(area.a)["name"~"${regexPattern}",i];`)
      clauses.push(`nwr(area.a)["shop"~"${regexPattern}",i];`)
      clauses.push(`nwr(area.a)["amenity"~"${regexPattern}",i];`)
      clauses.push(`nwr(area.a)["office"~"${regexPattern}",i];`)
      clauses.push(`nwr(area.a)["craft"~"${regexPattern}",i];`)
    }
  }

  const body = clauses.join('')
  return `[out:json][timeout:50];${areaBase}(${body});out tags center 350;`
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

export async function executeOverpassSearch(f: SearchFilters): Promise<Lead[]> {
  if (!f.uf) throw new Error('Selecione ao menos o estado (UF) para buscar.')

  const query = buildOverpassQuery(f)
  let lastError: any = null
  let data: any = null

  // Tenta endpoints com fallback
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      })

      if (response.ok) {
        data = await response.json()
        break
      }
    } catch (err: any) {
      lastError = err
    }
  }

  if (!data || !Array.isArray(data.elements)) {
    throw new Error(
      lastError?.message || 'Servidores do OpenStreetMap temporariamente ocupados. Tente novamente em alguns segundos.'
    )
  }

  const nichoInformado = (f.nicho || '').trim()

  let results: Lead[] = data.elements
    .filter((e: any) => e.tags && (e.tags.name || e.tags['operator']))
    .map((e: any) => {
      const g = e.tags
      const nome = g.name || g.operator || 'Empresa Local'
      const endParts = [g['addr:street'], g['addr:housenumber']].filter(Boolean)
      const endereco = endParts.length ? endParts.join(', ') : g['addr:place'] || ''
      const bairro = g['addr:suburb'] || g['addr:neighbourhood'] || g['addr:district'] || ''
      const cidade = g['addr:city'] || f.cidade || ''
      const site = g.website || g['contact:website'] || g['url'] || ''
      const telefone =
        g.phone || g['contact:phone'] || g['contact:whatsapp'] || g.whatsapp || g['contact:mobile'] || null

      const mapsQuery = encodeURIComponent(`${nome} ${endereco} ${bairro} ${cidade} ${f.uf}`)
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

      const inferredNicho =
        nichoInformado ||
        g.shop ||
        g.amenity ||
        g.office ||
        g.craft ||
        g.leisure ||
        g.cuisine ||
        'Geral'

      return {
        place_id: `${e.type}/${e.id}`,
        nome,
        email: g.email || g['contact:email'] || null,
        site: site || null,
        telefone,
        endereco,
        bairro,
        cidade,
        uf: f.uf,
        nicho: inferredNicho,
        maps_url: mapsUrl,
        status: 'novo',
        capturado_em: new Date().toISOString(),
      }
    })

  // Filtro de bairro se preenchido
  if (f.bairro) {
    const bNorm = normalizeStr(f.bairro)
    results = results.filter((l) =>
      normalizeStr((l.bairro || '') + ' ' + (l.endereco || '')).includes(bNorm)
    )
  }

  // Filtro de sem site
  if (f.semSite) {
    results = results.filter((l) => !l.site)
  }

  // Filtro opcional só com telefone
  if (f.apenasComTelefone) {
    results = results.filter((l) => Boolean(l.telefone))
  }

  return results
}

