import type { ReactNode } from "react";
import { Plus } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ResourceListItem = {
  id: number;
  title: string;
  subtitle: string;
  summary?: string;
  badge?: string;
  badgeVariant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "destructive";
  meta: string[];
};

type ResourceWorkspaceProps = {
  title: string;
  description: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onCreateNew: () => void;
  items: ResourceListItem[];
  selectedId: number | "new" | null;
  onSelect: (id: number) => void;
  itemLabel: string;
  itemCount: number;
  filteredCount: number;
  isLoading: boolean;
  detail: ReactNode;
  stats?: ReactNode;
  emptyMessage: string;
};

function WorkspaceListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-3xl border border-border/60 bg-background/70"
        />
      ))}
    </div>
  );
}

export function ResourceWorkspace({
  title,
  description,
  searchPlaceholder,
  searchValue,
  onSearchValueChange,
  onCreateNew,
  items,
  selectedId,
  onSelect,
  itemLabel,
  itemCount,
  filteredCount,
  isLoading,
  detail,
  stats,
  emptyMessage,
}: ResourceWorkspaceProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
      <div className="space-y-4">
        <Card className="overflow-hidden p-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/75">
                  {itemLabel}
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
              <Button size="sm" onClick={onCreateNew}>
                <Plus className="size-4" />
                Nuevo
              </Button>
            </div>

            {stats ? (
              <div className="grid gap-3 sm:grid-cols-2">{stats}</div>
            ) : null}

            <div className="rounded-[1.4rem] border border-white/35 bg-white/20 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Buscar {itemLabel.toLowerCase()}
                </p>
                <Badge variant="outline">
                  {filteredCount}/{itemCount}
                </Badge>
              </div>
              <Input
                className="mt-3"
                value={searchValue}
                onChange={(event) => onSearchValueChange(event.target.value)}
                placeholder={searchPlaceholder}
              />
            </div>
          </div>
        </Card>

        <Card className="max-h-[calc(100vh-14rem)] overflow-hidden p-3">
          <div className="flex items-center justify-between px-2 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Registros
              </h4>
              <p className="text-xs text-muted-foreground">
                Elige un registro para editarlo o crea uno nuevo.
              </p>
            </div>
            {selectedId === "new" ? <Badge>Borrador</Badge> : null}
          </div>

          <div className="space-y-3 overflow-y-auto pr-1 [content-visibility:auto]">
            {isLoading ? <WorkspaceListSkeleton /> : null}

            {!isLoading && items.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-white/35 bg-white/18 px-5 py-8 text-sm leading-6 text-muted-foreground backdrop-blur-xl">
                {emptyMessage}
              </div>
            ) : null}

            {!isLoading
              ? items.map((item) => {
                  const isActive = selectedId === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className={cn(
                        "w-full rounded-[1.4rem] border p-4 text-left transition-all",
                        isActive
                          ? "border-primary/28 bg-white/36 shadow-[0_18px_40px_-24px_rgba(192,38,211,0.35)] backdrop-blur-xl"
                          : "border-white/30 bg-white/18 backdrop-blur-lg hover:border-primary/20 hover:bg-white/28",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-foreground">
                            {item.title}
                          </div>
                          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            {item.subtitle}
                          </div>
                        </div>
                        {item.badge ? (
                          <Badge variant={item.badgeVariant ?? "outline"}>
                            {item.badge}
                          </Badge>
                        ) : null}
                      </div>

                      {item.summary ? (
                        <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {item.summary}
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.meta.map((metaEntry) => (
                          <span
                            key={metaEntry}
                            className="rounded-full border border-white/35 bg-white/24 px-3 py-1 text-[10px] font-medium tracking-[0.06em] text-muted-foreground backdrop-blur-lg"
                          >
                            {metaEntry}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })
              : null}
          </div>
        </Card>
      </div>

      <div className="min-w-0">{detail}</div>
    </div>
  );
}
