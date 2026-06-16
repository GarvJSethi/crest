-- ============================================================================
-- Migration 00003: Categories & Tags
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Categories (self-referencing for parent → child hierarchy)
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
