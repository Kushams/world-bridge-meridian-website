/**
 * Pay by card via a secure hosted payment link.
 *
 * The site never takes card details. The consultant creates a payment link in
 * the processor's merchant portal and sends it to the client; the client pays
 * on the processor's own page and the funds settle to our wallet as a stablecoin.
 *
 * Set CARD_PAYMENTS_ENABLED to false to hide the whole option again.
 */
export const CARD_PAYMENTS_ENABLED = true;

export const cardPaymentProvider = {
  name: "ePayVista",
  host: "pay.epayvista.com",
  /** Smallest card payment the processor accepts, in US dollars. */
  minimumUsd: 20,
};
