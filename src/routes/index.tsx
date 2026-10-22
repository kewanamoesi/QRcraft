import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Crown, Download, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QRcraft — Free QR code generator / Générateur de QR codes gratuit" },
      { name: "description", content: "Create QR codes instantly for free. Premium: colors, HD, SVG and history." },
      { property: "og:title", content: "QRcraft — QR code generator" },
      { property: "og:description", content: "Create QR codes instantly for free. Go Premium for colors, HD and SVG." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function download(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href; a.download = name; a.click();
}

function Index() {
  const { t } = useI18n();
  const { user, isPremium } = useAuth();
  const [text, setText] = useState("https://lovable.dev");
  const [fg, setFg] = useState("#0f3d2e");
  const [bg, setBg] = useState("#ffffff");
  const [preview, setPreview] = useState("");
  const colors = isPremium ? { dark: fg, light: bg } : { dark: "#000000", light: "#ffffff" };

  useEffect(() => {
    if (!text) { setPreview(""); return; }
    QRCode.toDataURL(text, { width: 600, margin: 2, color: colors }).then(setPreview).catch(() => setPreview(""));
  }, [text, fg, bg, isPremium]);

  const dlPng = async () => {
    const url = await QRCode.toDataURL(text, { width: isPremium ? 1200 : 300, margin: 2, color: colors });
    download(url, "qrcode.png");
  };
  const dlSvg = async () => {
    if (!isPremium) { toast(t("need_premium")); return; }
    const svg = await QRCode.toString(text, { type: "svg", margin: 2, color: colors });
    download(URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })), "qrcode.svg");
  };
  const save = async () => {
    if (!user) { toast(t("need_login")); return; }
    if (!isPremium) { toast(t("need_premium")); return; }
    const { error } = await supabase.from("qr_codes").insert({ user_id: user.id, content: text, fg_color: fg, bg_color: bg });
    if (error) toast.error(error.message); else toast.success(t("saved"));
  };

  return (
    <main className="grid-dots">
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">{t("hero_title")}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("hero_sub")}</p>
          <label className="mt-8 text-sm font-semibold">{t("input_label")}</label>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("input_ph")} className="mt-2 h-12 bg-card text-base" />
          <div className="mt-5 flex gap-4">
            {([["fg", fg, setFg], ["bg", bg, setBg]] as const).map(([k, v, set]) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input type="color" value={v} disabled={!isPremium} onChange={(e) => set(e.target.value)} className="size-9 cursor-pointer rounded border disabled:opacity-40" />
                {t(k)}
                {!isPremium && <span className="inline-flex items-center gap-1 rounded-full bg-premium px-2 py-0.5 text-xs font-bold text-premium-foreground"><Crown className="size-3" />{t("premium_only")}</span>}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
            {preview && <img src={preview} alt="QR code" className="size-full object-contain" />}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">{t("hd_note")}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button onClick={dlPng} disabled={!text} className="col-span-2 h-11"><Download />{t("dl_png")}</Button>
            <Button variant="secondary" onClick={dlSvg} disabled={!text}>{!isPremium && <Crown />}{t("dl_svg")}</Button>
            <Button variant="secondary" onClick={save} disabled={!text}>{!isPremium && <Crown />}<Save />{t("save")}</Button>
          </div>
          {!isPremium && (
            <Link to="/pricing" className="mt-4 block rounded-lg bg-accent px-4 py-3 text-center text-sm font-bold text-accent-foreground">
              {t("go_premium")} →
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
