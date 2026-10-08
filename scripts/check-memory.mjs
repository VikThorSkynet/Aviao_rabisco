import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, ''));

export function validateValue(value, schema, location = '$', errors = []) {
  const type = schema.type;
  const matches = type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value)
    : type === 'array' ? Array.isArray(value)
    : type === 'integer' ? Number.isInteger(value)
    : type === 'number' ? typeof value === 'number' && Number.isFinite(value)
    : typeof value === type;
  if (type && !matches) { errors.push(`${location}: esperado ${type}`); return errors; }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${location}: valor fora do enum`);
  if (type === 'string') {
    if (value.length < (schema.minLength || 0)) errors.push(`${location}: texto vazio/curto`);
    if (schema.format === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) errors.push(`${location}: data inválida`);
    if (schema.format === 'uri') { try { const url = new URL(value); if (!['https:', 'http:'].includes(url.protocol)) throw new Error(); } catch { errors.push(`${location}: URL inválida`); } }
  }
  if (type === 'array') {
    if (value.length < (schema.minItems || 0)) errors.push(`${location}: array curto`);
    value.forEach((item, index) => validateValue(item, schema.items, `${location}[${index}]`, errors));
  }
  if (type === 'object') {
    for (const key of schema.required || []) if (!Object.hasOwn(value, key)) errors.push(`${location}.${key}: obrigatório`);
    for (const [key, item] of Object.entries(value)) {
      if (Object.hasOwn(schema.properties || {}, key)) validateValue(item, schema.properties[key], `${location}.${key}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${location}.${key}: campo desconhecido`);
    }
  }
  return errors;
}

export function validateReference(base, reference) {
  if (typeof reference !== 'string' || !reference || path.isAbsolute(reference) || /^[A-Za-z]:|^[\\/]|^[a-z]+:/i.test(reference)) return 'referência absoluta/inválida';
  const target = path.resolve(base, reference), relative = path.relative(base, target);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) return 'referência fora do repositório';
  if (!fs.existsSync(target)) return 'referência inexistente';
  const realRelative = path.relative(fs.realpathSync(base), fs.realpathSync(target));
  if (realRelative === '..' || realRelative.startsWith('..' + path.sep) || path.isAbsolute(realRelative)) return 'referência real fora do repositório';
  return null;
}

export function checkMemory() {
  const state = read('.memory/state.json'), schema = read('.memory/schema.json'), decisions = read('.memory/decisions.json'), packageJson = read('package.json');
  const errors = validateValue(state, schema);
  if (state.project?.version !== packageJson.version) errors.push('Versão da memória difere de package.json');
  const refs = [...(Array.isArray(state.references) ? state.references : []), ...(Array.isArray(state.components) ? state.components.map(c => c.path) : []), state.entrypoints?.source, state.entrypoints?.portable];
  const ids = new Set();
  if (!Array.isArray(decisions)) errors.push('decisions.json precisa ser array');
  else for (const [index, decision] of decisions.entries()) {
    validateValue(decision, { type:'object', required:['id','date','status','decision','rationale','references'], additionalProperties:false, properties:{id:{type:'string',minLength:1},date:{type:'string',format:'date'},status:{type:'string',enum:['accepted','superseded']},decision:{type:'string',minLength:1},rationale:{type:'string',minLength:1},references:{type:'array',minItems:1,items:{type:'string',minLength:1}}}}, `decisions[${index}]`, errors);
    if (ids.has(decision.id)) errors.push(`ID de decisão duplicado: ${decision.id}`);
    ids.add(decision.id);
    if (Array.isArray(decision.references)) refs.push(...decision.references);
  }
  for (const ref of refs) { const error = validateReference(root, ref); if (error) errors.push(`${String(ref)}: ${error}`); }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Memória válida: v${state.schemaVersion}, ${state.components.length} componentes, ${decisions.length} decisões.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { checkMemory(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
