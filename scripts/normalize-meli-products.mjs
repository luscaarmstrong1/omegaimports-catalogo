import { existsSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";

if (!existsSync("work/meli-snapshot.json")) {
  console.log("Normalização por snapshot ignorada: work/meli-snapshot.json ausente.");
  process.exit(0);
}

const snapshot = JSON.parse(readFileSync("work/meli-snapshot.json", "utf8"));
const products = Array.isArray(snapshot.products) ? snapshot.products : [];
const normalizedSource = products.map((item, index) => ({
  id: String(item.mlbId || "").toLowerCase(),
  mlbId: item.mlbId,
  userProductId: item.userProductId || null,
  familyId: item.familyId || null,
  title: item.title || "",
  shortTitle: item.title || "",
  category: item.categoryId || "Mercado Livre",
  categoryId: item.categoryId || null,
  brand: item.attributes?.find?.((attr) => attr.id === "BRAND")?.value_name || "",
  model: item.attributes?.find?.((attr) => attr.id === "MODEL")?.value_name || "",
  condition: item.condition === "new" ? "novo" : item.condition === "used" ? "usado" : "não-confirmado",
  quantity: inferQuantity(item.title || ""),
  price: item.price,
  originalPrice: item.originalPrice,
  currency: item.currency || "BRL",
  stock: item.stock ?? null,
  marketplaceUrl: item.permalink || "",
  image: item.thumbnail || "/assets/product-placeholder.svg",
  gallery: item.pictures?.map((picture) => picture.secureUrl || picture.url).filter(Boolean) || [],
  pictures: item.pictures || [],
  imageStatus: item.pictures?.length ? "pending-review" : "missing",
  shortDescription: item.description?.slice(0, 220) || `Oferta OMEGAIMPORTS para ${item.title || item.mlbId}.`,
  fullDescription: item.description || "",
  specifications: (item.attributes || []).map((attr) => ({ label: attr.name || attr.id, value: attr.value_name || attr.value_id || "" })),
  applications: [],
  warnings: [],
  storeUrl: snapshot.store?.marketplaceUrl || "https://www.mercadolivre.com.br/pagina/omegaimports",
  active: item.status === "active",
  featured: false,
  bestSeller: false,
  newArrival: index < 6,
  priority: index + 1,
  searchTerms: [item.title, item.mlbId, item.categoryId].filter(Boolean),
  status: item.status === "active" ? "published" : "pending-review",
  priceLastVerifiedAt: snapshot.generatedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  lastVerifiedAt: snapshot.generatedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
}));

writeFileSync("src/data/products-source.meli.json", `${JSON.stringify(normalizedSource, null, 2)}\n`, "utf8");
console.log(`Fonte normalizada do snapshot criada: ${normalizedSource.length} produtos.`);

function inferQuantity(title = "") {
  const match = title.match(/\b(\d+)\s*x\b|\bkit\s*(?:com\s*)?(\d+)/i);
  return Number(match?.[1] || match?.[2] || 1);
}
