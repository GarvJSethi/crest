-- ============================================================================
-- Migration 00011: Row Level Security (RLS) Policies
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================
-- Convention:
--   (SELECT auth.uid())  — cached subquery, avoids per-row function calls.
--   public.is_admin()    — SECURITY DEFINER helper from migration 00010.
-- ============================================================================

-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  ENABLE RLS ON EVERY TABLE                                              ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝
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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  1. PROFILES                                                            ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  2. ADDRESSES                                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  3. CATEGORIES                                                          ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  4. TAGS                                                                ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  5. PRODUCTS                                                            ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  6. PRODUCT VARIANTS                                                    ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  7. PRODUCT IMAGES                                                      ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  8. PRODUCT TAGS                                                        ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

CREATE POLICY product_tags_select_public ON public.product_tags
    FOR SELECT USING (TRUE);

CREATE POLICY product_tags_insert_admin ON public.product_tags
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY product_tags_delete_admin ON public.product_tags
    FOR DELETE USING (public.is_admin());


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  9. INVENTORY                                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  10. INVENTORY LOGS (admin only)                                        ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

CREATE POLICY inventory_logs_select_admin ON public.inventory_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY inventory_logs_insert_admin ON public.inventory_logs
    FOR INSERT WITH CHECK (public.is_admin());


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  11. COUPONS                                                            ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  12. COUPON USAGE                                                       ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

CREATE POLICY coupon_usage_select_own ON public.coupon_usage
    FOR SELECT USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY coupon_usage_insert_own ON public.coupon_usage
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  13. ORDERS                                                             ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  14. ORDER ITEMS                                                        ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  15. ORDER STATUS HISTORY                                               ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  16. PAYMENTS                                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  17. REFUNDS                                                            ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  18. WEBHOOK EVENTS                                                     ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

-- Only admins can read; service_role bypasses RLS for inserts
CREATE POLICY webhook_events_select_admin ON public.webhook_events
    FOR SELECT USING (public.is_admin());

-- service_role inserts bypass RLS, but we also allow admin insert
CREATE POLICY webhook_events_insert_admin ON public.webhook_events
    FOR INSERT WITH CHECK (public.is_admin());


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  19. CART ITEMS                                                         ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  20. WISHLIST ITEMS                                                     ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

CREATE POLICY wishlist_items_select_own ON public.wishlist_items
    FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY wishlist_items_insert_own ON public.wishlist_items
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY wishlist_items_delete_own ON public.wishlist_items
    FOR DELETE USING (user_id = (SELECT auth.uid()));


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  21. REVIEWS                                                            ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  22. SEO PAGES                                                          ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  23. WEBSITE SESSIONS                                                   ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

-- Anyone (anon + auth) can create sessions; admins can read
CREATE POLICY sessions_insert_any ON public.website_sessions
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY sessions_select_admin ON public.website_sessions
    FOR SELECT USING (public.is_admin());

CREATE POLICY sessions_update_any ON public.website_sessions
    FOR UPDATE USING (TRUE) WITH CHECK (TRUE);


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  24. PAGE VIEWS                                                         ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

CREATE POLICY page_views_insert_any ON public.page_views
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY page_views_select_admin ON public.page_views
    FOR SELECT USING (public.is_admin());


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  25. PRODUCT VIEW COUNTS                                                ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  26. CONVERSION EVENTS                                                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

CREATE POLICY conversion_events_insert_any ON public.conversion_events
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY conversion_events_select_admin ON public.conversion_events
    FOR SELECT USING (public.is_admin());
