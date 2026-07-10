import { readFileSync, writeFileSync } from "node:fs";

const csvPath = process.argv[2] || "products-import.csv";
const raw = readFileSync(csvPath, "utf8");
const [headerLine, ...lines] = raw.split(/\r?\n/).filter(Boolean);
const headers = headerLine.split(",").map((item) => item.trim());
const required = ["mlbId", "name", "mercadoLivreUrl"];
for (const key of required) {
  if (!headers.includes(key)) throw new Error(`CSV precisa conter a coluna ${key}`);
}

const records = lines.map((line) => {
  const values = line.split(",").map((item) => item.trim());
  return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
});

writeFileSync("products-import-preview.json", JSON.stringify(records, null, 2));
console.log(`Prévia de importação gerada: ${records.length} registro(s). Revise antes de substituir o catálogo.`);
