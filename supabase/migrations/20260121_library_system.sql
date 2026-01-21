-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MESA REDONDA v1.3: BIBLIOTECA DE MESAS
-- Migration: Library System (Categories, Jobs, Templates, Tags, User Intents)
-- Date: 2026-01-21
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. TABLE CATEGORIES (Áreas de Negócio)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS table_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_table_categories_key ON table_categories(key);
CREATE INDEX idx_table_categories_order ON table_categories(order_index);

COMMENT ON TABLE table_categories IS 'Business areas/categories for template organization';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. TABLE JOBS (JTBD - Jobs to Be Done)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS table_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_table_jobs_key ON table_jobs(key);
CREATE INDEX idx_table_jobs_order ON table_jobs(order_index);

COMMENT ON TABLE table_jobs IS 'Jobs to Be Done - user objectives/goals';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. TABLE TEMPLATES (Biblioteca de Mesas)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS table_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES table_categories(id),
    job_id UUID REFERENCES table_jobs(id),
    difficulty TEXT CHECK (difficulty IN ('basic', 'advanced')) DEFAULT 'basic',
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'low',
    outputs JSONB NOT NULL DEFAULT '[]',
    prompt_bundle JSONB,
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    version TEXT DEFAULT 'v1.0',
    status TEXT CHECK (status IN ('active', 'draft', 'archived')) DEFAULT 'active',
    estimated_time_minutes INT DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_table_templates_key ON table_templates(key);
CREATE INDEX idx_table_templates_category ON table_templates(category_id);
CREATE INDEX idx_table_templates_job ON table_templates(job_id);
CREATE INDEX idx_table_templates_featured ON table_templates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_table_templates_status ON table_templates(status);
CREATE INDEX idx_table_templates_difficulty ON table_templates(difficulty);
CREATE INDEX idx_table_templates_risk ON table_templates(risk_level);

COMMENT ON TABLE table_templates IS 'Curated library of mesa templates';
COMMENT ON COLUMN table_templates.outputs IS 'Array of output types: ["plan", "checklist", "swot", etc.]';
COMMENT ON COLUMN table_templates.prompt_bundle IS 'Versioned prompts and guardrails for this template';
COMMENT ON COLUMN table_templates.risk_level IS 'Legal/financial risk: low, medium, high (high requires disclaimers)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. TEMPLATE TAGS (Search & Discovery)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS template_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_tag_links (
    template_id UUID REFERENCES table_templates(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES template_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, tag_id)
);

CREATE INDEX idx_template_tag_links_template ON template_tag_links(template_id);
CREATE INDEX idx_template_tag_links_tag ON template_tag_links(tag_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. USER INTENTS (User Preferences per Workspace)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS user_intents (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    primary_job_id UUID REFERENCES table_jobs(id),
    secondary_job_ids UUID[] DEFAULT '{}',
    industries TEXT[] DEFAULT '{}',
    stage TEXT CHECK (stage IN ('idea', 'mvp', 'growth', 'scale')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_intents_primary_job ON user_intents(primary_job_id);

COMMENT ON TABLE user_intents IS 'User preferences and intent signals per workspace';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. TEMPLATE USAGE STATS (View)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE VIEW template_usage_stats AS
SELECT 
    template_id,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS uses_7d,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS uses_30d,
    COUNT(*) AS uses_total
FROM tables
GROUP BY template_id;

COMMENT ON VIEW template_usage_stats IS 'Template usage statistics for recommendation engine';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. RLS POLICIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Categories, Jobs, Templates: Read public (catalog), write admin only
ALTER TABLE table_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tag_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_intents ENABLE ROW LEVEL SECURITY;

-- Public read for catalog tables
CREATE POLICY "Public read for categories" ON table_categories FOR SELECT USING (true);
CREATE POLICY "Public read for jobs" ON table_jobs FOR SELECT USING (true);
CREATE POLICY "Public read for templates" ON table_templates FOR SELECT USING (status = 'active');
CREATE POLICY "Public read for tags" ON template_tags FOR SELECT USING (true);
CREATE POLICY "Public read for tag links" ON template_tag_links FOR SELECT USING (true);

-- User intents: per workspace
CREATE POLICY "Members can view workspace intents" ON user_intents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = user_intents.workspace_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Members can update workspace intents" ON user_intents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = user_intents.workspace_id 
            AND user_id = auth.uid()
        )
    );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. TRIGGERS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Auto-update timestamp for templates
DROP TRIGGER IF EXISTS trigger_update_template_timestamp ON table_templates;

CREATE OR REPLACE FUNCTION update_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_timestamp
BEFORE UPDATE ON table_templates
FOR EACH ROW
EXECUTE FUNCTION update_template_timestamp();

-- Auto-update timestamp for user_intents
DROP TRIGGER IF EXISTS trigger_update_user_intent_timestamp ON user_intents;

CREATE OR REPLACE FUNCTION update_user_intent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_intent_timestamp
BEFORE UPDATE ON user_intents
FOR EACH ROW
EXECUTE FUNCTION update_user_intent_timestamp();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- END OF MIGRATION (Seeds in separate file)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
