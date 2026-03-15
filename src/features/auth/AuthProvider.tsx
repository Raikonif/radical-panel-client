import { startTransition, useEffect, useEffectEvent, useState } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Navigate } from "react-router";
import { AppFallback } from "@/components/layout/AppFallback";
import { AuthContext } from "@/features/auth/auth-context";
import { useAuth } from "@/features/auth/useAuth";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  const applySession = useEffectEvent((nextSession: Session | null) => {
    startTransition(() => {
      setSession(nextSession);
      setIsLoading(false);
    });
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const client = getSupabaseClient();
    let isMounted = true;

    void client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          throw error;
        }

        if (isMounted) {
          applySession(data.session);
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to restore Supabase session", error);
        if (isMounted) {
          applySession(null);
        }
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function requestEmailCode(email: string) {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY antes de iniciar sesion.",
      );
    }

    const { error } = await getSupabaseClient().auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      throw error;
    }
  }

  async function verifyEmailCode(email: string, token: string) {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY antes de iniciar sesion.",
      );
    }

    const { error } = await getSupabaseClient().auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      throw error;
    }
  }

  async function signOut() {
    if (!isSupabaseConfigured) {
      return;
    }

    const { error } = await getSupabaseClient().auth.signOut();

    if (error) {
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        isConfigured: isSupabaseConfigured,
        requestEmailCode,
        verifyEmailCode,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

type AuthRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: AuthRouteProps) {
  const { isLoading, user, isConfigured } = useAuth();

  if (isLoading) {
    return <AppFallback />;
  }

  if (!isConfigured || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: AuthRouteProps) {
  const { isLoading, user, isConfigured } = useAuth();

  if (isLoading) {
    return <AppFallback />;
  }

  if (isConfigured && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
