import initSqlJs from "sql.js";
import localforage from "localforage";

const STORAGE_KEY = "attendance_db_v1";
let SQL = null;
let db = null;

async function initDB() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => `/sql-wasm.wasm`,
    });
  }

  const saved = await localforage.getItem(STORAGE_KEY);
  try {
    if (saved) {
      const u8 = new Uint8Array(saved);
      db = new SQL.Database(u8);
    } else {
      db = new SQL.Database();
      createTables();
      await persist();
    }
  } catch (err) {
    console.error("DB init error", err);
    db = new SQL.Database();
    createTables();
  }

  return db;
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roll TEXT,
      class TEXT,
      meta TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS change_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      op_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

async function persist() {
  ensureDB();
  const data = db.export();
  await localforage.setItem(STORAGE_KEY, data);
}

function ensureDB() {
  if (!db) throw new Error("Database not initialized! Call initDB() first.");
}

function run(sql, params = []) {
  ensureDB();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const res = [];
  while (stmt.step()) res.push(stmt.getAsObject());
  stmt.free();
  return res;
}

/* -------------------- STUDENT CRUD -------------------- */
export async function addStudent({ name, roll, className, meta = "" }) {
  ensureDB();
  db.run(`INSERT INTO students (name, roll, class, meta) VALUES (?,?,?,?)`, [
    name,
    roll,
    className,
    meta,
  ]);
  db.run(`INSERT INTO change_queue (op_type, payload) VALUES (?,?)`, [
    "student_create",
    JSON.stringify({ name, roll, className, meta }),
  ]);
  await persist();
}

export async function updateStudent({ id, name, roll, className }) {
  ensureDB();
  db.run(`UPDATE students SET name=?, roll=?, class=? WHERE id=?`, [
    name,
    roll,
    className,
    id,
  ]);
  db.run(`INSERT INTO change_queue (op_type, payload) VALUES (?,?)`, [
    "student_update",
    JSON.stringify({ id, name, roll, className }),
  ]);
  await persist();
}

export async function deleteStudent(id) {
  ensureDB();
  db.run(`DELETE FROM students WHERE id=?`, [id]);
  db.run(`INSERT INTO change_queue (op_type, payload) VALUES (?,?)`, [
    "student_delete",
    JSON.stringify({ id }),
  ]);
  await persist();
}

export function getStudents() {
  try {
    return run("SELECT * FROM students ORDER BY name");
  } catch (err) {
    console.error(err);
    return [];
  }
}

/* -------------------- ATTENDANCE -------------------- */
export async function markAttendance({ studentId, date, status }) {
  ensureDB();

  const existing = run(
    `SELECT * FROM attendance WHERE student_id=? AND date=?`,
    [studentId, date]
  );

  if (existing.length) {
    db.run(`UPDATE attendance SET status=? WHERE id=?`, [
      status,
      existing[0].id,
    ]);
  } else {
    db.run(
      `INSERT INTO attendance (student_id, date, status) VALUES (?,?,?)`,
      [studentId, date, status]
    );
  }

  await persist();
}

export async function updateAttendance(recordId, status) {
  ensureDB();
  db.run(`UPDATE attendance SET status=? WHERE id=?`, [status, recordId]);
  db.run(`INSERT INTO change_queue (op_type, payload) VALUES (?,?)`, [
    "attendance_update",
    JSON.stringify({ id: recordId, status }),
  ]);
  await persist();
}

export async function deleteAttendance(recordId) {
  ensureDB();
  db.run(`DELETE FROM attendance WHERE id=?`, [recordId]);
  db.run(`INSERT INTO change_queue (op_type, payload) VALUES (?,?)`, [
    "attendance_delete",
    JSON.stringify({ id: recordId }),
  ]);
  await persist();
}

export function getAttendanceByDate(date) {
  try {
    return run(
      `SELECT a.*, s.name, s.roll FROM attendance a JOIN students s ON s.id = a.student_id WHERE a.date = ? ORDER BY s.name`,
      [date]
    );
  } catch (err) {
    console.error(err);
    return [];
  }
}

/* Added For Reports */
export function getAttendanceByDateRange(startDate, endDate) {
  try {
    return run(
      `SELECT a.*, s.name, s.roll FROM attendance a
       JOIN students s ON s.id = a.student_id
       WHERE a.date >= ? AND a.date <= ?
       ORDER BY a.date, s.name`,
      [startDate, endDate]
    );
  } catch (err) {
    console.error(err);
    return [];
  }
}

/* -------------------- CHANGE QUEUE -------------------- */
export function getChangeQueue() {
  try {
    return run("SELECT * FROM change_queue ORDER BY created_at");
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function clearChangeQueue(ids = []) {
  ensureDB();
  if (!ids.length) {
    db.run("DELETE FROM change_queue");
  } else {
    const placeholders = ids.map(() => "?").join(",");
    db.run(`DELETE FROM change_queue WHERE id IN (${placeholders})`, ids);
  }
  await persist();
}

/* -------------------- DB EXPORT/IMPORT -------------------- */
export async function exportDatabase() {
  ensureDB();
  return db.export();
}

export async function importDatabase(uint8arr) {
  SQL && (db = new SQL.Database(uint8arr));
  await persist();
}

/* -------------------- RESET DATABASE -------------------- */
export async function resetDatabase() {
  try {
    db && db.close();
    db = null;
    await localforage.removeItem(STORAGE_KEY);
    console.log("Database reset successfully!");
  } catch (err) {
    console.error("Failed to reset database", err);
  }
}

export default {
  initDB,
  addStudent,
  updateStudent,
  deleteStudent,
  getStudents,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByDate,
  getAttendanceByDateRange,
  getChangeQueue,
  clearChangeQueue,
  exportDatabase,
  importDatabase,
  resetDatabase,
};