import { CircleNotch } from "@phosphor-icons/react";

export function AppFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-[0_32px_120px_-48px_rgba(147,51,234,0.55)] backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-fuchsia-500/30">
            RP
          </span>
          Cargando panel radical
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
          <CircleNotch className="size-4 animate-spin text-primary" />
          Preparando el espacio de trabajo y sincronizando tu contenido.
        </div>
      </div>
    </div>
  );
}
