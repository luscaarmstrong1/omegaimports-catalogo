import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const inspectEnvironment = `
  import { absolute, assetUrl, deployment, pageUrl, site } from "./scripts/shared.mjs";
  import { renderV2Home, renderV2InternalPage } from "./scripts/v2-home.mjs";
  const home = renderV2Home({ products: [], posts: [] });
  const internal = renderV2InternalPage({ title: "Teste", description: "Página de teste para validar metadados do ambiente de preview.", path: "teste/", body: "<p>Teste</p>" });
  process.stdout.write(JSON.stringify({
    deployment,
    siteBase: site.base,
    page: pageUrl("produtos/"),
    asset: assetUrl("v2/runtime.js"),
    canonical: absolute("produtos/"),
    homeNoindex: home.includes("noindex,nofollow,noarchive"),
    internalNoindex: internal.includes("noindex,nofollow,noarchive"),
  }));
`;

function inspect(env = {}) {
  const result = spawnSync(process.execPath, ["--input-type=module", "--eval", inspectEnvironment], {
    cwd: process.cwd(),
    env: { ...process.env, VERCEL: "", VERCEL_ENV: "", VERCEL_URL: "", SITE_URL: "", SITE_BASE: undefined, ...env },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout.trim());
}

test("keeps the GitHub Pages base and canonical URLs by default", () => {
  const result = inspect();
  assert.equal(result.siteBase, "/omegaimports-catalogo");
  assert.equal(result.page, "/omegaimports-catalogo/produtos/");
  assert.equal(result.asset, "/omegaimports-catalogo/v2/runtime.js");
  assert.equal(result.canonical, "https://luscaarmstrong1.github.io/omegaimports-catalogo/produtos/");
  assert.equal(result.homeNoindex, false);
});

test("uses root-relative navigation and strict noindex in Vercel Preview", () => {
  const result = inspect({ VERCEL: "1", VERCEL_ENV: "preview", VERCEL_URL: "omegaimports-preview.example.vercel.app" });
  assert.equal(result.deployment.base, "");
  assert.equal(result.deployment.url, "https://omegaimports-preview.example.vercel.app/");
  assert.equal(result.page, "/produtos/");
  assert.equal(result.asset, "/v2/runtime.js");
  assert.equal(result.canonical, "https://luscaarmstrong1.github.io/omegaimports-catalogo/produtos/");
  assert.equal(result.homeNoindex, true);
  assert.equal(result.internalNoindex, true);
});

test("allows an explicit base override without changing official canonicals", () => {
  const result = inspect({ SITE_BASE: "/preview-root/" });
  assert.equal(result.siteBase, "/preview-root");
  assert.equal(result.page, "/preview-root/produtos/");
  assert.equal(result.canonical, "https://luscaarmstrong1.github.io/omegaimports-catalogo/produtos/");
});
