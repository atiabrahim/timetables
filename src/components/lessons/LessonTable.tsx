"use client";

import React from "react";
import { 
  BookOpen, 
  User, 
  GraduationCap, 
  Building2, 
  Clock, 
  Edit2, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-slate-50">
              <th className={cn("p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200", isRTL ? "text-right" : "text-left")}>
                {isRTL ? "المادة" : "Subject"}
              </th>
              <th className={cn("p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200", isRTL ? "text-right" : "text-left")}>
                {isRTL ? "الأستاذ" : "Teacher"}
              </th>
              <th className="p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200 text-center">
                {isRTL ? "الفوج" : "Class"}
              </th>
              <th className={cn("p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200", isRTL ? "text-right" : "text-left")}>
                {isRTL ? "القاعة" : "Room"}
              </th>
              <th className={cn("p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200", isRTL ? "text-right" : "text-left")}>
                {isRTL ? "التوقيت" : "Timing"}
              </th>
              {isAdmin && (
                <th className="p-1.5 text-slate-700 font-black text-[10px] uppercase border border-slate-200 text-center">
                  {isRTL ? "إجراءات" : "Actions"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {lessons.map((asgn) => (
              <tr key={asgn.id} className="hover:bg-emerald-50/30 transition-colors group">
                {/* عمود المادة */}
                <td className="p-0.5 border border-slate-100">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <span className="font-bold text-emerald-900 text-xs">{getSubjectName(asgn.subjectId)}</span>
                    <BookOpen size={12} className="text-emerald-500 shrink-0" />
                  </div>
                </td>
                {/* عمود الأستاذ */}
                <td className="p-0.5 border border-slate-100">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <span className="text-slate-700 font-medium text-xs">{getTeacherName(asgn.employeeId)}</span>
                    <User size={12} className="text-slate-400 shrink-0" />
                  </div>
                </td>
                {/* عمود الفوج - يبقى في المنتصف */}
                <td className="p-0.5 border border-slate-100 text-center">
                  <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black">
                    <GraduationCap size={10} />
                    {getClassName(asgn.classId)}
                  </div>
                </td>
                {/* عمود القاعة */}
                <td className="p-0.5 border border-slate-100">
                  <div className={cn("flex items-center gap-1 px-2 text-slate-600 text-[10px] font-bold", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    {asgn.room || "---"}
                    <Building2 size={10} className="text-slate-400 shrink-0" />
                  </div>
                </td>
                {/* عمود التوقيت */}
                <td className="p-0.5 border border-slate-100">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold shrink-0">
                      <Clock size={10} />
                      {isRTL ? "ح" : "P"}{asgn.period}
                    </div>
                    <span className="text-[10px] font-black text-slate-900 truncate">{getDayName(asgn.day)}</span>
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-0.5 border border-slate-100 text-center">
                    <div className="flex justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-emerald-600 hover:bg-emerald-50 rounded-md"
                        onClick={() => onEdit(asgn)}
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-red-400 hover:bg-red-50 rounded-md"
                        onClick={() => onDelete(asgn.id)}
                      >
                        <Trash2 size={12} />
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
        <div className="text-center py-12 bg-slate-50/50">
          <p className="text-slate-400 font-bold text-sm">{isRTL ? "لا توجد حصص مطابقة" : "No lessons match"}</p>
          <Button variant="link" onClick={onReset} className="text-emerald-600 font-bold mt-1 h-auto p-0 text-xs">
            {isRTL ? "إظهار كافة الحصص" : "Show all lessons"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LessonTable;