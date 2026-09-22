import fs from 'fs';
import path from 'path';

function readPngDimensions(buffer) {
  if (buffer.length < 24) return null;
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.readUInt32BE(0) !== 0x89504e47 || buffer.readUInt32BE(4) !== 0x0d0a1a0a) return null;
  // IHDR chunk comes right after signature: length (4), 'IHDR' (4), width (4), height (4)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

const dir = 'reference-mockups';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
const report = [];

for (const f of files) {
  const full = path.join(dir, f);
  const buf = fs.readFileSync(full);
  const dim = readPngDimensions(buf);
  report.push({
    file: f,
    width: dim ? dim.width : 0,
    height: dim ? dim.height : 0,
    aspect: dim ? (dim.width / dim.height).toFixed(2) : '0',
    sizeKb: (buf.length / 1024).toFixed(1)
  });
}

console.table(report);
fs.writeFileSync('scripts/mockups-analysis.json', JSON.stringify(report, null, 2), 'utf8');
