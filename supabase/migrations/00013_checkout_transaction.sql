-- ============================================================================
-- Migration 00013: Checkout Transaction RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_order_transaction(
    p_user_id UUID,
    p_order_number TEXT,
    p_subtotal INTEGER,
    p_shipping_amount INTEGER,
    p_tax_amount INTEGER,
    p_total_amount INTEGER,
    p_shipping_address JSONB,
    p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
    v_variant_id UUID;
    v_quantity INTEGER;
    v_current_stock INTEGER;
BEGIN
    -- 1. Loop through items to verify and deduct inventory
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_variant_id := (v_item->>'variant_id')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;

        -- Get current stock with an exclusive row lock to prevent race conditions
        SELECT quantity INTO v_current_stock 
        FROM public.inventory 
        WHERE variant_id = v_variant_id 
        FOR UPDATE;

        IF v_current_stock IS NULL THEN
            RAISE EXCEPTION 'Inventory record not found for variant %', v_variant_id;
        END IF;

        IF v_current_stock < v_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for variant %. Available: %, Requested: %', v_variant_id, v_current_stock, v_quantity;
        END IF;

        -- Deduct inventory
        UPDATE public.inventory
        SET quantity = quantity - v_quantity,
            updated_at = now()
        WHERE variant_id = v_variant_id;

        -- Log inventory change
        INSERT INTO public.inventory_logs (
            variant_id, change_quantity, reason, previous_quantity, new_quantity, created_by
        ) VALUES (
            v_variant_id, -v_quantity, 'order_placed', v_current_stock, v_current_stock - v_quantity, p_user_id
        );
    END LOOP;

    -- 2. Insert Order
    INSERT INTO public.orders (
        user_id, order_number, status, shipping_address, billing_address,
        subtotal, shipping_amount, tax_amount, total_amount
    ) VALUES (
        p_user_id, p_order_number, 'confirmed', p_shipping_address, p_shipping_address,
        p_subtotal, p_shipping_amount, p_tax_amount, p_total_amount
    ) RETURNING id INTO v_order_id;

    -- 3. Insert Order Items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id, variant_id, product_name, variant_sku, variant_size, variant_color,
            product_image_url, unit_price, quantity, total_price, discount_amount, tax_amount
        ) VALUES (
            v_order_id,
            (v_item->>'variant_id')::UUID,
            v_item->>'product_name',
            v_item->>'variant_sku',
            v_item->>'variant_size',
            v_item->>'variant_color',
            v_item->>'product_image_url',
            (v_item->>'unit_price')::INTEGER,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'total_price')::INTEGER,
            0,
            0
        );
    END LOOP;

    RETURN v_order_id;
END;
$$;
