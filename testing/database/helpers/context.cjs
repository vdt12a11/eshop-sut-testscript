const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const Module = require('node:module');
const { all, get, close } = require('./db.cjs');
const { seedForTests } = require('./seed-for-tests.cjs');
const { migrate } = require('./flyway.cjs');

const testingRoot = path.resolve(__dirname, '../..');
const sutRoot = path.resolve(testingRoot, '..');
const nativeRequire = Module.createRequire(path.join(testingRoot, 'package.json'));
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');

function loadApp(db) {
  const sourcePath = path.join(sutRoot, 'backend/server.js');
  const original = fs.readFileSync(sourcePath, 'utf8');
  const listenPattern = /app\.listen\(PORT, \(\) => \{\s*console\.log\(`Server is running on http:\/\/localhost:\$\{PORT\}`\);\s*\}\);\s*$/;
  if (!listenPattern.test(original)) throw new Error('SUT adapter: unrecognised app.listen; review before testing');

  // Only the terminal listener is replaced with an export. All API handlers
  // remain the actual SUT source. The injected db is a real SQLite database.
  const adapted = original.replace(listenPattern, 'module.exports = app;\n');
  const sutModule = new Module(sourcePath, module);
  sutModule.filename = sourcePath;
  sutModule.paths = Module._nodeModulePaths(path.dirname(sourcePath));
  sutModule.require = dependency => dependency === './database' ? db : nativeRequire(dependency);
  sutModule._compile(adapted, sourcePath);
  return { app: sutModule.exports, serverSha256: sha256(original) };
}

async function createContext(caseId, { api = false } = {}) {
  const temporaryRoot = path.join(testingRoot, '.tmp', 'tung');
  fs.mkdirSync(temporaryRoot, { recursive: true });
  const directory = fs.mkdtempSync(path.join(temporaryRoot, `${caseId}-`));
  const initializerPath = path.join(sutRoot, 'backend/database.js');
  // Guard against migration drift: V1 must preserve the actual SUT DDL.
  const source = fs.readFileSync(initializerPath, 'utf8');
  const statements = [...source.matchAll(/db\.run\(`(CREATE TABLE[\s\S]*?)`\);/g)].map(match => match[1].replace(/\s+/g, ' ').trim());
  const migration = fs.readFileSync(path.join(sutRoot, 'flyway/sql/V1__create_eshop_schema.sql'), 'utf8');
  const migrationStatements = [...migration.matchAll(/CREATE TABLE[\s\S]*?\);/g)].map(match => match[0].slice(0, -1).replace(/\s+/g, ' ').trim());
  if (statements.length !== 6 || JSON.stringify(statements) !== JSON.stringify(migrationStatements)) throw new Error('Flyway V1 does not match SUT schema: review schema drift');
  if (/PRAGMA\s+foreign_keys/i.test(source)) throw new Error('SUT connection configuration changed: review Flyway test connection');
  const databasePath = path.join(directory, 'database.sqlite');
  const flyway = migrate(databasePath);
  const sqlite3 = nativeRequire('sqlite3');
  const db = new sqlite3.Database(databasePath);
  db.serialize();
  const context = {
    caseId, db, directory, flyway,
    databasePath: path.join(directory, 'database.sqlite'),
    initializerSha256: sha256(fs.readFileSync(initializerPath)),
  };
  try {
    await get(db, 'SELECT 1 AS initialized');
    context.sourceForeignKeys = (await get(db, 'PRAGMA foreign_keys')).foreign_keys;
    context.fixture = await seedForTests(db);
    context.schema = await all(db, "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    if (api) Object.assign(context, loadApp(db));
    return context;
  } catch (error) {
    await close(db);
    throw error;
  }
}

function observe(context, observations) {
  const outputDirectory = process.env.TUNG_EVIDENCE_DIR || path.join(testingRoot, '.tmp', 'tung-observations');
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, `${context.caseId}.json`), JSON.stringify({
    caseId: context.caseId,
    observedAt: new Date().toISOString(),
    databasePath: context.databasePath,
    initializerSha256: context.initializerSha256,
    serverSha256: context.serverSha256,
    sourceForeignKeys: context.sourceForeignKeys,
    flyway: context.flyway,
    fixture: context.fixture,
    observations,
  }, null, 2));
}

module.exports = { createContext, observe, disposeContext: context => context ? close(context.db) : Promise.resolve() };
