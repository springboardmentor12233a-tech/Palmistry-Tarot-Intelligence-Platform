import { useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in · Palmistry & Tarot Intelligence Platform" },
      {
        name: "description",
        content:
          "Sign in or create an account to save palm scans, tarot spreads and exported reading reports.",
      },
      { property: "og:title", content: "Sign in · Palmistry & Tarot Intelligence" },
      {
        property: "og:description",
        content: "Access your saved palm analyses, tarot spreads and PDF reading reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/studio";
  return value;
}

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const destination = safePath(search.redirect);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy("signin");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back.");
    void navigate({ to: destination });
  }

  async function signUp(event: React.FormEvent) {
    event.preventDefault();
    setBusy("signup");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      setAwaitingConfirm(true);
      toast.success("Check your email to confirm your account.");
      return;
    }
    toast.success("Your account is ready.");
    void navigate({ to: destination });
  }

  async function google() {
    setBusy("google");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(null);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    setBusy(null);
    void navigate({ to: destination });
  }

  async function resetPassword() {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    setBusy("reset");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset link sent.");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <div className="surface-panel animate-rise p-6">
          <h1 className="font-display text-2xl">Enter the reading room</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{" "}
            <Link to="/studio" search={{ guest: true }} className="text-primary underline">
              continue as a guest
            </Link>{" "}
            — readings just won&apos;t be saved.
          </p>
          <div className="gold-rule my-5" />

          {awaitingConfirm ? (
            <div className="space-y-4 text-sm">
              <p>
                We sent a confirmation link to <span className="text-primary">{email}</span>. Click
                it, then come back and sign in.
              </p>
              <Button variant="secondary" onClick={() => setAwaitingConfirm(false)}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-5">
                <form onSubmit={signIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy !== null}>
                    {busy === "signin" && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Sign in
                  </Button>
                  <button
                    type="button"
                    onClick={() => void resetPassword()}
                    className="text-xs text-muted-foreground underline"
                  >
                    Forgot your password?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-5">
                <form onSubmit={signUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display name</Label>
                    <Input
                      id="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Seeker"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-up">Email</Label>
                    <Input
                      id="email-up"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-up">Password</Label>
                    <Input
                      id="password-up"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy !== null}>
                    {busy === "signup" && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="gold-rule flex-1" /> or <span className="gold-rule flex-1" />
          </div>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => void google()}
            disabled={busy !== null}
          >
            {busy === "google" && <Loader2 className="mr-2 size-4 animate-spin" />}
            Continue with Google
          </Button>
        </div>
      </main>
    </div>
  );
}
