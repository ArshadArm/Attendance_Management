import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports"; // <-- new
import useSync from "./hooks/useSync";

export default function App() {
  const syncStatus = useSync({ pollInterval: 6000, apiBase: "/api" });

  const syncText =
    syncStatus === true
      ? "Synced"
      : syncStatus === false
      ? "Sync Failed"
      : "Syncing...";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white dark:bg-slate-800 shadow-md transition-colors">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-2xl font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Student Attendance Management
            </Link>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Sync: {syncText}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} /> {/* <-- new */}
        </Routes>
      </main>
    </div>
  );
}