const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { all } = require('../helpers/db.cjs');

let context;
beforeEach(async () => { context = await createContext('TC_STRUCT_01'); });
afterEach(async () => { await disposeContext(context); });

test('[TC_STRUCT_01] database có đúng 7 bảng theo catalog sau khi thiết lập Flyway', async () => {
  const expected = ['categories', 'coupons', 'coupon_usage', 'users', 'products', 'orders', 'flyway_schema_history'].sort();
  // SQLite's own sqlite_sequence is not an application table.
  const rows = await all(context.db, "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'");
  const actual = rows.map(row => row.name).sort();
  observe(context, { expected, actual, missing: expected.filter(name => !actual.includes(name)), extra: actual.filter(name => !expected.includes(name)) });
  expect(actual).toEqual(expected);
});
