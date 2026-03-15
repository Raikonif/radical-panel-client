import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ContentLanguageSwitch } from "@/components/workspace/ContentLanguageSwitch";
import { ResourceListPanel } from "@/components/workspace/ResourceListPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/features/auth/useAuth";
import { VideoDetails } from "@/features/videos/VideoDetails";
import { VideoEditor } from "@/features/videos/VideoEditor";
import {
  createVideo,
  deleteVideo,
  listVideos,
  updateVideo,
} from "@/features/content/api";
import { formatDate, getVideoTranslation } from "@/features/content/types";
import type {
  ContentLanguage,
  VideoFormValues,
  VideoRecord,
} from "@/features/content/types";
import { useUiLanguage } from "@/features/i18n/useUiLanguage";

type VideosModalState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "view"; record: VideoRecord }
  | { type: "edit"; record: VideoRecord }
  | { type: "delete"; record: VideoRecord };

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

function matchesVideo(
  record: VideoRecord,
  term: string,
  language: ContentLanguage,
) {
  const translation = getVideoTranslation(record, language);
  const haystack = [
    translation?.name,
    translation?.description,
    record.file_url,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(term.toLowerCase());
}

export function VideosPage() {
  const { user } = useAuth();
  const { t } = useUiLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<ContentLanguage>("es");
  const [modalState, setModalState] = useState<VideosModalState>({
    type: "closed",
  });
  const deferredSearch = useDeferredValue(search.trim());

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["videos", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => listVideos(user!.id),
  });

  const filteredVideos = deferredSearch
    ? data.filter((record) => matchesVideo(record, deferredSearch, language))
    : data;

  const saveMutation = useMutation({
    mutationFn: (values: VideoFormValues) => {
      if (modalState.type === "edit") {
        return updateVideo(modalState.record.id, values);
      }

      return createVideo(values, user!.id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["videos", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] }),
      ]);
      toast.success(
        modalState.type === "edit"
          ? t.content.videos.saveUpdated
          : t.content.videos.saveCreated,
      );
      setModalState({ type: "closed" });
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : t.content.videos.saveError,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (record: VideoRecord) => deleteVideo(record.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["videos", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] }),
      ]);
      toast.success(t.content.videos.deleteSuccess);
      setModalState({ type: "closed" });
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : t.content.videos.deleteError,
      );
    },
  });

  const items = filteredVideos.map((record) => {
    const translation = getVideoTranslation(record, language);
    const statusVariant: "success" | "outline" = translation?.is_active
      ? "success"
      : "outline";

    return {
      id: record.id,
      title:
        translation?.name ||
        `Video #${record.id} ${t.common.noTranslation.toLowerCase()} ${language.toUpperCase()}`,
      subtitle: translation
        ? `${t.common.translationLabel} ${language.toUpperCase()}`
        : `${t.common.noTranslation} ${language.toUpperCase()}`,
      status: translation
        ? translation.is_active
          ? t.common.active
          : t.common.draft
        : t.common.noTranslation,
      statusVariant,
      columns: [
        record.file_url ? "Con archivo" : "Sin archivo",
        `${t.common.updatedAt} ${formatDate(record.updated_at)}`,
      ],
    };
  });

  if (error) {
    return (
      <Card className="p-6">
        <h1 className="text-lg font-semibold text-foreground">
          {t.content.videos.loadError}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {error instanceof Error ? error.message : t.common.unknownError}
        </p>
      </Card>
    );
  }

  const activeVideos = data.filter(
    (record) => getVideoTranslation(record, language)?.is_active,
  ).length;

  return (
    <>
      <ResourceListPanel
        title={t.content.videos.title}
        description={t.content.videos.description}
        createLabel={t.content.videos.createLabel}
        searchValue={search}
        searchPlaceholder={t.content.videos.searchPlaceholder}
        onSearchValueChange={setSearch}
        onCreate={() => setModalState({ type: "create" })}
        isLoading={isLoading}
        toolbarSlot={
          <ContentLanguageSwitch value={language} onChange={setLanguage} />
        }
        items={items}
        emptyMessage={t.content.videos.empty}
        stats={
          <>
            <ResumenStat
              label={t.content.videos.title}
              value={String(data.length)}
              detail={t.content.videos.totalDetail}
            />
            <ResumenStat
              label={t.common.active}
              value={String(activeVideos)}
              detail={`${t.content.videos.activeDetailPrefix} ${t.common.languageNames[language]}.`}
            />
          </>
        }
        renderActions={(item) => {
          const record = filteredVideos.find((entry) => entry.id === item.id)!;
          return {
            onView: () => setModalState({ type: "view", record }),
            onEdit: () => setModalState({ type: "edit", record }),
            onDelete: () => setModalState({ type: "delete", record }),
          };
        }}
      />

      <Modal
        open={modalState.type !== "closed"}
        onClose={() => setModalState({ type: "closed" })}
        title={
          modalState.type === "create"
            ? t.content.modal.createVideo
            : modalState.type === "edit"
              ? t.content.modal.editVideo
              : modalState.type === "view"
                ? t.content.modal.viewVideo
                : modalState.type === "delete"
                  ? t.content.modal.deleteVideo
                  : ""
        }
        description={
          modalState.type === "create"
            ? `${t.common.create} ${t.common.translationLabel.toLowerCase()} ${language.toUpperCase()} del video.`
            : modalState.type === "edit"
              ? `${t.common.edit} ${t.common.translationLabel.toLowerCase()} ${language.toUpperCase()} del video.`
              : modalState.type === "view"
                ? `${t.common.detail} ${t.common.translationLabel.toLowerCase()} ${language.toUpperCase()} del video.`
                : modalState.type === "delete"
                  ? t.content.modal.deleteVideoDescription
                  : undefined
        }
        size={modalState.type === "delete" ? "md" : "xl"}
      >
        {modalState.type === "create" ? (
          <VideoEditor
            mode="create"
            record={null}
            language={language}
            isPending={saveMutation.isPending}
            onSave={async (values) => {
              await saveMutation.mutateAsync(values);
            }}
          />
        ) : null}
        {modalState.type === "edit" ? (
          <VideoEditor
            mode="edit"
            record={modalState.record}
            language={language}
            isPending={saveMutation.isPending}
            onSave={async (values) => {
              await saveMutation.mutateAsync(values);
            }}
          />
        ) : null}
        {modalState.type === "view" ? (
          <VideoDetails record={modalState.record} language={language} />
        ) : null}
        {modalState.type === "delete" ? (
          <div className="space-y-6">
            <Card className="p-6">
              <p className="text-sm leading-7 text-muted-foreground">
                Vas a eliminar{" "}
                <span className="font-semibold text-foreground">
                  {getVideoTranslation(modalState.record, language)?.name ||
                    `Video #${modalState.record.id}`}
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
                  : t.content.modal.deleteVideo}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
