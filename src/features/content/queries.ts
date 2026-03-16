import { queryOptions, type QueryClient } from "@tanstack/react-query";
import {
  getDashboardData,
  listCases,
  listPodcasts,
  listVideos,
} from "@/features/content/api";

const CONTENT_STALE_TIME = 5 * 60 * 1_000;

export const contentQueryKeys = {
  dashboard: (userId: string) => ["dashboard", userId] as const,
  cases: (userId: string) => ["cases", userId] as const,
  videos: (userId: string) => ["videos", userId] as const,
  podcasts: (userId: string) => ["podcasts", userId] as const,
};

export function dashboardQueryOptions(userId: string) {
  return queryOptions({
    queryKey: contentQueryKeys.dashboard(userId),
    queryFn: () => getDashboardData(userId),
    staleTime: CONTENT_STALE_TIME,
  });
}

export function casesQueryOptions(userId: string) {
  return queryOptions({
    queryKey: contentQueryKeys.cases(userId),
    queryFn: () => listCases(userId),
    staleTime: CONTENT_STALE_TIME,
  });
}

export function videosQueryOptions(userId: string) {
  return queryOptions({
    queryKey: contentQueryKeys.videos(userId),
    queryFn: () => listVideos(userId),
    staleTime: CONTENT_STALE_TIME,
  });
}

export function podcastsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: contentQueryKeys.podcasts(userId),
    queryFn: () => listPodcasts(userId),
    staleTime: CONTENT_STALE_TIME,
  });
}

export async function prefetchContentQueries(
  queryClient: QueryClient,
  userId: string,
) {
  await Promise.all([
    queryClient.prefetchQuery(dashboardQueryOptions(userId)),
    queryClient.prefetchQuery(casesQueryOptions(userId)),
    queryClient.prefetchQuery(videosQueryOptions(userId)),
    queryClient.prefetchQuery(podcastsQueryOptions(userId)),
  ]);
}
