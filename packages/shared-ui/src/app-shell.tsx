import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "./cn";

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  maxWidthClassName?: string;
  className?: string;
}>;

export const AppShell = ({
  title,
  subtitle,
  actions,
  maxWidthClassName = "max-w-6xl",
  className,
  children,
}: AppShellProps) => {
  return (
    <main className={cn("relative min-h-screen overflow-hidden px-4 py-8 md:px-6 md:py-10", className)}>
      <div className="pointer-events-none absolute -top-32 -left-16 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-16 right-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

      <div className={cn("relative mx-auto flex w-full flex-col gap-6", maxWidthClassName)}>
        <header className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <p className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-700">
                Consultation Space
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
              {subtitle ? <p className="text-sm text-slate-600 md:text-base">{subtitle}</p> : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </header>

        <section className="space-y-4">{children}</section>
      </div>
    </main>
  );
};

