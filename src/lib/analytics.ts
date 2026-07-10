import type { Product } from "@/src/types/product";

type EventPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: EventPayload[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, payload: EventPayload = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...payload });
  window.gtag?.("event", name, payload);
  window.clarity?.("event", name);
}

export function openMercadoLivreProduct(
  product: Product,
  context: { origin: string; cta: string; position?: number },
) {
  try {
    const url = new URL(product.mercadoLivreUrl);
    if (url.protocol !== "https:" || !url.hostname.endsWith("mercadolivre.com.br")) {
      return false;
    }
    trackEvent("mercado_livre_redirect", {
      product_id: product.id,
      mlb_id: product.mlbId,
      category: product.category,
      origin: context.origin,
      cta: context.cta,
      position: context.position,
    });
    window.open(url.toString(), "_blank", "noopener,noreferrer");
    return true;
  } catch {
    return false;
  }
}
