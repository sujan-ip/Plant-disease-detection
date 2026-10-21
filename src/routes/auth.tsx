import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Leaf, LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppShell } from "@/components/agricare-shell";
import { useAgriAuth } from "@/lib/agricare-auth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AgriCare AI" },
      { name: "description", content: "Sign in or create a free account to run plant checks and keep a private history." },
      { property: "og:title", content: "Sign in — AgriCare AI" },
      { property: "og:description", content: "Sign in or create a free account to run plant checks and keep a private history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAgriAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  if (user && !loading) {
    void navigate({ to: "/dashboard" });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in. Your history is waiting.");
        void navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setNotice("Account created. Check your email for a confirmation link, then sign in here.");
        setMode("signin");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "That did not work. Please try again.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSocial(provider: "google" | "lovable") {
    setBusy(true);
    try {
      if (provider === "google") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const result = await lovable.auth.signInWithOAuth("lovable", { redirect_uri: window.location.origin });
        if (result.error && !result.redirected) throw result.error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in could not start. Please try again.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-md px-4 pb-20 pt-14 sm:px-6">
        <Card className="rounded-md border-border p-6 shadow-none sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground"><Leaf className="size-6" /></span>
            <h1 className="mt-4 text-2xl font-semibold text-foreground">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">One account keeps your plant checks and history private to you.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7">
            <label className="block text-sm font-medium text-foreground" htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" required minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            {notice && <p className="mt-3 rounded-md bg-accent px-3 py-2 text-xs leading-5 text-foreground">{notice}</p>}
            <Button type="submit" className="mt-5 w-full rounded-md" disabled={busy}>
              {busy ? <LoaderCircle className="size-4 animate-spin" /> : mode === "signin" ? <><LogIn className="size-4" /> Sign in</> : <><UserPlus className="size-4" /> Create account</>}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>

          <div className="grid gap-2">
            <Button type="button" variant="outline" className="rounded-md" disabled={busy} onClick={() => void handleSocial("google")}>Continue with Google</Button>
            <Button type="button" variant="outline" className="rounded-md" disabled={busy} onClick={() => void handleSocial("lovable")}>Continue with Lovable</Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <button type="button" className="font-semibold text-primary hover:underline" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setNotice(""); }}>
              {mode === "signin" ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </Card>
      </main>
    </AppShell>
  );
}
