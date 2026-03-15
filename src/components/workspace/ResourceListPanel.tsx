import type { ReactNode } from "react";
import { Eye, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type ResourceActionHandlers = {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export type ResourceTableItem = {
  id: number;
  title: string;
  subtitle: string;
  status: string;
  statusVariant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "destructive";
  columns: string[];
};

type ResourceListPanelProps = {
  title: string;
  description: string;
  createLabel: string;
  searchValue: string;
  searchPlaceholder: string;
  onSearchValueChange: (value: string) => void;
  onCreate: () => void;
  isLoading: boolean;
  items: ResourceTableItem[];
  emptyMessage: string;
  stats?: ReactNode;
  toolbarSlot?: ReactNode;
  renderActions: (item: ResourceTableItem) => ResourceActionHandlers;
};

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="soft-rise h-18 animate-pulse rounded-3xl border border-white/25 bg-white/18"
          style={{ animationDelay: `${index * 45}ms` }}
        />
      ))}
    </div>
  );
}

export function ResourceListPanel({
  title,
  description,
  createLabel,
  searchValue,
  searchPlaceholder,
  onSearchValueChange,
  onCreate,
  isLoading,
  items,
  emptyMessage,
  stats,
  toolbarSlot,
  renderActions,
}: ResourceListPanelProps) {
  return (
    <div className="space-y-4">
      <Card className="soft-enter p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">
              Biblioteca
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            {toolbarSlot}
            <Input
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="min-w-[260px]"
            />
            <Button size="lg" onClick={onCreate}>
              <Plus className="size-4" />
              {createLabel}
            </Button>
          </div>
        </div>
        {stats ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stats}
          </div>
        ) : null}
      </Card>

      <Card className="soft-enter soft-enter-delay-1 overflow-hidden p-3">
        <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-white/24 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:border-white/10">
          <span>Registro</span>
          <span>Detalle</span>
          <span>Columna 1</span>
          <span>Columna 2</span>
          <span className="text-right">Acciones</span>
        </div>

        <div className="mt-2.5 space-y-2.5">
          {isLoading ? <TableSkeleton /> : null}

          {!isLoading && items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/36 bg-white/22 px-5 py-10 text-sm leading-6 text-muted-foreground backdrop-blur-xl dark:border-white/12 dark:bg-white/6">
              {emptyMessage}
            </div>
          ) : null}

          {!isLoading
            ? items.map((item, index) => {
                const actions = renderActions(item);

                return (
                  <div
                    key={item.id}
                    className="soft-rise grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-4 rounded-[1.35rem] border border-white/34 bg-white/24 px-4 py-3.5 backdrop-blur-xl dark:border-white/12 dark:bg-white/7"
                    style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {item.title}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        ID {item.id}
                      </div>
                    </div>
                    <div className="min-w-0 text-sm text-muted-foreground">
                      {item.subtitle}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.columns[0] ?? "Sin dato"}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Badge variant={item.statusVariant ?? "outline"}>
                        {item.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.columns[1] ?? "Sin dato"}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={actions.onView}
                      >
                        <Eye className="size-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={actions.onEdit}
                      >
                        <PencilSimple className="size-4" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={actions.onDelete}
                      >
                        <Trash className="size-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })
            : null}
        </div>
      </Card>
    </div>
  );
}
