import { normalizeText } from "./shared.mjs";

export { loadProducts, normalizeText, site } from "./shared.mjs";

export function expectedQuantityFromText(text = "") {
  const normalized = normalizeText(text);
  const matches = [];
  for (const pattern of [/\b(\d+)\s*x\b/g, /\bkit\s*(?:com\s*)?(\d+)/g, /\b(\d+)\s*(?:unidades|pecas|peças|modulos|módulos)\b/g]) {
    for (const match of normalized.matchAll(pattern)) matches.push(Number(match[1]));
  }
  return matches.length ? Math.max(...matches) : 1;
}

export function validateProducts(products) {
  const issues = [];
  const critical = [];
  const ids = new Set();
  const slugs = new Set();
  const images = new Map();

  for (const product of products) {
    const ref = `${product.mlbId} ${product.title}`;
    const published = product.status === "published";
    if (!/^MLB\d+$/.test(product.mlbId)) critical.push(`${ref}: MLB inválido`);
    if (ids.has(product.mlbId)) critical.push(`${ref}: MLB duplicado`);
    if (slugs.has(product.slug)) critical.push(`${ref}: slug duplicado`);
    ids.add(product.mlbId);
    slugs.add(product.slug);

    if (!["published", "hidden", "pending-review"].includes(product.status)) critical.push(`${ref}: status público inválido`);
    if (!["verified", "missing", "mismatch", "pending-review"].includes(product.imageStatus)) critical.push(`${ref}: imageStatus inválido`);
    if (!product.permalink?.startsWith("https://")) critical.push(`${ref}: permalink não HTTPS`);
    if (!product.permalink?.includes(product.mlbId.replace("MLB", ""))) critical.push(`${ref}: permalink não contém o MLB`);
    if (!product.source?.fields) critical.push(`${ref}: produto sem proveniência por campo`);

    if (published) {
      if (!product.active) critical.push(`${ref}: publicado mas active=false`);
      if (product.imageStatus !== "verified") critical.push(`${ref}: publicado sem imagem verificada`);
      if (!product.image || product.image.includes("product-placeholder")) critical.push(`${ref}: publicado com placeholder`);
      if (product.blockingIssues?.length) critical.push(`${ref}: publicado com blockingIssues`);
      if (!product.priceLastVerifiedAt) critical.push(`${ref}: publicado sem data de preço`);
      if (!product.internalCategorySlug) critical.push(`${ref}: publicado sem categoria interna`);
    }

    if (!product.priceLastVerifiedAt && product.price) issues.push(`${ref}: preço sem data de atualização`);
    const expected = expectedQuantityFromText(`${product.title} ${product.description || ""}`);
    if (expected !== product.quantity && product.quantity !== 1) issues.push(`${ref}: possível divergência de quantidade (${product.quantity} x texto ${expected})`);
    const text = normalizeText(`${product.title} ${product.description || ""}`);
    if (product.condition === "novo" && /\busado\b|\baberto\b/.test(text)) issues.push(`${ref}: condição novo contradita por título/descrição`);
    if (product.condition === "usado" && /\bnovo\b|nunca aberto|embalado/.test(text)) issues.push(`${ref}: condição usado contradita por título/descrição`);
    if (product.mlbId === "MLB4417997973") issues.push(`${ref}: divergência conhecida de condição/quantidade exige revisão manual`);
    if (product.image) {
      const list = images.get(product.image) || [];
      list.push(product.mlbId);
      images.set(product.image, list);
    }
  }

  for (const [image, idsUsing] of images) {
    if (idsUsing.length > 1 && !image.includes("product-placeholder")) {
      issues.push(`${image}: usado por múltiplos MLBs (${idsUsing.join(", ")})`);
    }
  }
  return { issues, critical };
}
