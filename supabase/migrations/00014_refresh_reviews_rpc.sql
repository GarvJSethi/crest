-- ============================================================================
-- Migration 00014: Refresh Reviews RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.refresh_product_rating_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.product_rating_summary;
END;
$$;

COMMENT ON FUNCTION public.refresh_product_rating_summary() IS 'Refreshes the product rating summary materialized view.';
