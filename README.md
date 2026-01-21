# Mesa Redonda (MVP)

Plataforma de decisão estratégica e execução guiada por IA.
"Saia de qualquer conversa com um plano executável em 15 minutos."

## 🚀 Status do Projeto

✅ **MVP Completo (Versão 1.0)**
- **Authentication:** Magic Link (Supabase).
- **Billing:** Stripe (Checkout, Portal, Webhooks) com planos (Free, Starter, Pro).
- **Core Product:** Multi-tenant Workspaces, Chat-interface com IA Determinística, Geração de Artefatos.
- **Content Engine:** Blog SSR com MDX, otimizado para SEO e conversão.

## 🛠 Tech Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS, Shadcn/ui.
- **Backend:** Next.js Server Actions.
- **Database:** Supabase (PostgreSQL + RLS).
- **Payments:** Stripe.
- **Deploy:** Vercel (Recomendado).

## 🚀 Como Rodar (Local)

### 1. Pré-requisitos
- Node.js 18+
- Docker (Opcional, se quiser Banco Local)
- Contas: Supabase & Stripe.

### 2. Configuração

1. Clone o repo.
2. Copie o arquivo de ambiente:
   ```bash
   cp .env.local.example .env.local
   ```
3. Preencha as chaves no `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` e `KEY` (Painel Supabase > Settings > API).
   - `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` (Stripe Dashboard > Developers).

### 3. Banco de Dados

1. Vá no SQL Editor do Supabase.
2. Copie e cole o conteúdo de `supabase/migrations/20240101000000_init_schema.sql`.
3. Rode o script para criar tabelas e políticas de segurança.

### 4. Execução

Instale as dependências:
```bash
npm install
```

Rode o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse `http://localhost:3000`.

## 📚 Estrutura de Pastas

*   `/src/app`: Rotas principais (App Router).
    *   `/app/app`: Área logada (Dashboard, Workspaces, Mesas).
    *   `/app/blog`: Motor de conteúdo MDX.
*   `/src/actions`: Server Actions (Lógica de negócio segura).
*   `/src/lib/ai`: Engine da IA Determinística (Templates e Personas).
*   `/supabase`: Migrations SQL e Seeds.
*   `/content/blog`: Artigos em Markdown (MDX) para SEO.

## ✅ Checklist de Entregas (MVP)

- [x] Login com Magic Link
- [x] Multi-tenant Workspaces
- [x] Criação de Mesas (Templates: Marketing, Produto, Carreira, Estudo)
- [x] Chat com "Personas" (Simulado/Stub)
- [x] Geração de Artefato (JSON -> View)
- [x] Blog SSR com 10 Artigos Pilares
- [x] Stripe Billing Integration

## 📄 Licença

Proprietário.
