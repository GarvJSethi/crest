import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers.
 *
 * **Must be called with `await`** — Next.js 15+ requires awaiting `cookies()`.
 *
 * This client respects Row-Level Security and uses the anonymous key.
 *
 * @example
 * ```ts
 * import { createClient } from "@/lib/supabase/server";
 * const supabase = await createClient();
 * const { data } = await supabase.from("products").select("*");
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` can throw in Server Components when response headers
            // are already sent. This is safe to ignore — the middleware
            // handles session refresh.
          }
        },
      },
    }
  );
}
