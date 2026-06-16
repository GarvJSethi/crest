-- ============================================================================
-- Migration 00001: Extensions & ENUM Types
-- Crest Men's Fashion E-Commerce Platform
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"  SCHEMA public;   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto"   SCHEMA public;   -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS "pg_trgm"    SCHEMA public;   -- trigram similarity / GIN indexes

-- ---------------------------------------------------------------------------
-- 2. ENUM types
-- ---------------------------------------------------------------------------

-- User roles
CREATE TYPE public.user_role AS ENUM (
    'customer',
    'admin',
    'super_admin'
);

-- Order lifecycle
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned',
    'refund_initiated',
    'refunded'
);

-- Razorpay payment states
CREATE TYPE public.payment_status AS ENUM (
    'created',
    'authorized',
    'captured',
    'failed',
    'refunded',
    'partially_refunded'
);

-- Payment instruments
CREATE TYPE public.payment_method AS ENUM (
    'card',
    'upi',
    'netbanking',
    'wallet',
    'emi',
    'cod'
);

-- Refund lifecycle
CREATE TYPE public.refund_status AS ENUM (
    'pending',
    'processed',
    'failed'
);

-- Coupon discount strategy
CREATE TYPE public.discount_type AS ENUM (
    'percentage',
    'fixed_amount'
);

-- Address classification
CREATE TYPE public.address_type AS ENUM (
    'shipping',
    'billing'
);
