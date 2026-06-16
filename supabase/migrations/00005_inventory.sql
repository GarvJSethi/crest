-- ============================================================================
-- Migration 00005: Inventory
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Inventory (one row per variant)
-- ---------------------------------------------------------------------------
CREATE TABLE public.inventory (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id          UUID        NOT NULL UNIQUE REFERENCES public.product_variants (id) ON DELETE CASCADE,
    quantity            INTEGER     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity   INTEGER     NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    low_stock_threshold INTEGER     NOT NULL DEFAULT 5  CHECK (low_stock_threshold >= 0),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT inventory_reserved_lte_quantity CHECK (reserved_quantity <= quantity)
);

COMMENT ON TABLE  public.inventory IS 'Stock levels per product variant.';
COMMENT ON COLUMN public.inventory.quantity IS 'Total units on hand (includes reserved).';
COMMENT ON COLUMN public.inventory.reserved_quantity IS 'Units reserved by pending orders.';

-- Indexes
CREATE INDEX idx_inventory_variant_id  ON public.inventory (variant_id);
CREATE INDEX idx_inventory_low_stock   ON public.inventory (quantity, low_stock_threshold)
    WHERE quantity <= low_stock_threshold;

-- ---------------------------------------------------------------------------
-- 2. Inventory Change Logs (audit trail)
-- ---------------------------------------------------------------------------
CREATE TABLE public.inventory_logs (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id          UUID        NOT NULL REFERENCES public.product_variants (id) ON DELETE CASCADE,
    change_quantity     INTEGER     NOT NULL,                     -- +/- delta
    reason              TEXT        NOT NULL,                     -- e.g. 'order_placed', 'manual_adjustment', 'return'
    reference_id        UUID,                                    -- optional FK to order / return
    previous_quantity   INTEGER     NOT NULL,
    new_quantity        INTEGER     NOT NULL,
    created_by          UUID        REFERENCES public.profiles (id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.inventory_logs IS 'Immutable audit log for every inventory change.';

-- Indexes
CREATE INDEX idx_inventory_logs_variant_id  ON public.inventory_logs (variant_id);
CREATE INDEX idx_inventory_logs_created_at  ON public.inventory_logs (created_at DESC);
CREATE INDEX idx_inventory_logs_reference   ON public.inventory_logs (reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX idx_inventory_logs_reason      ON public.inventory_logs (reason);

-- ---------------------------------------------------------------------------
-- 3. Low Stock Alerts View
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.low_stock_alerts AS
SELECT
    i.id              AS inventory_id,
    i.variant_id,
    pv.sku,
    pv.size,
    pv.color,
    p.id              AS product_id,
    p.name            AS product_name,
    i.quantity,
    i.reserved_quantity,
    (i.quantity - i.reserved_quantity) AS available_quantity,
    i.low_stock_threshold
FROM public.inventory        i
JOIN public.product_variants pv ON pv.id = i.variant_id
JOIN public.products         p  ON p.id  = pv.product_id
WHERE i.quantity <= i.low_stock_threshold;

COMMENT ON VIEW public.low_stock_alerts IS 'Variants whose stock is at or below their alert threshold.';
