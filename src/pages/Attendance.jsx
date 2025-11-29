import React, { useEffect, useState } from "react";
import db from "../lib/db";
import { motion } from "framer-motion";

export default function Attendance() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);

  async function load() {
    await db.initDB(); // ensure DB is ready
    setStudents(db.getStudents());
    setRecords(db.getAttendanceByDate(date));
  }

  useEffect(() => {
    load();
  }, [date]);

  async function mark(studentId, status) {
    await db.markAttendance({ studentId, date, status });
    setRecords(db.getAttendanceByDate(date));
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 space-y-6 transition-colors">
      <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-semibold">Attendance</h2>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-slate-800 
                     text-slate-900 dark:text-slate-100 border-gray-300 dark:border-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ------------------------------------------
          LEFT: STUDENT LIST WITH PRESENT/ABSENT BUTTONS
        -------------------------------------------*/}
        <motion.div
          layout
          className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md"
        >
          <h3 className="font-medium mb-2">All Students</h3>

          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {students.map((s) => {
              const record = records.find((r) => r.student_id === s.id);
              const status = record?.status || null;

              return (
                <motion.li
                  key={s.id}
                  className="p-2 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700 transition rounded"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{s.roll}</div>
                  </div>

                  <div className="flex gap-2">

                    {/* PRESENT */}
                    <button
                      onClick={() => mark(s.id, "present")}
                      disabled={status === "present"}
                      className={`px-3 py-1 rounded text-white transition ${
                        status === "present"
                          ? "bg-emerald-500 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-500"
                      }`}
                    >
                      Present
                    </button>

                    {/* ABSENT */}
                    <button
                      onClick={() => mark(s.id, "absent")}
                      disabled={status === "absent"}
                      className={`px-3 py-1 rounded text-white transition ${
                        status === "absent"
                          ? "bg-red-500 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-500"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        {/* ------------------------------------------
          RIGHT: ATTENDANCE RECORDS
        -------------------------------------------*/}
        <motion.div
          layout
          className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md"
        >
          <h3 className="font-medium mb-2">Attendance Records ({date})</h3>

          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {records.length > 0 ? (
              records.map((r) => (
                <motion.li
                  key={r.id}
                  className="p-2 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700 transition rounded"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div
                      className={`text-sm font-semibold ${
                        r.status === "present"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {r.status}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Edit */}
                    <button
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                      onClick={async () => {
                        const newStatus = prompt("Enter: present / absent", r.status);
                        if (newStatus === "present" || newStatus === "absent") {
                          await db.updateAttendance(r.id, newStatus);
                          setRecords(db.getAttendanceByDate(date));
                        }
                      }}
                    >
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      onClick={async () => {
                        if (window.confirm("Delete this attendance record?")) {
                          await db.deleteAttendance(r.id);
                          setRecords(db.getAttendanceByDate(date));
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </motion.li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No records for this date.</li>
            )}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}