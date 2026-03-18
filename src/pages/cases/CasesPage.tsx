import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { ContentLanguageSwitch } from "@/components/workspace/ContentLanguageSwitch";
import { ResourceListPanel } from "@/components/workspace/ResourceListPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/features/auth/useAuth";
import { CaseDetails } from "@/features/cases/CaseDetails";
import { CaseEditor } from "@/features/cases/CaseEditor";
import { useCasesCrud } from "@/features/cases/useCasesCrud";
import { formatDate, getCaseTranslation } from "@/features/content/types";
import type {
  CaseFormValues,
  CaseRecord,
  ContentLanguage,
} from "@/features/content/types";
import { useUiLanguage } from "@/features/i18n/useUiLanguage";

type CasesModalState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "view"; record: CaseRecord }
  | { type: "edit"; record: CaseRecord }
  | { type: "delete"; record: CaseRecord };

function ResumenStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/25 bg-white/18 px-4 py-3.5 backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function matchesCase(
  record: CaseRecord,
  term: string,
  language: ContentLanguage,
) {
  const translation = getCaseTranslation(record, language);
  const haystack = [
    translation?.title,
    translation?.description,
    translation?.diagnosis,
    translation?.complexity,
    translation?.specimen,
    ...record.images.map((image) => image.type),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(term.toLowerCase());
}

export function CasesPage() {
  const { user } = useAuth();
  const { t } = useUiLanguage();
  const userId = user?.id ?? "";
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<ContentLanguage>("es");
  const [editorLanguage, setEditorLanguage] = useState<ContentLanguage>("es");
  const [modalState, setModalState] = useState<CasesModalState>({
    type: "closed",
  });
  const deferredSearch = useDeferredValue(search.trim());

  const {
    data = [],
    isPending,
    error,
    createCaseMutation,
    updateCaseMutation,
    deleteCaseMutation,
  } = useCasesCrud(userId);
  const isInitialLoading = isPending && data.length === 0;

  const filteredCases = deferredSearch
    ? data.filter((record) => matchesCase(record, deferredSearch, language))
    : data;

  const isSavingCase =
    createCaseMutation.isPending || updateCaseMutation.isPending;
  const isDeletingCase = deleteCaseMutation.isPending;

  async function handleCreateCase(values: CaseFormValues) {
    try {
      const result = await createCaseMutation.mutateAsync(values);
      toast.success(t.content.cases.saveCreated);
      toast.success(
        result.translationCreated
          ? t.common.autoTranslationCreated
          : t.common.autoTranslationFailed,
      );
      setModalState({ type: "closed" });
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : t.content.cases.saveError,
      );
    }
  }

  async function handleUpdateCase(record: CaseRecord, values: CaseFormValues) {
    try {
      await updateCaseMutation.mutateAsync({ record, values });
      toast.success(t.content.cases.saveUpdated);
      setModalState({ type: "closed" });
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : t.content.cases.saveError,
      );
    }
  }

  async function handleDeleteCase(record: CaseRecord) {
    try {
      await deleteCaseMutation.mutateAsync(record);
      toast.success(t.content.cases.deleteSuccess);
      setModalState({ type: "closed" });
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : t.content.cases.deleteError,
      );
    }
  }

  const items = filteredCases.map((record) => {
    const translation = getCaseTranslation(record, language);
    const statusVariant: "success" | "outline" = translation?.is_active
      ? "success"
      : "outline";

    return {
      id: record.id,
      title:
        translation?.title ||
        `Caso #${record.id} ${t.common.noTranslation.toLowerCase()} ${language.toUpperCase()}`,
      subtitle:
        translation?.diagnosis ||
        `Diagnostico pendiente ${t.common.availableIn} ${language.toUpperCase()}`,
      status: translation
        ? translation.is_active
          ? t.common.active
          : t.common.draft
        : t.common.noTranslation,
      statusVariant,
      columns: [
        translation?.complexity ||
          `Sin complejidad ${t.common.availableIn} ${language.toUpperCase()}`,
        `${t.common.updatedAt} ${formatDate(record.updated_at)}`,
      ],
    };
  });

  if (error) {
    return (
      <Card className="p-6">
        <h1 className="text-lg font-semibold text-foreground">
          {t.content.cases.loadError}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {error instanceof Error ? error.message : t.common.unknownError}
        </p>
      </Card>
    );
  }

  const totalImages = data.reduce(
    (total, record) => total + record.images.length,
    0,
  );
  const activeCases = data.filter(
    (record) => getCaseTranslation(record, language)?.is_active,
  ).length;

  return (
    <>
      <ResourceListPanel
        title={t.content.cases.title}
        description={t.content.cases.description}
        createLabel={t.content.cases.createLabel}
        searchValue={search}
        searchPlaceholder={t.content.cases.searchPlaceholder}
        onSearchValueChange={setSearch}
        onCreate={() => {
          setEditorLanguage("es");
          setModalState({ type: "create" });
        }}
        isLoading={isInitialLoading}
        toolbarSlot={
          <ContentLanguageSwitch value={language} onChange={setLanguage} />
        }
        items={items}
        emptyMessage={t.content.cases.empty}
        stats={
          <>
            <ResumenStat
              label={t.content.cases.title}
              value={String(data.length)}
              detail={t.content.cases.totalDetail}
            />
            <ResumenStat
              label={t.common.active}
              value={String(activeCases)}
              detail={`${t.content.cases.activeDetailPrefix} ${t.common.languageNames[language]}.`}
            />
            <ResumenStat
              label={t.content.cases.imagesLabel}
              value={String(totalImages)}
              detail={t.content.cases.imagesDetail}
            />
          </>
        }
        renderActions={(item) => {
          const record = filteredCases.find((entry) => entry.id === item.id)!;
          return {
            onView: () => setModalState({ type: "view", record }),
            onEdit: () => {
              setEditorLanguage(language);
              setModalState({ type: "edit", record });
            },
            onDelete: () => setModalState({ type: "delete", record }),
          };
        }}
      />

      <Modal
        open={modalState.type !== "closed"}
        onClose={() => setModalState({ type: "closed" })}
        title={
          modalState.type === "create"
            ? t.content.modal.createCase
            : modalState.type === "edit"
              ? t.content.modal.editCase
              : modalState.type === "view"
                ? t.content.modal.viewCase
                : modalState.type === "delete"
                  ? t.content.modal.deleteCase
                  : ""
        }
        description={
          modalState.type === "create"
            ? `${t.common.create} ${t.common.translationLabel.toLowerCase()} ${t.common.availableIn} ${t.common.languageNames[editorLanguage]}.`
            : modalState.type === "edit"
              ? `${t.common.edit} ${t.common.translationLabel.toLowerCase()} ${editorLanguage.toUpperCase()} sin salir de la lista.`
              : modalState.type === "view"
                ? `${t.common.detail} ${t.common.translationLabel.toLowerCase()} ${language.toUpperCase()} del caso.`
                : modalState.type === "delete"
                  ? t.content.modal.deleteCaseDescription
                  : undefined
        }
        size={modalState.type === "delete" ? "md" : "xl"}
      >
        {modalState.type === "create" ? (
          <CaseEditor
            mode="create"
            record={null}
            language={editorLanguage}
            onLanguageChange={setEditorLanguage}
            isPending={isSavingCase}
            onSave={handleCreateCase}
          />
        ) : null}
        {modalState.type === "edit" ? (
          <CaseEditor
            mode="edit"
            record={modalState.record}
            language={editorLanguage}
            onLanguageChange={setEditorLanguage}
            isPending={isSavingCase || isDeletingCase}
            onSave={async (values) => {
              await handleUpdateCase(modalState.record, values);
            }}
            onDelete={async () => {
              await handleDeleteCase(modalState.record);
            }}
          />
        ) : null}
        {modalState.type === "view" ? (
          <CaseDetails record={modalState.record} language={language} />
        ) : null}
        {modalState.type === "delete" ? (
          <div className="space-y-6">
            <Card className="p-6">
              <p className="text-sm leading-7 text-muted-foreground">
                Vas a eliminar{" "}
                <span className="font-semibold text-foreground">
                  {getCaseTranslation(modalState.record, language)?.title ||
                    `Caso #${modalState.record.id}`}
                </span>
                . Esta accion tambien eliminara sus imagenes asociadas.
              </p>
            </Card>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalState({ type: "closed" })}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDeleteCase(modalState.record)}
                disabled={isDeletingCase}
              >
                {isDeletingCase
                  ? t.common.deleting
                  : t.content.modal.deleteCase}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
