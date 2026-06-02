"use client";

import React from "react";
import { 
  Search, 
  BookOpen, 
  User, 
  GraduationCap, 
  Building2, 
  Clock, 
  Edit2, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonTableProps {
  lessons: any[];
  isRTL: boolean;
  isAdmin: boolean;
  getSubjectName: (id: string) => string;
  getTeacherName: (id: string) => string;
  getClassName: (id: string) => string;
  getDayName: (id: number) => string;
  onEdit: (lesson: any) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
}

const LessonTable = ({
  lessons, isRTL, isAdmin, getSubjectName, getTeacherName,
  getClassName, getDayName, onEdit, onDelete, onReset
}: LessonTableProps) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-[#f9f9f1]">
              <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100">
                {isRTL ? "المادة" : "Subject"}
              </th>
              <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100">
                {isRTL ? "الأستاذ" : "Teacher"}
              </th>
              <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100">
                {isRTL ? "الفوج" : "Class"}
              </th>
              <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100">
                {isRTL ? "اسم القاعدة" : "Base Name"}
              </th>
              <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100">
                {isRTL ? "التوقيت" : "Timing"}
              </th>
              {isAdmin && (
                <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 text-center">
                  {isRTL ? "إجراءات" : "Actions"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {lessons.map((asgn) => (
              <tr key={asgn.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                <td className="p-5">
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-bold text-emerald-900">{getSubjectName(asgn.subjectId)}</span>
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                      <BookOpen size={14} />
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-gray-700 font-medium">{getTeacherName(asgn.employeeId)}</span>
                    <User size={14} className="text-gray-400" />
                  </div>
                </td>
                <td className="p-5">
                  <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter inline-flex items-center gap-1.5">
                    <GraduationCap size={12} />
                    {getClassName(asgn.classId)}
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex items-center justify-end gap-1.5 text-gray-600 text-xs font-bold">
                    {asgn.department || "---"}
                    <Building2 size={12} className="text-emerald-500" />
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-900">{getDayName(asgn.day)}</span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                      <Clock size={10} />
                      {isRTL ? "الحصة" : "Period"} {asgn.period}
                    </div>
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-5 text-center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEdit(asgn)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDelete(asgn.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-24 bg-gray-50/50">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-300" />
          </div>
          <p className="text-gray-400 font-bold">{isRTL ? "لا توجد حصص مطابقة لخيارات التصفية" : "No lessons match your filter criteria"}</p>
          <Button variant="link" onClick={onReset} className="text-emerald-600 font-bold mt-2">
            {isRTL ? "إظهار كافة الحصص" : "Show all lessons"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LessonTable;