import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { user: User | null; isPremium: boolean; loading: boolean };
const Ctx = createContext<AuthState>({ user: null, isPremium: false, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isPremium: false, loading: true });
  useEffect(() => {
    const load = async (user: User | null) => {
      let isPremium = false;
      if (user) {
        const { data } = await supabase.from("profiles").select("is_premium").eq("id", user.id).maybeSingle();
        isPremium = !!data?.is_premium;
      }
      setState({ user, isPremium, loading: false });
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setTimeout(() => load(session?.user ?? null), 0);
    });
    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
