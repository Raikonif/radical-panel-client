import { FilmSlate, Trash } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, getVideoTranslation } from "@/features/content/types";
import type {
  ContentLanguage,
  VideoFormValues,
  VideoRecord,
} from "@/features/content/types";

const languageLabels: Record<ContentLanguage, string> = {
  es: "Espanol",
  en: "Ingles",
};

const videoSchema = z.object({
  file_url: z.string().trim().min(1, "Agrega la URL o ruta del video."),
  translation: z.object({
    language: z.enum(["es", "en"]),
    name: z.string().trim().min(3, "Escribe un nombre claro."),
    description: z.string().trim().min(10, "Agrega una descripcion breve."),
    is_active: z.boolean(),
  }),
});

type VideoEditorValues = z.infer<typeof videoSchema>;

type VideoEditorProps = {
  mode: "create" | "edit";
  record: VideoRecord | null;
  language: ContentLanguage;
  isPending: boolean;
  onSave: (values: VideoFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function getDefaultValues(
  record: VideoRecord | null,
  language: ContentLanguage,
): VideoEditorValues {
  const translation = record ? getVideoTranslation(record, language) : null;

  return {
    file_url: record?.file_url ?? "",
    translation: {
      language,
      name: translation?.name ?? "",
      description: translation?.description ?? "",
      is_active: translation?.is_active ?? true,
    },
  };
}

export function VideoEditor({
  mode,
  record,
  language,
  isPending,
  onSave,
  onDelete,
}: VideoEditorProps) {
  const form = useForm<VideoEditorValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: getDefaultValues(record, language),
  });

  useEffect(() => {
    form.reset(getDefaultValues(record, language));
  }, [form, language, record]);

  const errors = form.formState.errors;
  const currentTranslation = useWatch({
    control: form.control,
    name: "translation",
  });

  async function handleDelete() {
    if (!onDelete) {
      return;
    }

    if (
      !window.confirm(
        "Se eliminara el video completo. Esta accion no se puede deshacer.",
      )
    ) {
      return;
    }

    await onDelete();
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 pb-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Badge>{mode === "create" ? "Nuevo video" : "Edicion"}</Badge>
              <Badge
                variant={currentTranslation.is_active ? "success" : "outline"}
              >
                {currentTranslation.is_active ? "Activo" : "Borrador"}
              </Badge>
            </div>
            <CardTitle className="mt-4 text-2xl">
              {mode === "create"
                ? `Crear video en ${languageLabels[language]}`
                : currentTranslation.name || `Video #${record?.id ?? ""}`}
            </CardTitle>
            <CardDescription className="mt-2">
              Solo se edita la ficha en {languageLabels[language].toLowerCase()}
              . Las otras traducciones quedan intactas.
            </CardDescription>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-border/70 bg-background/72 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Idioma
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {language.toUpperCase()}
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/72 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Creado
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {formatDate(record?.created_at)}
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/72 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                ID
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {record?.id ?? "Nuevo"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
          onSubmit={form.handleSubmit(onSave)}
          noValidate
        >
          <div className="space-y-6">
            <section className="rounded-[1.75rem] border border-border/70 bg-background/72 p-5">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-foreground">
                  Ficha del video
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Registra el enlace del archivo y su metadata en{" "}
                  {languageLabels[language].toLowerCase()}.
                </p>
              </div>

              <div className="grid gap-5">
                <div>
                  <Label htmlFor="video-file-url">Archivo o URL</Label>
                  <Input
                    id="video-file-url"
                    className="mt-2"
                    placeholder="https://..."
                    {...form.register("file_url")}
                  />
                  <FormMessage>{errors.file_url?.message}</FormMessage>
                </div>

                <div>
                  <Label htmlFor="video-name">Nombre</Label>
                  <Input
                    id="video-name"
                    className="mt-2"
                    placeholder="Reseccion pulmonar con marcadores"
                    {...form.register("translation.name")}
                  />
                  <FormMessage>{errors.translation?.name?.message}</FormMessage>
                </div>

                <div>
                  <Label htmlFor="video-description">Descripcion</Label>
                  <Textarea
                    id="video-description"
                    className="mt-2"
                    placeholder="Resumen de lo que cubre el video."
                    {...form.register("translation.description")}
                  />
                  <FormMessage>
                    {errors.translation?.description?.message}
                  </FormMessage>
                </div>
              </div>

              <label className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border text-primary"
                  {...form.register("translation.is_active")}
                />
                Publicar el video como activo
              </label>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-4">
            <div className="rounded-[1.75rem] border border-border/70 bg-background/72 p-5">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FilmSlate className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Acciones
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                El panel guarda solo la traduccion en{" "}
                {languageLabels[language].toLowerCase()} y conserva el resto de
                idiomas.
              </p>

              <div className="mt-5 space-y-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full justify-center"
                  disabled={isPending}
                >
                  {isPending
                    ? "Guardando..."
                    : mode === "create"
                      ? "Crear video"
                      : "Guardar cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full justify-center"
                  onClick={() => form.reset(getDefaultValues(record, language))}
                  disabled={isPending}
                >
                  Restablecer formulario
                </Button>
                {onDelete ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="lg"
                    className="w-full justify-center"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    <Trash className="size-4" />
                    Eliminar video
                  </Button>
                ) : null}
              </div>
            </div>
          </aside>
        </form>
      </CardContent>
    </Card>
  );
}
