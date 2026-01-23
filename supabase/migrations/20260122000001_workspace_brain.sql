-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MESA REDONDA v1.4: THE BRAIN (KNOWLEDGE BASE)
-- Migration: Workspace Context & Business Rules
-- Date: 2026-01-22
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. WORKSPACE KNOWLEDGE TABLE
CREATE TABLE IF NOT EXISTS workspace_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('business_rule', 'product_info', 'brand_voice', 'customer_profile', 'other')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_knowledge_workspace ON workspace_knowledge(workspace_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON workspace_knowledge(category);

-- 3. RLS SECURITY
ALTER TABLE workspace_knowledge ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see knowledge from workspaces they belong to
CREATE POLICY "Users can view knowledge from their workspaces"
    ON workspace_knowledge FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = workspace_knowledge.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM workspaces
            WHERE workspaces.id = workspace_knowledge.workspace_id
            AND workspaces.owner_id = auth.uid()
        )
    );

-- Policy: Owners/Admins can manage knowledge
CREATE POLICY "Owners can manage knowledge"
    ON workspace_knowledge FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM workspaces
            WHERE workspaces.id = workspace_knowledge.workspace_id
            AND workspaces.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspaces
            WHERE workspaces.id = workspace_knowledge.workspace_id
            AND workspaces.owner_id = auth.uid()
        )
    );

-- 4. TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_knowledge_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_knowledge_timestamp
BEFORE UPDATE ON workspace_knowledge
FOR EACH ROW
EXECUTE FUNCTION update_knowledge_timestamp();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- COMMENTARY
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMENT ON TABLE workspace_knowledge IS 'Source of truth for the workspace. Used to guide AI personas and prevent hallucinations.';
