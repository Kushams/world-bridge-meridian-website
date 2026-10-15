/** A WhatsApp chat link that opens with a message already typed, ready for the visitor to fill in their name and send. */
export function whatsappHref(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** The opening message for a general question. The bracketed parts are for the visitor to replace before sending. */
export const WHATSAPP_GENERAL = "Hello World Bridge Meridian, my name is [your name]. I'd like to ask about [your trip or exhibition].";

/** The opening message from an exhibition's page. */
export function whatsappForExhibition(title: string, venue: string): string {
  return `Hello World Bridge Meridian, my name is [your name]. I'd like to plan a trip for "${title}" at ${venue}. [Add your preferred dates or any questions here]`;
}
