create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  place_id text unique not null,
  nome text not null, email text, site text, telefone text,
  endereco text, bairro text, cidade text, uf text, nicho text, maps_url text,
  status text not null default 'novo' check (status in ('novo','contatado','respondeu','fechado','descartado')),
  anotacoes text, ultimo_contato date,
  capturado_em timestamptz not null default now(),
  contatado_em timestamptz, respondeu_em timestamptz, fechado_em timestamptz
);
create table if not exists buscas (
  id uuid primary key default gen_random_uuid(),
  filtros jsonb, total_encontrado int, criado_em timestamptz default now()
);
create index on leads(status); create index on leads(nicho); create index on leads(capturado_em);
alter table leads enable row level security;
alter table buscas enable row level security;
create policy "so logado" on leads for all to authenticated using (true) with check (true);
create policy "so logado" on buscas for all to authenticated using (true) with check (true);
