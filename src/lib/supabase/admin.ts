import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client that **bypasses Row-Level Security**.
 *
 * ⚠️ **Server-only** — never import this in client components or expose
 * the service-role key to the browser.
 *
 * Use this for:
 * - Admin operations that need full table access
 * - Background jobs / webhooks
 * - Seeding data
 *
 * @example
 * ```ts
 * import { createAdminClient } from "@/lib/supabase/admin";
 * const supabase = createAdminClient();
 * const { data } = await supabase.from("profiles").select("*");
 * ```
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. " +
        "The admin client can only be used on the server.",
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
