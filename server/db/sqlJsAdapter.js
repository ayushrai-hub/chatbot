/**
 * sql.js (WASM) wrapper with a better-sqlite3-like API used by this codebase.
 */
const fs = require('fs');
const path = require('path');

function getLastInsertRowid(rawDb) {
  const r = rawDb.exec('SELECT last_insert_rowid() AS id');
  if (!r.length || !r[0].values.length) return 0;
  return r[0].values[0][0];
}

function createPrepare(rawDb, sqlText) {
  return {
    all(...params) {
      const stmt = rawDb.prepare(sqlText);
      try {
        if (params.length) stmt.bind(params);
        const out = [];
        while (stmt.step()) {
          out.push(stmt.getAsObject());
        }
        return out;
      } finally {
        stmt.free();
      }
    },
    get(...params) {
      const stmt = rawDb.prepare(sqlText);
      try {
        if (params.length) stmt.bind(params);
        if (!stmt.step()) return undefined;
        return stmt.getAsObject();
      } finally {
        stmt.free();
      }
    },
    run(...params) {
      const stmt = rawDb.prepare(sqlText);
      try {
        if (params.length) stmt.bind(params);
        stmt.step();
        return {
          changes: rawDb.getRowsModified(),
          lastInsertRowid: getLastInsertRowid(rawDb),
        };
      } finally {
        stmt.free();
      }
    },
  };
}

function wrapDatabase(rawDb) {
  return {
    _raw: rawDb,
    pragma(pragmaSql) {
      rawDb.run(`PRAGMA ${pragmaSql}`);
    },
    exec(sql) {
      rawDb.exec(sql);
    },
    prepare(sql) {
      return createPrepare(rawDb, sql);
    },
    transaction(fn) {
      return () => {
        rawDb.run('BEGIN IMMEDIATE');
        try {
          const result = fn();
          rawDb.run('COMMIT');
          return result;
        } catch (e) {
          try {
            rawDb.run('ROLLBACK');
          } catch {
            /* ignore */
          }
          throw e;
        }
      };
    },
    close() {
      rawDb.close();
    },
  };
}

async function openSqlJsDatabase(filePath) {
  const initSqlJs = require('sql.js');
  const distDir = path.dirname(require.resolve('sql.js'));
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(distDir, file),
  });

  let raw;
  if (filePath && filePath !== ':memory:' && fs.existsSync(filePath)) {
    const filebuffer = fs.readFileSync(filePath);
    raw = new SQL.Database(filebuffer);
  } else {
    raw = new SQL.Database();
  }

  return wrapDatabase(raw);
}

function persistDatabase(db, filePath) {
  if (!filePath || filePath === ':memory:') return;
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const raw = db._raw || db;
  const data = raw.export();
  fs.writeFileSync(filePath, Buffer.from(data));
}

module.exports = {
  openSqlJsDatabase,
  wrapDatabase,
  persistDatabase,
};
