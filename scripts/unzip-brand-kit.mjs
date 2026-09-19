import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const zip = 'C:\\Users\\lucas\\Downloads\\OMEGAIMPORTS_Brand_Kit_Completo.zip';
const outDir = path.resolve('preview-v2/assets/brand-kit-extracted');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

execSync(`powershell -Command "Expand-Archive -Path '${zip}' -DestinationPath '${outDir}' -Force"`);

const kitDir = path.join(outDir, 'OMEGAIMPORTS_Brand_Kit');
console.log('Files in Brand Kit:');
fs.readdirSync(kitDir).forEach(f => console.log(' -', f));
