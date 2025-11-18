import { cn } from "@/lib/utils";

interface ReasonTagProps {
  label: string;
  variant?: "default" | "success" | "warning";
  className?: string;
}

export function ReasonTag({ label, variant = "default", className }: ReasonTagProps) {
  const variantStyles = {
    default: "bg-muted text-muted-foreground",
    success: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    warning: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
