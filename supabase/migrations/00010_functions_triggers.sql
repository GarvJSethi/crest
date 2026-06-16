-- ============================================================================
-- Migration 00010: Functions & Triggers
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. is_admin()  — cached auth check, SECURITY DEFINER
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
-- 2. is_super_admin()  — cached auth check, SECURITY DEFINER
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
-- 3. handle_new_user()  — auto-create profile on sign-up
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
-- 4. update_updated_at()  — generic "touch" trigger
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
-- 5. generate_order_number()  — ORD-YYYYMMDD-XXXXX
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
-- 6. products_search_vector_update()  — maintain tsvector
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
