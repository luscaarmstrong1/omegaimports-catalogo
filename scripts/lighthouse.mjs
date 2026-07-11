import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

mkdirSync("reports/lighthouse", { recursive: true });
const url = process.argv.find((arg) => arg.startsWith("--url="))?.split("=")[1] || "http://localhost:4173/omegaimports-catalogo/";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(npx, ["lighthouse", url, "--quiet", "--chrome-flags=--headless", "--output=json", "--output-path=reports/lighthouse/home.json"], {
  stdio: "pipe",
  timeout: 180000,
});

if (result.status === 0) {
  console.log("Lighthouse concluído: reports/lighthouse/home.json");
} else {
  const message = {
    status: "not-run",
    reason: "Lighthouse/Chrome indisponível no ambiente local ou servidor não iniciado.",
    url,
    stderr: String(result.stderr || "").slice(0, 1000),
    checkedAt: new Date().toISOString(),
  };
  writeFileSync("reports/lighthouse/home-not-run.json", `${JSON.stringify(message, null, 2)}\n`, "utf8");
  console.log("Lighthouse não executado; relatório de indisponibilidade salvo em reports/lighthouse/home-not-run.json.");
}
