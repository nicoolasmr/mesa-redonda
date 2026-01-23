-- P0: FOUNDATIONS MIGRATION
-- Entitlements, Usage and Stripe Synchronization

-- 1. STRIPE EVENTS (IDEMPOTENCY / DEDUPLICATION)
CREATE TABLE IF NOT EXISTS public.stripe_events (
    id TEXT PRIMARY KEY, -- Stripe Event ID
    type TEXT NOT NULL,
    data JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- No public/guest access to stripe events, only service role or direct DB access
CREATE POLICY "Stripe events are protected" ON public.stripe_events FOR ALL USING (false);

-- 2. WORKSPACE ENTITLEMENTS (LIMITS)
CREATE TABLE IF NOT EXISTS public.workspace_entitlements (
    plan_name TEXT PRIMARY KEY, -- free, starter, pro, team
    max_tables_per_month INTEGER NOT NULL,
    max_artifacts_per_month INTEGER NOT NULL,
    can_export_pdf BOOLEAN DEFAULT false,
    can_share_publicly BOOLEAN DEFAULT false,
    max_members INTEGER DEFAULT 1,
    max_storage_mb INTEGER DEFAULT 50,
    can_use_smart_models BOOLEAN DEFAULT false, -- GPT-4o
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.workspace_entitlements (plan_name, max_tables_per_month, max_artifacts_per_month, can_export_pdf, can_share_publicly, max_members, max_storage_mb, can_use_smart_models)
VALUES 
    ('free', 3, 1, false, false, 1, 10, false),
    ('starter', 10, 5, true, false, 1, 100, false),
    ('pro', 99999, 99999, true, true, 1, 1000, true),
    ('team', 99999, 99999, true, true, 5, 5000, true)
ON CONFLICT (plan_name) DO UPDATE SET
    max_tables_per_month = EXCLUDED.max_tables_per_month,
    max_artifacts_per_month = EXCLUDED.max_artifacts_per_month,
    can_export_pdf = EXCLUDED.can_export_pdf,
    can_share_publicly = EXCLUDED.can_share_publicly,
    max_members = EXCLUDED.max_members,
    max_storage_mb = EXCLUDED.max_storage_mb,
    can_use_smart_models = EXCLUDED.can_use_smart_models;

ALTER TABLE public.workspace_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view entitlements" ON public.workspace_entitlements FOR SELECT USING (true);

-- 3. WORKSPACE USAGE MONTHLY (METERING)
CREATE TABLE IF NOT EXISTS public.workspace_usage_monthly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    year_month TEXT NOT NULL, -- Format: YYYY-MM
    tables_count INTEGER DEFAULT 0,
    artifacts_count INTEGER DEFAULT 0,
    storage_mb_used FLOAT DEFAULT 0,
    meetings_minutes INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(workspace_id, year_month)
);

ALTER TABLE public.workspace_usage_monthly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace owners can view their usage" 
ON public.workspace_usage_monthly FOR SELECT 
USING (
    workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
);

-- 4. SHARES (PUBLIC READ-ONLY ACCESS)
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL, -- 'artifact', 'analysis', 'meeting'
    resource_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- Workspace members can manage their shares
CREATE POLICY "Workspace owners can manage shares"
ON public.shares FOR ALL
USING (
    workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
);

-- Anyone can view an active share
CREATE POLICY "Public can view active shares"
ON public.shares FOR SELECT
USING (
    is_active = true AND (expires_at IS NULL OR expires_at > now())
);

-- 5. AUDIT LOGS (SECURITY)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'delete_workspace', 'export_data', 'change_plan'
    metadata JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only view audit logs" ON public.audit_logs FOR SELECT USING (false); -- To be handled by Service Role or Admin UI
