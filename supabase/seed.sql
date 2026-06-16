-- ============================================================================
-- CREST — Seed Data
-- ============================================================================
-- Run this after all migrations to populate initial data.
-- ============================================================================

-- ── Categories ──
INSERT INTO public.categories (id, name, slug, description, display_order, is_active) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Shirts',       'shirts',       'Tailored shirts for every occasion — casual, formal, and everything in between.', 1, true),
  ('c0000001-0000-0000-0000-000000000002', 'T-Shirts',     't-shirts',     'Premium tees crafted from the softest fabrics.',                                   2, true),
  ('c0000001-0000-0000-0000-000000000003', 'Jeans',         'jeans',         'Premium denim engineered for comfort and style.',                                 3, true),
  ('c0000001-0000-0000-0000-000000000004', 'Cargo Pants',   'cargo-pants',   'Utility-driven cargo pants with a modern edge.',                                 4, true),
  ('c0000001-0000-0000-0000-000000000005', 'Jackets',       'jackets',       'Statement outerwear to complete your look.',                                     5, true),
  ('c0000001-0000-0000-0000-000000000006', 'Belts',         'belts',         'Handcrafted belts in premium leather.',                                           6, true),
  ('c0000001-0000-0000-0000-000000000007', 'Wallets',       'wallets',       'Slim, functional wallets crafted from fine materials.',                           7, true),
  ('c0000001-0000-0000-0000-000000000008', 'Accessories',   'accessories',   'The finishing touches that define your style.',                                   8, true);

-- ── Subcategories — Shirts ──
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Casual Shirts',  'casual-shirts',  'Relaxed fits for everyday style',                  'c0000001-0000-0000-0000-000000000001', 1, true),
  ('Formal Shirts',  'formal-shirts',  'Crisp, professional shirts for the office',         'c0000001-0000-0000-0000-000000000001', 2, true),
  ('Linen Shirts',   'linen-shirts',   'Breathable linen for warm days',                    'c0000001-0000-0000-0000-000000000001', 3, true);

-- ── Subcategories — T-Shirts ──
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Round Neck',  'round-neck',  'Classic round neck tees',        'c0000001-0000-0000-0000-000000000002', 1, true),
  ('V-Neck',      'v-neck',      'Sleek V-neck silhouettes',       'c0000001-0000-0000-0000-000000000002', 2, true),
  ('Polo',        'polo',        'Smart casual polo shirts',       'c0000001-0000-0000-0000-000000000002', 3, true),
  ('Oversized',   'oversized',   'Trendy oversized fits',          'c0000001-0000-0000-0000-000000000002', 4, true);

-- ── Subcategories — Jeans ──
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Slim Fit',     'slim-fit',     'Modern slim fit jeans',          'c0000001-0000-0000-0000-000000000003', 1, true),
  ('Straight Fit', 'straight-fit', 'Classic straight cut',            'c0000001-0000-0000-0000-000000000003', 2, true),
  ('Skinny',       'skinny',       'Body-hugging skinny jeans',       'c0000001-0000-0000-0000-000000000003', 3, true),
  ('Relaxed Fit',  'relaxed-fit',  'Comfortable relaxed jeans',       'c0000001-0000-0000-0000-000000000003', 4, true);

-- ── Subcategories — Cargo Pants ──
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Regular Cargo', 'regular-cargo', 'Classic cargo silhouettes',        'c0000001-0000-0000-0000-000000000004', 1, true),
  ('Jogger Cargo',  'jogger-cargo',  'Tapered jogger-style cargo',       'c0000001-0000-0000-0000-000000000004', 2, true);

-- ── Subcategories — Jackets ──
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Bomber Jackets',  'bomber-jackets',  'Iconic bomber styles',            'c0000001-0000-0000-0000-000000000005', 1, true),
  ('Denim Jackets',   'denim-jackets',   'Timeless denim outerwear',        'c0000001-0000-0000-0000-000000000005', 2, true),
  ('Leather Jackets', 'leather-jackets', 'Premium leather pieces',          'c0000001-0000-0000-0000-000000000005', 3, true),
  ('Windbreakers',    'windbreakers',    'Lightweight weather protection',   'c0000001-0000-0000-0000-000000000005', 4, true);

-- ── Subcategories — Belts ──
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Leather Belts', 'leather-belts', 'Classic leather belts',    'c0000001-0000-0000-0000-000000000006', 1, true),
  ('Canvas Belts',  'canvas-belts',  'Casual canvas styles',     'c0000001-0000-0000-0000-000000000006', 2, true);

-- ── Subcategories — Wallets ──
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Bi-Fold',       'bi-fold',       'Classic bi-fold wallets',     'c0000001-0000-0000-0000-000000000007', 1, true),
  ('Card Holders',  'card-holders',  'Minimalist card holders',     'c0000001-0000-0000-0000-000000000007', 2, true);

-- ── Subcategories — Accessories ──
INSERT INTO public.categories (name, slug, description, parent_id, display_order, is_active) VALUES
  ('Watches',      'watches',     'Timepieces for the modern man',  'c0000001-0000-0000-0000-000000000008', 1, true),
  ('Sunglasses',   'sunglasses',  'Premium eyewear',                'c0000001-0000-0000-0000-000000000008', 2, true),
  ('Caps & Hats',  'caps-hats',   'Headwear for every season',      'c0000001-0000-0000-0000-000000000008', 3, true),
  ('Bags',         'bags',        'Backpacks, duffels, and more',   'c0000001-0000-0000-0000-000000000008', 4, true);

-- ── Common Tags ──
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
