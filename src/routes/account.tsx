import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { createPortal } from "@/lib/billing.functions";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account / Mon compte — QRcraft" },
      { name: "description", content: "Your QRcraft plan and saved QR codes." },
      { property: "og:title", content: "My account — QRcraft" },
      { property: "og:description", content: "Your plan and saved QR codes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Account,
});

type Row = { id: string; content: string; fg_color: string; bg_color: string; img?: string };

function Account() {
  const { t } = useI18n();
  const { user, isPremium, loading } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const portal = useServerFn(createPortal);
  const manage = async () => {
    try { const { url } = await portal(); window.location.href = url; }
    catch (e) { toast.error(e instanceof Error ? e.message : String(e)); }
  };

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user]);
  useEffect(() => {
    if (!user) return;
    supabase.from("qr_codes").select("*").order("created_at", { ascending: false }).then(async ({ data }) => {
      const list = await Promise.all((data ?? []).map(async (r) => ({
        ...r, img: await QRCode.toDataURL(r.content, { width: 200, margin: 1, color: { dark: r.fg_color, light: r.bg_color } }),
      })));
      setRows(list);
    });
  }, [user]);

  if (!user) return null;
  const del = async (id: string) => {
    await supabase.from("qr_codes").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">{t("account_title")}</h1>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5">
        <div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-1 flex items-center gap-2 font-bold">{t("plan")} : {isPremium ? <><Crown className="size-4 text-premium" />{t("premium")}</> : t("free")}</p>
        </div>
        <div className="flex gap-2">
          {isPremium ? <Button variant="secondary" onClick={manage}>{t("manage_sub")}</Button> : <Button asChild><Link to="/pricing">{t("go_premium")}</Link></Button>}
          <Button variant="secondary" onClick={() => supabase.auth.signOut()}>{t("logout")}</Button>
        </div>
      </div>
      <h2 className="mt-10 text-xl font-bold">{t("history")}</h2>
      {rows.length === 0 ? <p className="mt-3 text-muted-foreground">{t("empty")}</p> : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-3">
              <img src={r.img} alt={r.content} className="w-full rounded" />
              <p className="mt-2 truncate text-xs">{r.content}</p>
              <button onClick={() => del(r.id)} className="mt-1 text-xs text-destructive">{t("delete")}</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
