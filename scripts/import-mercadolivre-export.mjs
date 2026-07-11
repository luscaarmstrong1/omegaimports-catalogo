import { mkdirSync, writeFileSync } from "node:fs";
import xlsx from "xlsx";

const input = process.argv.find((arg) => arg.startsWith("--input="))?.split("=")[1] || "C:/Users/lucas/Downloads/Anuncios-2026_07_10-13_28.xlsx";
const output = process.argv.find((arg) => arg.startsWith("--output="))?.split("=")[1] || "work/mercadolivre-export.json";

mkdirSync("work", { recursive: true });
const workbook = xlsx.readFile(input, { cellDates: true });
const sheets = Object.fromEntries(
  workbook.SheetNames.map((name) => [name, xlsx.utils.sheet_to_json(workbook.Sheets[name], { defval: "" })]),
);

writeFileSync(output, `${JSON.stringify({ input, importedAt: new Date().toISOString(), sheets }, null, 2)}\n`, "utf8");
console.log(`Exportação XLSX importada: ${workbook.SheetNames.length} abas em ${output}.`);
