-- ============================================================================
-- CREST — Seed Products Data
-- ============================================================================

-- 1. Insert Products
INSERT INTO public.products (id, name, slug, description, short_description, category_id, brand, base_price, is_active, is_featured, is_new_arrival) VALUES
  ('p0000001-0000-0000-0000-000000000001', 'Premium Oxford Cotton Shirt', 'premium-oxford-cotton-shirt', 'A classic wardrobe staple. This Oxford cotton shirt offers unparalleled comfort and a timeless fit.', 'Classic Oxford cotton shirt.', 'c0000001-0000-0000-0000-000000000001', 'Crest Originals', 299900, true, true, true),
  ('p0000001-0000-0000-0000-000000000002', 'Heavyweight Essential Tee', 'heavyweight-essential-tee', 'Crafted from 100% premium heavyweight cotton, designed to maintain its shape wash after wash.', 'Durable heavyweight cotton t-shirt.', 'c0000001-0000-0000-0000-000000000002', 'Crest Basics', 149900, true, false, true),
  ('p0000001-0000-0000-0000-000000000003', 'Japanese Selvedge Denim', 'japanese-selvedge-denim', 'Raw Japanese selvedge denim that will naturally fade and mold to your body over time.', 'Raw Japanese selvedge denim jeans.', 'c0000001-0000-0000-0000-000000000003', 'Crest Heritage', 599900, true, true, false),
  ('p0000001-0000-0000-0000-000000000004', 'Classic Aviator Sunglasses', 'classic-aviator-sunglasses', 'Timeless aviator shades featuring polarized lenses and a lightweight metal frame.', 'Polarized classic aviator sunglasses.', 'c0000001-0000-0000-0000-000000000008', 'Crest Accessories', 199900, true, false, false);

-- 2. Insert Variants
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, price_override) VALUES
  ('p0000001-0000-0000-0000-000000000001', 'OXF-WHT-M', 'M', 'White', '#FFFFFF', null),
  ('p0000001-0000-0000-0000-000000000001', 'OXF-WHT-L', 'L', 'White', '#FFFFFF', null),
  ('p0000001-0000-0000-0000-000000000001', 'OXF-BLU-M', 'M', 'Light Blue', '#ADD8E6', null),
  
  ('p0000001-0000-0000-0000-000000000002', 'TEE-BLK-S', 'S', 'Black', '#000000', null),
  ('p0000001-0000-0000-0000-000000000002', 'TEE-BLK-M', 'M', 'Black', '#000000', null),
  ('p0000001-0000-0000-0000-000000000002', 'TEE-BLK-L', 'L', 'Black', '#000000', null),

  ('p0000001-0000-0000-0000-000000000003', 'DNM-IND-32', '32', 'Indigo', '#4B0082', null),
  ('p0000001-0000-0000-0000-000000000003', 'DNM-IND-34', '34', 'Indigo', '#4B0082', null),

  ('p0000001-0000-0000-0000-000000000004', 'AVI-GLD-OS', 'OS', 'Gold/Green', '#FFD700', null);

-- 3. Insert Images
INSERT INTO public.product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('p0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', 'White Oxford Shirt', 1, true),
  ('p0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80', 'Blue Oxford Shirt', 2, false),
  
  ('p0000001-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'Black Heavyweight Tee', 1, true),
  
  ('p0000001-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', 'Japanese Selvedge Denim', 1, true),
  
  ('p0000001-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', 'Classic Aviator Sunglasses', 1, true);

-- 4. Insert Inventory
INSERT INTO public.inventory_locations (id, name, type) VALUES ('loc-001', 'Main Warehouse', 'warehouse') ON CONFLICT DO NOTHING;

INSERT INTO public.inventory (variant_id, location_id, quantity)
SELECT id, 'loc-001', 50 FROM public.product_variants;
