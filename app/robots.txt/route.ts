import { storeConfig } from "@/src/data/store";

export function GET() {
  const base = storeConfig.siteUrl.replace(/\/$/, "");
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`, {
    headers: { "content-type": "text/plain" },
  });
}
