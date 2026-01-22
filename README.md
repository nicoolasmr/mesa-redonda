# Mesa Redonda

**Decisões estratégicas em 15 minutos** — Debata com especialistas de IA e saia com artefatos prontos para executar.

![Mesa Redonda](https://img.shields.io/badge/version-1.3.0-violet) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 O Que É

Mesa Redonda é uma plataforma de **decisões estratégicas assistidas por IA** que transforma conversas em artefatos executáveis.

Ao invés de passar horas em reuniões improdutivas ou receber respostas genéricas de ChatGPT, você:
1. **Escolhe uma mesa** (Plano de Marketing, Roadmap de Produto, PDI, etc.)
2. **Debate com especialistas** (Cético, Criativo, Analítico)
3. **Recebe artefatos prontos** (PDFs, checklists, planos estruturados)

---

## ✨ Features

### v1.3 - Biblioteca de Mesas
- ✅ **30 templates curados** organizados por JTBD (Jobs to Be Done)
- ✅ **Progressive disclosure**: Home JTBD → Biblioteca → Template detail
- ✅ **Recommendation engine** determinístico baseado em job/stage/plan
- ✅ **Guardrails legais**: Templates high-risk (legal/finance) com disclaimers
- ✅ **Gating por plano**: Free (3 mesas basic) → Pro (ilimitado + advanced + high-risk)

### v1.2 - Demo + Auth + Paywall
- ✅ **Guest demo system**: 5 créditos gratuitos para testar
- ✅ **Auth email+password**: Substituiu magic link
- ✅ **Paywall**: Página de upgrade com 3 planos

### v1.1 - PMF & Scale
- ✅ **LLM integration**: OpenAI GPT-4 com prompts estruturados
- ✅ **Modo Cético**: Toggle para ativar persona crítica
- ✅ **Entitlements**: Limites por plano (free/starter/pro/max)
- ✅ **Blog**: 12+ artigos profundos sobre estratégia e produto

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key (opcional para demo)

### Installation

```bash
# 1. Clone o repositório
git clone https://github.com/nicoolasmr/mesa-redonda.git
cd mesa-redonda

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.local.example .env.local
# Edite .env.local com suas credenciais

# 4. Run Supabase migrations
supabase db push

# 5. Seed database
supabase db seed

# 6. Start dev server
npm run dev
```

Acesse: `http://localhost:3000`

---

## 📦 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, shadcn/ui
- **Backend**: Next.js Server Actions, Supabase (PostgreSQL + Auth + RLS)
- **AI**: OpenAI GPT-4 (deterministic-first prompts)
- **Payments**: Stripe (subscriptions + webhooks)
- **Deploy**: Vercel

---

## 🗂️ Project Structure

```
mesa-redonda/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── app/               # Authenticated app
│   │   │   ├── library/       # Template library (NEW v1.3)
│   │   │   ├── tables/        # Chat interface
│   │   │   └── workspaces/    # Workspace management
│   │   ├── api/               # API routes
│   │   ├── blog/              # MDX blog
│   │   └── upgrade/           # Paywall
│   ├── actions/               # Server Actions
│   │   ├── library.ts         # Library API (NEW v1.3)
│   │   ├── tables.ts          # Table CRUD
│   │   └── chat.ts            # LLM integration
│   ├── components/            # React components
│   │   ├── job-picker.tsx     # JTBD picker (NEW v1.3)
│   │   ├── template-card.tsx  # Template cards (NEW v1.3)
│   │   └── upgrade-modal.tsx  # Gating modal (NEW v1.3)
│   └── lib/                   # Utilities
│       ├── llm.ts             # OpenAI wrapper
│       ├── entitlements.ts    # Plan limits
│       └── supabase/          # Supabase clients
├── supabase/
│   ├── migrations/            # SQL migrations
│   │   ├── 20240101000000_init_schema.sql
│   │   ├── 20260121000000_guest_system.sql
│   │   └── 20260121_library_system.sql  # NEW v1.3
│   └── seeds.sql              # Database seeds (30 templates)
└── content/
    └── blog/                  # MDX articles (12+)
```

---

## 🎨 Database Schema (v1.3)

### Core Tables
- `workspaces`: Multi-tenant workspaces
- `workspace_members`: RBAC (owner/admin/member)
- `tables`: Mesas (conversations)
- `messages`: Chat messages
- `artifacts`: Generated outputs (plan, checklist, etc.)

### Library System (NEW v1.3)
- `table_categories`: 9 business areas (Growth, Sales, Product, etc.)
- `table_jobs`: 6 JTBD (Grow Revenue, Build Product, etc.)
- `table_templates`: 30 curated templates
- `template_tags`: Search tags
- `user_intents`: User preferences per workspace

### Guest System (v1.2)
- `guest_credits`: 5 free credits for demos
- `guest_artifacts`: Public shareable artifacts

---

## 🔐 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (opcional para demo)
OPENAI_API_KEY=your_openai_key

# Stripe (opcional)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📚 Documentation

- [Product Vision](/.gemini/antigravity/brain/30c7a3ad-a4cd-4ebc-8447-164ef261d256/01_product_vision.md)
- [Technical Architecture](/.gemini/antigravity/brain/30c7a3ad-a4cd-4ebc-8447-164ef261d256/02_technical_architecture.md)
- [Library Implementation Plan](/.gemini/antigravity/brain/30c7a3ad-a4cd-4ebc-8447-164ef261d256/08_library_implementation_plan.md)
- [Walkthrough v1.3](/.gemini/antigravity/brain/30c7a3ad-a4cd-4ebc-8447-164ef261d256/walkthrough.md)

---

## 🧪 Testing

### Manual Testing Checklist

```bash
# 1. Database
supabase db push
supabase db seed

# 2. Test flows
- Guest demo (5 credits)
- Login/Signup (email+password)
- JTBD picker → recommendations
- Library browse → filters → template detail
- Template gating (Free vs Pro)
- Create mesa → chat → generate artifact
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# 1. Connect GitHub repo to Vercel
# 2. Add environment variables
# 3. Deploy

vercel --prod
```

### Supabase Production

```bash
# 1. Create production project
# 2. Run migrations
supabase db push --db-url your_production_url

# 3. Run seeds
supabase db seed --db-url your_production_url
```

---

## 📊 Roadmap

### v1.4 (Next)
- [ ] Stripe Checkout integration (real payments)
- [ ] Template prompts with guardrails (legal/finance)
- [ ] Analytics dashboard (template usage, conversion)
- [ ] Mobile app (React Native)

### v1.5 (Future)
- [ ] Templates verificados (audited by experts)
- [ ] Community templates (user-generated)
- [ ] Integrations (Notion, Slack, Google Docs)
- [ ] White-label for enterprises

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- UI by [shadcn/ui](https://ui.shadcn.com/)
- AI by [OpenAI](https://openai.com/)

---

## 📧 Contact

- Website: [mesaredonda.app](https://mesaredonda.app)
- Email: contato@mesaredonda.app
- Twitter: [@mesaredondaapp](https://twitter.com/mesaredondaapp)

---

**Made with ❤️ by [Nicolas Moreira](https://github.com/nicoolasmr)**
