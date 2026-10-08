import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateValue, validateReference, checkMemory } from '../scripts/check-memory.mjs';

test('memory rejects missing fields, unknown fields and wrong types', () => {
  const schema={type:'object',required:['version'],additionalProperties:false,properties:{version:{type:'integer',enum:[1]}}};
  assert.deepEqual(validateValue({version:1},schema),[]);
  assert.ok(validateValue({},schema).length);
  assert.ok(validateValue({version:'1'},schema).length);
  assert.ok(validateValue({version:1,token:'should-not-be-here'},schema).length);
});
test('memory rejects impossible dates', () => {
  const schema={type:'string',format:'date'};
  assert.deepEqual(validateValue('2026-10-08',schema),[]);
  assert.ok(validateValue('2026-02-30',schema).length);
  assert.ok(validateValue('yesterday',schema).length);
});
test('memory rejects missing references and paths escaping its root', () => {
  const base=fs.mkdtempSync(path.join(os.tmpdir(),'rabisco-memory-'));
  try {
    fs.writeFileSync(path.join(base,'valid.md'),'context');
    assert.equal(validateReference(base,'valid.md'),null);
    assert.ok(validateReference(base,'missing.md'));
    assert.ok(validateReference(base,'../outside.md'));
    assert.ok(validateReference(base,path.resolve(base,'valid.md')));
    assert.ok(validateReference(base,'C:/private.txt'));
  } finally { fs.rmSync(base,{recursive:true,force:true}); }
});
test('checked-in memory matches its schema, package and references', () => checkMemory());
