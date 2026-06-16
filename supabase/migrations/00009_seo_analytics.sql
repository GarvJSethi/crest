-- ============================================================================
-- Migration 00009: SEO Pages & Analytics
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. SEO Pages (custom meta for any page)
-- ---------------------------------------------------------------------------
CREATE TABLE public.seo_pages (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_type       TEXT        NOT NULL,       -- 'product', 'category', 'static', 'blog'
    reference_id    UUID,                       -- optional FK to product / category
    slug            TEXT        NOT NULL UNIQUE,
    title           TEXT        NOT NULL,
    meta_title      TEXT,
    meta_description TEXT,
    og_title        TEXT,
    og_description  TEXT,
    og_image_url    TEXT,
    canonical_url   TEXT,
    structured_data JSONB,
    is_indexed      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT seo_pages_slug_format CHECK (slug ~ '^[a-z0-9]+([/\-][a-z0-9]+)*$')
);

COMMENT ON TABLE public.seo_pages IS 'Overridable SEO metadata for any page on the storefront.';

-- Indexes
CREATE INDEX idx_seo_pages_page_type    ON public.seo_pages (page_type);
CREATE INDEX idx_seo_pages_reference_id ON public.seo_pages (reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX idx_seo_pages_slug         ON public.seo_pages (slug);
CREATE INDEX idx_seo_pages_is_indexed   ON public.seo_pages (is_indexed) WHERE is_indexed = TRUE;

-- ---------------------------------------------------------------------------
-- 2. Website Sessions
-- ---------------------------------------------------------------------------
CREATE TABLE public.website_sessions (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        REFERENCES public.profiles (id) ON DELETE SET NULL,
    session_token   TEXT        NOT NULL UNIQUE,
    device_type     TEXT,       -- 'mobile', 'tablet', 'desktop'
    browser         TEXT,
    os              TEXT,
    ip_address      INET,

    -- UTM attribution
    utm_source      TEXT,
    utm_medium      TEXT,
    utm_campaign    TEXT,
    utm_term        TEXT,
    utm_content     TEXT,
    referrer        TEXT,

    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.website_sessions IS 'Browser sessions for analytics attribution.';

-- Indexes
CREATE INDEX idx_sessions_user_id       ON public.website_sessions (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_sessions_session_token ON public.website_sessions (session_token);
CREATE INDEX idx_sessions_started_at    ON public.website_sessions (started_at DESC);
CREATE INDEX idx_sessions_utm_source    ON public.website_sessions (utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX idx_sessions_utm_campaign  ON public.website_sessions (utm_campaign) WHERE utm_campaign IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Page Views
-- ---------------------------------------------------------------------------
CREATE TABLE public.page_views (
    id              BIGSERIAL   PRIMARY KEY,
    session_id      UUID        NOT NULL REFERENCES public.website_sessions (id) ON DELETE CASCADE,
    user_id         UUID        REFERENCES public.profiles (id) ON DELETE SET NULL,
    page_type       TEXT        NOT NULL,       -- 'product', 'category', 'home', 'cart', 'checkout'
    page_url        TEXT        NOT NULL,
    reference_id    UUID,                       -- product_id, category_id, etc.
    time_on_page_ms INTEGER,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.page_views IS 'Individual page view events for analytics.';

-- Indexes
CREATE INDEX idx_page_views_session_id   ON public.page_views (session_id);
CREATE INDEX idx_page_views_user_id      ON public.page_views (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_page_views_page_type    ON public.page_views (page_type);
CREATE INDEX idx_page_views_reference_id ON public.page_views (reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX idx_page_views_created_at   ON public.page_views (created_at DESC);

-- ---------------------------------------------------------------------------
-- 4. Product View Counts (denormalised counter)
-- ---------------------------------------------------------------------------
CREATE TABLE public.product_view_counts (
    product_id          UUID        PRIMARY KEY REFERENCES public.products (id) ON DELETE CASCADE,
    view_count          BIGINT      NOT NULL DEFAULT 0,
    unique_view_count   BIGINT      NOT NULL DEFAULT 0,
    last_viewed_at      TIMESTAMPTZ
);

COMMENT ON TABLE public.product_view_counts IS 'Denormalised running counters for product popularity.';

-- ---------------------------------------------------------------------------
-- 5. Conversion Events
-- ---------------------------------------------------------------------------
CREATE TABLE public.conversion_events (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id  UUID        REFERENCES public.website_sessions (id) ON DELETE SET NULL,
    user_id     UUID        REFERENCES public.profiles (id) ON DELETE SET NULL,
    event_type  TEXT        NOT NULL,           -- 'add_to_cart', 'begin_checkout', 'purchase', 'sign_up'
    event_data  JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.conversion_events IS 'Key funnel events for conversion analytics.';

-- Indexes
CREATE INDEX idx_conversion_events_session_id  ON public.conversion_events (session_id)
    WHERE session_id IS NOT NULL;
CREATE INDEX idx_conversion_events_user_id     ON public.conversion_events (user_id)
    WHERE user_id IS NOT NULL;
CREATE INDEX idx_conversion_events_event_type  ON public.conversion_events (event_type);
CREATE INDEX idx_conversion_events_created_at  ON public.conversion_events (created_at DESC);

-- ---------------------------------------------------------------------------
-- 6. Daily Sales Summary (Materialized View)
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW public.daily_sales_summary AS
SELECT
    DATE(o.placed_at)                               AS sale_date,
    COUNT(DISTINCT o.id)                             AS total_orders,
    COUNT(DISTINCT o.user_id)                        AS unique_customers,
    SUM(o.total_amount)                              AS total_revenue,
    SUM(o.discount_amount)                           AS total_discounts,
    SUM(o.shipping_amount)                           AS total_shipping,
    SUM(o.tax_amount)                                AS total_tax,
    ROUND(AVG(o.total_amount)::NUMERIC, 0)           AS avg_order_value,
    COUNT(*) FILTER (WHERE o.status = 'cancelled')   AS cancelled_orders,
    COUNT(*) FILTER (WHERE o.status = 'delivered')   AS delivered_orders
FROM public.orders o
GROUP BY DATE(o.placed_at);

CREATE UNIQUE INDEX idx_daily_sales_summary_date
    ON public.daily_sales_summary (sale_date);

COMMENT ON MATERIALIZED VIEW public.daily_sales_summary
    IS 'Pre-aggregated daily sales KPIs. Refresh with: REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales_summary;';
