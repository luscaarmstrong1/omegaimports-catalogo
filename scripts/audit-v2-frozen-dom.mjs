import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const frozen = readFileSync("tests/fixtures/v2-frozen/index.html", "utf8");
const production = readFileSync("dist/index.html", "utf8");

function staticTagSequence(html) {
  return html
    .replace(/<head>[\s\S]*?<\/head>/i, "")
    .replace(/(<div class="products-carousel"[^>]*>)[\s\S]*?(<\/div>\s*<button type="button" class="carousel-nav-btn carousel-next")/, `$1${"<article class=\"product-card\"></article>".repeat(6)}$2`)
    .replace(/(<div class="blog-newsletter-grid">)[\s\S]*?(<!-- (?:Newsletter Box|Functional editorial CTA) -->)/, `$1${"<article class=\"article-card\"></article>".repeat(4)}$2`)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .match(/<\/?(?:header|main|footer|section|aside|nav|form|div|article|picture|h1|h2|h3|h4|p|ul|li|a|button|input|label|span)\b[^>]*>/gi)
    ?.map((tag) => tag
      .replace(/\s(?:href|src|srcset|action|method|name|id|aria-[\w-]+|data-[\w-]+|target|rel|loading|decoding|fetchpriority|alt|title|placeholder|value|required|role|tabindex|width|height|type|style)=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/\s+/g, " ")
      .replace(/ >$/, ">"))
    .join("\n") || "";
}

const frozenSequence = staticTagSequence(frozen);
const productionSequence = staticTagSequence(production);
mkdirSync("reports", { recursive: true });
writeFileSync("reports/v2-frozen-dom-reference.txt", frozenSequence, "utf8");
writeFileSync("reports/v2-frozen-dom-production.txt", productionSequence, "utf8");

if (frozenSequence !== productionSequence) {
  const frozenTags = frozenSequence.split("\n");
  const productionTags = productionSequence.split("\n");
  const index = frozenTags.findIndex((tag, i) => tag !== productionTags[i]);
  throw new Error(`Frozen DOM differs at tag ${index + 1}: expected ${frozenTags[index]}, received ${productionTags[index]}`);
}
console.log(`V2 frozen DOM parity confirmed: ${frozenSequence.split("\n").length} static tags.`);
