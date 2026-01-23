-- P2: GROWTH & VIRALIDADE
-- Invites, Members, Referrals, Observability

-- 1. WORKSPACE MEMBERS (Multi-tenant)
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view members of their own workspace
CREATE POLICY "Members can view workspace members"
ON public.workspace_members FOR SELECT
USING (
    workspace_id IN (
        -- User is owner of the workspace OR is a member
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
);

-- 2. WORKSPACE INVITES (Pending)
CREATE TABLE IF NOT EXISTS public.workspace_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    role TEXT DEFAULT 'member',
    created_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'pending' -- pending, accepted, expired
);

ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace admins can manage invites"
ON public.workspace_invites FOR ALL
USING (
    workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
);

-- 3. REFERRAL SYSTEM
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    code TEXT NOT NULL UNIQUE,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own code" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id),
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    status TEXT DEFAULT 'pending', -- pending, converted, paid
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);

-- 4. TELEMETRY (EVENTS)
-- Re-creating properly if not exists (to support prev features)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    workspace_id UUID REFERENCES public.workspaces(id),
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- App can insert events freely (authenticated users)
CREATE POLICY "Users can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (true);
-- Only track own events? or just app-wide log. For simplicity:
CREATE POLICY "Users can see own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
