const isServer = () => typeof window === "undefined";

/**
 * Next.js only inlines environment variables when they are referenced with static keys.
 * Avoid dynamic lookups (e.g. process.env[key]) because they are stripped from the client bundle
 * and will always be undefined in the browser.
 */
export function getSupabaseConfig() {
  const serverUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serverAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url = isServer() ? serverUrl : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = isServer() ? serverAnonKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL environment variable");
  }
  if (!anonKey) {
    throw new Error("Missing SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
  }

  return { url, anonKey };
}
