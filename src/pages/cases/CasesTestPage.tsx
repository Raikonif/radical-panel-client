import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/useAuth";
import { listCases } from "@/features/content/api";

export function CasesTestPage() {
  const { user } = useAuth();
  const {
    data = [],
    error,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["cases-test", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => listCases(user!.id),
  });

  return (
    <div className="grid gap-4">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Cases Test
        </h1>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>Authenticated user id: {user?.id ?? "No session"}</p>
          <p>Rows returned: {data.length}</p>
          <p>Loading: {isLoading ? "true" : "false"}</p>
          <p>Fetching: {isFetching ? "true" : "false"}</p>
          <p>Error: {error instanceof Error ? error.message : "none"}</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Raw Result</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-background/60 p-4 text-xs leading-6 text-foreground">
          {JSON.stringify(data, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
