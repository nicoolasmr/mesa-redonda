-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MESA REDONDA v1.4: ANALYZER SYSTEM
-- Migration: Multi-format Analysis & Structured Results
-- Date: 2026-01-22
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. ANALYSES TABLE
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    specialist_key TEXT NOT NULL,
    user_goal TEXT,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'uploading', 'processing', 'done', 'error')),
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    jurisdiction TEXT,
    consent_confirmed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ANALYSIS FILES TABLE
CREATE TABLE IF NOT EXISTS analysis_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    file_kind TEXT NOT NULL CHECK (file_kind IN ('pdf', 'spreadsheet', 'image', 'other')),
    extracted_text TEXT,
    extracted_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ANALYSIS RESULTS TABLE
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID UNIQUE NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    study_json JSONB NOT NULL,
    dashboard_json JSONB NOT NULL,
    model_used TEXT NOT NULL,
    cost_estimate JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ARTIFACT LINKS
CREATE TABLE IF NOT EXISTS analysis_artifacts_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    artifact_id UUID NOT NULL, -- Logical reference to artifacts table
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_analyses_workspace ON analyses(workspace_id);
CREATE INDEX IF NOT EXISTS idx_analysis_files_analysis ON analysis_files(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_analysis ON analysis_results(analysis_id);

-- 6. RLS POLICIES
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_artifacts_link ENABLE ROW LEVEL SECURITY;

-- Shared Policy Function for Workspace access
CREATE OR REPLACE FUNCTION user_in_workspace(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspaces
        WHERE id = ws_id AND owner_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = ws_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Analyses Policies
CREATE POLICY "Users can manage their workspace analyses"
    ON analyses FOR ALL
    USING (user_in_workspace(workspace_id));

-- Analysis Files Policies
CREATE POLICY "Users can manage their workspace analysis files"
    ON analysis_files FOR ALL
    USING (user_in_workspace(workspace_id));

-- Analysis Results Policies
CREATE POLICY "Users can view workspace analysis results"
    ON analysis_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM analyses 
            WHERE analyses.id = analysis_results.analysis_id 
            AND user_in_workspace(analyses.workspace_id)
        )
    );

-- 7. TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_analyses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_analyses_timestamp
BEFORE UPDATE ON analyses
FOR EACH ROW
EXECUTE FUNCTION update_analyses_timestamp();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STORAGE BUCKET CONFIG (Mental Note: Requer configuração manual no console se não usar SQL p/ Storage)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INSERT INTO storage.buckets (id, name, public) VALUES ('analyzer-uploads', 'analyzer-uploads', false);
