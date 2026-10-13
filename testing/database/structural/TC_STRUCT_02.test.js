const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { all } = require('../helpers/db.cjs');

let context;
beforeEach(async () => { context = await createContext('TC_STRUCT_02'); });
afterEach(async () => { await disposeContext(context); });

test('[TC_STRUCT_02] users có các cột thiết yếu id, email, role và locked_until', async () => {
  // Arrange: beforeEach already created the actual schema and the shared seed.
  const requiredColumns = ['id', 'email', 'role', 'locked_until'];
  // Act: inspect metadata, not user records.
  const columns = await all(context.db, "PRAGMA table_info('users')");
  const actual = columns.map(column => column.name);
  observe(context, { requiredColumns, actual, columns });
  // Assert: arrayContaining checks the required subset, not exactly four columns.
  expect(actual).toEqual(expect.arrayContaining(requiredColumns));
  expect(new Set(actual).size).toBe(actual.length);
});
