-- ============================================================================
-- Migration 00001: Extensions & ENUM Types
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"  SCHEMA public;   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto"   SCHEMA public;   -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS "pg_trgm"    SCHEMA public;   -- trigram similarity / GIN indexes

-- ---------------------------------------------------------------------------
-- 2. ENUM types
-- ---------------------------------------------------------------------------

-- User roles
CREATE TYPE public.user_role AS ENUM (
    'customer',
    'admin',
    'super_admin'
);

-- Order lifecycle
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned',
    'refund_initiated',
    'refunded'
);

-- Razorpay payment states
CREATE TYPE public.payment_status AS ENUM (
    'created',
    'authorized',
    'captured',
    'failed',
    'refunded',
    'partially_refunded'
);

-- Payment instruments
CREATE TYPE public.payment_method AS ENUM (
    'card',
    'upi',
    'netbanking',
    'wallet',
    'emi',
    'cod'
);

-- Refund lifecycle
CREATE TYPE public.refund_status AS ENUM (
    'pending',
    'processed',
    'failed'
);

-- Coupon discount strategy
CREATE TYPE public.discount_type AS ENUM (
    'percentage',
    'fixed_amount'
);

-- Address classification
CREATE TYPE public.address_type AS ENUM (
    'shipping',
    'billing'
);
-- ============================================================================
-- Migration 00002: Profiles & Addresses
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id          UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email       TEXT        NOT NULL,
    full_name   TEXT,
    phone       TEXT,
    avatar_url  TEXT,
    role        public.user_role NOT NULL DEFAULT 'customer',
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    date_of_birth DATE,
    gender      TEXT        NOT NULL DEFAULT 'male'
                            CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT profiles_email_check  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT profiles_phone_check  CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{10,15}$')
);

COMMENT ON TABLE  public.profiles IS 'User profiles, auto-created on sign-up via trigger.';
COMMENT ON COLUMN public.profiles.id IS 'Mirrors auth.users.id â€” 1-to-1 relationship.';

-- Indexes
CREATE INDEX idx_profiles_email     ON public.profiles (email);
CREATE INDEX idx_profiles_role      ON public.profiles (role);
CREATE INDEX idx_profiles_phone     ON public.profiles (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_profiles_is_active ON public.profiles (is_active) WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- 2. Addresses
-- ---------------------------------------------------------------------------
CREATE TABLE public.addresses (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    address_type    public.address_type NOT NULL DEFAULT 'shipping',
    full_name       TEXT        NOT NULL,
    phone           TEXT        NOT NULL
                                CHECK (phone ~ '^\+?[0-9]{10,15}$'),
    address_line_1  TEXT        NOT NULL,
    address_line_2  TEXT,
    city            TEXT        NOT NULL,
    state           TEXT        NOT NULL,
    postal_code     TEXT        NOT NULL
                                CHECK (postal_code ~ '^[0-9]{5,10}$'),
    country         TEXT        NOT NULL DEFAULT 'IN',
    landmark        TEXT,
    is_default      BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.addresses IS 'Shipping / billing addresses for users.';

-- Indexes
CREATE INDEX idx_addresses_user_id    ON public.addresses (user_id);
CREATE INDEX idx_addresses_type       ON public.addresses (user_id, address_type);
CREATE INDEX idx_addresses_is_default ON public.addresses (user_id, is_default) WHERE is_default = TRUE;
-- ============================================================================
-- Migration 00003: Categories & Tags
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Categories (self-referencing for parent â†’ child hierarchy)
-- ---------------------------------------------------------------------------
CREATE TABLE public.categories (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id       UUID        REFERENCES public.categories (id) ON DELETE SET NULL,
    name            TEXT        NOT NULL,
    slug            TEXT        NOT NULL UNIQUE,
    description     TEXT,
    image_url       TEXT,
    display_order   INTEGER     NOT NULL DEFAULT 0,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT categories_name_length  CHECK (char_length(name) BETWEEN 1 AND 255),
    CONSTRAINT categories_slug_format  CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT categories_no_self_ref  CHECK (id <> parent_id)
);

COMMENT ON TABLE public.categories IS 'Product categories with optional parent for subcategory hierarchy.';

-- Indexes
CREATE INDEX idx_categories_parent_id     ON public.categories (parent_id);
CREATE INDEX idx_categories_slug          ON public.categories (slug);
CREATE INDEX idx_categories_display_order ON public.categories (display_order);
CREATE INDEX idx_categories_is_active     ON public.categories (is_active) WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- 2. Tags
-- ---------------------------------------------------------------------------
CREATE TABLE public.tags (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT    NOT NULL UNIQUE,
    slug        TEXT    NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT tags_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
    CONSTRAINT tags_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

COMMENT ON TABLE public.tags IS 'Freeform tags that can be associated with products.';

-- Indexes
CREATE INDEX idx_tags_slug ON public.tags (slug);
CREATE INDEX idx_tags_name_trgm ON public.tags USING gin (name gin_trgm_ops);
-- ============================================================================
-- Migration 00004: Products, Variants, Images & Product-Tags Junction
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Products
-- ---------------------------------------------------------------------------
CREATE TABLE public.products (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT        NOT NULL,
    slug                TEXT        NOT NULL UNIQUE,
    description         TEXT,
    short_description   TEXT,
    category_id         UUID        REFERENCES public.categories (id) ON DELETE SET NULL,
    brand               TEXT,
    material            TEXT,
    care_instructions   TEXT,

    -- Pricing (stored in paise: â‚¹599 = 59900)
    base_price          INTEGER     NOT NULL CHECK (base_price >= 0),
    compare_at_price    INTEGER     CHECK (compare_at_price IS NULL OR compare_at_price >= 0),

    -- Flags
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    is_featured         BOOLEAN     NOT NULL DEFAULT FALSE,
    is_new_arrival      BOOLEAN     NOT NULL DEFAULT FALSE,

    -- Physical
    weight_grams        INTEGER     CHECK (weight_grams IS NULL OR weight_grams > 0),

    -- SEO
    meta_title          TEXT,
    meta_description    TEXT,
    meta_keywords       TEXT[],
    og_image_url        TEXT,

    -- Full-text search
    search_vector       TSVECTOR,

    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT products_name_length         CHECK (char_length(name) BETWEEN 1 AND 500),
    CONSTRAINT products_slug_format         CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT products_compare_price_check CHECK (
        compare_at_price IS NULL OR compare_at_price > base_price
    )
);

COMMENT ON TABLE  public.products IS 'Master product catalog. Prices in paise.';
COMMENT ON COLUMN public.products.base_price IS 'Price in paise (â‚¹599 = 59900).';

-- Indexes
CREATE INDEX idx_products_category_id   ON public.products (category_id);
CREATE INDEX idx_products_slug          ON public.products (slug);
CREATE INDEX idx_products_is_active     ON public.products (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_is_featured   ON public.products (is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_is_new        ON public.products (is_new_arrival) WHERE is_new_arrival = TRUE;
CREATE INDEX idx_products_base_price    ON public.products (base_price);
CREATE INDEX idx_products_brand         ON public.products (brand) WHERE brand IS NOT NULL;
CREATE INDEX idx_products_created_at    ON public.products (created_at DESC);

-- GIN indexes for full-text and trigram search
CREATE INDEX idx_products_search_vector ON public.products USING gin (search_vector);
CREATE INDEX idx_products_name_trgm     ON public.products USING gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- 2. Product Variants
-- ---------------------------------------------------------------------------
CREATE TABLE public.product_variants (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID        NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
    sku             TEXT        NOT NULL UNIQUE,
    size            TEXT,
    color           TEXT,
    color_hex       TEXT        CHECK (color_hex IS NULL OR color_hex ~ '^#[0-9A-Fa-f]{6}$'),
    attributes      JSONB       DEFAULT '{}'::JSONB,
    price_override  INTEGER     CHECK (price_override IS NULL OR price_override >= 0),
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT product_variants_sku_length CHECK (char_length(sku) BETWEEN 1 AND 100),
    CONSTRAINT product_variants_unique_combo UNIQUE (product_id, size, color)
);

COMMENT ON TABLE  public.product_variants IS 'Size Ã— color variants for each product.';
COMMENT ON COLUMN public.product_variants.price_override IS 'If set, overrides the product base_price (in paise).';

-- Indexes
CREATE INDEX idx_product_variants_product_id ON public.product_variants (product_id);
CREATE INDEX idx_product_variants_sku        ON public.product_variants (sku);
CREATE INDEX idx_product_variants_size       ON public.product_variants (size) WHERE size IS NOT NULL;
CREATE INDEX idx_product_variants_color      ON public.product_variants (color) WHERE color IS NOT NULL;
CREATE INDEX idx_product_variants_is_active  ON public.product_variants (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_product_variants_attrs      ON public.product_variants USING gin (attributes);

-- ---------------------------------------------------------------------------
-- 3. Product Images
-- ---------------------------------------------------------------------------
CREATE TABLE public.product_images (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID        NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
    url             TEXT        NOT NULL,
    alt_text        TEXT,
    display_order   INTEGER     NOT NULL DEFAULT 0,
    is_primary      BOOLEAN     NOT NULL DEFAULT FALSE,
    color_variant   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_images IS 'Product gallery images, optionally linked to a color variant.';

-- Indexes
CREATE INDEX idx_product_images_product_id    ON public.product_images (product_id);
CREATE INDEX idx_product_images_display_order ON public.product_images (product_id, display_order);
CREATE INDEX idx_product_images_is_primary    ON public.product_images (product_id, is_primary)
    WHERE is_primary = TRUE;
CREATE INDEX idx_product_images_color_variant ON public.product_images (product_id, color_variant)
    WHERE color_variant IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 4. Product â†” Tags Junction
-- ---------------------------------------------------------------------------
CREATE TABLE public.product_tags (
    product_id  UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
    tag_id      UUID NOT NULL REFERENCES public.tags    (id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

COMMENT ON TABLE public.product_tags IS 'Many-to-many join between products and tags.';

-- Indexes
CREATE INDEX idx_product_tags_tag_id ON public.product_tags (tag_id);
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

COMMENT ON TABLE  public.coupons IS 'Discount coupons. discount_value is paise for fixed_amount, basis points (Ã—100) for percentage.';

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
-- ============================================================================
-- Migration 00008: Cart, Wishlist & Reviews
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Cart Items
-- ---------------------------------------------------------------------------
CREATE TABLE public.cart_items (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    variant_id  UUID        NOT NULL REFERENCES public.product_variants (id) ON DELETE CASCADE,
    quantity    INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT cart_items_unique_user_variant UNIQUE (user_id, variant_id)
);

COMMENT ON TABLE public.cart_items IS 'Server-side cart: one row per user Ã— variant.';

-- Indexes
CREATE INDEX idx_cart_items_user_id    ON public.cart_items (user_id);
CREATE INDEX idx_cart_items_variant_id ON public.cart_items (variant_id);

-- ---------------------------------------------------------------------------
-- 2. Wishlist Items
-- ---------------------------------------------------------------------------
CREATE TABLE public.wishlist_items (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    product_id  UUID        NOT NULL REFERENCES public.products  (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT wishlist_items_unique_user_product UNIQUE (user_id, product_id)
);

COMMENT ON TABLE public.wishlist_items IS 'Products a user has wishlisted.';

-- Indexes
CREATE INDEX idx_wishlist_items_user_id    ON public.wishlist_items (user_id);
CREATE INDEX idx_wishlist_items_product_id ON public.wishlist_items (product_id);

-- ---------------------------------------------------------------------------
-- 3. Reviews
-- ---------------------------------------------------------------------------
CREATE TABLE public.reviews (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id          UUID        NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
    user_id             UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    order_item_id       UUID        REFERENCES public.order_items (id) ON DELETE SET NULL,
    rating              SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title               TEXT,
    body                TEXT,
    is_verified_purchase BOOLEAN    NOT NULL DEFAULT FALSE,
    is_approved         BOOLEAN     NOT NULL DEFAULT FALSE,
    admin_reply         TEXT,
    helpful_count       INTEGER     NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT reviews_unique_user_product UNIQUE (user_id, product_id),
    CONSTRAINT reviews_title_length        CHECK (title IS NULL OR char_length(title) BETWEEN 1 AND 255),
    CONSTRAINT reviews_body_length         CHECK (body  IS NULL OR char_length(body)  <= 5000)
);

COMMENT ON TABLE public.reviews IS 'Product reviews â€” one per user per product.';

-- Indexes
CREATE INDEX idx_reviews_product_id      ON public.reviews (product_id);
CREATE INDEX idx_reviews_user_id         ON public.reviews (user_id);
CREATE INDEX idx_reviews_is_approved     ON public.reviews (product_id, is_approved)
    WHERE is_approved = TRUE;
CREATE INDEX idx_reviews_rating          ON public.reviews (product_id, rating);
CREATE INDEX idx_reviews_created_at      ON public.reviews (created_at DESC);
CREATE INDEX idx_reviews_order_item_id   ON public.reviews (order_item_id) WHERE order_item_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 4. Product Rating Summary (Materialized View)
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW public.product_rating_summary AS
SELECT
    r.product_id,
    COUNT(*)                                    AS review_count,
    ROUND(AVG(r.rating)::NUMERIC, 2)           AS average_rating,
    COUNT(*) FILTER (WHERE r.rating = 5)        AS five_star_count,
    COUNT(*) FILTER (WHERE r.rating = 4)        AS four_star_count,
    COUNT(*) FILTER (WHERE r.rating = 3)        AS three_star_count,
    COUNT(*) FILTER (WHERE r.rating = 2)        AS two_star_count,
    COUNT(*) FILTER (WHERE r.rating = 1)        AS one_star_count
FROM public.reviews r
WHERE r.is_approved = TRUE
GROUP BY r.product_id;

CREATE UNIQUE INDEX idx_product_rating_summary_product_id
    ON public.product_rating_summary (product_id);

COMMENT ON MATERIALIZED VIEW public.product_rating_summary
    IS 'Pre-computed rating aggregates per product. Refresh with: REFRESH MATERIALIZED VIEW CONCURRENTLY product_rating_summary;';
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
-- ============================================================================
-- Migration 00010: Functions & Triggers
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. is_admin()  â€” cached auth check, SECURITY DEFINER
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
          AND role IN ('admin', 'super_admin')
          AND is_active = TRUE
    );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Returns TRUE if the calling user has admin or super_admin role.';

-- ---------------------------------------------------------------------------
-- 2. is_super_admin()  â€” cached auth check, SECURITY DEFINER
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
          AND role = 'super_admin'
          AND is_active = TRUE
    );
$$;

COMMENT ON FUNCTION public.is_super_admin() IS 'Returns TRUE if the calling user is a super_admin.';

-- ---------------------------------------------------------------------------
-- 3. handle_new_user()  â€” auto-create profile on sign-up
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.raw_user_meta_data ->> 'name',
            ''
        ),
        COALESCE(
            NEW.raw_user_meta_data ->> 'avatar_url',
            NEW.raw_user_meta_data ->> 'picture',
            NULL
        ),
        'customer',
        TRUE
    );
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function: auto-creates a profile row when a new auth.users row is inserted.';

-- Attach trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. update_updated_at()  â€” generic "touch" trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at() IS 'Sets updated_at = now() on every UPDATE.';

-- Apply the trigger to every mutable table that has an updated_at column
DO $$
DECLARE
    _tbl TEXT;
BEGIN
    FOR _tbl IN
        SELECT unnest(ARRAY[
            'profiles',
            'addresses',
            'categories',
            'products',
            'product_variants',
            'inventory',
            'coupons',
            'orders',
            'cart_items',
            'reviews',
            'payments',
            'refunds',
            'seo_pages'
        ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%I_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION public.update_updated_at();',
            _tbl, _tbl
        );
    END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. generate_order_number()  â€” ORD-YYYYMMDD-XXXXX
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    _date_part TEXT;
    _seq       INTEGER;
BEGIN
    _date_part := to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYYMMDD');

    -- Count orders placed today (IST) + 1
    SELECT COUNT(*) + 1
      INTO _seq
      FROM public.orders
     WHERE DATE(placed_at AT TIME ZONE 'Asia/Kolkata') = CURRENT_DATE;

    NEW.order_number := 'ORD-' || _date_part || '-' || lpad(_seq::TEXT, 5, '0');
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.generate_order_number() IS 'Auto-generates order_number in ORD-YYYYMMDD-XXXXX format.';

CREATE TRIGGER trg_orders_generate_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION public.generate_order_number();

-- ---------------------------------------------------------------------------
-- 6. products_search_vector_update()  â€” maintain tsvector
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.products_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')),              'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.brand, '')),             'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')),       'D') ||
        setweight(to_tsvector('english', COALESCE(NEW.material, '')),          'D');
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.products_search_vector_update()
    IS 'Rebuilds the products.search_vector tsvector with weighted fields.';

CREATE TRIGGER trg_products_search_vector
    BEFORE INSERT OR UPDATE OF name, brand, short_description, description, material
    ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.products_search_vector_update();
-- ============================================================================
-- Migration 00011: Row Level Security (RLS) Policies
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================
-- Convention:
--   (SELECT auth.uid())  â€” cached subquery, avoids per-row function calls.
--   public.is_admin()    â€” SECURITY DEFINER helper from migration 00010.
-- ============================================================================

-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  ENABLE RLS ON EVERY TABLE                                              â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
DO $$
DECLARE
    _tbl TEXT;
BEGIN
    FOR _tbl IN
        SELECT unnest(ARRAY[
            'profiles',
            'addresses',
            'categories',
            'tags',
            'products',
            'product_variants',
            'product_images',
            'product_tags',
            'inventory',
            'inventory_logs',
            'coupons',
            'coupon_usage',
            'orders',
            'order_items',
            'order_status_history',
            'payments',
            'refunds',
            'webhook_events',
            'cart_items',
            'wishlist_items',
            'reviews',
            'seo_pages',
            'website_sessions',
            'page_views',
            'product_view_counts',
            'conversion_events'
        ])
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', _tbl);
    END LOOP;
END;
$$;


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  1. PROFILES                                                            â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Anyone can read profiles (public storefront: display names, avatars)
CREATE POLICY profiles_select_public ON public.profiles
    FOR SELECT USING (TRUE);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON public.profiles
    FOR UPDATE
    USING  (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

-- Admins can update any profile
CREATE POLICY profiles_update_admin ON public.profiles
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  2. ADDRESSES                                                           â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Users see/manage only their own addresses
CREATE POLICY addresses_select_own ON public.addresses
    FOR SELECT USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY addresses_insert_own ON public.addresses
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY addresses_update_own ON public.addresses
    FOR UPDATE
    USING  (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY addresses_delete_own ON public.addresses
    FOR DELETE USING (user_id = (SELECT auth.uid()));


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  3. CATEGORIES                                                          â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Public read for active categories
CREATE POLICY categories_select_public ON public.categories
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

-- Admin CRUD
CREATE POLICY categories_insert_admin ON public.categories
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY categories_update_admin ON public.categories
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY categories_delete_admin ON public.categories
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  4. TAGS                                                                â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY tags_select_public ON public.tags
    FOR SELECT USING (TRUE);

CREATE POLICY tags_insert_admin ON public.tags
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY tags_update_admin ON public.tags
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY tags_delete_admin ON public.tags
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  5. PRODUCTS                                                            â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Public: see active products; Admins: see all
CREATE POLICY products_select_public ON public.products
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY products_insert_admin ON public.products
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY products_update_admin ON public.products
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY products_delete_admin ON public.products
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  6. PRODUCT VARIANTS                                                    â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY product_variants_select_public ON public.product_variants
    FOR SELECT USING (
        is_active = TRUE
        OR public.is_admin()
    );

CREATE POLICY product_variants_insert_admin ON public.product_variants
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY product_variants_update_admin ON public.product_variants
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY product_variants_delete_admin ON public.product_variants
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  7. PRODUCT IMAGES                                                      â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY product_images_select_public ON public.product_images
    FOR SELECT USING (TRUE);

CREATE POLICY product_images_insert_admin ON public.product_images
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY product_images_update_admin ON public.product_images
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY product_images_delete_admin ON public.product_images
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  8. PRODUCT TAGS                                                        â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY product_tags_select_public ON public.product_tags
    FOR SELECT USING (TRUE);

CREATE POLICY product_tags_insert_admin ON public.product_tags
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY product_tags_delete_admin ON public.product_tags
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  9. INVENTORY                                                           â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Public can read stock levels (for "in stock" badge)
CREATE POLICY inventory_select_public ON public.inventory
    FOR SELECT USING (TRUE);

CREATE POLICY inventory_insert_admin ON public.inventory
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY inventory_update_admin ON public.inventory
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY inventory_delete_admin ON public.inventory
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  10. INVENTORY LOGS (admin only)                                        â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY inventory_logs_select_admin ON public.inventory_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY inventory_logs_insert_admin ON public.inventory_logs
    FOR INSERT WITH CHECK (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  11. COUPONS                                                            â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Authenticated users can read active, non-expired coupons (for validation)
CREATE POLICY coupons_select_active ON public.coupons
    FOR SELECT USING (
        (is_active = TRUE AND (expires_at IS NULL OR expires_at > now()) AND (SELECT auth.uid()) IS NOT NULL)
        OR public.is_admin()
    );

CREATE POLICY coupons_insert_admin ON public.coupons
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY coupons_update_admin ON public.coupons
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY coupons_delete_admin ON public.coupons
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  12. COUPON USAGE                                                       â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY coupon_usage_select_own ON public.coupon_usage
    FOR SELECT USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY coupon_usage_insert_own ON public.coupon_usage
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  13. ORDERS                                                             â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Users see their own orders; admins see all
CREATE POLICY orders_select_own ON public.orders
    FOR SELECT USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- Users can create their own orders
CREATE POLICY orders_insert_own ON public.orders
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- Admin can update orders (status changes, tracking, notes)
CREATE POLICY orders_update_admin ON public.orders
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

-- Admin can delete orders
CREATE POLICY orders_delete_admin ON public.orders
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  14. ORDER ITEMS                                                        â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- User sees items for their orders
CREATE POLICY order_items_select_own ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
        )
        OR public.is_admin()
    );

CREATE POLICY order_items_insert_own ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
        )
        OR public.is_admin()
    );

CREATE POLICY order_items_update_admin ON public.order_items
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY order_items_delete_admin ON public.order_items
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  15. ORDER STATUS HISTORY                                               â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY order_status_history_select_own ON public.order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
        )
        OR public.is_admin()
    );

CREATE POLICY order_status_history_insert_admin ON public.order_status_history
    FOR INSERT WITH CHECK (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  16. PAYMENTS                                                           â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY payments_select_own ON public.payments
    FOR SELECT USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY payments_insert_admin ON public.payments
    FOR INSERT WITH CHECK (public.is_admin() OR user_id = (SELECT auth.uid()));

CREATE POLICY payments_update_admin ON public.payments
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY payments_delete_admin ON public.payments
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  17. REFUNDS                                                            â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY refunds_select_own ON public.refunds
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.payments p
            WHERE p.id = payment_id AND p.user_id = (SELECT auth.uid())
        )
        OR public.is_admin()
    );

CREATE POLICY refunds_insert_admin ON public.refunds
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY refunds_update_admin ON public.refunds
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY refunds_delete_admin ON public.refunds
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  18. WEBHOOK EVENTS                                                     â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Only admins can read; service_role bypasses RLS for inserts
CREATE POLICY webhook_events_select_admin ON public.webhook_events
    FOR SELECT USING (public.is_admin());

-- service_role inserts bypass RLS, but we also allow admin insert
CREATE POLICY webhook_events_insert_admin ON public.webhook_events
    FOR INSERT WITH CHECK (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  19. CART ITEMS                                                         â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY cart_items_select_own ON public.cart_items
    FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY cart_items_insert_own ON public.cart_items
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY cart_items_update_own ON public.cart_items
    FOR UPDATE
    USING  (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY cart_items_delete_own ON public.cart_items
    FOR DELETE USING (user_id = (SELECT auth.uid()));


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  20. WISHLIST ITEMS                                                     â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY wishlist_items_select_own ON public.wishlist_items
    FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY wishlist_items_insert_own ON public.wishlist_items
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY wishlist_items_delete_own ON public.wishlist_items
    FOR DELETE USING (user_id = (SELECT auth.uid()));


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  21. REVIEWS                                                            â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Public can read approved reviews; users can see their own; admins see all
CREATE POLICY reviews_select_public ON public.reviews
    FOR SELECT USING (
        is_approved = TRUE
        OR user_id = (SELECT auth.uid())
        OR public.is_admin()
    );

-- Users can insert their own review
CREATE POLICY reviews_insert_own ON public.reviews
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can update their own review; admins can update any
CREATE POLICY reviews_update_own ON public.reviews
    FOR UPDATE
    USING  (user_id = (SELECT auth.uid()) OR public.is_admin())
    WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

-- Users can delete their own review; admins can delete any
CREATE POLICY reviews_delete_own ON public.reviews
    FOR DELETE USING (user_id = (SELECT auth.uid()) OR public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  22. SEO PAGES                                                          â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY seo_pages_select_public ON public.seo_pages
    FOR SELECT USING (TRUE);

CREATE POLICY seo_pages_insert_admin ON public.seo_pages
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY seo_pages_update_admin ON public.seo_pages
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY seo_pages_delete_admin ON public.seo_pages
    FOR DELETE USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  23. WEBSITE SESSIONS                                                   â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Anyone (anon + auth) can create sessions; admins can read
CREATE POLICY sessions_insert_any ON public.website_sessions
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY sessions_select_admin ON public.website_sessions
    FOR SELECT USING (public.is_admin());

CREATE POLICY sessions_update_any ON public.website_sessions
    FOR UPDATE USING (TRUE) WITH CHECK (TRUE);


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  24. PAGE VIEWS                                                         â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY page_views_insert_any ON public.page_views
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY page_views_select_admin ON public.page_views
    FOR SELECT USING (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  25. PRODUCT VIEW COUNTS                                                â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Public read (for popularity badges)
CREATE POLICY product_view_counts_select_public ON public.product_view_counts
    FOR SELECT USING (TRUE);

-- Only service_role (bypasses RLS) or admin can update
CREATE POLICY product_view_counts_update_admin ON public.product_view_counts
    FOR UPDATE
    USING  (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY product_view_counts_insert_admin ON public.product_view_counts
    FOR INSERT WITH CHECK (public.is_admin());


-- â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
-- â•‘  26. CONVERSION EVENTS                                                  â•‘
-- â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE POLICY conversion_events_insert_any ON public.conversion_events
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY conversion_events_select_admin ON public.conversion_events
    FOR SELECT USING (public.is_admin());
-- ============================================================================
-- CREST â€” Seed Data
-- ============================================================================
-- Run this after all migrations to populate initial data.
-- ============================================================================

-- â”€â”€ Categories â”€â”€
INSERT INTO public.categories (id, name, slug, description, display_order, is_active) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Shirts',       'shirts',       'Tailored shirts for every occasion â€” casual, formal, and everything in between.', 1, true),
  ('c0000001-0000-0000-0000-000000000002', 'T-Shirts',     't-shirts',     'Premium tees crafted from the softest fabrics.',                                   2, true),
  ('c0000001-0000-0000-0000-000000000003', 'Jeans',         'jeans',         'Premium denim engineered for comfort and style.',                                 3, true),
  ('c0000001-0000-0000-0000-000000000004', 'Cargo Pants',   'cargo-pants',   'Utility-driven cargo pants with a modern edge.',                                 4, true),
  ('c0000001-0000-0000-0000-000000000005', 'Jackets',       'jackets',       'Statement outerwear to complete your look.',                                     5, true),
  ('c0000001-0000-0000-0000-000000000006', 'Belts',         'belts',         'Handcrafted belts in premium leather.',                                           6, true),
  ('c0000001-0000-0000-0000-000000000007', 'Wallets',       'wallets',       'Slim, functional wallets crafted from fine materials.',                           7, true),
  ('c0000001-0000-0000-0000-000000000008', 'Accessories',   'accessories',   'The finishing touches that define your style.',                                   8, true);

-- â”€â”€ Subcategories â€” Shirts â”€â”€
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Casual Shirts',  'casual-shirts',  'Relaxed fits for everyday style',                  'c0000001-0000-0000-0000-000000000001', 1, true),
  ('Formal Shirts',  'formal-shirts',  'Crisp, professional shirts for the office',         'c0000001-0000-0000-0000-000000000001', 2, true),
  ('Linen Shirts',   'linen-shirts',   'Breathable linen for warm days',                    'c0000001-0000-0000-0000-000000000001', 3, true);

-- â”€â”€ Subcategories â€” T-Shirts â”€â”€
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Round Neck',  'round-neck',  'Classic round neck tees',        'c0000001-0000-0000-0000-000000000002', 1, true),
  ('V-Neck',      'v-neck',      'Sleek V-neck silhouettes',       'c0000001-0000-0000-0000-000000000002', 2, true),
  ('Polo',        'polo',        'Smart casual polo shirts',       'c0000001-0000-0000-0000-000000000002', 3, true),
  ('Oversized',   'oversized',   'Trendy oversized fits',          'c0000001-0000-0000-0000-000000000002', 4, true);

-- â”€â”€ Subcategories â€” Jeans â”€â”€
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Slim Fit',     'slim-fit',     'Modern slim fit jeans',          'c0000001-0000-0000-0000-000000000003', 1, true),
  ('Straight Fit', 'straight-fit', 'Classic straight cut',            'c0000001-0000-0000-0000-000000000003', 2, true),
  ('Skinny',       'skinny',       'Body-hugging skinny jeans',       'c0000001-0000-0000-0000-000000000003', 3, true),
  ('Relaxed Fit',  'relaxed-fit',  'Comfortable relaxed jeans',       'c0000001-0000-0000-0000-000000000003', 4, true);

-- â”€â”€ Subcategories â€” Cargo Pants â”€â”€
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Regular Cargo', 'regular-cargo', 'Classic cargo silhouettes',        'c0000001-0000-0000-0000-000000000004', 1, true),
  ('Jogger Cargo',  'jogger-cargo',  'Tapered jogger-style cargo',       'c0000001-0000-0000-0000-000000000004', 2, true);

-- â”€â”€ Subcategories â€” Jackets â”€â”€
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Bomber Jackets',  'bomber-jackets',  'Iconic bomber styles',            'c0000001-0000-0000-0000-000000000005', 1, true),
  ('Denim Jackets',   'denim-jackets',   'Timeless denim outerwear',        'c0000001-0000-0000-0000-000000000005', 2, true),
  ('Leather Jackets', 'leather-jackets', 'Premium leather pieces',          'c0000001-0000-0000-0000-000000000005', 3, true),
  ('Windbreakers',    'windbreakers',    'Lightweight weather protection',   'c0000001-0000-0000-0000-000000000005', 4, true);

-- â”€â”€ Subcategories â€” Belts â”€â”€
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Leather Belts', 'leather-belts', 'Classic leather belts',    'c0000001-0000-0000-0000-000000000006', 1, true),
  ('Canvas Belts',  'canvas-belts',  'Casual canvas styles',     'c0000001-0000-0000-0000-000000000006', 2, true);

-- â”€â”€ Subcategories â€” Wallets â”€â”€
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Bi-Fold',       'bi-fold',       'Classic bi-fold wallets',     'c0000001-0000-0000-0000-000000000007', 1, true),
  ('Card Holders',  'card-holders',  'Minimalist card holders',     'c0000001-0000-0000-0000-000000000007', 2, true);

-- â”€â”€ Subcategories â€” Accessories â”€â”€
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Watches',      'watches',     'Timepieces for the modern man',  'c0000001-0000-0000-0000-000000000008', 1, true),
  ('Sunglasses',   'sunglasses',  'Premium eyewear',                'c0000001-0000-0000-0000-000000000008', 2, true),
  ('Caps & Hats',  'caps-hats',   'Headwear for every season',      'c0000001-0000-0000-0000-000000000008', 3, true),
  ('Bags',         'bags',        'Backpacks, duffels, and more',   'c0000001-0000-0000-0000-000000000008', 4, true);

-- â”€â”€ Common Tags â”€â”€
INSERT INTO public.tags (name, slug) VALUES
  ('New Arrival',   'new-arrival'),
  ('Bestseller',    'bestseller'),
  ('Trending',      'trending'),
  ('Limited Edition', 'limited-edition'),
  ('Sale',          'sale'),
  ('Premium',       'premium'),
  ('Essentials',    'essentials'),
  ('Streetwear',    'streetwear'),
  ('Formal',        'formal'),
  ('Casual',        'casual'),
  ('Summer',        'summer'),
  ('Winter',        'winter'),
  ('Festival',      'festival'),
  ('Office Wear',   'office-wear'),
  ('Party Wear',    'party-wear');
