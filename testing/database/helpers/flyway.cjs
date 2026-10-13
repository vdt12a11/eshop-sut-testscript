const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const cli = path.join(root, 'testing/.tmp/tools/flyway-13.10.0/flyway.cmd');
function migrate(databasePath) {
  if (!fs.existsSync(cli)) throw new Error('Flyway CLI missing: see flyway/README.md');
  // Pass configuration via environment to avoid cmd.exe quoting database paths.
  const result = spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'flyway.cmd migrate validate info'], {
    cwd: path.dirname(cli), encoding: 'utf8', timeout: 60000,
    env: { ...process.env, FLYWAY_URL: 'jdbc:sqlite:' + databasePath.replaceAll('\\', '/'), FLYWAY_LOCATIONS: 'filesystem:' + path.join(root, 'flyway/sql').replaceAll('\\', '/'), FLYWAY_CLEAN_DISABLED: 'true' },
  });
  const log = (result.stdout || '') + (result.stderr || '');
  fs.writeFileSync(path.join(path.dirname(databasePath), 'flyway.log'), log);
  if (result.error || result.status !== 0) throw new Error('Flyway migration failed: ' + (result.error?.message || log));
  return { version: '13.10.0', logPath: path.join(path.dirname(databasePath), 'flyway.log') };
}
module.exports = { migrate };
