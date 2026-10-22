import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function origin() {
  return process.env["APP_URL"] ?? getRequestHeader("origin") ?? "http://localhost:8080";
}

async function getOrCreateCustomer(userId: string, email: string | undefined) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { stripe } = await import("./stripe.server");
  const { data } = await supabaseAdmin.from("profiles").select("stripe_customer_id").eq("id", userId).maybeSingle();
  if (data?.stripe_customer_id) return data.stripe_customer_id;
  const c = await stripe<{ id: string }>("customers", { email: email ?? "", "metadata[user_id]": userId });
  await supabaseAdmin.from("profiles").update({ stripe_customer_id: c.id }).eq("id", userId);
  return c.id;
}

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { stripe } = await import("./stripe.server");
    const price = process.env["STRIPE_PRICE_ID"];
    if (!price) throw new Error("STRIPE_PRICE_ID is not set");
    const customer = await getOrCreateCustomer(context.userId, context.claims.email as string | undefined);
    const s = await stripe<{ url: string }>("checkout/sessions", {
      mode: "subscription",
      customer,
      client_reference_id: context.userId,
      "line_items[0][price]": price,
      "line_items[0][quantity]": "1",
      "subscription_data[metadata][user_id]": context.userId,
      success_url: `${origin()}/account?paid=1`,
      cancel_url: `${origin()}/pricing`,
    });
    return { url: s.url };
  });

export const createPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { stripe } = await import("./stripe.server");
    const customer = await getOrCreateCustomer(context.userId, context.claims.email as string | undefined);
    const s = await stripe<{ url: string }>("billing_portal/sessions", { customer, return_url: `${origin()}/account` });
    return { url: s.url };
  });
