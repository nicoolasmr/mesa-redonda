-- P0: SAAS HARDENING
-- Billing, Usage, Telemetry, Entitlements

-- 1. STRIPE INTEGRATION (Source of Truth)
DROP TABLE IF EXISTS public.stripe_customers CASCADE;
DROP TABLE IF EXISTS public.stripe_subscriptions CASCADE;
DROP TABLE IF EXISTS public.stripe_events CASCADE;
DROP TABLE IF EXISTS public.workspace_entitlements CASCADE;
DROP TABLE IF EXISTS public.workspace_usage_monthly CASCADE;
DROP TABLE IF EXISTS public.usage_events CASCADE;
DROP TABLE IF EXISTS public.telemetry_events CASCADE;
DROP TABLE IF EXISTS public.plan_catalog CASCADE;

-- 1. STRIPE INTEGRATION
CREATE TABLE public.stripe_customers (
    workspace_id UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.stripe_subscriptions (
    workspace_id UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL, -- 'active', 'trialing', 'past_due', 'canceled', 'unpaid'
    plan_key TEXT NOT NULL, -- 'starter', 'pro', 'team'
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.stripe_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT NOT NULL UNIQUE, -- For Idempotency
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'failed'
    error TEXT,
    workspace_id UUID REFERENCES public.workspaces(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- 2. ENTITLEMENTS & USAGE
CREATE TABLE public.plan_catalog (
    plan_key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    limits JSONB NOT NULL DEFAULT '{}'::jsonb, -- { 'runs': 10, 'upload_mb': 20 }
    features JSONB NOT NULL DEFAULT '[]'::jsonb
);
ALTER TABLE public.plan_catalog ENABLE ROW LEVEL SECURITY;
-- Insert Defaults
INSERT INTO public.plan_catalog (plan_key, name, limits) VALUES
('free', 'Free Tier', '{"runs": 5, "upload_mb": 20, "meetings": 1}'),
('starter', 'Starter', '{"runs": 50, "upload_mb": 100, "meetings": 10}'),
('pro', 'Pro Founder', '{"runs": 500, "upload_mb": 500, "meetings": 50}'),
('team', 'Team', '{"runs": 1000, "upload_mb": 1000, "meetings": 100}')
ON CONFLICT DO NOTHING;

CREATE TABLE public.workspace_entitlements (
    workspace_id UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
    plan_key TEXT NOT NULL REFERENCES public.plan_catalog(plan_key) DEFAULT 'free',
    override_limits JSONB, -- For custom deals
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.workspace_entitlements ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workspace_usage_monthly (
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    month_key TEXT NOT NULL, -- '2024-01'
    counters JSONB NOT NULL DEFAULT '{}'::jsonb, -- { 'runs': 12, 'storage': 1048576 }
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (workspace_id, month_key)
);
ALTER TABLE public.workspace_usage_monthly ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    metric TEXT NOT NULL,
    amount INTEGER NOT NULL,
    ref_id UUID, -- run_id, file_id etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- 3. TELEMETRY
CREATE TABLE public.telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id),
    user_id UUID REFERENCES auth.users(id),
    event_name TEXT NOT NULL,
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
-- 4. RLS POLICIES
-- Stripe: Only service role manages usually, but users can read own sub
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users view own subscription' and tablename = 'stripe_subscriptions') then
    create policy "Users view own subscription" on public.stripe_subscriptions
      for select using (workspace_id in (select id from workspaces where owner_id = auth.uid()));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users view own entitlements' and tablename = 'workspace_entitlements') then
    create policy "Users view own entitlements" on public.workspace_entitlements
      for select using (workspace_id in (select id from workspaces where owner_id = auth.uid()));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users view own usage' and tablename = 'workspace_usage_monthly') then
    create policy "Users view own usage" on public.workspace_usage_monthly
      for select using (workspace_id in (select id from workspaces where owner_id = auth.uid()));
  end if;
end $$;

-- Telemetry: Insert allowed, Select own
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users insert telemetry' and tablename = 'telemetry_events') then
    create policy "Users insert telemetry" on public.telemetry_events
      for insert to authenticated with check (auth.uid() = user_id);
  end if;
end $$;
