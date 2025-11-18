import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DriverShellProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DriverShell({ title, subtitle, actions, children, className }: DriverShellProps) {
  return (
    <section className={cn("flex h-full flex-col", className)}>
      {(title || subtitle || actions) && (
        <header className="flex flex-col gap-2 border-b px-4 py-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              {title && <h1 className="text-2xl font-semibold leading-tight">{title}</h1>}
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </header>
      )}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 md:pb-8">{children}</div>
    </section>
  );
}
