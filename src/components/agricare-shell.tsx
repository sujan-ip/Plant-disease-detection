import { Link } from "@tanstack/react-router";
import { Leaf, Menu, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgriAuth } from "@/lib/agricare-auth";

const navigation = [
  { to: "/", label: "Plant check" },
  { to: "/fertilizer", label: "Soil & nutrients" },
  { to: "/dashboard", label: "My history" },
  { to: "/about", label: "About" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAgriAuth();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="AgriCare AI home">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><Leaf className="size-5" /></span>
            <span className="min-w-0"><span className="block text-sm font-semibold leading-tight">AgriCare AI</span><span className="hidden text-[11px] text-muted-foreground sm:block">Plant health companion</span></span>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-accent font-semibold text-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            {user ? <Link to="/dashboard" className="hidden max-w-40 truncate text-xs text-muted-foreground sm:block">{user.email}</Link> : <Button asChild variant="outline" size="sm" className="rounded-md"><Link to="/auth">Sign in</Link></Button>}
            <Link to="/" className="flex size-9 items-center justify-center rounded-md text-primary hover:bg-accent md:hidden" aria-label="Plant check"><Sprout className="size-5" /></Link>
          </div>
        </div>
        <nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="shrink-0 rounded-md px-3 py-1.5 text-xs text-muted-foreground"
                activeProps={{ className: "bg-accent font-semibold text-primary" }}
              >
                {item.label}
              </Link>
            ))}
        </nav>
      </header>
      {children}
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <span>AgriCare AI · A careful first look for healthier plants</span>
          <Link to="/about" className="inline-flex items-center gap-2 hover:text-foreground"><Menu className="size-3.5" /> About & limitations</Link>
        </div>
      </footer>
    </div>
  );
}