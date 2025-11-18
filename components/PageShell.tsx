import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function PageShell({ children, title, subtitle }: PageShellProps) {
  return (
    <section className="flex flex-col h-full">
      {(title || subtitle) && (
        <div className="px-4 py-6 border-b">
          {title && <h1 className="text-2xl font-bold mb-1">{title}</h1>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className="flex-1 overflow-auto">{children}</div>
    </section>
  );
}
