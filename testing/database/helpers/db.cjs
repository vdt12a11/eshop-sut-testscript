// Promise adapters let Jest await every SQLite operation, including failures.
function run(db, sql, parameters = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, parameters, function (error) {
      if (error) return reject(error);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(db, sql, parameters = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, parameters, (error, row) => error ? reject(error) : resolve(row));
  });
}

function all(db, sql, parameters = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, parameters, (error, rows) => error ? reject(error) : resolve(rows));
  });
}

function close(db) {
  return new Promise((resolve, reject) => {
    db.close(error => error ? reject(error) : resolve());
  });
}

module.exports = { run, get, all, close };
