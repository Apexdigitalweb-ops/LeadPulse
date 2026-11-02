# Leads — prospecção de clientes (grátis)

Fonte de dados: OpenStreetMap (grátis, sem cartão). Banco/login: Supabase. Hospedagem: GitHub Pages.

## Passo a passo
1. **Supabase** (supabase.com, plano grátis): crie um projeto.
2. Em *SQL Editor*, cole e rode `supabase/schema.sql`.
3. Em *Authentication › Providers › Email*, **desative "Allow new users to sign up"**. Depois, em *Authentication › Users › Add user*, crie seu usuário (seu e-mail + senha, marque "Auto confirm"). A senha `Buscar` funciona, mas é fraca: troque por uma forte depois de testar.
4. Em *Project Settings › API*, copie a **Project URL** e a chave **anon public**.
5. **GitHub**: crie um repositório e envie estes arquivos (branch `main`). Em *Settings › Secrets and variables › Actions*, crie `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Em *Settings › Pages*, escolha **Source: GitHub Actions**. Cada push publica o site.
6. **Busca de e-mail (opcional)**: instale a CLI do Supabase e rode `supabase functions deploy extrair-email --project-ref SEU_REF`.
7. Teste local: copie `.env.example` para `.env`, preencha e rode `npm install && npm run dev`.

## Limitações honestas
- O OpenStreetMap tem cobertura irregular no Brasil e quase não tem e-mail. "Sem site" pode significar só "não cadastrado": use o link **Conferir** antes de abordar.
- A busca devolve até 300 resultados por consulta.
- E-mail só é extraído de quem tem site.
- LGPD: use só dados públicos de empresas, com abordagem comercial legítima e opção de descadastro.
