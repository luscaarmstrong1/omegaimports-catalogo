import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["src/data", "public/assets", "public/brand", "dist"].filter((path) => {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
});

const patternSources = [
  "\\?\\?",
  "Ãƒ",
  "Ã‚",
  "automa-o",
  "eletr-n",
  "instala-o",
  "alimenta-o",
  "localiza-o",
  "medi-o",
  "omegaimports\\.catalogo\\.local",
  "Î©",
];
const bad = patternSources.map((source) => new RegExp(source, "i"));
const allowedBinary = /\.(png|jpg|jpeg|webp|ico)$/i;
const findings = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const st = statSync(path);
    if (st.isDirectory()) walk(path);
    else if (!allowedBinary.test(path)) {
      const text = readFileSync(path, "utf8");
      for (const pattern of bad) {
        if (pattern.test(text)) findings.push(`${path}: ${pattern}`);
      }
    }
  }
}

roots.forEach(walk);
if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log("Auditoria de encoding concluída sem mojibake.");
