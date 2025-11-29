import React from "react";
import { UsersIcon, CheckCircleIcon, CalendarIcon } from "@heroicons/react/24/outline";

// Card configuration for type → icon & colors
const cardConfig = {
  students: { icon: UsersIcon, bg: "bg-blue-50 dark:bg-blue-900", iconColor: "text-blue-500 dark:text-blue-300" },
  attendance: { icon: CalendarIcon, bg: "bg-yellow-50 dark:bg-yellow-900", iconColor: "text-yellow-500 dark:text-yellow-300" },
  present: { icon: CheckCircleIcon, bg: "bg-emerald-50 dark:bg-emerald-900", iconColor: "text-emerald-500 dark:text-emerald-300" },
  reports: { bg: "bg-purple-50 dark:bg-purple-900", iconColor: "text-purple-500 dark:text-purple-300" }, // placeholder, icon can come from prop
};

export default function Card({ label, value, type = "students", onClick, icon: CustomIcon, className = "" }) {
  const { icon: DefaultIcon, bg, iconColor } = cardConfig[type] || cardConfig.students;
  const Icon = CustomIcon || DefaultIcon;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer hover:shadow-lg transition ${bg} ${className}`}
    >
      {Icon && (
        <div className="p-3 rounded-full flex items-center justify-center">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-gray-500 dark:text-gray-400 text-sm">{label}</span>
        <span className="text-xl font-bold">{value}</span>
      </div>
    </div>
  );
}