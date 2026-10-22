import { lovable } from "@/integrations/lovable/index";

// Inside Lovable, Google sign-in goes through Lovable's managed broker.
// OUTSIDE Lovable (your own hosting), replace the body of this function with:
//
//   import { supabase } from "@/integrations/supabase/client";
//   return supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
//
// and enable Google with your own Google client ID/secret in your Supabase project.
export async function signInWithGoogle() {
  return lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
}
