const officialOrigin = "https://luscaarmstrong1.github.io";
const officialBase = "/omegaimports-catalogo";

function normalizeBase(value) {
  const clean = String(value || "").trim().replace(/^\/+|\/+$/g, "");
  return clean ? `/${clean}` : "";
}

function normalizeDeploymentUrl(value, fallback) {
  if (!value) return fallback;
  const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return `${url.replace(/\/+$/, "")}/`;
}

export function resolveDeployment(env = process.env) {
  const officialUrl = `${officialOrigin}${officialBase}/`;
  const isVercel = env.VERCEL === "1" || Boolean(env.VERCEL_ENV);
  const hasSiteBase = Object.prototype.hasOwnProperty.call(env, "SITE_BASE");

  return Object.freeze({
    officialOrigin,
    officialBase,
    officialUrl,
    isVercel,
    isPreview: env.VERCEL_ENV === "preview",
    base: normalizeBase(hasSiteBase ? env.SITE_BASE : isVercel ? "" : officialBase),
    url: normalizeDeploymentUrl(env.SITE_URL || env.VERCEL_URL, officialUrl),
  });
}

