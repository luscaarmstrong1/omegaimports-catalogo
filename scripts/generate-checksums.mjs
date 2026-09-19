import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const baseDir = 'handoff/omegaimports-v2-approved';
const checksumFile = path.join(baseDir, '06-checksums', 'SHA256SUMS.txt');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

const foldersToHash = ['01-preview-v2', '02-assets', '03-screenshots', '04-documentation', '05-integration-map'];
let hashes = [];

for (const folder of foldersToHash) {
  const folderPath = path.join(baseDir, folder);
  if (fs.existsSync(folderPath)) {
    const files = getAllFiles(folderPath);
    for (const f of files) {
      const relPath = path.relative(baseDir, f).replace(/\\/g, '/');
      const fileBuffer = fs.readFileSync(f);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      hashes.push(`${hash}  ${relPath}`);
    }
  }
}

hashes.sort();
fs.mkdirSync(path.dirname(checksumFile), { recursive: true });
fs.writeFileSync(checksumFile, hashes.join('\n') + '\n', 'utf8');
console.log(`Generated ${hashes.length} SHA-256 checksums in ${checksumFile}`);
