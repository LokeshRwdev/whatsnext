import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";
import type { AppUser, DriverProfile } from "./types";

export type { AppUser, DriverProfile } from "./types";

function mapUser(user: SupabaseUser | null): AppUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
    fullName: (user.user_metadata as Record<string, any> | null)?.full_name ?? null,
  };
}

export async function createServerSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        const mutableStore = cookieStore as unknown as {
          set?: (options: { name: string; value: string } & Record<string, any>) => void;
        };
        mutableStore.set?.({ name, value, ...options });
      },
      remove(name: string, options: any) {
        const mutableStore = cookieStore as unknown as {
          set?: (options: { name: string; value: string } & Record<string, any>) => void;
        };
        mutableStore.set?.({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && error.message !== "Auth session missing!") {
    console.warn("[supabase] auth.getUser failed", error);
  }

  return {
    supabase,
    user: mapUser(user),
  };
}

export async function loadProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.warn("[supabase] failed to load profile", { userId, error });
    return null;
  }

  return (data ?? null) as DriverProfile | null;
}
