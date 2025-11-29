import React, { useState, useEffect } from "react";
import db from "../lib/db";

export default function StudentForm({ onSaved, editStudent }) {
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [className, setClassName] = useState("");

  useEffect(() => {
    if (editStudent) {
      setName(editStudent.name);
      setRoll(editStudent.roll);
      setClassName(editStudent.class);
    }
  }, [editStudent]);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    if (editStudent) {
      await db.updateStudent({ id: editStudent.id, name, roll, className });
    } else {
      await db.addStudent({ name, roll, className });
    }
    setName("");
    setRoll("");
    setClassName("");
    onSaved?.();
  }

  return (
    <form
      onSubmit={submit}
      className="card space-y-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
    >
      <h3 className="text-lg font-semibold">
        {editStudent ? "Edit Student" : "Add Student"}
      </h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
      />
      <input
        value={roll}
        onChange={(e) => setRoll(e.target.value)}
        placeholder="Roll"
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
      />
      <input
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        placeholder="Class"
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
      />
      <button className="w-full py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition">
        {editStudent ? "Update" : "Save"}
      </button>
    </form>
  );
}