import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { normalizeText } from "./shared.mjs";

const now = new Date().toISOString();
const sourcePath = process.argv.find((arg) => arg.startsWith("--source-file="))?.split("=")[1] || "src/data/products-source.legacy.json";
const outputPath = process.argv.find((arg) => arg.startsWith("--output="))?.split("=")[1] || "src/data/products.json";
const mode = process.argv.find((arg) => arg.startsWith("--mode="))?.split("=")[1] || "offline";

const sourceProducts = JSON.parse(readFileSync(sourcePath, "utf8"));
mkdirSync("reports", { recursive: true });

const categories = {
  boards: ["Placas e Microcontroladores", "placas-e-microcontroladores", "ESP32"],
  iot: ["IoT, GSM e Comunicação", "iot-gsm-e-comunicacao", "GSM/GPRS"],
  gps: ["GPS e Localização", "gps-e-localizacao", "GPS"],
  sensors: ["Sensores e Medição", "sensores-e-medicao", "sensor"],
  power: ["Fontes e Alimentação", "fontes-e-alimentacao", "fonte"],
  automation: ["Automação e Comando", "automacao-e-comando", "contator"],
  components: ["Componentes Eletrônicos", "componentes-eletronicos", "componente"],
  connectors: ["Conectores e Instalação", "conectores-e-instalacao", "conector"],
  instruments: ["Instrumentos de Bancada", "instrumentos-de-bancada", "instrumento"],
};

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110);
}

function field(value, sourceRef, confidence = "low", reviewStatus = "pending-review") {
  return {
    value,
    source: mode === "api" ? "mercadolivre-api" : mode === "xlsx" ? "mercadolivre-xlsx" : mode === "dashboard" ? "seller-dashboard-html" : "legacy-comparison",
    sourceRef,
    fetchedAt: now,
    confidence,
    reviewStatus,
  };
}

function inferCategory(product) {
  const text = normalizeText(`${product.title} ${product.shortDescription} ${product.fullDescription} ${product.category} ${product.model}`);
  if (/\bgps\b|neo-?6m|ublox/.test(text)) return categories.gps;
  if (/sct-?013|zmct|corrente|energia|medicao|medição/.test(text)) return categories.sensors;
  if (/fonte|hlk|hi-?link|alimentacao|alimentação|bancada hikari/.test(text)) return /bancada/.test(text) ? categories.instruments : categories.power;
  if (/contator|rele|relé|supressor|comando/.test(text)) return categories.automation;
  if (/split bolt|prensa|conector|pigtail|ipex|antena/.test(text)) return /gps/.test(text) ? categories.gps : categories.connectors;
  if (/resistor|varistor|diodo|barra de pinos|header|micro switch|chave/.test(text)) return categories.components;
  if (/sim800|gsm|gprs|rf|t-?call|ttgo/.test(text)) return categories.iot;
  if (/esp32|modulo|módulo|microcontrolador/.test(text)) return categories.boards;
  return categories.components;
}

function inferFamily(product) {
  const text = normalizeText(`${product.title} ${product.model} ${product.fullDescription}`);
  if (/ttgo|t-?call|sim800/.test(text)) return "ttgo-t-call";
  if (/neo-?6m|gy-?gps6mv2|ublox/.test(text)) return "gps-neo-6m";
  if (/hlk|hi-?link|pm01/.test(text)) return "hi-link-hlk-pm01";
  if (/sct-?013|zmct|sensor de corrente/.test(text)) return "sensores-de-corrente";
  if (/contator/.test(text)) return "contatores";
  if (/varistor/.test(text)) return "varistores";
  if (/split bolt/.test(text)) return "split-bolt";
  if (/fonte|bancada|gerador/.test(text)) return "instrumentos-e-fontes";
  return null;
}

function quantitySignals(text) {
  const normalized = normalizeText(text);
  const matches = [];
  for (const pattern of [/\b(\d+)\s*x\b/g, /\bkit\s*(?:com\s*)?(\d+)/g, /\b(\d+)\s*(?:unidades|pecas|peças|modulos|módulos)\b/g]) {
    for (const match of normalized.matchAll(pattern)) matches.push(Number(match[1]));
  }
  return [...new Set(matches.filter((value) => Number.isFinite(value) && value > 0))];
}

function cleanMarketing(text = "") {
  return String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/garanta já|prezado cliente|venda somente|não emito nota fiscal/i.test(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 240);
}

function badSpecification(spec) {
  const value = normalizeText(`${spec.label} ${spec.value}`);
  return (
    /\b130\b/.test(value) ||
    /digite o codigo|digite o código|outro motivo/.test(value) ||
    /caracteristicas principais|especificacoes tecnicas|aplicacoes/.test(value) ||
    /110v de entrada.*220v de saida/.test(value)
  );
}

function mapProduct(product) {
  const sourceRef = product.mlbId || product.id;
  const title = product.title || product.shortTitle || "";
  const fullText = `${title} ${product.shortDescription || ""} ${product.fullDescription || ""}`;
  const category = inferCategory(product);
  const familyId = inferFamily(product);
  const signals = quantitySignals(fullText);
  const expectedQuantity = signals.length ? Math.max(...signals) : product.quantity || 1;
  const quantityDiverges = Number(product.quantity || 1) !== expectedQuantity;
  const conditionText = normalizeText(fullText);
  const conditionDiverges = (product.condition === "novo" && /\busado\b|\baberto\b/.test(conditionText)) || (product.condition === "usado" && /\bnovo\b|nunca aberto|embalado/.test(conditionText));
  const hasPlaceholder = !product.image || product.image.includes("product-placeholder");
  const imageStatus = product.imageStatus === "verified" && !hasPlaceholder ? "verified" : hasPlaceholder ? "missing" : "pending-review";
  const specificationIssues = (product.specifications || []).filter(badSpecification);
  const blockingIssues = [];

  if (!/^MLB\d+$/.test(product.mlbId || "")) blockingIssues.push("MLB inválido ou ausente");
  if (!product.marketplaceUrl || !product.marketplaceUrl.includes((product.mlbId || "").replace("MLB", ""))) blockingIssues.push("permalink não confirmado para o MLB");
  if (imageStatus !== "verified") blockingIssues.push("imagem real do anúncio exato não verificada");
  if (quantityDiverges) blockingIssues.push(`quantidade divergente: cadastro=${product.quantity || 1}, texto=${expectedQuantity}`);
  if (conditionDiverges) blockingIssues.push("condição divergente entre cadastro, título ou descrição");
  if (specificationIssues.length) blockingIssues.push("especificações suspeitas exigem revisão");
  if (!product.priceLastVerifiedAt) blockingIssues.push("preço sem data de atualização");
  if (product.status && !["published", "needs-review", "pending-review"].includes(product.status)) blockingIssues.push("status de origem não publicável");

  const status = blockingIssues.length ? "pending-review" : "published";
  const normalized = {
    id: (product.id || product.mlbId || "").toLowerCase(),
    mlbId: product.mlbId,
    userProductId: product.userProductId || null,
    familyId,
    title,
    normalizedTitle: normalizeText(title),
    shortTitle: product.shortTitle || title.slice(0, 80),
    slug: `${slugify(title)}-${String(product.mlbId || "").toLowerCase()}`,
    status,
    active: status === "published",
    condition: product.condition || "não-confirmado",
    categoryId: product.categoryId || null,
    marketplaceCategory: product.category || null,
    internalCategory: category[0],
    internalCategorySlug: category[1],
    internalSubcategory: null,
    brand: product.brand || null,
    model: product.model || null,
    quantity: Number(product.quantity || 1),
    packageType: Number(product.quantity || 1) > 1 ? "kit" : "unit",
    stock: product.stock ?? null,
    price: product.price ?? null,
    originalPrice: product.originalPrice ?? null,
    currency: product.currency || "BRL",
    priceLastVerifiedAt: product.priceLastVerifiedAt || null,
    permalink: product.marketplaceUrl || product.storeUrl || "",
    thumbnail: imageStatus === "verified" ? product.image : null,
    pictures: [],
    imageStatus,
    imageVerifiedAt: imageStatus === "verified" ? product.lastVerifiedAt || now : null,
    image: imageStatus === "verified" ? product.image : "/assets/product-placeholder.svg",
    gallery: imageStatus === "verified" ? product.gallery || [] : [],
    description: product.fullDescription || "",
    shortDescription: product.shortDescription || cleanMarketing(fullText) || `Oferta OMEGAIMPORTS para ${title}.`,
    technicalSummary: cleanMarketing(product.shortDescription || product.fullDescription || title),
    attributes: [],
    specifications: (product.specifications || []).map((spec) => ({ ...spec, source: "legacy-comparison", confidence: badSpecification(spec) ? "low" : "medium" })),
    applications: (product.applications || []).filter((item) => !/especifica|caracter/i.test(item)).slice(0, 6),
    includedItems: (product.includedItems || []).filter((item) => !/caracter/i.test(item)).slice(0, 8),
    warnings: [...(product.warnings || []), ...blockingIssues],
    compatibility: [],
    relatedProducts: [],
    featured: false,
    bestSeller: Boolean(product.bestSeller),
    source: {
      mode,
      primary: mode === "api" ? "mercadolivre-api" : mode === "xlsx" ? "mercadolivre-xlsx" : mode === "dashboard" ? "seller-dashboard-html" : "legacy-comparison",
      fetchedAt: now,
      fields: {
        title: field(title, sourceRef, "low"),
        status: field(status, sourceRef, "low"),
        condition: field(product.condition || "não-confirmado", sourceRef, "low"),
        quantity: field(Number(product.quantity || 1), sourceRef, "low"),
        price: field(product.price ?? null, sourceRef, "low"),
        permalink: field(product.marketplaceUrl || "", sourceRef, "low"),
        image: field(imageStatus === "verified" ? product.image : null, sourceRef, "low"),
      },
    },
    fetchedAt: product.lastVerifiedAt ? `${product.lastVerifiedAt}T00:00:00.000Z` : now,
    lastReviewedAt: now,
    reviewStatus: status === "published" ? "approved" : "blocked",
    blockingIssues,
    searchTerms: [...new Set([...(product.searchTerms || []), title, product.mlbId, category[0], familyId].filter(Boolean).map(String))],
  };
  return normalized;
}

const normalizedProducts = sourceProducts.map(mapProduct);
writeFileSync(outputPath, `${JSON.stringify(normalizedProducts, null, 2)}\n`, "utf8");

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

writeFileSync(
  "reports/catalog.csv",
  [
    "mlbId,title,status,reviewStatus,imageStatus,condition,quantity,price,category,familyId,blockingIssues,permalink",
    ...normalizedProducts.map((product) =>
      [
        product.mlbId,
        product.title,
        product.status,
        product.reviewStatus,
        product.imageStatus,
        product.condition,
        product.quantity,
        product.price,
        product.internalCategory,
        product.familyId,
        product.blockingIssues.join("; "),
        product.permalink,
      ].map(csvEscape).join(","),
    ),
  ].join("\n"),
  "utf8",
);

writeFileSync(
  "reports/hidden-products.csv",
  [
    "mlbId,title,status,reason",
    ...normalizedProducts
      .filter((product) => product.status !== "published")
      .map((product) => [product.mlbId, product.title, product.status, product.blockingIssues.join("; ")].map(csvEscape).join(",")),
  ].join("\n"),
  "utf8",
);

writeFileSync(
  "reports/specification-issues.csv",
  [
    "mlbId,title,label,value,issue",
    ...normalizedProducts.flatMap((product) =>
      product.specifications
        .filter((spec) => badSpecification(spec))
        .map((spec) => [product.mlbId, product.title, spec.label, spec.value, "suspect-specification"].map(csvEscape).join(",")),
    ),
  ].join("\n"),
  "utf8",
);

writeFileSync(
  "reports/product-differences.csv",
  [
    "mlbId,title,field,current,expected,issue",
    ...normalizedProducts.flatMap((product) =>
      product.blockingIssues.map((issue) => [product.mlbId, product.title, "blockingIssues", product.reviewStatus, "manual-review", issue].map(csvEscape).join(",")),
    ),
  ].join("\n"),
  "utf8",
);

const published = normalizedProducts.filter((product) => product.status === "published").length;
console.log(`Base pública v2 gerada: ${normalizedProducts.length} itens analisados, ${published} publicados, ${normalizedProducts.length - published} pendentes/ocultos.`);
