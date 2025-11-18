"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createBrowserSupabaseClient();

interface LogoutButtonProps extends Omit<ButtonProps, "onClick"> {
  redirectTo?: string;
  children?: ReactNode;
  showIcon?: boolean;
}

export function LogoutButton({
  redirectTo = "/login",
  children = "Sign out",
  showIcon = false,
  ...buttonProps
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Unable to sign out");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <Button type="button" onClick={handleLogout} disabled={loading} {...buttonProps}>
      {showIcon && <LogOut className="h-4 w-4" />}
      {children}
    </Button>
  );
}
