import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, posix } from "node:path";
import { unzipSync } from "fflate";
import { XMLParser } from "fast-xml-parser";

const input = process.argv.find((arg) => arg.startsWith("--input="))?.split("=")[1] || "C:/Users/lucas/Downloads/Anuncios-2026_07_10-13_28.xlsx";
const output = process.argv.find((arg) => arg.startsWith("--output="))?.split("=")[1] || "work/mercadolivre-export.json";
const maxWorkbookBytes = 50 * 1024 * 1024;
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "#text",
});

function arrayOf(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function xmlFromZip(zip, path) {
  const entry = zip[path];
  if (!entry) return null;
  return parser.parse(Buffer.from(entry).toString("utf8"));
}

function cellColumnIndex(reference = "") {
  const letters = String(reference).match(/^[A-Z]+/i)?.[0]?.toUpperCase() || "A";
  return [...letters].reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function sharedStringText(item) {
  if (!item) return "";
  if (typeof item.t === "string" || typeof item.t === "number") return String(item.t);
  return arrayOf(item.r).map((run) => run?.t ?? "").join("");
}

function cellValue(cell, sharedStrings) {
  if (!cell) return "";
  if (cell.t === "inlineStr") return sharedStringText(cell.is);
  const raw = cell.v;
  if (raw === undefined || raw === null) return "";
  if (cell.t === "s") return sharedStrings[Number(raw)] ?? "";
  if (cell.t === "b") return raw === 1 || raw === "1";
  if (cell.t === "str") return String(raw);
  const numeric = Number(raw);
  return Number.isFinite(numeric) && String(raw).trim() !== "" ? numeric : String(raw);
}

function rowsFromWorksheet(sheet, sharedStrings) {
  const rowNodes = arrayOf(sheet?.worksheet?.sheetData?.row);
  return rowNodes.map((row) => {
    const cells = [];
    for (const cell of arrayOf(row.c)) {
      cells[cellColumnIndex(cell.r)] = cellValue(cell, sharedStrings);
    }
    return cells;
  });
}

function toJsonRows(rows) {
  const headers = (rows[0] || []).map((value, index) => String(value || `Coluna ${index + 1}`).trim());
  return rows.slice(1).filter((row) => row.some((value) => value !== "")).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
  );
}

function workbookSheets(zip) {
  const workbook = xmlFromZip(zip, "xl/workbook.xml");
  const relationships = xmlFromZip(zip, "xl/_rels/workbook.xml.rels");
  const rels = new Map(
    arrayOf(relationships?.Relationships?.Relationship).map((rel) => [rel.Id, rel.Target]),
  );
  return arrayOf(workbook?.workbook?.sheets?.sheet).map((sheet) => {
    const target = rels.get(sheet["r:id"]);
    const resolved = target?.startsWith("/") ? target.slice(1) : posix.normalize(posix.join("xl", target || ""));
    return { name: sheet.name, path: resolved };
  }).filter((sheet) => sheet.name && sheet.path);
}

if (extname(input).toLowerCase() !== ".xlsx") {
  throw new Error("Use um arquivo .xlsx exportado do Mercado Livre.");
}

if (!existsSync(input)) {
  throw new Error(`Arquivo XLSX não encontrado: ${input}`);
}

const size = statSync(input).size;
if (size > maxWorkbookBytes) {
  throw new Error(`Arquivo XLSX muito grande (${Math.round(size / 1024 / 1024)} MB). Limite: 50 MB.`);
}

mkdirSync(dirname(output), { recursive: true });

const zip = unzipSync(new Uint8Array(readFileSync(input)));
const sharedStrings = arrayOf(xmlFromZip(zip, "xl/sharedStrings.xml")?.sst?.si).map(sharedStringText);
const sheets = Object.fromEntries(
  workbookSheets(zip).map((sheet) => [sheet.name, toJsonRows(rowsFromWorksheet(xmlFromZip(zip, sheet.path), sharedStrings))]),
);

writeFileSync(output, `${JSON.stringify({ input, importedAt: new Date().toISOString(), sheets }, null, 2)}\n`, "utf8");
console.log(`Exportação XLSX importada: ${Object.keys(sheets).length} abas em ${output}.`);
