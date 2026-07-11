import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const input = process.argv.find((arg) => arg.startsWith("--input="))?.split("=")[1] || "C:/Users/lucas/Downloads/Anúncios.html";
const output = process.argv.find((arg) => arg.startsWith("--output="))?.split("=")[1] || "work/dashboard-items.json";

mkdirSync("work", { recursive: true });
const html = readFileSync(input, "utf8");
const ids = [...new Set(html.match(/MLB\d{8,}/g) || [])];
const sanitized = ids.map((mlbId) => ({ mlbId, source: "seller-dashboard-html", sourceFile: input.replace(/^.*[\\/]/, ""), parsedAt: new Date().toISOString() }));

writeFileSync(output, `${JSON.stringify(sanitized, null, 2)}\n`, "utf8");
console.log(`Dashboard processado sem persistir sessão: ${sanitized.length} MLBs encontrados em ${output}.`);
