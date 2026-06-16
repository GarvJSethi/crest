-- ============================================================================
-- CREST — Complete Seed Data (Categories + Products)
-- ============================================================================

-- 0. Clean the slate
DELETE FROM public.tags;
DELETE FROM public.categories;
DELETE FROM public.products;

-- 1. Categories
INSERT INTO public.categories (id, name, slug, description, display_order, is_active) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Shirts',       'shirts',       'Tailored shirts for every occasion — casual, formal, and everything in between.', 1, true),
  ('c0000001-0000-0000-0000-000000000002', 'T-Shirts',     't-shirts',     'Premium tees crafted from the softest fabrics.',                                   2, true),
  ('c0000001-0000-0000-0000-000000000003', 'Jeans',         'jeans',         'Premium denim engineered for comfort and style.',                                 3, true),
  ('c0000001-0000-0000-0000-000000000004', 'Cargo Pants',   'cargo-pants',   'Utility-driven cargo pants with a modern edge.',                                 4, true),
  ('c0000001-0000-0000-0000-000000000005', 'Jackets',       'jackets',       'Statement outerwear to complete your look.',                                     5, true),
  ('c0000001-0000-0000-0000-000000000006', 'Belts',         'belts',         'Handcrafted belts in premium leather.',                                           6, true),
  ('c0000001-0000-0000-0000-000000000007', 'Wallets',       'wallets',       'Slim, functional wallets crafted from fine materials.',                           7, true),
  ('c0000001-0000-0000-0000-000000000008', 'Accessories',   'accessories',   'The finishing touches that define your style.',                                   8, true);

-- 2. Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Casual Shirts',  'casual-shirts',  'Relaxed fits for everyday style',                  'c0000001-0000-0000-0000-000000000001', 1, true),
  ('Formal Shirts',  'formal-shirts',  'Crisp, professional shirts for the office',         'c0000001-0000-0000-0000-000000000001', 2, true),
  ('Linen Shirts',   'linen-shirts',   'Breathable linen for warm days',                    'c0000001-0000-0000-0000-000000000001', 3, true),
  ('Round Neck',  'round-neck',  'Classic round neck tees',        'c0000001-0000-0000-0000-000000000002', 1, true),
  ('V-Neck',      'v-neck',      'Sleek V-neck silhouettes',       'c0000001-0000-0000-0000-000000000002', 2, true),
  ('Polo',        'polo',        'Smart casual polo shirts',       'c0000001-0000-0000-0000-000000000002', 3, true),
  ('Oversized',   'oversized',   'Trendy oversized fits',          'c0000001-0000-0000-0000-000000000002', 4, true),
  ('Slim Fit',     'slim-fit',     'Modern slim fit jeans',          'c0000001-0000-0000-0000-000000000003', 1, true),
  ('Straight Fit', 'straight-fit', 'Classic straight cut',            'c0000001-0000-0000-0000-000000000003', 2, true),
  ('Skinny',       'skinny',       'Body-hugging skinny jeans',       'c0000001-0000-0000-0000-000000000003', 3, true),
  ('Relaxed Fit',  'relaxed-fit',  'Comfortable relaxed jeans',       'c0000001-0000-0000-0000-000000000003', 4, true),
  ('Regular Cargo', 'regular-cargo', 'Classic cargo silhouettes',        'c0000001-0000-0000-0000-000000000004', 1, true),
  ('Jogger Cargo',  'jogger-cargo',  'Tapered jogger-style cargo',       'c0000001-0000-0000-0000-000000000004', 2, true),
  ('Bomber Jackets',  'bomber-jackets',  'Iconic bomber styles',            'c0000001-0000-0000-0000-000000000005', 1, true),
  ('Denim Jackets',   'denim-jackets',   'Timeless denim outerwear',        'c0000001-0000-0000-0000-000000000005', 2, true),
  ('Leather Jackets', 'leather-jackets', 'Premium leather pieces',          'c0000001-0000-0000-0000-000000000005', 3, true),
  ('Windbreakers',    'windbreakers',    'Lightweight weather protection',   'c0000001-0000-0000-0000-000000000005', 4, true),
  ('Leather Belts', 'leather-belts', 'Classic leather belts',    'c0000001-0000-0000-0000-000000000006', 1, true),
  ('Canvas Belts',  'canvas-belts',  'Casual canvas styles',     'c0000001-0000-0000-0000-000000000006', 2, true),
  ('Bi-Fold',       'bi-fold',       'Classic bi-fold wallets',     'c0000001-0000-0000-0000-000000000007', 1, true),
  ('Card Holders',  'card-holders',  'Minimalist card holders',     'c0000001-0000-0000-0000-000000000007', 2, true),
  ('Watches',      'watches',     'Timepieces for the modern man',  'c0000001-0000-0000-0000-000000000008', 1, true),
  ('Sunglasses',   'sunglasses',  'Premium eyewear',                'c0000001-0000-0000-0000-000000000008', 2, true),
  ('Caps & Hats',  'caps-hats',   'Headwear for every season',      'c0000001-0000-0000-0000-000000000008', 3, true),
  ('Bags',         'bags',        'Backpacks, duffels, and more',   'c0000001-0000-0000-0000-000000000008', 4, true);

-- 3. Common Tags
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

-- 4. Products
INSERT INTO public.products (id, name, slug, description, short_description, category_id, brand, base_price, is_active, is_featured, is_new_arrival) VALUES
  ('f0000001-0000-0000-0000-000000000001', 'Premium Oxford Cotton Shirt', 'premium-oxford-cotton-shirt', 'A classic wardrobe staple. This Oxford cotton shirt offers unparalleled comfort and a timeless fit.', 'Classic Oxford cotton shirt.', 'c0000001-0000-0000-0000-000000000001', 'Crest Originals', 299900, true, true, true),
  ('f0000001-0000-0000-0000-000000000002', 'Heavyweight Essential Tee', 'heavyweight-essential-tee', 'Crafted from 100% premium heavyweight cotton, designed to maintain its shape wash after wash.', 'Durable heavyweight cotton t-shirt.', 'c0000001-0000-0000-0000-000000000002', 'Crest Basics', 149900, true, false, true),
  ('f0000001-0000-0000-0000-000000000003', 'Japanese Selvedge Denim', 'japanese-selvedge-denim', 'Raw Japanese selvedge denim that will naturally fade and mold to your body over time.', 'Raw Japanese selvedge denim jeans.', 'c0000001-0000-0000-0000-000000000003', 'Crest Heritage', 599900, true, true, false),
  ('f0000001-0000-0000-0000-000000000004', 'Classic Aviator Sunglasses', 'classic-aviator-sunglasses', 'Timeless aviator shades featuring polarized lenses and a lightweight metal frame.', 'Polarized classic aviator sunglasses.', 'c0000001-0000-0000-0000-000000000008', 'Crest Accessories', 199900, true, false, false);

-- 5. Product Variants
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, price_override) VALUES
  ('f0000001-0000-0000-0000-000000000001', 'OXF-WHT-M', 'M', 'White', '#FFFFFF', null),
  ('f0000001-0000-0000-0000-000000000001', 'OXF-WHT-L', 'L', 'White', '#FFFFFF', null),
  ('f0000001-0000-0000-0000-000000000001', 'OXF-BLU-M', 'M', 'Light Blue', '#ADD8E6', null),
  
  ('f0000001-0000-0000-0000-000000000002', 'TEE-BLK-S', 'S', 'Black', '#000000', null),
  ('f0000001-0000-0000-0000-000000000002', 'TEE-BLK-M', 'M', 'Black', '#000000', null),
  ('f0000001-0000-0000-0000-000000000002', 'TEE-BLK-L', 'L', 'Black', '#000000', null),

  ('f0000001-0000-0000-0000-000000000003', 'DNM-IND-32', '32', 'Indigo', '#4B0082', null),
  ('f0000001-0000-0000-0000-000000000003', 'DNM-IND-34', '34', 'Indigo', '#4B0082', null),

  ('f0000001-0000-0000-0000-000000000004', 'AVI-GLD-OS', 'OS', 'Gold/Green', '#FFD700', null);

-- 6. Product Images
INSERT INTO public.product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('f0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', 'White Oxford Shirt', 1, true),
  ('f0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80', 'Blue Oxford Shirt', 2, false),
  
  ('f0000001-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'Black Heavyweight Tee', 1, true),
  
  ('f0000001-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', 'Japanese Selvedge Denim', 1, true),
  
  ('f0000001-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', 'Classic Aviator Sunglasses', 1, true);

-- 7. Inventory
INSERT INTO public.inventory (variant_id, quantity)
SELECT id, 50 FROM public.product_variants ON CONFLICT (variant_id) DO UPDATE SET quantity = 50;
