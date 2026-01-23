-- RPC for atomic usage increment
CREATE OR REPLACE FUNCTION public.increment_workspace_usage(
    w_id UUID,
    m TEXT,
    f TEXT,
    a FLOAT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.workspace_usage_monthly (workspace_id, year_month, updated_at)
    VALUES (w_id, m, now())
    ON CONFLICT (workspace_id, year_month)
    DO UPDATE SET 
        tables_count = CASE WHEN f = 'tables_count' THEN workspace_usage_monthly.tables_count + a::INT ELSE workspace_usage_monthly.tables_count END,
        artifacts_count = CASE WHEN f = 'artifacts_count' THEN workspace_usage_monthly.artifacts_count + a::INT ELSE workspace_usage_monthly.artifacts_count END,
        storage_mb_used = CASE WHEN f = 'storage_mb_used' THEN workspace_usage_monthly.storage_mb_used + a ELSE workspace_usage_monthly.storage_mb_used END,
        meetings_minutes = CASE WHEN f = 'meetings_minutes' THEN workspace_usage_monthly.meetings_minutes + a::INT ELSE workspace_usage_monthly.meetings_minutes END,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
