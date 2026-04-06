/**
 * SQLite via sql.js (WASM). Path from SQLITE_PATH (default ./data/appointments.db) or :memory:.
 */
const fs = require('fs');
const path = require('path');
const { openSqlJsDatabase, persistDatabase } = require('./sqlJsAdapter');

let dbInstance = null;
let resolvedPath = null;

function getDbPath() {
  const fromEnv = process.env.SQLITE_PATH;
  if (fromEnv && String(fromEnv).trim() !== '') {
    const t = String(fromEnv).trim();
    if (t === ':memory:') return ':memory:';
    return path.resolve(process.cwd(), t);
  }
  return path.join(process.cwd(), 'data', 'appointments.db');
}

async function openDatabase() {
  if (dbInstance) return dbInstance;

  resolvedPath = getDbPath();
  dbInstance = await openSqlJsDatabase(resolvedPath === ':memory:' ? ':memory:' : resolvedPath);
  dbInstance.pragma('foreign_keys = ON');

  return dbInstance;
}

function getResolvedDbPath() {
  return resolvedPath;
}

function saveDatabaseSync() {
  if (dbInstance && resolvedPath && resolvedPath !== ':memory:') {
    persistDatabase(dbInstance, resolvedPath);
  }
}

function closeDatabase() {
  if (dbInstance) {
    saveDatabaseSync();
    dbInstance.close();
    dbInstance = null;
    resolvedPath = null;
  }
}

module.exports = {
  openDatabase,
  closeDatabase,
  getDbPath,
  getResolvedDbPath,
  saveDatabaseSync,
};
