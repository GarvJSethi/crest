-- ============================================================================
-- Migration 00006: Coupons
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Coupons
-- ---------------------------------------------------------------------------
CREATE TABLE public.coupons (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                    TEXT            NOT NULL UNIQUE,
    description             TEXT,
    discount_type           public.discount_type NOT NULL,
    discount_value          INTEGER         NOT NULL CHECK (discount_value > 0),   -- paise or %
    min_order_amount        INTEGER         CHECK (min_order_amount IS NULL OR min_order_amount >= 0),
    max_discount_amount     INTEGER         CHECK (max_discount_amount IS NULL OR max_discount_amount > 0),
    usage_limit             INTEGER         CHECK (usage_limit IS NULL OR usage_limit > 0),
    usage_per_user          INTEGER         NOT NULL DEFAULT 1 CHECK (usage_per_user > 0),
    used_count              INTEGER         NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    applicable_categories   UUID[],
    applicable_products     UUID[],
    starts_at               TIMESTAMPTZ     NOT NULL DEFAULT now(),
    expires_at              TIMESTAMPTZ,
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    created_by              UUID            REFERENCES public.profiles (id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT coupons_code_upper       CHECK (code = upper(code)),
    CONSTRAINT coupons_code_length      CHECK (char_length(code) BETWEEN 3 AND 50),
    CONSTRAINT coupons_dates_check      CHECK (expires_at IS NULL OR expires_at > starts_at),
    CONSTRAINT coupons_percentage_max   CHECK (
        discount_type <> 'percentage' OR discount_value <= 10000   -- max 100.00 %
    ),
    CONSTRAINT coupons_usage_check      CHECK (usage_limit IS NULL OR used_count <= usage_limit)
);

COMMENT ON TABLE  public.coupons IS 'Discount coupons. discount_value is paise for fixed_amount, basis points (×100) for percentage.';

-- Indexes
CREATE INDEX idx_coupons_code       ON public.coupons (code);
CREATE INDEX idx_coupons_is_active  ON public.coupons (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_coupons_dates      ON public.coupons (starts_at, expires_at);
CREATE INDEX idx_coupons_categories ON public.coupons USING gin (applicable_categories)
    WHERE applicable_categories IS NOT NULL;
CREATE INDEX idx_coupons_products   ON public.coupons USING gin (applicable_products)
    WHERE applicable_products IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. Coupon Usage (tracks per-user redemptions)
-- ---------------------------------------------------------------------------
CREATE TABLE public.coupon_usage (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id           UUID        NOT NULL REFERENCES public.coupons (id) ON DELETE CASCADE,
    user_id             UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    order_id            UUID,       -- populated after order is placed (FK added in 00007)
    discount_applied    INTEGER     NOT NULL CHECK (discount_applied > 0),   -- paise
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.coupon_usage IS 'Records each coupon redemption per user per order.';

-- Indexes
CREATE INDEX idx_coupon_usage_coupon_id ON public.coupon_usage (coupon_id);
CREATE INDEX idx_coupon_usage_user_id   ON public.coupon_usage (user_id);
CREATE INDEX idx_coupon_usage_order_id  ON public.coupon_usage (order_id) WHERE order_id IS NOT NULL;
CREATE UNIQUE INDEX idx_coupon_usage_per_user ON public.coupon_usage (coupon_id, user_id, order_id);
