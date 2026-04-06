const fs = require('fs');
const path = require('path');

const MIGRATIONS = [
  { version: 1, file: '001_initial.sql' },
  { version: 2, file: '002_faqs.sql' },
];

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL
    );
  `);

  const applied = new Set(
    db.prepare('SELECT version FROM schema_migrations').all().map((r) => r.version),
  );

  for (const m of MIGRATIONS) {
    if (applied.has(m.version)) continue;

    const sqlPath = path.join(__dirname, 'migrations', m.file);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    db.exec(sql);

    db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(m.version);
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(`[migrate] applied version ${m.version} (${m.file})`);
    }
  }
}

module.exports = { migrate };
