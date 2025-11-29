import React, { useEffect, useState } from "react";
import db from "../lib/db";
import StudentForm from "../components/StudentForm";
import { motion } from "framer-motion";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [editStudent, setEditStudent] = useState(null);

  async function load() {
    setStudents(db.getStudents());
    setEditStudent(null);
  }

  async function removeStudent(id) {
    if (confirm("Are you sure you want to delete this student?")) {
      await db.deleteStudent(id);
      load();
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Students</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div layout whileHover={{ scale: 1.02 }} className="bg-white p-4 rounded-lg shadow-md">
          <StudentForm onSaved={load} editStudent={editStudent} />
        </motion.div>

        <motion.div layout whileHover={{ scale: 1.02 }} className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-medium mb-2">All Students</h3>
          <ul className="space-y-2">
            {students.map((s) => (
              <motion.li
                key={s.id}
                className="p-2 border rounded flex justify-between items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-slate-500">
                    Roll: {s.roll || "-"} | Class: {s.class || "-"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditStudent(s)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-400 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeStudent(s.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition"
                  >
                    Delete
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}