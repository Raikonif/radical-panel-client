import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, getVideoTranslation } from "@/features/content/types";
import type { ContentLanguage, VideoRecord } from "@/features/content/types";

export function VideoDetails({
  record,
  language,
}: {
  record: VideoRecord;
  language: ContentLanguage;
}) {
  const translation = getVideoTranslation(record, language);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Badge variant={translation?.is_active ? "success" : "outline"}>
            {translation
              ? translation.is_active
                ? "Activo"
                : "Borrador"
              : "Sin ficha"}
          </Badge>
          <Badge variant="outline">{language.toUpperCase()}</Badge>
        </div>
        <h3 className="mt-4 text-2xl font-semibold text-foreground">
          {translation?.name ||
            `Video #${record.id} sin traduccion ${language.toUpperCase()}`}
        </h3>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {translation?.description || "Sin descripcion disponible."}
        </p>
      </Card>
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-foreground">Resumen</h4>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <p>Creado: {formatDate(record.created_at)}</p>
          <p>Actualizado: {formatDate(record.updated_at)}</p>
          <p className="break-all">Archivo: {record.file_url || "Sin URL"}</p>
        </div>
      </Card>
    </div>
  );
}
