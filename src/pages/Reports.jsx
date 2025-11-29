import React, { useState, useRef } from "react";
import db from "../lib/db";
import * as XLSX from "xlsx"; // fixed typo
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";

export default function Reports() {
  const [period, setPeriod] = useState("monthly");
  const reportRef = useRef(null);

  const generateData = () => {
    const students = db.getStudents();
    const today = new Date();
    let startDate;

    if (period === "monthly") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (period === "weekly") {
      const day = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - day);
    } else if (period === "yearly") {
      startDate = new Date(today.getFullYear(), 0, 1);
    }

    const allAttendance = [];
    students.forEach((s) => {
      const studentRecords = db
        .getAttendanceByDateRange(
          startDate.toISOString().slice(0, 10),
          today.toISOString().slice(0, 10)
        )
        .filter((r) => r.student_id === s.id);

      studentRecords.forEach((r) => {
        allAttendance.push({
          Name: s.name,
          Roll: s.roll,
          Class: s.class,
          Date: r.date,
          Status: r.status,
        });
      });
    });

    return allAttendance;
  };

  const downloadCSV = () => {
    const data = generateData();
    if (!data.length) return alert("No attendance records found.");

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((r) => Object.values(r).join(","));
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `attendance_${period}.csv`);
  };

  const downloadExcel = () => {
    const data = generateData();
    if (!data.length) return alert("No attendance records found.");

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    XLSX.writeFile(wb, `attendance_${period}.xlsx`);
  };

  const downloadJPG = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, `attendance_${period}.jpg`);
    });
  };

  const downloadPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5], // top, left, bottom, right in inches
      filename: `attendance_${period}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const data = generateData();

  const totalStudents = new Set(data.map((d) => d.Roll)).size;
  const totalPresent = data.filter((d) => d.Status === "present").length;
  const totalAbsent = data.filter((d) => d.Status === "absent").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 space-y-6 transition-colors">
      <h2 className="text-2xl font-semibold mb-4">Generate Attendance Report</h2>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-gray-300 dark:border-gray-600"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Download CSV
        </button>

        <button
          onClick={downloadExcel}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Download Excel
        </button>

        <button
          onClick={downloadJPG}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Download JPG
        </button>

        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          Download PDF
        </button>
      </div>

      {/* Print-Friendly Report */}
      <div
        ref={reportRef}
        className="p-6 bg-white dark:bg-slate-800 shadow-md rounded w-full print:p-4 print:shadow-none print:rounded-none"
        style={{ minWidth: "600px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:flex-col print:items-start">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white print:text-black">
              Attendance Report
            </h3>
            <p className="text-gray-600 dark:text-gray-300 print:text-black">
              Period: {period}
            </p>
            <p className="text-gray-600 dark:text-gray-300 print:text-black">
              Generated: {new Date().toLocaleDateString()}
            </p>
          </div>
          <img
            src="/src/assets/hulul_logo.svg"
            alt="Logo"
            className="h-16 w-16 object-contain print:h-12 print:w-12 mt-2 print:mt-0"
          />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 print:grid-cols-3">
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-3 rounded text-center font-semibold print:bg-gray-200 print:text-black">
            Total Students <br /> {totalStudents}
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-3 rounded text-center font-semibold print:bg-gray-200 print:text-black">
            Present <br /> {totalPresent}
          </div>
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded text-center font-semibold print:bg-gray-200 print:text-black">
            Absent <br /> {totalAbsent}
          </div>
        </div>

        {/* Attendance Table */}
        <table className="w-full border-collapse text-sm print:text-black">
          <thead>
            <tr className="bg-gray-200 dark:bg-slate-700 print:bg-gray-300">
              {["Name", "Roll", "Class", "Date", "Status"].map((h) => (
                <th
                  key={h}
                  className="border px-2 py-1 text-left text-slate-900 dark:text-white print:text-black"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((r, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-50 dark:hover:bg-slate-700 print:border-b"
                >
                  <td className="px-2 py-1">{r.Name}</td>
                  <td className="px-2 py-1">{r.Roll}</td>
                  <td className="px-2 py-1">{r.Class}</td>
                  <td className="px-2 py-1">{r.Date}</td>
                  <td
                    className={`px-2 py-1 font-semibold ${
                      r.Status === "present"
                        ? "text-green-700 dark:text-green-300 print:text-black"
                        : "text-red-700 dark:text-red-300 print:text-black"
                    }`}
                  >
                    {r.Status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500 dark:text-gray-400 print:text-black">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}