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
COMMENT ON COLUMN public.profiles.id IS 'Mirrors auth.users.id — 1-to-1 relationship.';

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
