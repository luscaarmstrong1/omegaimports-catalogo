import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const referenceDir = path.resolve(__dirname, '../reference-mockups');

// Certificar que os diretórios existem
const dirsToCreate = [
  'categories',
  'blog',
  'blog-article',
  'about',
  'how-to-buy',
  'faq',
  'privacy',
  'terms',
  'contact'
];

dirsToCreate.forEach(d => {
  fs.mkdirSync(path.resolve(__dirname, `../reports/visual-parity/${d}`), { recursive: true });
});

console.log('Estrutura de diretórios criada em reports/visual-parity/');
