const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3');

const caseId = process.argv[2] || 'TC_STRUCT_01';
if (!/^TC_(STRUCT|FUNC)_\d{2}$/.test(caseId)) {
  throw new Error('Use a case ID such as TC_STRUCT_01');
}
const root = path.resolve(__dirname, '../.tmp/tung');
const candidates = fs.existsSync(root) ? fs.readdirSync(root)
  .filter(name => name.startsWith(caseId + '-') && fs.existsSync(path.join(root, name, 'database.sqlite')))
  .sort((a, b) => fs.statSync(path.join(root, b)).mtimeMs - fs.statSync(path.join(root, a)).mtimeMs) : [];
if (!candidates.length) throw new Error(`Run ${caseId} first: no test database found`);
const file = path.join(root, candidates[0], 'database.sqlite');
const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY, error => {
  if (error) { console.error(error.message); process.exitCode = 1; return; }
  console.log('Database:', file);
  const sql = "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name";
  console.log('SQL:', sql);
  db.all(sql, (queryError, rows) => {
    if (queryError) { console.error(queryError.message); process.exitCode = 1; }
    else { console.table(rows); console.log('So bang (khong tinh sqlite_*):', rows.length); }
    db.close(closeError => { if (closeError) { console.error(closeError.message); process.exitCode = 1; } });
  });
});
