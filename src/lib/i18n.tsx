import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";

const dict = {
  fr: {
    nav_generator: "Générateur", nav_pricing: "Tarifs", nav_account: "Mon compte", nav_login: "Connexion",
    hero_title: "Des QR codes nets, en une seconde.",
    hero_sub: "Collez un lien ou un texte. Téléchargez. C'est tout. Passez Premium pour les couleurs, l'export vectoriel et l'historique.",
    input_label: "Lien ou texte", input_ph: "https://votre-site.com",
    fg: "Couleur", bg: "Fond", premium_only: "Premium",
    dl_png: "Télécharger PNG", dl_svg: "Télécharger SVG", save: "Enregistrer",
    saved: "QR code enregistré", hd_note: "Gratuit : 300 px · Premium : 1200 px",
    pricing_title: "Un plan simple pour chacun",
    free: "Gratuit", premium: "Premium", per_month: "/mois",
    f1: "QR codes illimités", f2: "Noir et blanc", f3: "PNG 300 px",
    p1: "Couleurs personnalisées", p2: "PNG haute définition 1200 px", p3: "Export SVG vectoriel", p4: "Historique de vos QR codes",
    start_free: "Commencer gratuitement", go_premium: "Passer Premium",
    manage_sub: "Gérer mon abonnement",
    login_title: "Connexion", signup_title: "Créer un compte", email: "E-mail", password: "Mot de passe",
    submit_login: "Se connecter", submit_signup: "Créer mon compte", google: "Continuer avec Google",
    switch_signup: "Pas de compte ? Inscrivez-vous", switch_login: "Déjà inscrit ? Connectez-vous",
    check_email: "Vérifiez vos e-mails pour confirmer votre compte.",
    account_title: "Mon compte", plan: "Plan actuel", logout: "Se déconnecter",
    history: "Mes QR codes", empty: "Aucun QR code enregistré.", delete: "Supprimer",
    need_login: "Connectez-vous pour enregistrer.", need_premium: "Fonction réservée au Premium.",
  },
  en: {
    nav_generator: "Generator", nav_pricing: "Pricing", nav_account: "Account", nav_login: "Sign in",
    hero_title: "Crisp QR codes, in one second.",
    hero_sub: "Paste a link or text. Download. Done. Go Premium for colors, vector export and history.",
    input_label: "Link or text", input_ph: "https://your-site.com",
    fg: "Color", bg: "Background", premium_only: "Premium",
    dl_png: "Download PNG", dl_svg: "Download SVG", save: "Save",
    saved: "QR code saved", hd_note: "Free: 300 px · Premium: 1200 px",
    pricing_title: "A simple plan for everyone",
    free: "Free", premium: "Premium", per_month: "/month",
    f1: "Unlimited QR codes", f2: "Black & white", f3: "PNG 300 px",
    p1: "Custom colors", p2: "HD PNG 1200 px", p3: "SVG vector export", p4: "History of your QR codes",
    start_free: "Start for free", go_premium: "Go Premium",
    manage_sub: "Manage subscription",
    login_title: "Sign in", signup_title: "Create an account", email: "Email", password: "Password",
    submit_login: "Sign in", submit_signup: "Create account", google: "Continue with Google",
    switch_signup: "No account? Sign up", switch_login: "Already registered? Sign in",
    check_email: "Check your inbox to confirm your account.",
    account_title: "My account", plan: "Current plan", logout: "Sign out",
    history: "My QR codes", empty: "No saved QR codes yet.", delete: "Delete",
    need_login: "Sign in to save.", need_premium: "Premium-only feature.",
  },
} as const;

export type Key = keyof typeof dict.fr;
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "fr", setLang: () => {}, t: (k) => dict.fr[k],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");
  useEffect(() => {
    const s = localStorage.getItem("lang");
    if (s === "fr" || s === "en") setLangState(s);
    else if (!navigator.language.startsWith("fr")) setLangState("en");
  }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("lang", l); };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dict[lang][k] }}>{children}</Ctx.Provider>;
}
export const useI18n = () => useContext(Ctx);
