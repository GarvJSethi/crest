import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in browser / client components.
 *
 * This client respects Row-Level Security and uses the anonymous key.
 * Safe to call multiple times — `createBrowserClient` handles singleton caching.
 *
 * @example
 * ```ts
 * "use client";
 * import { createClient } from "@/lib/supabase/client";
 * const supabase = createClient();
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
