import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCase, updateCase } from "@/features/content/api";
import {
  createCaseWithAutoTranslation,
  type AutoTranslatedCreateResult,
} from "@/features/content/auto-translation";
import {
  casesQueryOptions,
  contentQueryKeys,
} from "@/features/content/queries";
import type {
  CaseFormValues,
  CaseRecord,
  DashboardData,
} from "@/features/content/types";

function getSortTimestamp(
  record: Pick<CaseRecord, "updated_at" | "created_at">,
) {
  return Date.parse(record.updated_at ?? record.created_at);
}

function sortCases(records: CaseRecord[]) {
  return [...records].sort(
    (left, right) => getSortTimestamp(right) - getSortTimestamp(left),
  );
}

function upsertCaseRecord(records: CaseRecord[], nextRecord: CaseRecord) {
  return sortCases([
    nextRecord,
    ...records.filter((record) => record.id !== nextRecord.id),
  ]);
}

function removeCaseRecord(records: CaseRecord[], caseId: number) {
  return records.filter((record) => record.id !== caseId);
}

function countActiveCaseTranslations(record: CaseRecord) {
  return record.translations.filter((translation) => translation.is_active)
    .length;
}

function getActiveTranslationDelta(
  nextRecord: CaseRecord,
  previousRecord?: CaseRecord,
) {
  return (
    countActiveCaseTranslations(nextRecord) -
    (previousRecord ? countActiveCaseTranslations(previousRecord) : 0)
  );
}

function updateDashboardWithCase(
  dashboard: DashboardData,
  nextRecord: CaseRecord,
  previousRecord?: CaseRecord,
): DashboardData {
  const caseCountDelta = previousRecord ? 0 : 1;
  const activeTranslationsDelta = getActiveTranslationDelta(
    nextRecord,
    previousRecord,
  );
  const caseImagesDelta =
    nextRecord.images.length - (previousRecord?.images.length ?? 0);

  return {
    ...dashboard,
    counts: {
      ...dashboard.counts,
      cases: dashboard.counts.cases + caseCountDelta,
      activeTranslations:
        dashboard.counts.activeTranslations + activeTranslationsDelta,
      caseImages: dashboard.counts.caseImages + caseImagesDelta,
    },
    recentCases: upsertCaseRecord(dashboard.recentCases, nextRecord).slice(
      0,
      4,
    ),
  };
}

function removeCaseFromDashboard(
  dashboard: DashboardData,
  record: CaseRecord,
): DashboardData {
  return {
    ...dashboard,
    counts: {
      ...dashboard.counts,
      cases: Math.max(0, dashboard.counts.cases - 1),
      activeTranslations: Math.max(
        0,
        dashboard.counts.activeTranslations -
          countActiveCaseTranslations(record),
      ),
      caseImages: Math.max(
        0,
        dashboard.counts.caseImages - record.images.length,
      ),
    },
    recentCases: removeCaseRecord(dashboard.recentCases, record.id).slice(0, 4),
  };
}

type UpdateCaseInput = {
  record: CaseRecord;
  values: CaseFormValues;
};

export function useCasesCrud(userId: string) {
  const queryClient = useQueryClient();
  const casesKey = contentQueryKeys.cases(userId);
  const dashboardKey = contentQueryKeys.dashboard(userId);

  const casesQuery = useQuery({
    ...casesQueryOptions(userId),
    enabled: Boolean(userId),
  });

  const createCaseMutation = useMutation({
    mutationFn: (values: CaseFormValues) =>
      createCaseWithAutoTranslation(values, userId),
    onSuccess: ({
      record: nextRecord,
    }: AutoTranslatedCreateResult<CaseRecord>) => {
      queryClient.setQueryData<CaseRecord[]>(casesKey, (records = []) =>
        upsertCaseRecord(records, nextRecord),
      );
      queryClient.setQueryData<DashboardData>(dashboardKey, (dashboard) =>
        dashboard ? updateDashboardWithCase(dashboard, nextRecord) : dashboard,
      );
    },
  });

  const updateCaseMutation = useMutation({
    mutationFn: ({ record, values }: UpdateCaseInput) =>
      updateCase(record.id, values),
    onSuccess: (nextRecord, { record }) => {
      queryClient.setQueryData<CaseRecord[]>(casesKey, (records = []) =>
        upsertCaseRecord(records, nextRecord),
      );
      queryClient.setQueryData<DashboardData>(dashboardKey, (dashboard) =>
        dashboard
          ? updateDashboardWithCase(dashboard, nextRecord, record)
          : dashboard,
      );
    },
  });

  const deleteCaseMutation = useMutation({
    mutationFn: (record: CaseRecord) => deleteCase(record.id),
    onMutate: async (record) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: casesKey }),
        queryClient.cancelQueries({ queryKey: dashboardKey }),
      ]);

      const previousCases = queryClient.getQueryData<CaseRecord[]>(casesKey);
      const previousDashboard =
        queryClient.getQueryData<DashboardData>(dashboardKey);

      queryClient.setQueryData<CaseRecord[]>(casesKey, (records = []) =>
        removeCaseRecord(records, record.id),
      );
      queryClient.setQueryData<DashboardData>(dashboardKey, (dashboard) =>
        dashboard ? removeCaseFromDashboard(dashboard, record) : dashboard,
      );

      return { previousCases, previousDashboard };
    },
    onError: (_error, _record, context) => {
      if (context?.previousCases) {
        queryClient.setQueryData(casesKey, context.previousCases);
      }

      if (context?.previousDashboard) {
        queryClient.setQueryData(dashboardKey, context.previousDashboard);
      }
    },
  });

  return {
    ...casesQuery,
    createCaseMutation,
    updateCaseMutation,
    deleteCaseMutation,
  };
}
