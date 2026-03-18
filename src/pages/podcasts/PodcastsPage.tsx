import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ContentLanguageSwitch } from "@/components/workspace/ContentLanguageSwitch";
import { ResourceListPanel } from "@/components/workspace/ResourceListPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/features/auth/useAuth";
import { PodcastDetails } from "@/features/podcasts/PodcastDetails";
import { PodcastEditor } from "@/features/podcasts/PodcastEditor";
import { deletePodcast, updatePodcast } from "@/features/content/api";
import {
  createPodcastWithAutoTranslation,
  type AutoTranslatedCreateResult,
} from "@/features/content/auto-translation";
import {
  contentQueryKeys,
  podcastsQueryOptions,
} from "@/features/content/queries";
import { formatDate, getPodcastTranslation } from "@/features/content/types";
import type {
  ContentLanguage,
  PodcastFormValues,
  PodcastRecord,
} from "@/features/content/types";
import { useUiLanguage } from "@/features/i18n/useUiLanguage";

type PodcastsModalState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "view"; record: PodcastRecord }
  | { type: "edit"; record: PodcastRecord }
  | { type: "delete"; record: PodcastRecord };

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

function matchesPodcast(
  record: PodcastRecord,
  term: string,
  language: ContentLanguage,
) {
  const translation = getPodcastTranslation(record, language);
  const haystack = [
    translation?.title,
    translation?.body,
    translation?.slug,
    record.file_url,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(term.toLowerCase());
}

export function PodcastsPage() {
  const { user } = useAuth();
  const { t } = useUiLanguage();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "";
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<ContentLanguage>("es");
  const [editorLanguage, setEditorLanguage] = useState<ContentLanguage>("es");
  const [modalState, setModalState] = useState<PodcastsModalState>({
    type: "closed",
  });
  const deferredSearch = useDeferredValue(search.trim());

  const {
    data = [],
    isPending,
    error,
  } = useQuery({
    ...podcastsQueryOptions(userId),
    enabled: Boolean(userId),
  });
  const isInitialLoading = isPending && data.length === 0;

  const filteredPodcasts = deferredSearch
    ? data.filter((record) => matchesPodcast(record, deferredSearch, language))
    : data;

  const saveMutation = useMutation({
    mutationFn: async (values: PodcastFormValues) => {
      if (modalState.type === "edit") {
        return {
          record: await updatePodcast(modalState.record.id, values, userId),
          translationCreated: false,
        };
      }

      return createPodcastWithAutoTranslation(values, userId);
    },
    onSuccess: async (result: AutoTranslatedCreateResult<PodcastRecord>) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: contentQueryKeys.podcasts(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: contentQueryKeys.dashboard(userId),
        }),
      ]);
      toast.success(
        modalState.type === "edit"
          ? t.content.podcasts.saveUpdated
          : t.content.podcasts.saveCreated,
      );
      if (modalState.type === "create") {
        toast.success(
          result.translationCreated
            ? t.common.autoTranslationCreated
            : t.common.autoTranslationFailed,
        );
      }
      setModalState({ type: "closed" });
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : t.content.podcasts.saveError,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (record: PodcastRecord) => deletePodcast(record.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: contentQueryKeys.podcasts(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: contentQueryKeys.dashboard(userId),
        }),
      ]);
      toast.success(t.content.podcasts.deleteSuccess);
      setModalState({ type: "closed" });
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : t.content.podcasts.deleteError,
      );
    },
  });

  const items = filteredPodcasts.map((record) => {
    const translation = getPodcastTranslation(record, language);
    const statusVariant: "success" | "outline" = record.is_active
      ? "success"
      : "outline";

    return {
      id: record.id,
      title:
        translation?.title ||
        `Podcast #${record.id} ${t.common.noTranslation.toLowerCase()} ${language.toUpperCase()}`,
      subtitle:
        translation?.slug ||
        `Slug pendiente ${t.common.availableIn} ${language.toUpperCase()}`,
      status: record.is_active ? t.common.active : t.common.draft,
      statusVariant,
      columns: [
        translation
          ? translation.is_active
            ? `${t.common.translationLabel} ${language.toUpperCase()} ${t.common.active.toLowerCase()}`
            : `${t.common.translationLabel} ${language.toUpperCase()} ${t.common.draft.toLowerCase()}`
          : `${t.common.noTranslation} ${language.toUpperCase()}`,
        `${t.common.updatedAt} ${formatDate(record.updated_at)}`,
      ],
    };
  });

  if (error) {
    return (
      <Card className="p-6">
        <h1 className="text-lg font-semibold text-foreground">
          {t.content.podcasts.loadError}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {error instanceof Error ? error.message : t.common.unknownError}
        </p>
      </Card>
    );
  }

  const activePodcasts = data.filter((record) => record.is_active).length;

  return (
    <>
      <ResourceListPanel
        title={t.content.podcasts.title}
        description={t.content.podcasts.description}
        createLabel={t.content.podcasts.createLabel}
        searchValue={search}
        searchPlaceholder={t.content.podcasts.searchPlaceholder}
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
        emptyMessage={t.content.podcasts.empty}
        stats={
          <>
            <ResumenStat
              label={t.content.podcasts.title}
              value={String(data.length)}
              detail={t.content.podcasts.totalDetail}
            />
            <ResumenStat
              label={t.common.active}
              value={String(activePodcasts)}
              detail={t.content.podcasts.activeDetail}
            />
          </>
        }
        renderActions={(item) => {
          const record = filteredPodcasts.find(
            (entry) => entry.id === item.id,
          )!;
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
            ? t.content.modal.createPodcast
            : modalState.type === "edit"
              ? t.content.modal.editPodcast
              : modalState.type === "view"
                ? t.content.modal.viewPodcast
                : modalState.type === "delete"
                  ? t.content.modal.deletePodcast
                  : ""
        }
        description={
          modalState.type === "create"
            ? `${t.common.create} ${t.common.translationLabel.toLowerCase()} ${editorLanguage.toUpperCase()} del episodio.`
            : modalState.type === "edit"
              ? `${t.common.edit} ${t.common.translationLabel.toLowerCase()} ${editorLanguage.toUpperCase()} del episodio.`
              : modalState.type === "view"
                ? `${t.common.detail} ${t.common.translationLabel.toLowerCase()} ${language.toUpperCase()} del episodio.`
                : modalState.type === "delete"
                  ? t.content.modal.deletePodcastDescription
                  : undefined
        }
        size={modalState.type === "delete" ? "md" : "xl"}
      >
        {modalState.type === "create" ? (
          <PodcastEditor
            mode="create"
            record={null}
            language={editorLanguage}
            onLanguageChange={setEditorLanguage}
            isPending={saveMutation.isPending}
            onSave={async (values) => {
              try {
                await saveMutation.mutateAsync(values);
              } catch {
                // Mutation toasts are handled in the page-level callbacks.
              }
            }}
          />
        ) : null}
        {modalState.type === "edit" ? (
          <PodcastEditor
            mode="edit"
            record={modalState.record}
            language={editorLanguage}
            onLanguageChange={setEditorLanguage}
            isPending={saveMutation.isPending}
            onSave={async (values) => {
              try {
                await saveMutation.mutateAsync(values);
              } catch {
                // Mutation toasts are handled in the page-level callbacks.
              }
            }}
          />
        ) : null}
        {modalState.type === "view" ? (
          <PodcastDetails record={modalState.record} language={language} />
        ) : null}
        {modalState.type === "delete" ? (
          <div className="space-y-6">
            <Card className="p-6">
              <p className="text-sm leading-7 text-muted-foreground">
                Vas a eliminar{" "}
                <span className="font-semibold text-foreground">
                  {getPodcastTranslation(modalState.record, language)?.title ||
                    `Podcast #${modalState.record.id}`}
                </span>
                .
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
                onClick={() =>
                  void deleteMutation.mutateAsync(modalState.record)
                }
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending
                  ? t.common.deleting
                  : t.content.modal.deletePodcast}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
