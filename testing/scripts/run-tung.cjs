const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const catalog = require('../database/cases-tung.cjs');
const root = path.resolve(__dirname, '../..');
let cases = catalog;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) {
  const [flag, value] = args.slice(i, i + 2);
  if (flag === '--suite' && ['structural', 'functional'].includes(value)) cases = cases.filter(c => c.suite === value);
  else if (flag === '--case' && catalog.some(c => c.id === value)) cases = cases.filter(c => c.id === value);
  else throw new Error('Usage: npm test -- [--suite structural|functional] [--case TC_STRUCT_02]');
}
if (!cases.length) throw new Error('No matching test cases');
const runId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + process.pid;
const evidence = path.join(root, 'evidence/tung', runId);
fs.mkdirSync(evidence, { recursive: true });
function hash(file) { return fs.existsSync(file) ? crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') : null; }
const database = path.join(root, 'backend/database.sqlite');
const before = hash(database);
const resultPath = path.join(evidence, 'jest-results.json');
const jestStartedAt = Date.now();
const result = spawnSync(process.execPath, ['--experimental-vm-modules', require.resolve('jest/bin/jest'), '--config', path.join(root, 'testing/jest.config.cjs'), '--runInBand', '--runTestsByPath', ...cases.map(c => path.join(root, 'testing/database', c.suite, c.id + '.test.js')), '--json', '--outputFile', resultPath], {
  cwd: path.join(root, 'testing'), env: { ...process.env, JEST_SKIP_LOCAL_INSTALL: '1', TUNG_EVIDENCE_DIR: evidence }, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
});
const jestDurationSeconds = (Date.now() - jestStartedAt) / 1000;
fs.writeFileSync(path.join(evidence, 'jest-console.log'), (result.stdout || '') + (result.stderr || ''));
const raw = fs.existsSync(resultPath) ? JSON.parse(fs.readFileSync(resultPath, 'utf8')) : null;
const assertions = raw ? raw.testResults.flatMap(r => r.assertionResults) : [];
const rows = cases.map(c => {
  const assertion = assertions.find(a => a.title.includes(c.id));
  const observationPath = path.join(evidence, c.id + '.json');
  const observed = fs.existsSync(observationPath) ? JSON.parse(fs.readFileSync(observationPath, 'utf8')) : null;
  let status = assertion?.status === 'passed' ? 'PASS' : observed ? 'FAIL' : 'BLOCKED';
  if (c.id === 'TC_STRUCT_01' && status === 'FAIL' && observed.observations.missing?.length === 1 && observed.observations.missing[0] === 'flyway_schema_history' && observed.observations.extra?.length === 0) status = 'BLOCKED';
  return { ...c, status, jestStatus: assertion?.status || 'not executed', observations: observed?.observations, failure: assertion?.failureMessages };
});
const summary = { runId, node: process.version, evidence, sourceHashes: { initializer: hash(path.join(root, 'backend/database.js')), server: hash(path.join(root, 'backend/server.js')), seeder: hash(path.join(root, 'testing/database/fixtures/seed-faker.js')), packageLock: hash(path.join(root, 'testing/package-lock.json')), originalDatabaseBefore: before, originalDatabaseAfter: hash(database) }, originalDatabaseUnchanged: before === hash(database), rawJest: raw && { passedSuites: raw.numPassedTestSuites, failedSuites: raw.numFailedTestSuites, pendingSuites: raw.numPendingTestSuites, totalSuites: raw.numTotalTestSuites, passed: raw.numPassedTests, failed: raw.numFailedTests, pending: raw.numPendingTests, total: raw.numTotalTests, snapshots: raw.snapshot?.total ?? 0, durationSeconds: jestDurationSeconds }, cases: rows };
fs.writeFileSync(path.join(evidence, 'summary.json'), JSON.stringify(summary, null, 2));
const docs = path.join(root, 'docs/tung');
fs.mkdirSync(docs, { recursive: true });
const suffix = cases.length === catalog.length ? '' : '-' + cases.map(c => c.id).join('-');
fs.writeFileSync(path.join(docs, 'Test_Results' + suffix + '.json'), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(docs, 'Test_Summary' + suffix + '.md'), `# Kết quả phần Tùng\n\nRun: ${runId}\n\nNode: ${process.version}. Database gốc không đổi: ${summary.originalDatabaseUnchanged}.\n\nJest: ${raw?.numPassedTests ?? 0} passed, ${raw?.numFailedTests ?? 0} failed, ${raw?.numTotalTests ?? 0} total. BLOCKED là phân loại báo cáo; assertion Jest vẫn thất bại.\n\n| Case | Kết quả | Nội dung |\n|---|---|---|\n${rows.map(c => `| ${c.id} | ${c.status} | ${c.title} |`).join('\n')}\n\nNếu STRUCT 01 bị BLOCKED do thiếu bảng lịch sử Flyway, kiểm tra bước migration trước khi seed. Xem quan sát HTTP/SQL trong Test_Results${suffix}.json và log tại ${evidence}.\n`);
function displayValues(row) {
  const observations = row.observations;
  if (!observations) return { expected: row.expected, actual: 'Chưa có dữ liệu quan sát; xem jest-console.log để kiểm tra lỗi setup.' };
  const expected = observations.expected ?? observations.requiredColumns ?? observations.expectedType ?? row.expected;
  // Keep expected-only fields out of the actual result. Full observations
  // and metadata remain available in the JSON evidence.
  let actual;
  if (Object.hasOwn(observations, 'actual')) actual = observations.actual;
  else if (row.id === 'TC_STRUCT_03') actual = observations.priceColumn?.type ?? null;
  else actual = Object.fromEntries(Object.entries(observations).filter(([key]) => !['expected', 'expectedType', 'requiredColumns'].includes(key)));
  return { expected, actual };
}
const formatValue = value => typeof value === 'string' ? value : JSON.stringify(value, null, 2);
const bold = text => process.stdout.isTTY ? `\u001b[1m${text}\u001b[22m` : text;
for (const row of rows) {
  const { expected, actual } = displayValues(row);
  console.log(`\n${row.id}`);
  console.log(`kết quả test: ${row.status}`);
  console.log('kết quả mong đợi: ' + formatValue(expected));
  console.log('kết quả thực tế: ' + formatValue(actual));
}
console.log(`${bold('Test Suites:')} ${raw?.numPassedTestSuites ?? 0} passed, ${raw?.numFailedTestSuites ?? 0} failed, ${raw?.numPendingTestSuites ?? 0} skipped, ${raw?.numTotalTestSuites ?? 0} total`);
console.log(`${bold('Tests:')} ${raw?.numPassedTests ?? 0} passed, ${raw?.numFailedTests ?? 0} failed, ${raw?.numPendingTests ?? 0} skipped, ${raw?.numTotalTests ?? 0} total`);
console.log(`${bold('Snapshots:')} ${raw?.snapshot?.total ?? 0} total`);
console.log(`${bold('Time:')} ${jestDurationSeconds.toFixed(2)} s`);
console.log(`${bold('Evidence:')} ${evidence}`);
if (!raw || result.error) console.error(result.error || result.stderr);
if (!summary.originalDatabaseUnchanged) console.error('ERROR: original backend database changed');
process.exitCode = summary.originalDatabaseUnchanged ? (result.status ?? 1) : 1;


