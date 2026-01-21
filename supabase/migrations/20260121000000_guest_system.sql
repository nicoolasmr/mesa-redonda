-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MESA REDONDA v1.2: GUEST DEMO SYSTEM
-- Migration: Guest Credits & Artifacts
-- Date: 2026-01-21
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. GUEST CREDITS TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Stores guest user credits (5 free credits per guest_id)
-- No PII, no IP addresses (GDPR/privacy compliant)

CREATE TABLE IF NOT EXISTS guest_credits (
    guest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credits_remaining INT NOT NULL DEFAULT 5 CHECK (credits_remaining >= 0 AND credits_remaining <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_credits_last_seen ON guest_credits(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_guest_credits_created ON guest_credits(created_at);

-- Comment
COMMENT ON TABLE guest_credits IS 'Guest user credits for landing page demo (5 free credits)';
COMMENT ON COLUMN guest_credits.guest_id IS 'Unique guest identifier (stored in HttpOnly cookie)';
COMMENT ON COLUMN guest_credits.credits_remaining IS 'Number of remaining credits (0-5)';
COMMENT ON COLUMN guest_credits.last_seen_at IS 'Last activity timestamp for cleanup';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. GUEST ARTIFACTS TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Stores artifacts created by guest users
-- Each artifact has a non-enumerable public_id for sharing

CREATE TABLE IF NOT EXISTS guest_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES guest_credits(guest_id) ON DELETE CASCADE,
    table_type TEXT NOT NULL CHECK (table_type IN ('marketing', 'produto', 'carreira', 'estudos')),
    prompt TEXT NOT NULL,
    result_json JSONB NOT NULL,
    public_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'base64url'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_guest_artifacts_guest_id ON guest_artifacts(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_artifacts_public_id ON guest_artifacts(public_id);
CREATE INDEX IF NOT EXISTS idx_guest_artifacts_created_at ON guest_artifacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_artifacts_table_type ON guest_artifacts(table_type);

-- Comments
COMMENT ON TABLE guest_artifacts IS 'Artifacts created by guest users in landing demo';
COMMENT ON COLUMN guest_artifacts.public_id IS 'Non-enumerable public ID for sharing (base64url, 16 bytes)';
COMMENT ON COLUMN guest_artifacts.table_type IS 'Type of mesa: marketing, produto, carreira, estudos';
COMMENT ON COLUMN guest_artifacts.result_json IS 'Structured artifact JSON (deterministic-first)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. AUTO-UPDATE TIMESTAMP TRIGGER
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION update_guest_credits_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_guest_credits_timestamp
BEFORE UPDATE ON guest_credits
FOR EACH ROW
EXECUTE FUNCTION update_guest_credits_timestamp();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. RLS POLICIES (SECURITY)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Guest tables are NOT accessible from client
-- All access must go through server-side API routes with service role

ALTER TABLE guest_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_artifacts ENABLE ROW LEVEL SECURITY;

-- No policies = no client access (server-side only via service role)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. CLEANUP FUNCTION (OPTIONAL - FOR CRON)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Delete guest data older than 30 days (GDPR compliance)

CREATE OR REPLACE FUNCTION cleanup_old_guest_data()
RETURNS void AS $$
BEGIN
    DELETE FROM guest_credits
    WHERE last_seen_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_guest_data IS 'Delete guest data older than 30 days (run via cron)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- END OF MIGRATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
