import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import { createCheckout } from "@/lib/billing.functions";
import { Check, Crown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing / Tarifs — QRcraft" },
      { name: "description", content: "Free QR codes forever, or Premium at 4.99/month for colors, HD, SVG and history." },
      { property: "og:title", content: "QRcraft pricing" },
      { property: "og:description", content: "Free or Premium at 4.99/month." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { t } = useI18n();
  const { user, isPremium } = useAuth();
  const nav = useNavigate();
  const checkout = useServerFn(createCheckout);
  const [busy, setBusy] = useState(false);
  const buy = async () => {
    if (!user) { nav({ to: "/auth" }); return; }
    if (isPremium) { nav({ to: "/account" }); return; }
    setBusy(true);
    try { const { url } = await checkout(); window.location.href = url; }
    catch (e) { toast.error(e instanceof Error ? e.message : String(e)); setBusy(false); }
  };
  const Item = ({ k }: { k: Parameters<typeof t>[0] }) => (
    <li className="flex items-center gap-2"><Check className="size-4 text-primary" />{t(k)}</li>
  );
  return (
    <main className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-center text-4xl font-extrabold md:text-5xl">{t("pricing_title")}</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-7">
          <h2 className="text-xl font-bold">{t("free")}</h2>
          <p className="mt-2 font-display text-4xl font-extrabold">0 €</p>
          <ul className="mt-6 space-y-3 text-sm"><Item k="f1" /><Item k="f2" /><Item k="f3" /></ul>
          <Button asChild variant="secondary" className="mt-8 w-full"><Link to="/">{t("start_free")}</Link></Button>
        </div>
        <div className="rounded-2xl border-2 border-primary bg-card p-7 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-bold"><Crown className="size-5 text-premium" />{t("premium")}</h2>
          <p className="mt-2 font-display text-4xl font-extrabold">4,99 €<span className="text-base font-medium text-muted-foreground">{t("per_month")}</span></p>
          <ul className="mt-6 space-y-3 text-sm"><Item k="f1" /><Item k="p1" /><Item k="p2" /><Item k="p3" /><Item k="p4" /></ul>
          <Button className="mt-8 w-full" disabled={busy} onClick={buy}>{t("go_premium")}</Button>
        </div>
      </div>
    </main>
  );
}
