-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MESA REDONDA v1.3: LIBRARY SEEDS
-- Seeds: Categories, Jobs, Templates (30), Tags
-- Date: 2026-01-21
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. CATEGORIES (9 áreas de negócio)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO table_categories (key, name, description, icon, order_index) VALUES
('growth', 'Marketing & Growth', 'Aquisição, retenção e crescimento de receita', '📈', 1),
('sales', 'Vendas & Revenue', 'Processos de vendas, pricing e conversão', '💰', 2),
('branding', 'Branding & Posicionamento', 'Marca, posicionamento e autoridade', '🎨', 3),
('product', 'Produto & Tech', 'Produto, roadmap e tecnologia', '🎯', 4),
('people', 'Pessoas & Cultura', 'Contratação, cultura e desenvolvimento', '👥', 5),
('ops', 'Operações & Processos', 'Processos, operações e eficiência', '⚙️', 6),
('finance', 'Financeiro & Contábil', 'Planejamento financeiro e contabilidade', '💵', 7),
('legal', 'Jurídico & Compliance', 'Contratos, compliance e proteção legal', '⚖️', 8),
('learning', 'Aprendizado & Desenvolvimento', 'Educação, treinamento e carreira', '📚', 9)
ON CONFLICT (key) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. JOBS (6 objetivos principais)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO table_jobs (key, name, description, icon, order_index) VALUES
('grow-revenue', 'Crescer Receita', 'Aumentar vendas, marketing e aquisição de clientes', '📈', 1),
('build-product', 'Construir Produto', 'Desenvolver produto, tech stack e roadmap', '🎯', 2),
('build-company', 'Construir Empresa', 'Estruturar operações, pessoas e processos', '🏗️', 3),
('reduce-risk', 'Reduzir Risco', 'Compliance, legal e proteção do negócio', '🛡️', 4),
('improve-ops', 'Melhorar Operações', 'Otimizar processos e eficiência operacional', '⚙️', 5),
('develop-self', 'Desenvolver-se', 'Crescimento pessoal, carreira e aprendizado', '🚀', 6)
ON CONFLICT (key) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. TEMPLATES (30 mesas curadas)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- GROW REVENUE (10 templates)

INSERT INTO table_templates (key, name, tagline, description, category_id, job_id, difficulty, risk_level, outputs, is_featured, estimated_time_minutes) VALUES
(
    'plano-marketing-b2b',
    'Plano de Marketing B2B',
    'Estratégia completa de aquisição e retenção',
    'Crie um plano de marketing B2B com ICP, canais de tração, métricas-chave e plano tático de 30 dias.',
    (SELECT id FROM table_categories WHERE key = 'growth'),
    (SELECT id FROM table_jobs WHERE key = 'grow-revenue'),
    'basic',
    'low',
    '["plan", "swot", "metrics"]',
    true,
    20
),
(
    'estrategia-conteudo',
    'Estratégia de Conteúdo',
    'Content marketing que gera leads qualificados',
    'Desenvolva uma estratégia de conteúdo com pilares, calendário editorial e distribuição multicanal.',
    (SELECT id FROM table_categories WHERE key = 'growth'),
    (SELECT id FROM table_jobs WHERE key = 'grow-revenue'),
    'basic',
    'low',
    '["plan", "calendar", "topics"]',
    false,
    15
),
(
    'funil-vendas-b2b',
    'Funil de Vendas B2B',
    'Processo de vendas previsível e escalável',
    'Construa um funil de vendas B2B com etapas, qualificação BANT/MEDDIC e playbook de vendas.',
    (SELECT id FROM table_categories WHERE key = 'sales'),
    (SELECT id FROM table_jobs WHERE key = 'grow-revenue'),
    'basic',
    'low',
    '["plan", "checklist", "playbook"]',
    true,
    20
),
(
    'pricing-strategy',
    'Estratégia de Pricing',
    'Precificação baseada em valor, não custo',
    'Defina sua estratégia de pricing com análise de valor, tiers, ancoragem e psicologia de preços.',
    (SELECT id FROM table_categories WHERE key = 'sales'),
    (SELECT id FROM table_jobs WHERE key = 'grow-revenue'),
    'advanced',
    'low',
    '["plan", "options", "analysis"]',
    false,
    25
),
(
    'lancamento-produto',
    'Lançamento de Produto',
    'Go-to-market para novos produtos',
    'Planeje o lançamento de produto com timeline, canais, mensagens e métricas de sucesso.',
    (SELECT id FROM table_categories WHERE key = 'growth'),
    (SELECT id FROM table_jobs WHERE key = 'grow-revenue'),
    'basic',
    'low',
    '["plan", "timeline", "checklist"]',
    false,
    20
),
(
    'oferta-perpetua',
    'Oferta Perpétua',
    'Funil evergreen de vendas automatizadas',
    'Crie uma oferta perpétua com funil automatizado, sequências de email e upsells.',
    (SELECT id FROM table_categories WHERE key = 'sales'),
    (SELECT id FROM table_jobs WHERE key = 'grow-revenue'),
    'advanced',
    'low',
    '["plan", "funnel", "sequences"]',
    false,
    30
),
(
    'high-ticket-sales',
    'Vendas High-Ticket',
    'Processo de vendas consultivas de alto valor',
    'Desenvolva processo de vendas high-ticket com discovery, demo, objeções e fechamento.',
    (SELECT id FROM table_categories WHERE key = 'sales'),
    (SELECT id FROM table_jobs WHERE key = 'grow-revenue'),
    'advanced',
    'low',
    '["plan", "script", "playbook"]',
    false,
    25
),
(
    'posicionamento-marca',
    'Posicionamento de Marca',
    'Diferenciação clara em mercados saturados',
    'Defina posicionamento de marca com proposta de valor, mensagens-chave e diferenciação.',
    (SELECT id FROM table_categories WHERE key = 'branding'),
    (SELECT id FROM table_jobs WHERE key = 'grow-revenue'),
    'basic',
    'low',
    '["plan", "messaging", "positioning"]',
    true,
    20
),
(
    'autoridade-digital',
    'Autoridade Digital',
    'Construa autoridade e thought leadership',
    'Estratégia de autoridade digital com LinkedIn, conteúdo, speaking e networking.',
    (SELECT id FROM table_categories WHERE key = 'branding'),
    (SELECT id FROM table_jobs WHERE key = 'grow-revenue'),
    'basic',
    'low',
    '["plan", "content", "tactics"]',
    false,
    15
),
(
    'growth-hacking',
    'Growth Hacking',
    'Experimentos de crescimento rápido',
    'Framework de growth hacking com hipóteses, experimentos, métricas e iteração.',
    (SELECT id FROM table_categories WHERE key = 'growth'),
    (SELECT id FROM table_jobs WHERE key = 'grow-revenue'),
    'advanced',
    'low',
    '["plan", "experiments", "metrics"]',
    false,
    25
);

-- BUILD COMPANY (10 templates)

INSERT INTO table_templates (key, name, tagline, description, category_id, job_id, difficulty, risk_level, outputs, is_featured, estimated_time_minutes) VALUES
(
    'contratacao-talentos',
    'Processo de Contratação',
    'Atraia e contrate A-players consistentemente',
    'Crie processo de contratação com job description, funil, entrevistas e onboarding.',
    (SELECT id FROM table_categories WHERE key = 'people'),
    (SELECT id FROM table_jobs WHERE key = 'build-company'),
    'basic',
    'low',
    '["plan", "checklist", "templates"]',
    false,
    20
),
(
    'onboarding-funcionarios',
    'Onboarding de Funcionários',
    'Primeiros 90 dias de novos contratados',
    'Estruture onboarding com timeline, treinamentos, metas e check-ins.',
    (SELECT id FROM table_categories WHERE key = 'people'),
    (SELECT id FROM table_jobs WHERE key = 'build-company'),
    'basic',
    'low',
    '["plan", "timeline", "checklist"]',
    false,
    15
),
(
    'cultura-organizacional',
    'Cultura Organizacional',
    'Defina valores e cultura da empresa',
    'Crie cultura organizacional com valores, comportamentos esperados e rituais.',
    (SELECT id FROM table_categories WHERE key = 'people'),
    (SELECT id FROM table_jobs WHERE key = 'build-company'),
    'advanced',
    'low',
    '["plan", "values", "rituals"]',
    false,
    25
),
(
    'processos-operacionais',
    'Processos Operacionais',
    'SOPs e documentação de processos',
    'Documente processos operacionais com SOPs, responsáveis e métricas de qualidade.',
    (SELECT id FROM table_categories WHERE key = 'ops'),
    (SELECT id FROM table_jobs WHERE key = 'improve-ops'),
    'basic',
    'low',
    '["plan", "sop", "checklist"]',
    false,
    20
),
(
    'planejamento-financeiro',
    'Planejamento Financeiro',
    'Budget, forecast e controle financeiro',
    'Crie planejamento financeiro com budget, forecast, KPIs e controle de custos.',
    (SELECT id FROM table_categories WHERE key = 'finance'),
    (SELECT id FROM table_jobs WHERE key = 'build-company'),
    'basic',
    'medium',
    '["plan", "budget", "metrics"]',
    true,
    25
),
(
    'contrato-sociedade',
    'Contrato de Sociedade',
    'Estruture sociedade com segurança jurídica',
    'INFORMATIVO: Checklist e perguntas para levar ao advogado sobre contrato de sociedade.',
    (SELECT id FROM table_categories WHERE key = 'legal'),
    (SELECT id FROM table_jobs WHERE key = 'reduce-risk'),
    'advanced',
    'high',
    '["checklist", "questions", "draft"]',
    false,
    30
),
(
    'planejamento-tributario',
    'Planejamento Tributário',
    'Otimize carga tributária legalmente',
    'INFORMATIVO: Checklist e opções para discutir com contador sobre planejamento tributário.',
    (SELECT id FROM table_categories WHERE key = 'finance'),
    (SELECT id FROM table_jobs WHERE key = 'reduce-risk'),
    'advanced',
    'high',
    '["checklist", "questions", "options"]',
    false,
    30
),
(
    'compliance-lgpd',
    'Compliance LGPD',
    'Adequação à Lei Geral de Proteção de Dados',
    'INFORMATIVO: Checklist de compliance LGPD e rascunho de política de privacidade.',
    (SELECT id FROM table_categories WHERE key = 'legal'),
    (SELECT id FROM table_jobs WHERE key = 'reduce-risk'),
    'advanced',
    'high',
    '["checklist", "policy-draft", "questions"]',
    false,
    35
),
(
    'due-diligence',
    'Due Diligence M&A',
    'Preparação para fusões e aquisições',
    'INFORMATIVO: Checklist de due diligence e perguntas para assessoria jurídica em M&A.',
    (SELECT id FROM table_categories WHERE key = 'legal'),
    (SELECT id FROM table_jobs WHERE key = 'reduce-risk'),
    'advanced',
    'high',
    '["checklist", "questions", "dataroom"]',
    false,
    40
),
(
    'registro-patente',
    'Registro de Patente',
    'Proteção de propriedade intelectual',
    'INFORMATIVO: Checklist e perguntas para agente de propriedade industrial sobre patentes.',
    (SELECT id FROM table_categories WHERE key = 'legal'),
    (SELECT id FROM table_jobs WHERE key = 'reduce-risk'),
    'advanced',
    'high',
    '["checklist", "questions", "draft"]',
    false,
    35
);

-- BUILD PRODUCT (10 templates)

INSERT INTO table_templates (key, name, tagline, description, category_id, job_id, difficulty, risk_level, outputs, is_featured, estimated_time_minutes) VALUES
(
    'roadmap-produto',
    'Roadmap de Produto',
    'Planejamento estratégico de produto',
    'Crie roadmap de produto com priorização RICE, horizonte Now/Next/Later e stakeholder management.',
    (SELECT id FROM table_categories WHERE key = 'product'),
    (SELECT id FROM table_jobs WHERE key = 'build-product'),
    'basic',
    'low',
    '["plan", "roadmap", "priorities"]',
    true,
    20
),
(
    'mvp-definition',
    'Definição de MVP',
    'Valide hipóteses com mínimo viável',
    'Defina MVP com core features, métricas de validação e critérios de sucesso.',
    (SELECT id FROM table_categories WHERE key = 'product'),
    (SELECT id FROM table_jobs WHERE key = 'build-product'),
    'basic',
    'low',
    '["plan", "features", "metrics"]',
    false,
    15
),
(
    'user-research',
    'Pesquisa de Usuários',
    'Entenda profundamente seus usuários',
    'Planeje pesquisa de usuários com perguntas, recrutamento e análise de insights.',
    (SELECT id FROM table_categories WHERE key = 'product'),
    (SELECT id FROM table_jobs WHERE key = 'build-product'),
    'basic',
    'low',
    '["plan", "questions", "analysis"]',
    false,
    20
),
(
    'product-market-fit',
    'Product-Market Fit',
    'Meça e alcance PMF em 90 dias',
    'Framework de PMF com métricas (NPS, retention, LTV), hipóteses e iteração.',
    (SELECT id FROM table_categories WHERE key = 'product'),
    (SELECT id FROM table_jobs WHERE key = 'build-product'),
    'advanced',
    'low',
    '["plan", "metrics", "experiments"]',
    false,
    25
),
(
    'tech-stack-decision',
    'Decisão de Tech Stack',
    'Escolha tecnologias certas para seu produto',
    'Avalie tech stack com critérios (escalabilidade, custo, time), opções e trade-offs.',
    (SELECT id FROM table_categories WHERE key = 'product'),
    (SELECT id FROM table_jobs WHERE key = 'build-product'),
    'advanced',
    'low',
    '["plan", "options", "analysis"]',
    false,
    25
),
(
    'api-design',
    'Design de API',
    'APIs bem projetadas e documentadas',
    'Projete API com endpoints, autenticação, versionamento e documentação.',
    (SELECT id FROM table_categories WHERE key = 'product'),
    (SELECT id FROM table_jobs WHERE key = 'build-product'),
    'advanced',
    'low',
    '["plan", "spec", "docs"]',
    false,
    30
),
(
    'arquitetura-sistema',
    'Arquitetura de Sistema',
    'Arquitetura escalável e resiliente',
    'Defina arquitetura de sistema com componentes, integrações, escalabilidade e segurança.',
    (SELECT id FROM table_categories WHERE key = 'product'),
    (SELECT id FROM table_jobs WHERE key = 'build-product'),
    'advanced',
    'low',
    '["plan", "diagram", "specs"]',
    false,
    35
),
(
    'pdi-carreira',
    'PDI (Plano de Desenvolvimento)',
    'Crescimento de carreira estruturado',
    'Crie PDI com diagnóstico, regra 70-20-10, metas SMART e tracking.',
    (SELECT id FROM table_categories WHERE key = 'learning'),
    (SELECT id FROM table_jobs WHERE key = 'develop-self'),
    'basic',
    'low',
    '["plan", "goals", "tracking"]',
    false,
    20
),
(
    'aprendizado-tecnico',
    'Aprendizado Técnico',
    'Domine novas tecnologias rapidamente',
    'Plano de aprendizado técnico com recursos, projetos práticos e cronograma.',
    (SELECT id FROM table_categories WHERE key = 'learning'),
    (SELECT id FROM table_jobs WHERE key = 'develop-self'),
    'basic',
    'low',
    '["plan", "resources", "timeline"]',
    false,
    15
),
(
    'mentoria-estruturada',
    'Mentoria Estruturada',
    'Maximize valor de mentorias',
    'Estruture mentoria com objetivos, perguntas, tracking e follow-ups.',
    (SELECT id FROM table_categories WHERE key = 'learning'),
    (SELECT id FROM table_jobs WHERE key = 'develop-self'),
    'basic',
    'low',
    '["plan", "questions", "tracking"]',
    false,
    15
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. TAGS (20 tags para busca)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO template_tags (key, name) VALUES
('lancamento', 'Lançamento'),
('perpetuo', 'Perpétuo'),
('high-ticket', 'High-Ticket'),
('contratacao', 'Contratação'),
('ma', 'M&A'),
('patente', 'Patente'),
('lgpd', 'LGPD'),
('tributario', 'Tributário'),
('saas', 'SaaS'),
('b2b', 'B2B'),
('b2c', 'B2C'),
('startup', 'Startup'),
('scale-up', 'Scale-up'),
('mvp', 'MVP'),
('growth', 'Growth'),
('ops', 'Operações'),
('legal', 'Legal'),
('finance', 'Financeiro'),
('tech', 'Tecnologia'),
('people', 'Pessoas')
ON CONFLICT (key) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. TAG LINKS (Associar tags aos templates)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Marketing & Growth
INSERT INTO template_tag_links (template_id, tag_id) VALUES
((SELECT id FROM table_templates WHERE key = 'plano-marketing-b2b'), (SELECT id FROM template_tags WHERE key = 'b2b')),
((SELECT id FROM table_templates WHERE key = 'plano-marketing-b2b'), (SELECT id FROM template_tags WHERE key = 'saas')),
((SELECT id FROM table_templates WHERE key = 'lancamento-produto'), (SELECT id FROM template_tags WHERE key = 'lancamento')),
((SELECT id FROM table_templates WHERE key = 'oferta-perpetua'), (SELECT id FROM template_tags WHERE key = 'perpetuo')),
((SELECT id FROM table_templates WHERE key = 'high-ticket-sales'), (SELECT id FROM template_tags WHERE key = 'high-ticket')),
((SELECT id FROM table_templates WHERE key = 'growth-hacking'), (SELECT id FROM template_tags WHERE key = 'growth')),
((SELECT id FROM table_templates WHERE key = 'growth-hacking'), (SELECT id FROM template_tags WHERE key = 'startup'));

-- Legal & Finance
INSERT INTO template_tag_links (template_id, tag_id) VALUES
((SELECT id FROM table_templates WHERE key = 'contrato-sociedade'), (SELECT id FROM template_tags WHERE key = 'legal')),
((SELECT id FROM table_templates WHERE key = 'planejamento-tributario'), (SELECT id FROM template_tags WHERE key = 'tributario')),
((SELECT id FROM table_templates WHERE key = 'planejamento-tributario'), (SELECT id FROM template_tags WHERE key = 'finance')),
((SELECT id FROM table_templates WHERE key = 'compliance-lgpd'), (SELECT id FROM template_tags WHERE key = 'lgpd')),
((SELECT id FROM table_templates WHERE key = 'compliance-lgpd'), (SELECT id FROM template_tags WHERE key = 'legal')),
((SELECT id FROM table_templates WHERE key = 'due-diligence'), (SELECT id FROM template_tags WHERE key = 'ma')),
((SELECT id FROM table_templates WHERE key = 'registro-patente'), (SELECT id FROM template_tags WHERE key = 'patente'));

-- Product & Tech
INSERT INTO template_tag_links (template_id, tag_id) VALUES
((SELECT id FROM table_templates WHERE key = 'roadmap-produto'), (SELECT id FROM template_tags WHERE key = 'saas')),
((SELECT id FROM table_templates WHERE key = 'mvp-definition'), (SELECT id FROM template_tags WHERE key = 'mvp')),
((SELECT id FROM table_templates WHERE key = 'mvp-definition'), (SELECT id FROM template_tags WHERE key = 'startup')),
((SELECT id FROM table_templates WHERE key = 'tech-stack-decision'), (SELECT id FROM template_tags WHERE key = 'tech')),
((SELECT id FROM table_templates WHERE key = 'api-design'), (SELECT id FROM template_tags WHERE key = 'tech')),
((SELECT id FROM table_templates WHERE key = 'arquitetura-sistema'), (SELECT id FROM template_tags WHERE key = 'tech'));

-- People & Ops
INSERT INTO template_tag_links (template_id, tag_id) VALUES
((SELECT id FROM table_templates WHERE key = 'contratacao-talentos'), (SELECT id FROM template_tags WHERE key = 'contratacao')),
((SELECT id FROM table_templates WHERE key = 'contratacao-talentos'), (SELECT id FROM template_tags WHERE key = 'people')),
((SELECT id FROM table_templates WHERE key = 'processos-operacionais'), (SELECT id FROM template_tags WHERE key = 'ops')),
((SELECT id FROM table_templates WHERE key = 'cultura-organizacional'), (SELECT id FROM template_tags WHERE key = 'people'));

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- END OF SEEDS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
