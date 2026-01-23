-- RPC for atomic usage increment
-- This avoids race conditions in read-modify-write cycles
CREATE OR REPLACE FUNCTION public.increment_workspace_usage(
  target_workspace_id UUID,
  target_metric TEXT,
  increment_amount INT
)
RETURNS VOID AS $$
DECLARE
  current_month TEXT;
BEGIN
  current_month := to_char(CURRENT_DATE, 'YYYY-MM');

  INSERT INTO public.workspace_usage_monthly (workspace_id, month_key, counters)
  VALUES (
    target_workspace_id,
    current_month,
    jsonb_build_object(target_metric, increment_amount)
  )
  ON CONFLICT (workspace_id, month_key)
  DO UPDATE SET
    counters = public.workspace_usage_monthly.counters || 
               jsonb_build_object(target_metric, 
                 COALESCE((public.workspace_usage_monthly.counters->>target_metric)::INT, 0) + increment_amount
               ),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
