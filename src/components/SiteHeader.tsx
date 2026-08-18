import { Link, useRouter } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/studio", label: "Studio" },
] as const;

export function SiteHeader() {
  const { user, loading } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void router.navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full border border-primary/50 text-primary">
            ☾
          </span>
          <span className="font-display text-sm leading-tight sm:text-base">
            Palmistry <span className="text-primary">&amp;</span> Tarot
            <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              Intelligence Platform
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <Link
              to="/dashboard"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Dashboard
            </Link>
          )}
          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="ml-2">
                  {user.email?.split("@")[0] ?? "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => void signOut()}>
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="ml-2">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="sm:hidden">
            <Button variant="secondary" size="icon" aria-label="Open menu">
              <Menu className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {NAV.map((item) => (
              <DropdownMenuItem key={item.to} asChild>
                <Link to={item.to}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
            {user ? (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void signOut()}>Sign out</DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link to="/auth">Sign in</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
