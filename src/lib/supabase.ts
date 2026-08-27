import "server-only";
import { createServerClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Builds a Supabase client scoped to the current request, reading and writing
 * the auth session through the visitor's own cookies.
 *
 * This must never become a module-level singleton: a shared client keeps the
 * signed-in session in server memory, which leaks one admin's session to every
 * other visitor of the site.
 */
export async function createSupabaseClient() : Promise<SupabaseClient>
{
    const cookieStore = await cookies();

    return createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        cookies: {
            getAll()
            {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet)
            {
                try
                {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                }
                catch
                {
                    // Cookies can only be written from a server action or route
                    // handler. Reads from elsewhere still work; the refreshed
                    // session just isn't persisted.
                }
            }
        }
    });
}

/**
 * Same client, but only returned when the request carries a valid admin
 * session. Every mutating server action goes through this: server actions are
 * public HTTP endpoints, so they cannot rely on the UI hiding the buttons.
 */
export async function createAdminSupabaseClient() : Promise<SupabaseClient | null>
{
    const supabase = await createSupabaseClient();
    const result = await supabase.auth.getUser();

    if(result.error != null || result.data.user == null)
    {
        console.error("Rejected an admin-only request from a visitor without a session");
        return null;
    }

    return supabase;
}
