const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'digitalforms.db');

let db;

function getDb() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
        return reject(err);
      }

      db.run('PRAGMA journal_mode = WAL', async (err) => {
        if (err) return reject(err);
        try {
          await initializeTables(db);
          resolve(db);
        } catch (initErr) {
          reject(initErr);
        }
      });
    });
  });
}

function initializeTables(database) {
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      database.run(`
        CREATE TABLE IF NOT EXISTS motor_claims (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reference_number TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          submitted_at TEXT NOT NULL,
          form_data TEXT NOT NULL
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS motor_onboarding (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reference_number TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          submitted_at TEXT NOT NULL,
          form_data TEXT NOT NULL
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS motor_insurance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reference_number TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          submitted_at TEXT NOT NULL,
          form_data TEXT NOT NULL
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS travel_insurance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reference_number TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          submitted_at TEXT NOT NULL,
          form_data TEXT NOT NULL
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS domestic_proposal (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reference_number TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          submitted_at TEXT NOT NULL,
          form_data TEXT NOT NULL
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS hospital_cashback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reference_number TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          submitted_at TEXT NOT NULL,
          form_data TEXT NOT NULL
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS kyc_individual (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reference_number TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          submitted_at TEXT NOT NULL,
          form_data TEXT NOT NULL
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS kyc_corporate (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reference_number TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          submitted_at TEXT NOT NULL,
          form_data TEXT NOT NULL
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS staff_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'reviewer'
        )
      `, () => {
        // Seed a default staff user if none exists
        database.get('SELECT id FROM staff_users WHERE username = ?', ['admin'], (err, row) => {
          if (err) return reject(err);
          if (!row) {
            database.run('INSERT INTO staff_users (username, password, role) VALUES (?, ?, ?)', ['admin', 'Admin@1234', 'admin'], (err) => {
              if (err) return reject(err);
              console.log('✅ Default admin user created: admin / Admin@1234');
              console.log('✅ Database tables initialized');
              resolve();
            });
          } else {
            console.log('✅ Database tables initialized');
            resolve();
          }
        });
      });
    });
  });
}

function generateReference(prefix) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AIC-${prefix}-${date}-${rand}`;
}

async function saveSubmission(tableName, prefix, formData) {
  const database = await getDb();
  const reference = generateReference(prefix);
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    database.run(
      `INSERT INTO ${tableName} (reference_number, status, submitted_at, form_data) VALUES (?, 'pending', ?, ?)`,
      [reference, now, JSON.stringify(formData)],
      function (err) {
        if (err) return reject(err);
        resolve(reference);
      }
    );
  });
}

async function getSubmissions(tableName) {
  const database = await getDb();
  return new Promise((resolve, reject) => {
    database.all(`SELECT * FROM ${tableName} ORDER BY submitted_at DESC`, (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map(row => ({
        ...row,
        form_data: JSON.parse(row.form_data)
      })));
    });
  });
}

async function updateStatus(tableName, id, status) {
  const database = await getDb();
  return new Promise((resolve, reject) => {
    database.run(`UPDATE ${tableName} SET status = ? WHERE id = ?`, [status, id], function (err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
}

async function getAllSubmissions() {
  const tables = [
    { name: 'motor_claims', label: 'Motor Claim', prefix: 'MC' },
    { name: 'motor_onboarding', label: 'Client Onboarding (Motor)', prefix: 'MO' },
    { name: 'motor_insurance', label: 'Motor Insurance', prefix: 'MI' },
    { name: 'travel_insurance', label: 'Travel Insurance', prefix: 'TI' },
    { name: 'domestic_proposal', label: 'Domestic Proposal', prefix: 'DP' },
    { name: 'hospital_cashback', label: 'Hospital Cash Back', prefix: 'HC' },
    { name: 'kyc_individual', label: 'KYC Individual', prefix: 'KI' },
    { name: 'kyc_corporate', label: 'KYC Corporate', prefix: 'KC' },
  ];

  const database = await getDb();
  const results = await Promise.all(tables.map(table => {
    return new Promise((resolve, reject) => {
      database.all(`SELECT *, '${table.name}' as table_name, '${table.label}' as form_type FROM ${table.name} ORDER BY submitted_at DESC`, (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(row => ({
          ...row,
          form_data: JSON.parse(row.form_data)
        })));
      });
    });
  }));

  const allRows = results.flat();
  allRows.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
  return allRows;
}

async function getStats() {
  const tables = [
    { name: 'motor_claims', label: 'Motor Claims' },
    { name: 'motor_onboarding', label: 'Client Onboarding (Motor)' },
    { name: 'motor_insurance', label: 'Motor Insurance' },
    { name: 'travel_insurance', label: 'Travel Insurance' },
    { name: 'domestic_proposal', label: 'Domestic Proposal' },
    { name: 'hospital_cashback', label: 'Hospital Cash Back' },
    { name: 'kyc_individual', label: 'KYC Individual' },
    { name: 'kyc_corporate', label: 'KYC Corporate' },
  ];

  const database = await getDb();
  const stats = await Promise.all(tables.map(table => {
    return new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status != 'pending' THEN 1 ELSE 0 END) as reviewed
        FROM ${table.name}
      `, (err, row) => {
        if (err) return reject(err);
        resolve({
          table: table.name,
          label: table.label,
          total: row.total || 0,
          pending: row.pending || 0,
          reviewed: row.reviewed || 0
        });
      });
    });
  }));

  const totalAll = stats.reduce((sum, s) => sum + s.total, 0);
  const pendingAll = stats.reduce((sum, s) => sum + s.pending, 0);

  return { totalAll, pendingAll, forms: stats };
}

async function verifyStaffLogin(username, password) {
  const database = await getDb();
  return new Promise((resolve, reject) => {
    database.get('SELECT * FROM staff_users WHERE username = ? AND password = ?', [username, password], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

module.exports = { getDb, saveSubmission, getSubmissions, updateStatus, getAllSubmissions, getStats, verifyStaffLogin };
