-- P3: LEADGATE & CREDITS LEDGER
-- Migration: Lead Capture, Drafts, and Credit Transactions

-- 1. LEADS (Pre-signup)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    consent_marketing BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'landing_demo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Only server (service role) can manage leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 2. DEMO DRAFTS (The 'Input' before Signup)
CREATE TABLE IF NOT EXISTS public.demo_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa_key TEXT NOT NULL,
    user_input TEXT,
    landing_session_id TEXT, -- Fingerprint/Cookie ID
    lead_id UUID REFERENCES public.leads(id),
    status TEXT DEFAULT 'created', -- 'created', 'unlocked', 'converted'
    converted_run_id UUID, -- Links to 'analyses' or 'tables' table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Only server can manage drafts
ALTER TABLE public.demo_drafts ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES UPDATES
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'consent_marketing') THEN
        ALTER TABLE public.profiles ADD COLUMN consent_marketing BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 4. CREDITS LEDGER (Transactional Credits)
CREATE TABLE IF NOT EXISTS public.credits_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Negative for debit, Positive for credit
    reason TEXT NOT NULL, -- 'signup_bonus', 'run_cost', 'upgrade_grant'
    ref_id UUID, -- Optional reference to external ID (e.g. run_id, payment_id)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.credits_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view ledger"
ON public.credits_ledger FOR SELECT
USING (
    workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
);

-- 5. CREDIT BALANCE VIEW
CREATE OR REPLACE VIEW public.workspace_credit_balance AS
SELECT 
    workspace_id,
    COALESCE(SUM(amount), 0) as balance
FROM 
    public.credits_ledger
GROUP BY 
    workspace_id;

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_drafts_session ON demo_drafts(landing_session_id);
CREATE INDEX IF NOT EXISTS idx_ledger_workspace ON credits_ledger(workspace_id);
