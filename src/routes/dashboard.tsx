import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleAlert, ClipboardList, History, LogIn, LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppShell } from "@/components/agricare-shell";
import { useAgriAuth } from "@/lib/agricare-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My history — AgriCare AI" },
      { name: "description", content: "Your private plant-check history: what was observed, and what to look at next." },
      { property: "og:title", content: "My history — AgriCare AI" },
      { property: "og:description", content: "Your private plant-check history: what was observed, and what to look at next." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

type HistoryRow = {
  id: string;
  created_at: string;
  crop: string | null;
  disease: string | null;
  health_status: string;
  result: unknown;
};

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(asText) as string[] : [];
}

function DashboardPage() {
  const { user, loading } = useAgriAuth();
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void supabase
      .from("plant_analyses")
      .select("id, created_at, crop, disease, health_status, result")
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!alive) return;
        if (fetchError) setError("Your history could not be loaded. Please refresh and try again.");
        setRows(data ?? []);
      });
    return () => { alive = false; };
  }, [user]);

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <div className="border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase text-primary">My history</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Your plant checks</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> Only you can see these written results. Photos are never saved with your history.</p>
        </div>

        {loading ? (
          <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Checking your session…</p>
        ) : !user ? (
          <Card className="mt-10 flex flex-col items-center rounded-md border-border p-10 text-center shadow-none">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary"><LogIn className="size-6" /></span>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Sign in to see your history</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Each plant check you run is saved privately to your account.</p>
            <Button asChild className="mt-5 rounded-md"><Link to="/auth">Sign in</Link></Button>
          </Card>
        ) : error ? (
          <Card className="mt-10 rounded-md border-destructive/50 p-6 shadow-none"><p className="flex items-center gap-2 text-sm text-destructive"><CircleAlert className="size-4" /> {error}</p></Card>
        ) : rows === null ? (
          <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Loading your history…</p>
        ) : rows.length === 0 ? (
          <Card className="mt-10 flex flex-col items-center rounded-md border-border p-10 text-center shadow-none">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary"><History className="size-6" /></span>
            <h2 className="mt-4 text-lg font-semibold text-foreground">No plant checks yet</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Run your first leaf check and its written result will appear here.</p>
            <Button asChild className="mt-5 rounded-md"><Link to="/">Check a leaf</Link></Button>
          </Card>
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {rows.map((row) => {
              const result = (row.result ?? {}) as Record<string, unknown>;
              const nextSteps = asList(result["nextSteps"]).slice(0, 2);
              return (
                <li key={row.id}>
                  <Card className="h-full rounded-md border-border p-5 shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{row.disease ?? (row.health_status === "healthy" ? "No clear concern visible" : row.health_status === "uncertain" ? "Not conclusive" : "A possible concern")}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{row.crop ? `Possible crop: ${row.crop} · ` : ""}{new Date(row.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-medium ${row.health_status === "healthy" ? "text-primary" : row.health_status === "uncertain" ? "text-muted-foreground" : "text-destructive"}`}>{row.health_status}</span>
                    </div>
                    {nextSteps.length > 0 && (
                      <div className="mt-4 border-t border-border pt-3">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground"><ClipboardList className="size-3.5 text-primary" /> Next steps</p>
                        <ul className="mt-1.5 space-y-1 text-sm leading-5 text-muted-foreground">{nextSteps.map((step, index) => <li key={index}>• {step}</li>)}</ul>
                      </div>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
