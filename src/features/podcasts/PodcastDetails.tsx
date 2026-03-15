import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, getPodcastTranslation } from "@/features/content/types";
import type { ContentLanguage, PodcastRecord } from "@/features/content/types";

export function PodcastDetails({
  record,
  language,
}: {
  record: PodcastRecord;
  language: ContentLanguage;
}) {
  const translation = getPodcastTranslation(record, language);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Badge variant={record.is_active ? "success" : "outline"}>
            {record.is_active ? "Activo" : "Borrador"}
          </Badge>
          <Badge variant={translation?.is_active ? "success" : "outline"}>
            {translation
              ? `Ficha ${language.toUpperCase()}`
              : `Sin ${language.toUpperCase()}`}
          </Badge>
        </div>
        <h3 className="mt-4 text-2xl font-semibold text-foreground">
          {translation?.title ||
            `Podcast #${record.id} sin traduccion ${language.toUpperCase()}`}
        </h3>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {translation?.body || "Sin cuerpo disponible."}
        </p>
      </Card>
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-foreground">Resumen</h4>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <p>Creado: {formatDate(record.created_at)}</p>
          <p>Actualizado: {formatDate(record.updated_at)}</p>
          <p>Slug: {translation?.slug || "Sin slug"}</p>
          <p className="break-all">Audio: {record.file_url || "Sin URL"}</p>
        </div>
      </Card>
    </div>
  );
}
