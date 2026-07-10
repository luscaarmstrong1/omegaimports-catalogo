import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["scripts", "src", "tests"];
const failures = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const st = statSync(path);
    if (st.isDirectory()) walk(path);
    else if (/\.(mjs|js|ts)$/.test(path)) {
      const text = readFileSync(path, "utf8");
      if (text.includes("console.log(") && !path.includes("scripts")) failures.push(`${path}: console.log fora de script`);
      if (text.includes(["debug", "ger"].join(""))) failures.push(`${path}: depurador encontrado`);
    }
  }
}
roots.forEach(walk);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Lint leve concluído.");
