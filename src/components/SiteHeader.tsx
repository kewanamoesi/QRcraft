import { Link } from "@tanstack/react-router";
import { QrCode } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const link = "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";
  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><QrCode className="size-5" /></span>
          QRcraft
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link to="/pricing" className={link} activeProps={{ className: "text-foreground" }}>{t("nav_pricing")}</Link>
          <Link to={user ? "/account" : "/auth"} className={link}>{user ? t("nav_account") : t("nav_login")}</Link>
          <button
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="rounded-md border px-2 py-1 text-xs font-bold uppercase"
            aria-label="Language"
          >{lang === "fr" ? "EN" : "FR"}</button>
        </nav>
      </div>
    </header>
  );
}
