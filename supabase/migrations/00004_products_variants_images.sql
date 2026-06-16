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

    -- Pricing (stored in paise: ₹599 = 59900)
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
COMMENT ON COLUMN public.products.base_price IS 'Price in paise (₹599 = 59900).';

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

COMMENT ON TABLE  public.product_variants IS 'Size × color variants for each product.';
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
-- 4. Product ↔ Tags Junction
-- ---------------------------------------------------------------------------
CREATE TABLE public.product_tags (
    product_id  UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
    tag_id      UUID NOT NULL REFERENCES public.tags    (id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

COMMENT ON TABLE public.product_tags IS 'Many-to-many join between products and tags.';

-- Indexes
CREATE INDEX idx_product_tags_tag_id ON public.product_tags (tag_id);
