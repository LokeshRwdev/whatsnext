import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "./api-respond";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppUser } from "@/lib/supabase/types";

export async function requireUser(_: Request | undefined | null = undefined): Promise<{
  supabase: SupabaseClient;
  user: AppUser;
}> {
  const { supabase, user } = await createServerSupabaseClient();
  if (!user) {
    throw new HttpError(401, "UNAUTHORIZED", "Unauthorized");
  }
  return { supabase, user };
}

export async function requireAdmin(req?: Request) {
  const { supabase, user } = await requireUser(req);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) {
    throw new HttpError(403, "FORBIDDEN", "Forbidden", error);
  }

  return { supabase, user };
}
