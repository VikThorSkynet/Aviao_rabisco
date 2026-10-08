import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url)), files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
    if (['.git','node_modules','dist'].includes(entry.name)) continue;
    const name = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(name);
    else if (entry.name.endsWith('.md')) files.push(name);
  }
}
walk(root);
const errors = []; let checked = 0;
for (const file of files) {
  const text = fs.readFileSync(file,'utf8').replace(/```[\s\S]*?```/g,'');
  for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g,'').split(/\s+"/)[0];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    let local;
    try { local = decodeURIComponent(target.split('#')[0].split('?')[0]); } catch { errors.push(`${path.relative(root,file)}: URL inválida ${target}`); continue; }
    const resolved = path.resolve(path.dirname(file),local), relative = path.relative(root,resolved);
    if (path.isAbsolute(local) || relative === '..' || relative.startsWith('..'+path.sep) || !fs.existsSync(resolved)) errors.push(`${path.relative(root,file)}: link local inválido ${target}`);
    checked++;
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode=1; }
else console.log(`Documentação válida: ${files.length} arquivos Markdown, ${checked} links locais. Âncoras e URLs externas não são verificadas.`);
