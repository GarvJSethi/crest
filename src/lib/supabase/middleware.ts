import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Creates a Supabase client scoped to a middleware request/response cycle.
 *
 * This client handles session refresh by reading and writing cookies via
 * the request/response pair. It must be used inside Next.js middleware.
 *
 * @returns An object containing the Supabase client and the
 *          NextResponse (with updated cookies for session refresh).
 *
 * @example
 * ```ts
 * import { createClient } from "@/lib/supabase/middleware";
 *
 * export async function middleware(request: NextRequest) {
 *   const { supabase, response } = createClient(request);
 *   const { data: { user } } = await supabase.auth.getUser();
 *   return response;
 * }
 * ```
 */
export function createClient(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // First, set on the request so downstream Server Components can read them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          // Then, create a new response that carries the updated request headers
          response = NextResponse.next({
            request: { headers: request.headers },
          });

          // Finally, set on the response so the browser stores them
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, response };
}
