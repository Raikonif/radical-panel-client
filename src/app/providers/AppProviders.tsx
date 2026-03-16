import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { UiLanguageProvider } from "@/features/i18n/UiLanguageProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1_000,
      gcTime: 30 * 60 * 1_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <UiLanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              visibleToasts={4}
              toastOptions={{
                classNames: {
                  toast:
                    "border border-border bg-card text-card-foreground shadow-lg",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </UiLanguageProvider>
    </QueryClientProvider>
  );
}
