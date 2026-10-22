import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/google-signin";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in / Connexion — QRcraft" },
      { name: "description", content: "Sign in or create your QRcraft account." },
      { property: "og:title", content: "Sign in — QRcraft" },
      { property: "og:description", content: "Access your QRcraft account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/account" }); }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      error ? toast.error(error.message) : toast.success(t("check_email"));
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    }
    setBusy(false);
  };
  const google = async () => {
    const r = (await signInWithGoogle()) as { error?: { message?: string } | null };
    if (r.error) toast.error(String(r.error.message ?? r.error));
  };

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl font-extrabold">{mode === "login" ? t("login_title") : t("signup_title")}</h1>
      <Button variant="secondary" className="mt-6 w-full" onClick={google}>{t("google")}</Button>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <Input type="email" required placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required minLength={6} placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" className="w-full" disabled={busy}>{mode === "login" ? t("submit_login") : t("submit_signup")}</Button>
      </form>
      <button className="mt-4 text-sm text-muted-foreground underline" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? t("switch_signup") : t("switch_login")}
      </button>
    </main>
  );
}
