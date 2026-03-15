import type { ReactNode } from "react";
import {
  ArrowRight,
  Broadcast,
  ChartBar,
  Microscope,
  VideoCamera,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/useAuth";
import { getDashboardData } from "@/features/content/api";
import {
  formatDate,
  getPrimaryCaseTranslation,
  getPrimaryPodcastTranslation,
  getPrimaryVideoTranslation,
} from "@/features/content/types";
import { useUiLanguage } from "@/features/i18n/useUiLanguage";

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">{detail}</p>
    </Card>
  );
}

function RecentCard({
  title,
  description,
  href,
  icon,
  emptyLabel,
  openLabel,
  updatedLabel,
  items,
}: {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  emptyLabel: string;
  openLabel: string;
  updatedLabel: string;
  items: Array<{
    id: number;
    title: string;
    subtitle: string;
    updatedAt: string | null;
  }>;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
            <CardTitle className="mt-3">{title}</CardTitle>
            <CardDescription className="mt-1.5">{description}</CardDescription>
          </div>
          <Link
            to={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
          >
            {openLabel}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-border bg-background/70 px-4 py-7 text-sm leading-6 text-muted-foreground">
            {emptyLabel}
          </div>
        ) : null}

        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-[1.4rem] border border-border/70 bg-background/72 p-4"
          >
            <div className="text-sm font-semibold text-foreground">
              {item.title}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {item.subtitle}
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {updatedLabel} {formatDate(item.updatedAt)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useUiLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => getDashboardData(user!.id),
  });

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-lg font-semibold text-foreground">
          {t.dashboard.loadError}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {error instanceof Error ? error.message : t.common.unknownError}
        </p>
      </Card>
    );
  }

  const caseItems =
    data?.recentCases.map((record) => {
      const translation = getPrimaryCaseTranslation(record);
      return {
        id: record.id,
        title: translation?.title || `Caso #${record.id}`,
        subtitle: translation?.language
          ? `${t.common.translationLabel} ${translation.language.toUpperCase()}`
          : t.common.noTranslation,
        updatedAt: record.updated_at,
      };
    }) ?? [];

  const videoItems =
    data?.recentVideos.map((record) => {
      const translation = getPrimaryVideoTranslation(record);
      return {
        id: record.id,
        title: translation?.name || `Video #${record.id}`,
        subtitle: translation?.language
          ? `${t.common.translationLabel} ${translation.language.toUpperCase()}`
          : t.common.noTranslation,
        updatedAt: record.updated_at,
      };
    }) ?? [];

  const podcastItems =
    data?.recentPodcasts.map((record) => {
      const translation = getPrimaryPodcastTranslation(record);
      return {
        id: record.id,
        title: translation?.title || `Podcast #${record.id}`,
        subtitle: translation?.language
          ? `${t.common.translationLabel} ${translation.language.toUpperCase()}`
          : t.common.noTranslation,
        updatedAt: record.updated_at,
      };
    }) ?? [];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/75">
              {t.dashboard.eyebrow}
            </div>
            <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              {t.dashboard.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t.dashboard.description}
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-border/70 bg-background/72 p-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ChartBar className="size-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t.dashboard.liveTitle}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {t.dashboard.liveDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t.dashboard.stats.cases.label}
          value={isLoading ? 0 : (data?.counts.cases ?? 0)}
          detail={t.dashboard.stats.cases.detail}
        />
        <StatCard
          label={t.dashboard.stats.videos.label}
          value={isLoading ? 0 : (data?.counts.videos ?? 0)}
          detail={t.dashboard.stats.videos.detail}
        />
        <StatCard
          label={t.dashboard.stats.podcasts.label}
          value={isLoading ? 0 : (data?.counts.podcasts ?? 0)}
          detail={t.dashboard.stats.podcasts.detail}
        />
        <StatCard
          label={t.dashboard.stats.activeTranslations.label}
          value={isLoading ? 0 : (data?.counts.activeTranslations ?? 0)}
          detail={`${data?.counts.caseImages ?? 0} ${t.dashboard.stats.activeTranslations.detailSuffix}`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <RecentCard
          title={t.dashboard.recents.cases.title}
          description={t.dashboard.recents.cases.description}
          href="/cases"
          icon={<Microscope className="size-5" />}
          emptyLabel={t.dashboard.recents.empty}
          openLabel={t.common.open}
          updatedLabel={t.common.updatedAt}
          items={caseItems}
        />
        <RecentCard
          title={t.dashboard.recents.videos.title}
          description={t.dashboard.recents.videos.description}
          href="/videos"
          icon={<VideoCamera className="size-5" />}
          emptyLabel={t.dashboard.recents.empty}
          openLabel={t.common.open}
          updatedLabel={t.common.updatedAt}
          items={videoItems}
        />
        <RecentCard
          title={t.dashboard.recents.podcasts.title}
          description={t.dashboard.recents.podcasts.description}
          href="/podcasts"
          icon={<Broadcast className="size-5" />}
          emptyLabel={t.dashboard.recents.empty}
          openLabel={t.common.open}
          updatedLabel={t.common.updatedAt}
          items={podcastItems}
        />
      </div>
    </div>
  );
}
