import { ImageSquare, Plus, Trash, UploadSimple } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
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
import { uploadMediaFile } from "@/features/content/upload";
import { formatDate, getCaseTranslation } from "@/features/content/types";
import type {
  CaseFormValues,
  CaseRecord,
  ContentLanguage,
} from "@/features/content/types";

const languageLabels: Record<ContentLanguage, string> = {
  es: "Espanol",
  en: "Ingles",
};

const caseSchema = z.object({
  translation: z.object({
    language: z.enum(["es", "en"]),
    title: z.string().trim().min(3, "Escribe un titulo claro."),
    description: z.string().trim().min(10, "Agrega una descripcion breve."),
    is_active: z.boolean(),
    diagnosis: z.string().trim().min(3, "Completa el diagnostico."),
    complexity: z.string().trim().min(2, "Indica la complejidad."),
    specimen: z.string().trim().min(2, "Indica la muestra."),
  }),
  images: z.array(
    z.object({
      image_url: z.string().trim(),
      type: z.string().trim().min(1, "Indica el tipo de imagen."),
    }),
  ),
});

type CaseEditorValues = z.infer<typeof caseSchema>;

type CaseEditorProps = {
  mode: "create" | "edit";
  record: CaseRecord | null;
  language: ContentLanguage;
  onLanguageChange: (language: ContentLanguage) => void;
  isPending: boolean;
  onSave: (values: CaseFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function getDefaultValues(
  record: CaseRecord | null,
  language: ContentLanguage,
): CaseEditorValues {
  const translation = record ? getCaseTranslation(record, language) : null;

  return {
    translation: {
      language,
      title: translation?.title ?? "",
      description: translation?.description ?? "",
      is_active: translation?.is_active ?? true,
      diagnosis: translation?.diagnosis ?? "",
      complexity: translation?.complexity ?? "",
      specimen: translation?.specimen ?? "",
    },
    images:
      record?.images.map((image) => ({
        image_url: image.image_url,
        type: image.type,
      })) ?? [],
  };
}

export function CaseEditor({
  mode,
  record,
  language,
  onLanguageChange,
  isPending,
  onSave,
  onDelete,
}: CaseEditorProps) {
  const [pendingImageFiles, setPendingImageFiles] = useState<
    Array<File | null>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm<CaseEditorValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: getDefaultValues(record, language),
  });

  useEffect(() => {
    form.reset(getDefaultValues(record, language));
    setPendingImageFiles(record?.images.map(() => null) ?? []);
  }, [form, language, record]);

  const imagesFieldArray = useFieldArray({
    control: form.control,
    name: "images",
  });

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
        "Se eliminara el caso completo. Esta accion no se puede deshacer.",
      )
    ) {
      return;
    }

    await onDelete();
  }

  async function handleSubmit(values: CaseEditorValues) {
    const missingImageUrlIndex = values.images.findIndex(
      (image, index) => !image.image_url.trim() && !pendingImageFiles[index],
    );

    if (missingImageUrlIndex >= 0) {
      form.setError(`images.${missingImageUrlIndex}.image_url`, {
        type: "manual",
        message: "Agrega la URL o ruta de la imagen, o selecciona un archivo.",
      });
      return;
    }

    try {
      setIsUploading(true);

      const images = await Promise.all(
        values.images.map(async (image, index) => {
          const file = pendingImageFiles[index];

          if (!file) {
            return image;
          }

          const upload = await uploadMediaFile(file, "cases");

          return {
            ...image,
            image_url: upload.url,
          };
        }),
      );

      await onSave({
        ...values,
        images,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron subir las imagenes.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  const isBusy = isPending || isUploading;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 pb-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Badge>{mode === "create" ? "Nuevo caso" : "Edicion"}</Badge>
              <Badge
                variant={currentTranslation.is_active ? "success" : "outline"}
              >
                {currentTranslation.is_active ? "Activo" : "Borrador"}
              </Badge>
            </div>
            <CardTitle className="mt-4 text-2xl">
              {mode === "create"
                ? `Crear caso en ${languageLabels[language]}`
                : currentTranslation.title || `Caso #${record?.id ?? ""}`}
            </CardTitle>
            <CardDescription className="mt-2">
              Este formulario edita solo la version en{" "}
              {languageLabels[language].toLowerCase()}. Las otras traducciones
              se mantienen separadas.
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
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <div className="space-y-6">
            <section className="rounded-[1.75rem] border border-border/70 bg-background/72 p-5">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-foreground">
                  Contenido principal
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Captura la ficha clinica en{" "}
                  {languageLabels[language].toLowerCase()}.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="case-title">Titulo</Label>
                  <Input
                    id="case-title"
                    className="mt-2"
                    placeholder="Adenocarcinoma pulmonar con patron mixto"
                    {...form.register("translation.title")}
                  />
                  <FormMessage>
                    {errors.translation?.title?.message}
                  </FormMessage>
                </div>

                <div>
                  <Label htmlFor="case-diagnosis">Diagnostico</Label>
                  <Input
                    id="case-diagnosis"
                    className="mt-2"
                    placeholder="Adenocarcinoma"
                    {...form.register("translation.diagnosis")}
                  />
                  <FormMessage>
                    {errors.translation?.diagnosis?.message}
                  </FormMessage>
                </div>

                <div>
                  <Label htmlFor="case-complexity">Complejidad</Label>
                  <Input
                    id="case-complexity"
                    className="mt-2"
                    placeholder="Alta"
                    {...form.register("translation.complexity")}
                  />
                  <FormMessage>
                    {errors.translation?.complexity?.message}
                  </FormMessage>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="case-specimen">Muestra</Label>
                  <Input
                    id="case-specimen"
                    className="mt-2"
                    placeholder="Biopsia pulmonar"
                    {...form.register("translation.specimen")}
                  />
                  <FormMessage>
                    {errors.translation?.specimen?.message}
                  </FormMessage>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="case-description">Descripcion</Label>
                  <Textarea
                    id="case-description"
                    className="mt-2"
                    placeholder="Resumen corto del caso, hallazgos y contexto."
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
                Publicar el caso como activo
              </label>
            </section>

            <section className="rounded-[1.75rem] border border-border/70 bg-background/72 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Imagenes del caso
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Adjunta los recursos visuales. La tabla de traducciones de
                    imagenes no se edita aqui por falta de relacion directa en
                    el esquema compartido.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    imagesFieldArray.append({ image_url: "", type: "" });
                    setPendingImageFiles((current) => [...current, null]);
                  }}
                >
                  <Plus className="size-4" />
                  Agregar imagen
                </Button>
              </div>

              <div className="mt-5 space-y-4">
                {imagesFieldArray.fields.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-card/70 px-4 py-8 text-sm leading-6 text-muted-foreground">
                    Todavia no hay imagenes asociadas.
                  </div>
                ) : null}

                {imagesFieldArray.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-3xl border border-border/70 bg-card/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                        <ImageSquare className="size-4 text-primary" />
                        Imagen {index + 1}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          imagesFieldArray.remove(index);
                          setPendingImageFiles((current) =>
                            current.filter(
                              (_, fileIndex) => fileIndex !== index,
                            ),
                          );
                        }}
                      >
                        <Trash className="size-4" />
                        Quitar
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                      <div>
                        <Label htmlFor={`case-image-url-${index}`}>
                          URL o ruta
                        </Label>
                        <Input
                          id={`case-image-url-${index}`}
                          className="mt-2"
                          placeholder="cases/imagen-clinica.jpg"
                          {...form.register(
                            `images.${index}.image_url` as const,
                          )}
                        />
                        <FormMessage>
                          {errors.images?.[index]?.image_url?.message}
                        </FormMessage>

                        <div className="mt-3 rounded-2xl border border-dashed border-border/70 bg-background/80 p-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <UploadSimple className="size-4 text-primary" />
                            <span>Subir imagen</span>
                          </div>
                          <Input
                            id={`case-image-file-${index}`}
                            className="mt-2"
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              setPendingImageFiles((current) => {
                                const next = [...current];
                                next[index] = file;
                                return next;
                              });
                              if (file) {
                                form.clearErrors(`images.${index}.image_url`);
                              }
                            }}
                          />
                          <p className="mt-2 text-xs text-muted-foreground">
                            {pendingImageFiles[index]
                              ? `Se subira ${pendingImageFiles[index]?.name} al guardar en radical-panel/cases/.`
                              : "Si eliges un archivo, al guardar reemplazara la ruta actual con la clave devuelta por /upload."}
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`case-image-type-${index}`}>Tipo</Label>
                        <Input
                          id={`case-image-type-${index}`}
                          className="mt-2"
                          placeholder="Microscopia"
                          {...form.register(`images.${index}.type` as const)}
                        />
                        <FormMessage>
                          {errors.images?.[index]?.type?.message}
                        </FormMessage>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-4">
            <div className="rounded-[1.75rem] border border-border/70 bg-background/72 p-5">
              <h3 className="text-lg font-semibold text-foreground">
                Acciones
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Guarda la ficha en espanol y deja las traducciones derivadas
                fuera de este panel.
              </p>

              <div className="mt-5 space-y-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full justify-center"
                  disabled={isBusy}
                >
                  {isBusy
                    ? isUploading
                      ? "Subiendo archivos..."
                      : "Guardando..."
                    : mode === "create"
                      ? "Crear caso"
                      : "Guardar cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full justify-center"
                  onClick={() => {
                    form.reset(getDefaultValues(record, language));
                    setPendingImageFiles(record?.images.map(() => null) ?? []);
                  }}
                  disabled={isBusy}
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
                    disabled={isBusy}
                  >
                    Eliminar caso
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/70 bg-background/72 p-5">
              <h3 className="text-lg font-semibold text-foreground">
                Notas del flujo
              </h3>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>Solo se edita la entrada en espanol (`language = es`).</li>
                <li>
                  Las imagenes del caso se reemplazan segun el formulario
                  actual.
                </li>
                <li>Las demas traducciones quedan intactas para DeepL.</li>
              </ul>
            </div>
          </aside>
        </form>
      </CardContent>
    </Card>
  );
}
