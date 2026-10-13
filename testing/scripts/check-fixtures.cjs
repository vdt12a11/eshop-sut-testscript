const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { createContext, disposeContext } = require('../database/helpers/context.cjs');
const { seedForTests, EXPECTED_COUNTS } = require('../database/helpers/seed-for-tests.cjs');
const { all } = require('../database/helpers/db.cjs');
async function snapshot(db) {
  const data = {};
  for (const table of Object.keys(EXPECTED_COUNTS)) data[table] = await all(db, `SELECT * FROM ${table} ORDER BY id`);
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}
(async () => {
  let first, second;
  try {
    first = await createContext('FIXTURE_CHECK_A');
    const initial = await snapshot(first.db);
    await seedForTests(first.db);
    const repeated = await snapshot(first.db);
    second = await createContext('FIXTURE_CHECK_B');
    const independent = await snapshot(second.db);
    assert.equal(initial, repeated, 'Repeated seed must have identical rows');
    assert.equal(initial, independent, 'Independent database must have identical rows');
    const result = { passed: true, initial, repeated, independent, fixture: first.fixture };
    const output = path.resolve(__dirname, '../.tmp/fixture-check.json');
    fs.writeFileSync(output, JSON.stringify(result, null, 2));
    console.log('Fixture check PASS: identical rows across repeated seed and independent databases.');
  } finally {
    await disposeContext(first);
    await disposeContext(second);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
