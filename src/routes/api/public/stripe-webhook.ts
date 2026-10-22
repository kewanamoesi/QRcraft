import { createFileRoute } from "@tanstack/react-router";

// Stripe → Developers → Webhooks → endpoint: https://YOUR-DOMAIN/api/public/stripe-webhook
// Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook secret missing", { status: 500 });
        const payload = await request.text();
        const { verifyStripeSignature } = await import("@/lib/stripe.server");
        if (!(await verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret))) {
          return new Response("Invalid signature", { status: 400 });
        }
        const event = JSON.parse(payload);
        const obj = event.data?.object ?? {};
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (event.type === "checkout.session.completed" && obj.client_reference_id) {
          await supabaseAdmin.from("profiles")
            .update({ is_premium: true, subscription_status: "active", stripe_customer_id: obj.customer })
            .eq("id", obj.client_reference_id);
        }
        if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
          const status: string = event.type === "customer.subscription.deleted" ? "canceled" : obj.status;
          const active = status === "active" || status === "trialing";
          await supabaseAdmin.from("profiles")
            .update({ is_premium: active, subscription_status: status })
            .eq("stripe_customer_id", obj.customer);
        }
        return Response.json({ received: true });
      },
    },
  },
});
