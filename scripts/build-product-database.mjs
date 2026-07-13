import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 110);
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

function normalizeTechnicalUnits(value = "") {
  return String(value)
    .replace(/\*\*/g, "")
    .replace(/\bEletronica\b/gi, "Eletrônica")
    .replace(/\bAutomacao\b/gi, "Automação")
    .replace(/\bAplicacoes\b/gi, "Aplicações")
    .replace(/\bDescricao\b/gi, "Descrição")
    .replace(/\bMedicao\b/gi, "Medição")
    .replace(/\bAlimentacao\b/gi, "Alimentação")
    .replace(/\bFuncao\b/gi, "Função")
    .replace(/\b(\d+)\s*m[aA]\b/g, "$1 mA")
    .replace(/\b(\d+)\s*[vV]\b/g, "$1 V")
    .replace(/\b(\d+)\s*[wW]\b/g, "$1 W")
    .replace(/\b(\d+)\s*[aA]\b/g, "$1 A")
    .replace(/\b(\d+)\s*k\s*(?:ohms?|Ω|Î©)\b/gi, "$1 kΩ")
    .replace(/\b2g\b/gi, "2G")
    .replace(/\b2[,.]?54\s*mm\b/gi, "2,54 mm")
    .replace(/\bhi[-\s]?link\b/gi, "Hi-Link")
    .replace(/\bhlk[-\s]?pm01\b/gi, "HLK-PM01")
    .replace(/\bsct[-\s]?013\b/gi, "SCT-013")
    .replace(/\bzmct123a\b/gi, "ZMCT123A")
    .replace(/\bneo[-\s]?6m\b/gi, "NEO-6M")
    .replace(/\besp32\b/gi, "ESP32")
    .replace(/\bsim800l\b/gi, "SIM800L")
    .replace(/\bgps\b/gi, "GPS")
    .replace(/\bac\b/gi, "AC")
    .replace(/\bdc\b/gi, "DC")
    .replace(/\s+\/\s+/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeProductTitle(value = "") {
  const keep = new Set(["A", "V", "W", "mA", "mAh", "AC", "DC", "GPS", "GSM", "GPRS", "IoT", "RF", "USB", "ESP32", "SIM800L", "SCT-013", "ZMCT123A", "HLK-PM01", "NEO-6M"]);
  const small = new Set(["a", "as", "com", "da", "das", "de", "do", "dos", "e", "em", "para", "por"]);
  const text = normalizeTechnicalUnits(value)
    .replace(/\bCom(\d+)x\b/gi, "com $1x")
    .replace(/\bkit\s+com\s*(\d+)\s*x\b/gi, "Kit com $1")
    .replace(/\s+/g, " ")
    .trim();
  return text
    .split(" ")
    .map((word, index) => {
      if (keep.has(word)) return word;
      if (/^\d+(?:,\d+)?$|^\d+x$/.test(word)) return word;
      const lower = word.toLocaleLowerCase("pt-BR");
      if (index > 0 && small.has(lower)) return lower;
      return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
    })
    .join(" ")
    .replace(/\bMini Fonte\b/g, "Mini fonte")
    .replace(/\bSensor De\b/g, "Sensor de")
    .replace(/\bKit Com\b/g, "Kit com")
    .replace(/\bFonte De\b/g, "Fonte de")
    .replace(/\bMódulo De\b/g, "Módulo de")
    .replace(/\bAc\b/g, "AC")
    .replace(/\bDc\b/g, "DC")
    .replace(/\bMm\b/g, "mm")
    .replace(/\bMhz\b/g, "MHz")
    .replace(/\b10k Ohms\b/gi, "10 kΩ")
    .replace(/\b100k Ohms\b/gi, "100 kΩ")
    .trim();
}

function cleanMarketing(text = "") {
  return normalizeTechnicalUnits(String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/garanta já|prezado cliente|venda somente|não emito nota fiscal|descrição:|oferta omegaimports para/i.test(line))
    .join(" ")
    .replace(/\s+/g, " "));
}

function cleanCardDescription(product) {
  const raw = cleanMarketing(product.shortDescription || product.fullDescription || "");
  const title = normalizeText(product.title || "");
  const cleaned = raw
    .replace(/sugest[aã]o de descri[cç][aã]o:?/gi, "")
    .replace(/\bgaranta j[aá]\b.*$/i, "")
    .replace(/^[\s:;.,-]+/, "")
    .trim();
  if (!cleaned || normalizeText(cleaned) === title) return "";
  const limit = 150;
  const slice = cleaned.length > limit ? cleaned.slice(0, limit) : cleaned;
  const sentenceEnd = Math.max(slice.lastIndexOf("."), slice.lastIndexOf("!"), slice.lastIndexOf("?"));
  const cut = sentenceEnd > 90 ? slice.slice(0, sentenceEnd + 1) : slice.replace(/\s+\S*$/, "").replace(/[.,;:\s]+$/, "");
  if (cut.length < 80) return "";
  return cut.endsWith(".") ? cut : `${cut}.`;
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

function inferCategory(product) {
  const text = normalizeText(`${product.title} ${product.shortDescription} ${product.fullDescription} ${product.category} ${product.model}`);
  const family = inferFamily(product);
  const manual = {
    MLB5272637504: categories.components,
    MLB5268487034: categories.instruments,
    MLB4669500229: categories.instruments,
    MLB6747662378: categories.instruments,
  };
  if (manual[product.mlbId]) return manual[product.mlbId];
  if (family === "ttgo-t-call") return categories.iot;
  if (family === "gps-neo-6m") return categories.gps;
  if (family === "hi-link-hlk-pm01") return categories.power;
  if (family === "sensores-de-corrente") return categories.sensors;
  if (family === "contatores") return categories.automation;
  if (family === "varistores") return categories.components;
  if (family === "split-bolt") return categories.connectors;
  if (family === "instrumentos-e-fontes") return categories.instruments;
  if (/fenolite|barra de pinos|header|resistor|varistor|micro switch|chave/.test(text)) return categories.components;
  if (/prensa|split bolt|conector|pigtail|ipex/.test(text)) return categories.connectors;
  if (/contator|supressor|rele|rel/.test(text)) return categories.automation;
  if (/hikari|fonte de bancada|gerador de funcao|gerador de fun/.test(text)) return categories.instruments;
  if (/hlk|hi-?link|pm01|fonte chaveada|retificador/.test(text)) return categories.power;
  if (/\bgps\b|neo-?6m|ublox/.test(text)) return categories.gps;
  if (/sct-?013|zmct|corrente|energia|medicao|medição/.test(text)) return categories.sensors;
  if (/sim800|gsm|gprs|rf|t-?call|ttgo/.test(text)) return categories.iot;
  if (/esp32|modulo|módulo|microcontrolador/.test(text)) return categories.boards;
  return categories.components;
}

function quantitySignals(text) {
  const normalized = normalizeText(text);
  const matches = [];
  for (const pattern of [/\b(\d+)\s*x\b/g, /\bkit\s*(?:com\s*)?(\d+)/g, /\b(\d+)\s*(?:unidades|pecas|peças|modulos|módulos)\b/g]) {
    for (const match of normalized.matchAll(pattern)) matches.push(Number(match[1]));
  }
  return [...new Set(matches.filter((value) => Number.isFinite(value) && value > 0))];
}

function badSpecification(spec) {
  const value = normalizeText(`${spec.label} ${spec.value}`);
  return /\b130\b/.test(value) || /digite o codigo|digite o código|outro motivo/.test(value) || /caracteristicas principais|especificacoes tecnicas|aplicacoes/.test(value) || /110v de entrada.*220v de saida/.test(value);
}

function verifiedImageFor(product) {
  if (!product.mlbId) return null;
  const base = `public/products/${product.mlbId}`;
  const manifestPath = `${base}/manifest.json`;
  const webpPath = `${base}/optimized/main.webp`;
  if (!existsSync(manifestPath) || !existsSync(webpPath)) return null;
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (manifest.validationStatus !== "verified") return null;
    if (manifest.mlbId !== product.mlbId) return null;
    if (manifest.itemUrl && product.marketplaceUrl && manifest.itemUrl !== product.marketplaceUrl) return null;
    return `/products/${product.mlbId}/optimized/main.webp`;
  } catch {
    return null;
  }
}

function mapProduct(product) {
  const sourceRef = product.mlbId || product.id;
  const expectedSellerId = String(product.expectedSellerId || "194516027");
  const sellerId = String(product.sellerId || product.seller_id || product.seller?.id || expectedSellerId);
  const returnedBySellerItemsSearch = product.sellerValidation?.returnedBySellerItemsSearch ?? (mode === "api");
  const ownListing = sellerId === expectedSellerId && returnedBySellerItemsSearch;
  const catalogListing = product.catalogListing === true || product.catalog_listing === true;
  const sourceOnlyCatalog = !product.mlbId && Boolean(product.catalogProductId || product.catalog_product_id || product.userProductId);
  const title = normalizeProductTitle(product.title || product.shortTitle || "");
  const fullText = `${title} ${product.shortDescription || ""} ${product.fullDescription || ""}`;
  const category = inferCategory(product);
  const familyId = inferFamily(product);
  const signals = quantitySignals(fullText);
  const expectedQuantity = signals.length ? Math.max(...signals) : product.quantity || 1;
  const quantityDiverges = Number(product.quantity || 1) !== expectedQuantity;
  const conditionText = normalizeText(fullText);
  const conditionDiverges = (product.condition === "novo" && /\busado\b|\baberto\b/.test(conditionText)) || (product.condition === "usado" && /\bnovo\b|nunca aberto|embalado/.test(conditionText));
  const verifiedImage = verifiedImageFor(product);
  const hasPlaceholder = !product.image || product.image.includes("product-placeholder");
  const imageStatus = verifiedImage || (product.imageStatus === "verified" && !hasPlaceholder) ? "verified" : hasPlaceholder ? "missing" : "pending-review";
  const productImage = verifiedImage || product.image;
  const specificationIssues = (product.specifications || []).filter(badSpecification);
  const blockingIssues = [];

  if (!/^MLB\d+$/.test(product.mlbId || "")) blockingIssues.push("MLB inválido ou ausente");
  if (!ownListing) blockingIssues.push("anúncio não pertence ao vendedor autorizado");
  if (!returnedBySellerItemsSearch) blockingIssues.push("item não comprovado na busca oficial do vendedor");
  if (catalogListing) blockingIssues.push("anúncio de catálogo excluído");
  if (sourceOnlyCatalog) blockingIssues.push("registro baseado somente em catálogo ou user product");
  if (!product.marketplaceUrl || !product.marketplaceUrl.includes((product.mlbId || "").replace("MLB", ""))) blockingIssues.push("permalink não confirmado para o MLB");
  if (imageStatus !== "verified") blockingIssues.push("imagem real do anúncio exato não verificada");
  if (quantityDiverges) blockingIssues.push(`quantidade divergente: cadastro=${product.quantity || 1}, texto=${expectedQuantity}`);
  if (conditionDiverges) blockingIssues.push("condição divergente entre cadastro, título ou descrição");
  if (specificationIssues.length) blockingIssues.push("especificações suspeitas exigem revisão");
  if (!product.priceLastVerifiedAt) blockingIssues.push("preço sem data de atualização");
  if (product.status && !["published", "needs-review", "pending-review"].includes(product.status)) blockingIssues.push("status de origem não publicável");

  const status = blockingIssues.length ? "pending-review" : "published";
  const shortDescription = cleanMarketing(product.shortDescription || product.fullDescription || title) || title;
  return {
    id: (product.id || product.mlbId || "").toLowerCase(),
    mlbId: product.mlbId,
    sellerId,
    expectedSellerId,
    returnedBySellerItemsSearch,
    sellerValidation: {
      source: product.sellerValidation?.source || (mode === "api" ? "private-sanitized-snapshot" : "legacy-comparison"),
      returnedBySellerItemsSearch,
      ownListing,
    },
    catalogListing,
    catalogProductId: product.catalogProductId || product.catalog_product_id || null,
    eligibleForPublicCatalog: ownListing && !catalogListing && !sourceOnlyCatalog,
    exclusionReason: product.exclusionReason || null,
    userProductId: product.userProductId || null,
    familyId,
    title,
    normalizedTitle: normalizeText(title),
    shortTitle: normalizeProductTitle(product.shortTitle || title),
    slug: `${slugify(title)}-${String(product.mlbId || "").toLowerCase()}`,
    status,
    active: status === "published",
    condition: product.condition || "não-confirmado",
    categoryId: product.categoryId || null,
    marketplaceCategory: product.category || null,
    internalCategory: category[0],
    internalCategorySlug: category[1],
    internalSubcategory: null,
    brand: product.brand ? normalizeTechnicalUnits(product.brand) : null,
    model: product.model ? normalizeTechnicalUnits(product.model) : null,
    quantity: Number(product.quantity || 1),
    packageType: Number(product.quantity || 1) > 1 ? "kit" : "unit",
    stock: product.stock ?? null,
    price: product.price ?? null,
    originalPrice: product.originalPrice ?? null,
    currency: product.currency || "BRL",
    priceLastVerifiedAt: product.priceLastVerifiedAt || null,
    permalink: product.marketplaceUrl || product.storeUrl || "",
    thumbnail: imageStatus === "verified" ? productImage : null,
    pictures: [],
    imageStatus,
    imageVerifiedAt: imageStatus === "verified" ? product.lastVerifiedAt || now : null,
    image: imageStatus === "verified" ? productImage : "/assets/product-placeholder.svg",
    gallery: imageStatus === "verified" ? [productImage, ...(product.gallery || []).filter((image) => image !== productImage)] : [],
    description: normalizeTechnicalUnits(product.fullDescription || ""),
    shortDescription,
    cardDescription: cleanCardDescription(product),
    technicalSummary: normalizeTechnicalUnits(cleanMarketing(product.shortDescription || product.fullDescription || title)),
    attributes: [],
    specifications: (product.specifications || []).map((spec) => ({ ...spec, label: normalizeTechnicalUnits(spec.label), value: normalizeTechnicalUnits(spec.value), source: "legacy-comparison", confidence: badSpecification(spec) ? "low" : "medium" })),
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
        title: field(title, sourceRef, "medium"),
        status: field(status, sourceRef, "medium"),
        condition: field(product.condition || "não-confirmado", sourceRef, "medium"),
        quantity: field(Number(product.quantity || 1), sourceRef, "medium"),
        price: field(product.price ?? null, sourceRef, "medium"),
        permalink: field(product.marketplaceUrl || "", sourceRef, "medium"),
        image: field(imageStatus === "verified" ? productImage : null, sourceRef, verifiedImage ? "high" : "low"),
      },
    },
    fetchedAt: product.lastVerifiedAt ? `${product.lastVerifiedAt}T00:00:00.000Z` : now,
    lastReviewedAt: now,
    reviewStatus: status === "published" ? "approved" : "blocked",
    blockingIssues,
    searchTerms: [...new Set([...(product.searchTerms || []), title, product.mlbId, category[0], familyId].filter(Boolean).map(String))],
  };
}

const normalizedProducts = sourceProducts.map(mapProduct);
writeFileSync(outputPath, `${JSON.stringify(normalizedProducts, null, 2)}\n`, "utf8");

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

writeFileSync("reports/catalog.csv", [
  "mlbId,title,status,reviewStatus,imageStatus,condition,quantity,price,category,familyId,blockingIssues,permalink",
  ...normalizedProducts.map((product) => [product.mlbId, product.title, product.status, product.reviewStatus, product.imageStatus, product.condition, product.quantity, product.price, product.internalCategory, product.familyId, product.blockingIssues.join("; "), product.permalink].map(csvEscape).join(",")),
].join("\n"), "utf8");

writeFileSync("reports/hidden-products.csv", [
  "mlbId,title,status,reason",
  ...normalizedProducts.filter((product) => product.status !== "published").map((product) => [product.mlbId, product.title, product.status, product.blockingIssues.join("; ")].map(csvEscape).join(",")),
].join("\n"), "utf8");

writeFileSync("reports/catalog-listings-excluded.csv", [
  "item_id,title,seller_id,catalog_listing,catalog_product_id,status,permalink,reason,excluded_at",
  ...normalizedProducts.filter((product) => product.catalogListing === true).map((product) => [
    product.mlbId,
    product.title,
    product.sellerId,
    product.catalogListing,
    product.catalogProductId,
    product.status,
    product.permalink,
    product.blockingIssues.join("; ") || "catalog_listing true",
    now,
  ].map(csvEscape).join(",")),
].join("\n"), "utf8");

writeFileSync("reports/non-owned-products-blocked.csv", [
  "item_id,title,seller_id,expected_seller_id,returned_by_seller_items_search,status,permalink,reason,blocked_at",
  ...normalizedProducts.filter((product) => product.sellerId !== product.expectedSellerId || product.returnedBySellerItemsSearch !== true).map((product) => [
    product.mlbId,
    product.title,
    product.sellerId,
    product.expectedSellerId,
    product.returnedBySellerItemsSearch,
    product.status,
    product.permalink,
    product.blockingIssues.join("; ") || "ownership mismatch",
    now,
  ].map(csvEscape).join(",")),
].join("\n"), "utf8");

writeFileSync("reports/specification-issues.csv", [
  "mlbId,title,label,value,issue",
  ...normalizedProducts.flatMap((product) => product.specifications.filter((spec) => badSpecification(spec)).map((spec) => [product.mlbId, product.title, spec.label, spec.value, "suspect-specification"].map(csvEscape).join(","))),
].join("\n"), "utf8");

writeFileSync("reports/product-differences.csv", [
  "mlbId,title,field,current,expected,issue",
  ...normalizedProducts.flatMap((product) => product.blockingIssues.map((issue) => [product.mlbId, product.title, "blockingIssues", product.reviewStatus, "manual-review", issue].map(csvEscape).join(","))),
].join("\n"), "utf8");

const published = normalizedProducts.filter((product) => product.status === "published").length;
console.log(`Base pública v6 gerada: ${normalizedProducts.length} itens analisados, ${published} publicados, ${normalizedProducts.length - published} pendentes/ocultos.`);
