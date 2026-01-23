# Mesa Redonda v1.4 🎯

**Sua diretoria virtual pessoal.** Debata com personas especialistas de IA e gere documentos estratégicos prontos para execução.

## 🚀 O que há de novo na v1.4

### ✅ Bugs Críticos Resolvidos
- **JobPicker Navigation**: Navegação fluida de JTBD para biblioteca filtrada
- **Library Filtering**: Filtros por objetivo funcionando perfeitamente

### 📰 Blog Experience Premium
- **MDX Rendering**: Checkboxes, tables, code blocks renderizados corretamente
- **3-Column Layout**: TOC + Article + Related Articles
- **Reading Progress Bar**: Barra de progresso no topo
- **Table of Contents**: Com scroll spy e navegação suave
- **Share Buttons**: Twitter, LinkedIn, Copy link
- **Related Articles**: Sugestões por categoria

### 💳 Stripe Integration Completa
- **Checkout Flow**: Integração completa com Stripe Checkout
- **Webhook Handling**: Atualização automática de planos via webhooks
- **Customer Portal**: Gerenciamento de assinatura pelo usuário
- **3 Planos**: Starter (R$ 49), Pro (R$ 99), Team (R$ 299)

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **AI**: OpenAI GPT-4o-mini
- **Styling**: Tailwind CSS + shadcn/ui
- **Blog**: MDX with remark-gfm

---

## 📦 Setup Local

### 1. Clone e Install

```bash
git clone <repo-url>
cd mesa-redonda
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:
- Supabase (URL, Anon Key, Service Role Key)
- Stripe (Secret Key, Webhook Secret, Price IDs)
- OpenAI API Key
- App URL

### 3. Setup Supabase

```bash
# Rodar migrations
npx supabase db push

# Rodar seeds (opcional)
npx supabase db seed
```

### 4. Setup Stripe (Importante!)

#### a) Criar Products no Stripe Dashboard
1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/test/products)
2. Crie 3 produtos:
   - **Starter**: R$ 49/mês (recorrente)
   - **Pro**: R$ 99/mês (recorrente)
   - **Team**: R$ 299/mês (recorrente)

#### b) Copiar Price IDs
Após criar, copie os Price IDs e atualize `.env.local`:
```bash
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_TEAM=price_xxxxxxxxxxxxx
```

#### c) Testar Webhook Localmente
```bash
# Terminal 1: Rodar app
npm run dev

# Terminal 2: Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 5. Rodar Aplicação

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🧪 Testes

### Fluxo de Teste Completo

1. **Signup**: Criar conta em `/login`
2. **JobPicker**: Clicar em objetivo → Biblioteca filtrada ✅
3. **Blog**: Acessar `/blog` → Artigo → Verificar MDX rendering ✅
4. **Upgrade**: Ir para `/upgrade` → Testar checkout
5. **Webhook**: Verificar atualização de plano no Supabase

### Cartões de Teste Stripe
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`

---

## 🚀 Deploy para Vercel

### 1. Push para GitHub

```bash
git add .
git commit -m "feat: v1.4 - Blog MDX + Stripe Integration"
git push origin main
```

### 2. Conectar Vercel

1. Importe projeto no Vercel
2. Configure Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY` (Production!)
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PRICE_*` (Production Price IDs)
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (https://seu-dominio.com)

### 3. Configurar Webhook no Stripe

1. Stripe Dashboard → Webhooks
2. Add endpoint: `https://seu-dominio.com/api/webhooks/stripe`
3. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiar Signing Secret → `STRIPE_WEBHOOK_SECRET` no Vercel

### 4. Deploy!

Vercel fará deploy automático. Aguarde build finalizar.

---

## 📁 Estrutura do Projeto

```
mesa-redonda/
├── src/
│   ├── actions/          # Server actions (stripe, library)
│   ├── app/              # App Router pages
│   │   ├── app/          # Authenticated app routes
│   │   ├── blog/         # Blog with MDX
│   │   ├── api/          # API routes (webhooks)
│   │   └── upgrade/      # Pricing page
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── mdx-components.tsx
│   │   ├── reading-progress-bar.tsx
│   │   ├── table-of-contents.tsx
│   │   └── ...
│   └── lib/              # Utilities (supabase, stripe, blog)
├── content/
│   └── blog/             # MDX blog posts
├── supabase/
│   ├── migrations/       # Database migrations
│   └── seeds.sql         # Seed data
└── public/               # Static assets
```

---

## 🔐 Security

- ✅ Row Level Security (RLS) habilitado no Supabase
- ✅ Server Actions para operações sensíveis
- ✅ Webhook signature verification
- ✅ Environment variables nunca commitadas
- ✅ Service Role Key apenas em server-side

---

## 📚 Documentação Adicional

- [Product Vision](/.gemini/antigravity/brain/.../01_product_vision.md)
- [Technical Architecture](/.gemini/antigravity/brain/.../02_technical_architecture.md)
- [Improvements Plan v1.4](/.gemini/antigravity/brain/.../09_improvements_plan.md)
- [Blog Improvements](/.gemini/antigravity/brain/.../10_blog_improvements.md)
- [Walkthrough v1.4](/.gemini/antigravity/brain/.../walkthrough.md)

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Limpar cache
rm -rf .next
npm run build
```

### Webhook não funciona
1. Verificar `STRIPE_WEBHOOK_SECRET` correto
2. Testar localmente com Stripe CLI
3. Verificar logs no Vercel

### Supabase Connection Issues
1. Verificar URL e keys corretas
2. Verificar RLS policies
3. Verificar migrations rodadas

---

## 📞 Suporte

Para questões técnicas, consulte a documentação ou abra uma issue.

---

**Desenvolvido com ❤️ pela equipe Mesa Redonda**  
**Versão**: 1.4.0  
**Última atualização**: Janeiro 2026
