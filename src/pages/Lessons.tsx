"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Download, 
  Trash2, 
  ArrowUpDown,
  BookOpen,
  User,
  GraduationCap,
  MapPin,
  Clock
} from "lucide-react";
import { showSuccess } from "../utils/toast";

const DAYS = [
  { id: 0, name: "الأحد", en: "Sunday" },
  { id: 1, name: "الاثنين", en: "Monday" },
  { id: 2, name: "الثلاثاء", en: "Tuesday" },
  { id: 3, name: "الأربعاء", en: "Wednesday" },
  { id: 4, name: "الخميس", en: "Thursday" },
];

const Lessons = () => {
  const { 
    assignments, setAssignments, 
    subjects, employees, classes, 
    isRTL, user 
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState("");
  const isAdmin = user?.role === "Admin";

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || "---";
  const getTeacherName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.lastName} ${emp.firstName}` : "---";
  };
  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || "---";
  const getDayName = (id: number) => DAYS.find(d => d.id === id)?.[isRTL ? 'name' : 'en'] || "---";

  const filteredLessons = assignments.filter(asgn => {
    const searchStr = `${getSubjectName(asgn.subjectId)} ${getTeacherName(asgn.employeeId)} ${getClassName(asgn.classId)} ${asgn.room}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const handleDelete = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
    showSuccess(isRTL ? "تم حذف الحصة بنجاح" : "Lesson deleted successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto order-2 md:order-1">
          <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700">
            <Download size={18} />
            {isRTL ? "تصدير PDF" : "Export PDF"}
          </Button>
          <div className="relative flex-1 md:w-80">
            <Input 
              placeholder={isRTL ? "بحث في الحصص..." : "Search lessons..."} 
              className="rounded-xl border-gray-200 bg-white h-11 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="text-right order-1 md:order-2 w-full md:w-auto">
          <h2 className="text-3xl font-black text-gray-900">
            {isRTL ? "قائمة الحصص" : "Lessons List"} 
            <span className="text-gray-400 text-xl mr-2">({assignments.length})</span>
          </h2>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-[#f9f9f1]">
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100">
                {isRTL ? "المادة" : "Subject"}
              </th>
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100">
                {isRTL ? "الأستاذ" : "Teacher"}
              </th>
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100">
                {isRTL ? "الفوج" : "Class"}
              </th>
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100">
                {isRTL ? "التوقيت" : "Timing"}
              </th>
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100">
                {isRTL ? "القاعة" : "Room"}
              </th>
              {isAdmin && (
                <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100 text-center">
                  {isRTL ? "إجراءات" : "Actions"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredLessons.map((asgn) => (
              <tr key={asgn.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-bold text-emerald-900">{getSubjectName(asgn.subjectId)}</span>
                    <BookOpen size={14} className="text-emerald-500" />
                  </div>
                </td>
                <td className="p-4 text-gray-700 font-medium">{getTeacherName(asgn.employeeId)}</td>
                <td className="p-4">
                  <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold inline-block">
                    {getClassName(asgn.classId)}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col items-end text-[10px] font-bold text-gray-500">
                    <span className="text-gray-900">{getDayName(asgn.day)}</span>
                    <span>{isRTL ? "الحصة" : "Period"} {asgn.period}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1 text-gray-600 text-xs">
                    {asgn.room || "---"}
                    <MapPin size={12} />
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-4 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDelete(asgn.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLessons.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold">{isRTL ? "لا توجد حصص مسجلة" : "No lessons found"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;