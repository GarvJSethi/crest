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

COMMENT ON TABLE public.cart_items IS 'Server-side cart: one row per user × variant.';

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

COMMENT ON TABLE public.reviews IS 'Product reviews — one per user per product.';

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
