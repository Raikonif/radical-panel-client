import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import {
  Broadcast,
  HouseLine,
  Microscope,
  SignOut,
  VideoCamera,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useLocation, useOutlet } from "react-router";
import { toast } from "sonner";
import { UiLanguageSwitch } from "@/components/layout/UiLanguageSwitch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/useAuth";
import {
  casesQueryOptions,
  dashboardQueryOptions,
  podcastsQueryOptions,
  prefetchContentQueries,
  videosQueryOptions,
} from "@/features/content/queries";
import { useUiLanguage } from "@/features/i18n/useUiLanguage";
import { ThemeModeSwitch } from "@/components/layout/ThemeModeSwitch";
import { cn } from "@/lib/utils";

type NavigationItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
  preload: () => Promise<unknown>;
};

function NavigationLink({
  href,
  label,
  description,
  icon: Icon,
  preload,
}: NavigationItem) {
  return (
    <NavLink
      to={href}
      onMouseEnter={() => void preload()}
      onFocus={() => void preload()}
      className={({ isActive }) =>
        cn(
          "group flex items-start gap-2.5 rounded-[1.35rem] border px-3 py-2.5 text-left transition-all",
          isActive
            ? "border-primary/30 bg-primary/10 text-foreground shadow-sm shadow-fuchsia-500/10"
            : "border-transparent bg-background/40 text-muted-foreground hover:border-border hover:bg-background/80 hover:text-foreground",
        )
      }
    >
      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </NavLink>
  );
}

function MobileNavigationCard({
  href,
  label,
  icon: Icon,
  preload,
}: Pick<NavigationItem, "href" | "label" | "icon" | "preload">) {
  return (
    <NavLink
      to={href}
      onMouseEnter={() => void preload()}
      onFocus={() => void preload()}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-[1.15rem] border px-3 py-2.5 text-left transition-all",
          isActive
            ? "border-primary/30 bg-primary/12 text-foreground shadow-sm shadow-fuchsia-500/10"
            : "border-border/70 bg-background/55 text-muted-foreground hover:border-border hover:bg-background/85 hover:text-foreground",
        )
      }
    >
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="truncate text-sm font-medium">{label}</span>
    </NavLink>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const { signOut, user } = useAuth();
  const { locale, t } = useUiLanguage();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "";
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      href: "/dashboard",
      label: t.shell.nav.dashboard.label,
      icon: HouseLine,
      description: t.shell.nav.dashboard.description,
      preload: async () => {
        await Promise.all([
          import("@/pages/dashboard/DashboardPage"),
          userId
            ? queryClient.prefetchQuery(dashboardQueryOptions(userId))
            : Promise.resolve(),
        ]);
      },
    },
    {
      href: "/cases",
      label: t.shell.nav.cases.label,
      icon: Microscope,
      description: t.shell.nav.cases.description,
      preload: async () => {
        await Promise.all([
          import("@/pages/cases/CasesPage"),
          userId
            ? queryClient.prefetchQuery(casesQueryOptions(userId))
            : Promise.resolve(),
        ]);
      },
    },
    {
      href: "/videos",
      label: t.shell.nav.videos.label,
      icon: VideoCamera,
      description: t.shell.nav.videos.description,
      preload: async () => {
        await Promise.all([
          import("@/pages/videos/VideosPage"),
          userId
            ? queryClient.prefetchQuery(videosQueryOptions(userId))
            : Promise.resolve(),
        ]);
      },
    },
    {
      href: "/podcasts",
      label: t.shell.nav.podcasts.label,
      icon: Broadcast,
      description: t.shell.nav.podcasts.description,
      preload: async () => {
        await Promise.all([
          import("@/pages/podcasts/PodcastsPage"),
          userId
            ? queryClient.prefetchQuery(podcastsQueryOptions(userId))
            : Promise.resolve(),
        ]);
      },
    },
  ];

  useEffect(() => {
    if (!userId) {
      return;
    }

    void Promise.allSettled([
      import("@/pages/dashboard/DashboardPage"),
      import("@/pages/cases/CasesPage"),
      import("@/pages/videos/VideosPage"),
      import("@/pages/podcasts/PodcastsPage"),
      prefetchContentQueries(queryClient, userId),
    ]);
  }, [queryClient, userId]);

  const activeLabel =
    navigationItems.find((item) => pathname.startsWith(item.href))?.label ??
    t.shell.nav.dashboard.label;
  const mobileLanguageLabel = locale === "es" ? "Idioma" : "Language";
  const mobileThemeLabel = locale === "es" ? "Tema" : "Theme";

  const todayLabel = new Intl.DateTimeFormat(
    locale === "es" ? "es-BO" : "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  ).format(new Date());

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOut();
      toast.success(t.common.signOutSuccess);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.common.signOutError;
      toast.error(message);
      setIsSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 lg:px-6">
        <aside className="soft-enter hidden w-72 shrink-0 flex-col gap-3 lg:flex">
          <div className="rounded-[1.65rem] border border-border/70 bg-card/82 p-5 shadow-[0_24px_96px_-58px_rgba(147,51,234,0.58)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-fuchsia-500/30">
                N
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">
                  Radical Panel
                </p>
                <h1 className="text-lg font-semibold text-foreground">
                  {t.shell.brandTitle}
                </h1>
              </div>
            </div>
          </div>

          <nav className="rounded-[1.65rem] border border-border/70 bg-card/75 p-3 backdrop-blur-xl">
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t.shell.navigation}
            </div>
            <div className="space-y-1.5">
              {navigationItems.map((item) => (
                <NavigationLink key={item.href} {...item} />
              ))}
            </div>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="soft-enter soft-enter-delay-1 rounded-[1.5rem] border border-border/70 bg-card/80 px-3.5 py-4 shadow-[0_24px_96px_-62px_rgba(192,38,211,0.5)] backdrop-blur-xl sm:rounded-[1.65rem] sm:px-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/75">
                  {todayLabel}
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    {activeLabel}
                  </h2>
                  <p className="text-sm leading-5 text-muted-foreground">
                    {t.shell.headerDescription}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 lg:hidden">
                <nav className="grid grid-cols-2 gap-2.5">
                  {navigationItems.map((item) => (
                    <MobileNavigationCard key={item.href} {...item} />
                  ))}
                </nav>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-[1.15rem] border border-border/70 bg-background/60 px-3 py-2.5">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {mobileLanguageLabel}
                    </p>
                    <UiLanguageSwitch className="self-start" />
                  </div>
                  <div className="rounded-[1.15rem] border border-border/70 bg-background/60 px-3 py-2.5">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {mobileThemeLabel}
                    </p>
                    <ThemeModeSwitch className="self-start" />
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-border bg-background/70 px-3 py-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {t.common.activeSession}
                      </p>
                      <p className="truncate text-sm font-medium text-foreground">
                        {user?.email ?? t.common.noEmail}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full justify-center sm:w-auto sm:shrink-0"
                    >
                      <SignOut className="size-4" />
                      {isSigningOut ? t.common.signingOut : t.common.signOut}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-2.5 lg:flex">
                <UiLanguageSwitch />
                <ThemeModeSwitch />

                <div className="flex items-center gap-3 rounded-[1.2rem] border border-border bg-background/70 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {t.common.activeSession}
                    </p>
                    <p className="truncate text-sm font-medium text-foreground">
                      {user?.email ?? t.common.noEmail}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    <SignOut className="size-4" />
                    {isSigningOut ? t.common.signingOut : t.common.signOut}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1">
            <div key={pathname} className="page-transition">
              {outlet}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
