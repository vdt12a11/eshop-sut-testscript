const path = require('node:path');
const { createRequire } = require('node:module');
const { run, get, all } = require('./db.cjs');

// Node 24 loads the shared CommonJS seeder and Faker 10. Under Jest the
// runner also enables experimental-vm-modules for its ESM loader.
const nativeRequire = createRequire(path.resolve(__dirname, '../../package.json'));
const { fakerVI } = nativeRequire('@faker-js/faker');
const { seedData, SEED_NUMBER } = nativeRequire(path.resolve(__dirname, '../fixtures/seed-faker.js'));
const REFERENCE_DATE = '2026-03-31T00:00:00.000Z';
const EXPECTED_COUNTS = { categories: 5, users: 20, products: 50, coupons: 5, coupon_usage: 3, orders: 30 };

async function seedForTests(db) {
  const originalForeignKeys = (await get(db, 'PRAGMA foreign_keys')).foreign_keys;
  // Fail early on a mismatched schema, before calling the original seeder.
  const schema = await all(db, "SELECT name FROM sqlite_master WHERE type='table'");
  const names = schema.map(row => row.name);
  for (const table of Object.keys(EXPECTED_COUNTS)) {
    if (!names.includes(table)) throw new Error(`Fixture setup: missing SUT table ${table}`);
  }

  // serialize() without a callback stays active across the BEGIN callback.
  // The original seeder's serialize(callback) alone did not cover that work.
  db.serialize();
  fakerVI.seed(SEED_NUMBER);
  fakerVI.setDefaultRefDate(REFERENCE_DATE);
  try {
    await seedData(db);
    const counts = {};
    for (const [table, expected] of Object.entries(EXPECTED_COUNTS)) {
      counts[table] = (await get(db, `SELECT COUNT(*) AS count FROM ${table}`)).count;
      if (counts[table] !== expected) {
        throw new Error(`Fixture setup: ${table} has ${counts[table]} rows; expected ${expected}`);
      }
    }
    return { seed: SEED_NUMBER, referenceDate: REFERENCE_DATE, counts, originalForeignKeys };
  } finally {
    // A data fixture must not make STRUCT_07 pass by changing the SUT setting.
    await run(db, `PRAGMA foreign_keys = ${originalForeignKeys ? 'ON' : 'OFF'}`);
    db.parallelize();
  }
}

module.exports = { seedForTests, REFERENCE_DATE, EXPECTED_COUNTS };
