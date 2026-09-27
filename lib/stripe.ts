import "server-only";
import Stripe from "stripe";

let _stripe: Stripe | null = null;

/** Lazy init so `next build` (which evaluates modules before env vars exist) never crashes. */
export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(secretKey);
  }
  return _stripe;
}
