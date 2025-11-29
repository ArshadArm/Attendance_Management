import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DocumentIcon } from "@heroicons/react/24/outline";
import db from "../lib/db";
import Card from "../components/Card";

export default function Dashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [todayRecords, setTodayRecords] = useState([]);
  const [recentChanges, setRecentChanges] = useState([]);
  const today = new Date().toISOString().slice(0, 10);

  async function load() {
    setStudents(db.getStudents());
    setTodayRecords(db.getAttendanceByDate(today));

    const changes = db
      .getChangeQueue()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);
    setRecentChanges(changes);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (path) => navigate(path);

  const addedStudents = recentChanges.filter(
    (c) => c.op_type === "student_create"
  ).length;
  const updatedStudents = recentChanges.filter(
    (c) => c.op_type === "student_update"
  ).length;
  const deletedStudents = recentChanges.filter(
    (c) => c.op_type === "student_delete"
  ).length;
  const attendanceMarked = todayRecords.filter(
    (r) => r.status === "present"
  ).length;

  const handleResetDB = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset the database? This will delete all data!"
      )
    ) {
      await db.resetDatabase();
      await db.initDB();
      setStudents([]);
      setTodayRecords([]);
      setRecentChanges([]);
      alert("Database has been reset successfully!");
    }
  };

  return (
    <div className="space-y-6 min-h-screen p-6 bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <motion.header
        className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Quick overview — {today}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          onClick={handleResetDB}
        >
          Reset Database
        </motion.button>
      </motion.header>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
          <Card
            label="Total Students"
            value={students.length}
            type="students"
            onClick={() => handleNavigate("/students")}
          />
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
          <Card
            label="Attendance Today"
            value={todayRecords.length}
            type="attendance"
            onClick={() => handleNavigate("/attendance")}
          />
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
          <Card
            label="Marked Present"
            value={attendanceMarked}
            type="present"
          />
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
          <Card
            label="Reports"
            value="View"
            type="reports"
            icon={DocumentIcon}
            onClick={() => handleNavigate("/reports")}
          />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.section
        className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
          Recent Activity
        </h2>
        <ul className="space-y-2 max-h-72 overflow-y-auto">
          {recentChanges.length > 0 ? (
            recentChanges.map((c) => {
              let description = "";
              const payload = JSON.parse(c.payload || "{}");

              switch (c.op_type) {
                case "student_create":
                  description = `Added student: ${payload.name}`;
                  break;
                case "student_update":
                  description = `Updated student: ${payload.name}`;
                  break;
                case "student_delete":
                  description = `Deleted student with ID: ${payload.id}`;
                  break;
                case "attendance_record":
                  description = `Marked ${payload.studentId} as ${payload.status}`;
                  break;
                default:
                  description = c.op_type;
              }

              return (
                <motion.li
                  key={c.id}
                  className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-gray-700 dark:text-gray-200">
                    {description}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(c.created_at).toLocaleTimeString()}
                  </div>
                </motion.li>
              );
            })
          ) : (
            <li className="text-gray-500 dark:text-gray-400 text-sm">
              No recent activity.
            </li>
          )}
        </ul>
      </motion.section>

      {/* Summary of Changes */}
      <motion.section
        className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
          Change Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card label="Added Students" value={addedStudents} type="students" />
          <Card
            label="Updated Students"
            value={updatedStudents}
            type="students"
          />
          <Card
            label="Deleted Students"
            value={deletedStudents}
            type="students"
          />
        </div>
      </motion.section>
    </div>
  );
}
