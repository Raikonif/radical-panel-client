import { MicrophoneStage, Sparkle, Trash } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ContentLanguageSwitch } from "@/components/workspace/ContentLanguageSwitch";
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
import {
  formatDate,
  getPodcastTranslation,
  slugify,
} from "@/features/content/types";
import type {
  ContentLanguage,
  PodcastFormValues,
  PodcastRecord,
} from "@/features/content/types";

const languageLabels: Record<ContentLanguage, string> = {
  es: "Espanol",
  en: "Ingles",
};

const podcastSchema = z.object({
  file_url: z.string().trim().min(1, "Agrega la URL o ruta del audio."),
  is_active: z.boolean(),
  translation: z.object({
    language: z.enum(["es", "en"]),
    title: z.string().trim().min(3, "Escribe un titulo."),
    slug: z.string().trim().min(3, "Genera un slug valido."),
    body: z.string().trim().min(20, "Agrega el cuerpo del podcast."),
    is_active: z.boolean(),
  }),
});

type PodcastEditorValues = z.infer<typeof podcastSchema>;

type PodcastEditorProps = {
  mode: "create" | "edit";
  record: PodcastRecord | null;
  language: ContentLanguage;
  onLanguageChange: (language: ContentLanguage) => void;
  isPending: boolean;
  onSave: (values: PodcastFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function getDefaultValues(
  record: PodcastRecord | null,
  language: ContentLanguage,
): PodcastEditorValues {
  const translation = record ? getPodcastTranslation(record, language) : null;
  const isActive = translation?.is_active ?? record?.is_active ?? true;

  return {
    file_url: record?.file_url ?? "",
    is_active: record?.is_active ?? true,
    translation: {
      language,
      title: translation?.title ?? "",
      slug: translation?.slug ?? "",
      body: translation?.body ?? "",
      is_active: isActive,
    },
  };
}

export function PodcastEditor({
  mode,
  record,
  language,
  onLanguageChange,
  isPending,
  onSave,
  onDelete,
}: PodcastEditorProps) {
  const form = useForm<PodcastEditorValues>({
    resolver: zodResolver(podcastSchema),
    defaultValues: getDefaultValues(record, language),
  });

  useEffect(() => {
    form.reset(getDefaultValues(record, language));
  }, [form, language, record]);

  const errors = form.formState.errors;
  const isActive = useWatch({
    control: form.control,
    name: "is_active",
  });
  const title = useWatch({
    control: form.control,
    name: "translation.title",
  });

  async function handleDelete() {
    if (!onDelete) {
      return;
    }

    if (
      !window.confirm(
        "Se eliminara el podcast completo. Esta accion no se puede deshacer.",
      )
    ) {
      return;
    }

    await onDelete();
  }

  function handleGenerateSlug() {
    const title = form.getValues("translation.title");
    form.setValue("translation.slug", slugify(title), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 pb-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Badge>{mode === "create" ? "Nuevo podcast" : "Edicion"}</Badge>
              <Badge variant={isActive ? "success" : "outline"}>
                {isActive ? "Activo" : "Borrador"}
              </Badge>
            </div>
            <CardTitle className="mt-4 text-2xl">
              {mode === "create"
                ? `Crear podcast en ${languageLabels[language]}`
                : title || `Podcast #${record?.id ?? ""}`}
            </CardTitle>
            <CardDescription className="mt-2">
              Edita el episodio en {languageLabels[language].toLowerCase()} sin
              tocar las otras traducciones.
            </CardDescription>
            <div className="mt-4">
              <ContentLanguageSwitch
                value={language}
                onChange={onLanguageChange}
              />
            </div>
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
                  Ficha del podcast
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Gestiona el audio, el slug y el contenido editorial en{" "}
                  {languageLabels[language].toLowerCase()}.
                </p>
              </div>

              <div className="grid gap-5">
                <div>
                  <Label htmlFor="podcast-file-url">Audio o URL</Label>
                  <Input
                    id="podcast-file-url"
                    className="mt-2"
                    placeholder="https://..."
                    {...form.register("file_url")}
                  />
                  <FormMessage>{errors.file_url?.message}</FormMessage>
                </div>

                <div>
                  <Label htmlFor="podcast-title">Titulo</Label>
                  <Input
                    id="podcast-title"
                    className="mt-2"
                    placeholder="Patologia molecular en practica clinica"
                    {...form.register("translation.title")}
                  />
                  <FormMessage>
                    {errors.translation?.title?.message}
                  </FormMessage>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="podcast-slug">Slug</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateSlug}
                    >
                      <Sparkle className="size-4" />
                      Generar
                    </Button>
                  </div>
                  <Input
                    id="podcast-slug"
                    className="mt-2"
                    placeholder="patologia-molecular-practica-clinica"
                    {...form.register("translation.slug")}
                  />
                  <FormMessage>{errors.translation?.slug?.message}</FormMessage>
                </div>

                <div>
                  <Label htmlFor="podcast-body">Cuerpo</Label>
                  <Textarea
                    id="podcast-body"
                    className="mt-2 min-h-40"
                    placeholder="Descripcion larga del episodio, invitados y temas."
                    {...form.register("translation.body")}
                  />
                  <FormMessage>{errors.translation?.body?.message}</FormMessage>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <label className="inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border text-primary"
                    {...form.register("is_active")}
                  />
                  Activar el episodio
                </label>

                <label className="inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border text-primary"
                    {...form.register("translation.is_active")}
                  />
                  Activar la ficha en espanol
                </label>
              </div>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-4">
            <div className="rounded-[1.75rem] border border-border/70 bg-background/72 p-5">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MicrophoneStage className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Acciones
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                El formulario actua solo sobre la traduccion en{" "}
                {languageLabels[language].toLowerCase()}.
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
                      ? "Crear podcast"
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
                    Eliminar podcast
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
