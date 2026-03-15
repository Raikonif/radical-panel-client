import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, getCaseTranslation } from "@/features/content/types";
import type { CaseRecord, ContentLanguage } from "@/features/content/types";

export function CaseDetails({
  record,
  language,
}: {
  record: CaseRecord;
  language: ContentLanguage;
}) {
  const translation = getCaseTranslation(record, language);

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
          {translation?.title ||
            `Caso #${record.id} sin traduccion ${language.toUpperCase()}`}
        </h3>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {translation?.description || "Sin descripcion disponible."}
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-white/25 bg-white/18 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Diagnostico
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {translation?.diagnosis || "Sin dato"}
            </p>
          </div>
          <div className="rounded-3xl border border-white/25 bg-white/18 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Complejidad
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {translation?.complexity || "Sin dato"}
            </p>
          </div>
          <div className="rounded-3xl border border-white/25 bg-white/18 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Muestra
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {translation?.specimen || "Sin dato"}
            </p>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-foreground">Resumen</h4>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <p>Creado: {formatDate(record.created_at)}</p>
          <p>Actualizado: {formatDate(record.updated_at)}</p>
          <p>Imagenes: {record.images.length}</p>
        </div>
        <div className="mt-5 space-y-3">
          {record.images.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/25 bg-white/18 px-4 py-6 text-sm text-muted-foreground">
              Este caso no tiene imagenes asociadas.
            </div>
          ) : (
            record.images.map((image) => (
              <div
                key={image.id}
                className="rounded-3xl border border-white/25 bg-white/18 p-4"
              >
                <div className="text-sm font-semibold text-foreground">
                  {image.type || "Imagen"}
                </div>
                <div className="mt-2 break-all text-sm text-muted-foreground">
                  {image.image_url}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
