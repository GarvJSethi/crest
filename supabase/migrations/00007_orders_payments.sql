-- ============================================================================
-- Migration 00007: Orders, Order Items, Status History, Payments, Refunds,
--                  Webhook Events
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Orders
-- ---------------------------------------------------------------------------
CREATE TABLE public.orders (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number        TEXT            NOT NULL UNIQUE,
    user_id             UUID            NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
    status              public.order_status NOT NULL DEFAULT 'pending',

    -- Snapshot of addresses at order time (immutable after placement)
    shipping_address    JSONB           NOT NULL,
    billing_address     JSONB           NOT NULL,

    -- Monetary values in paise
    subtotal            INTEGER         NOT NULL CHECK (subtotal >= 0),
    discount_amount     INTEGER         NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    shipping_amount     INTEGER         NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    tax_amount          INTEGER         NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount        INTEGER         NOT NULL CHECK (total_amount >= 0),

    coupon_id           UUID            REFERENCES public.coupons (id) ON DELETE SET NULL,
    razorpay_order_id   TEXT,

    -- Shipping
    tracking_number     TEXT,
    shipping_carrier    TEXT,
    estimated_delivery  DATE,

    -- Notes
    customer_notes      TEXT,
    admin_notes         TEXT,

    -- Lifecycle timestamps
    placed_at           TIMESTAMPTZ     NOT NULL DEFAULT now(),
    confirmed_at        TIMESTAMPTZ,
    shipped_at          TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,

    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT orders_total_check CHECK (
        total_amount = subtotal - discount_amount + shipping_amount + tax_amount
    )
);

COMMENT ON TABLE  public.orders IS 'Customer orders. All monetary values in paise.';
COMMENT ON COLUMN public.orders.order_number IS 'Human-readable order identifier (ORD-YYYYMMDD-XXXXX).';

-- Indexes
CREATE INDEX idx_orders_user_id           ON public.orders (user_id);
CREATE INDEX idx_orders_status            ON public.orders (status);
CREATE INDEX idx_orders_order_number      ON public.orders (order_number);
CREATE INDEX idx_orders_placed_at         ON public.orders (placed_at DESC);
CREATE INDEX idx_orders_razorpay_order_id ON public.orders (razorpay_order_id)
    WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX idx_orders_coupon_id         ON public.orders (coupon_id)
    WHERE coupon_id IS NOT NULL;
CREATE INDEX idx_orders_tracking          ON public.orders (tracking_number)
    WHERE tracking_number IS NOT NULL;

-- Back-fill the FK from coupon_usage.order_id to orders.id
ALTER TABLE public.coupon_usage
    ADD CONSTRAINT fk_coupon_usage_order_id
    FOREIGN KEY (order_id) REFERENCES public.orders (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 2. Order Items
-- ---------------------------------------------------------------------------
CREATE TABLE public.order_items (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id            UUID        NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
    variant_id          UUID        REFERENCES public.product_variants (id) ON DELETE SET NULL,

    -- Product snapshot (preserved even if product is later deleted)
    product_name        TEXT        NOT NULL,
    variant_sku         TEXT        NOT NULL,
    variant_size        TEXT,
    variant_color       TEXT,
    product_image_url   TEXT,

    -- Pricing in paise
    unit_price          INTEGER     NOT NULL CHECK (unit_price >= 0),
    quantity            INTEGER     NOT NULL CHECK (quantity > 0),
    discount_amount     INTEGER     NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount          INTEGER     NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_price         INTEGER     NOT NULL CHECK (total_price >= 0),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_items IS 'Line items for an order, with product snapshots.';

-- Indexes
CREATE INDEX idx_order_items_order_id   ON public.order_items (order_id);
CREATE INDEX idx_order_items_variant_id ON public.order_items (variant_id) WHERE variant_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Order Status History
-- ---------------------------------------------------------------------------
CREATE TABLE public.order_status_history (
    id          UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID                NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
    from_status public.order_status,
    to_status   public.order_status NOT NULL,
    changed_by  UUID                REFERENCES public.profiles (id) ON DELETE SET NULL,
    note        TEXT,
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_status_history IS 'Audit trail for every order status transition.';

-- Indexes
CREATE INDEX idx_order_status_history_order_id   ON public.order_status_history (order_id);
CREATE INDEX idx_order_status_history_created_at ON public.order_status_history (created_at DESC);

-- ---------------------------------------------------------------------------
-- 4. Payments (Razorpay-centric)
-- ---------------------------------------------------------------------------
CREATE TABLE public.payments (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id                UUID            NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
    user_id                 UUID            NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
    razorpay_payment_id     TEXT            UNIQUE,
    razorpay_order_id       TEXT,
    razorpay_signature      TEXT,
    amount                  INTEGER         NOT NULL CHECK (amount > 0),      -- paise
    status                  public.payment_status NOT NULL DEFAULT 'created',
    method                  public.payment_method,
    bank                    TEXT,
    wallet                  TEXT,
    vpa                     TEXT,           -- UPI virtual payment address
    error_code              TEXT,
    error_description       TEXT,
    raw_response            JSONB,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payments IS 'Razorpay payment records. Amount in paise.';

-- Indexes
CREATE INDEX idx_payments_order_id       ON public.payments (order_id);
CREATE INDEX idx_payments_user_id        ON public.payments (user_id);
CREATE INDEX idx_payments_razorpay_pid   ON public.payments (razorpay_payment_id)
    WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX idx_payments_status         ON public.payments (status);
CREATE INDEX idx_payments_created_at     ON public.payments (created_at DESC);

-- ---------------------------------------------------------------------------
-- 5. Refunds
-- ---------------------------------------------------------------------------
CREATE TABLE public.refunds (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id          UUID            NOT NULL REFERENCES public.payments (id) ON DELETE CASCADE,
    order_id            UUID            NOT NULL REFERENCES public.orders   (id) ON DELETE CASCADE,
    razorpay_refund_id  TEXT            UNIQUE,
    amount              INTEGER         NOT NULL CHECK (amount > 0),          -- paise
    status              public.refund_status NOT NULL DEFAULT 'pending',
    reason              TEXT,
    raw_response        JSONB,
    initiated_by        UUID            REFERENCES public.profiles (id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.refunds IS 'Refund records linked to a payment and order.';

-- Indexes
CREATE INDEX idx_refunds_payment_id     ON public.refunds (payment_id);
CREATE INDEX idx_refunds_order_id       ON public.refunds (order_id);
CREATE INDEX idx_refunds_status         ON public.refunds (status);
CREATE INDEX idx_refunds_razorpay_rid   ON public.refunds (razorpay_refund_id)
    WHERE razorpay_refund_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 6. Webhook Events (Razorpay event ingestion)
-- ---------------------------------------------------------------------------
CREATE TABLE public.webhook_events (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type          TEXT        NOT NULL,
    razorpay_event_id   TEXT,
    payload             JSONB       NOT NULL,
    is_processed        BOOLEAN     NOT NULL DEFAULT FALSE,
    error_message       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at        TIMESTAMPTZ
);

COMMENT ON TABLE public.webhook_events IS 'Raw Razorpay webhook payloads for idempotent processing.';

-- Indexes
CREATE INDEX idx_webhook_events_event_type      ON public.webhook_events (event_type);
CREATE INDEX idx_webhook_events_razorpay_eid    ON public.webhook_events (razorpay_event_id)
    WHERE razorpay_event_id IS NOT NULL;
CREATE INDEX idx_webhook_events_is_processed    ON public.webhook_events (is_processed) WHERE is_processed = FALSE;
CREATE INDEX idx_webhook_events_created_at      ON public.webhook_events (created_at DESC);
