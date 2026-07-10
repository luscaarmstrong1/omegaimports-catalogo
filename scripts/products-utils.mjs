import { normalizeText } from "./shared.mjs";

export { loadProducts, normalizeText, site } from "./shared.mjs";

export function expectedQuantityFromText(text = "") {
  const normalized = normalizeText(text);
  const match = normalized.match(/\b(\d+)\s*x\b|\bkit\s*(?:com\s*)?(\d+)|\bcom\s*(\d+)\s*(?:unidades|pecas|peças)/);
  if (!match) return 1;
  return Number(match[1] || match[2] || match[3] || 1);
}

export function validateProducts(products) {
  const issues = [];
  const critical = [];
  const ids = new Set();
  const slugs = new Set();
  const images = new Map();

  for (const product of products) {
    const ref = `${product.mlbId} ${product.title}`;
    if (!/^MLB\d+$/.test(product.mlbId)) critical.push(`${ref}: MLB inválido`);
    if (ids.has(product.mlbId)) critical.push(`${ref}: MLB duplicado`);
    if (slugs.has(product.slug)) critical.push(`${ref}: slug duplicado`);
    ids.add(product.mlbId);
    slugs.add(product.slug);
    if (!product.marketplaceUrl?.startsWith("https://")) critical.push(`${ref}: URL não HTTPS`);
    if (!product.marketplaceUrl?.includes(product.mlbId.replace("MLB", ""))) critical.push(`${ref}: URL não contém o código MLB`);
    if (!product.image) critical.push(`${ref}: imagem ausente`);
    if (!["verified", "needs-review", "missing"].includes(product.imageStatus)) critical.push(`${ref}: imageStatus inválido`);
    if (product.featured && product.imageStatus !== "verified") critical.push(`${ref}: destaque sem imagem verificada`);
    if (!product.priceLastVerifiedAt && product.price) issues.push(`${ref}: preço sem data de atualização`);
    const expected = expectedQuantityFromText(`${product.title} ${product.fullDescription}`);
    if (expected !== product.quantity && product.quantity !== 1) issues.push(`${ref}: possível divergência de quantidade (${product.quantity} x texto ${expected})`);
    const text = normalizeText(`${product.title} ${product.fullDescription}`);
    if (product.condition === "novo" && /\busado\b|\baberto\b/.test(text)) issues.push(`${ref}: condição novo contradita por título/descrição`);
    if (product.mlbId === "MLB4417997973") issues.push(`${ref}: divergência conhecida de condição/quantidade exige revisão manual`);
    if (product.image) {
      const list = images.get(product.image) || [];
      list.push(product.mlbId);
      images.set(product.image, list);
    }
  }

  for (const [image, idsUsing] of images) {
    if (idsUsing.length > 1 && image !== "/assets/product-placeholder.svg") {
      issues.push(`${image}: usado por múltiplos MLBs (${idsUsing.join(", ")})`);
    }
  }
  return { issues, critical };
}
