import { MessageCircle } from 'lucide-react';
import { site } from '../../../site.config.js';

/** WhatsApp click-to-chat — rendered only when site.contact.whatsapp is set. */
export function SupportFab() {
  const n = String(site.contact.whatsapp || '').replace(/\D/g, '');
  if (!n) return null;
  return (
    <a
      href={`https://wa.me/${n}?text=${encodeURIComponent(`Hi ${site.brand.name}, I have a question.`)}`}
      target="_blank"
      rel="noopener"
      aria-label="Chat with us on WhatsApp (opens in a new tab)"
      className="fixed right-5 bottom-5 z-30 inline-flex size-14 items-center justify-center rounded-full bg-cocoa text-milk shadow-[0_18px_40px_-12px_rgb(42_32_27/0.5)] transition hover:scale-105"
    >
      <MessageCircle className="size-6" strokeWidth={1.3} />
    </a>
  );
}
