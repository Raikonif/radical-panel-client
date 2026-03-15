import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppFallback } from "@/components/layout/AppFallback";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute, PublicOnlyRoute } from "@/features/auth/AuthProvider";

const LoginPage = lazy(async () => {
  const module = await import("@/pages/login/LoginPage");
  return { default: module.LoginPage };
});

const DashboardPage = lazy(async () => {
  const module = await import("@/pages/dashboard/DashboardPage");
  return { default: module.DashboardPage };
});

const CasesPage = lazy(async () => {
  const module = await import("@/pages/cases/CasesPage");
  return { default: module.CasesPage };
});

const CasesTestPage = lazy(async () => {
  const module = await import("@/pages/cases/CasesTestPage");
  return { default: module.CasesTestPage };
});

const VideosPage = lazy(async () => {
  const module = await import("@/pages/videos/VideosPage");
  return { default: module.VideosPage };
});

const PodcastsPage = lazy(async () => {
  const module = await import("@/pages/podcasts/PodcastsPage");
  return { default: module.PodcastsPage };
});

export function AppRouter() {
  return (
    <Suspense fallback={<AppFallback />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases-test" element={<CasesTestPage />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="podcasts" element={<PodcastsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
