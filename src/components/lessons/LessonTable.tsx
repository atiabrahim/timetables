"use client";

import React, { useState } from "react";
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
import ResizableHeader from "../shared/ResizableHeader";

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
  // تتبع عرض الأعمدة
  const [widths, setWidths] = useState({
    subject: 180,
    teacher: 180,
    class: 100,
    room: 100,
    time: 140,
    actions: 100
  });

  const updateWidth = (column: keyof typeof widths, newWidth: number) => {
    setWidths(prev => ({ ...prev, [column]: newWidth }));
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse table-fixed", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-slate-50">
              <ResizableHeader 
                width={widths.subject} 
                onResize={(w) => updateWidth("subject", w)} 
                isRTL={isRTL}
                className="p-1.5 text-slate-700 font-bold text-[10px] uppercase border border-slate-200"
              >
                {isRTL ? "المادة" : "Subject"}
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.teacher} 
                onResize={(w) => updateWidth("teacher", w)} 
                isRTL={isRTL}
                className="p-1.5 text-slate-700 font-bold text-[10px] uppercase border border-slate-200"
              >
                {isRTL ? "الأستاذ" : "Teacher"}
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.class} 
                onResize={(w) => updateWidth("class", w)} 
                isRTL={isRTL}
                className="p-1.5 text-slate-700 font-bold text-[10px] uppercase border border-slate-200 text-center"
              >
                {isRTL ? "الفوج" : "Class"}
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.room} 
                onResize={(w) => updateWidth("room", w)} 
                isRTL={isRTL}
                className="p-1.5 text-slate-700 font-bold text-[10px] uppercase border border-slate-200"
              >
                {isRTL ? "القاعة" : "Room"}
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.time} 
                onResize={(w) => updateWidth("time", w)} 
                isRTL={isRTL}
                className="p-1.5 text-slate-700 font-bold text-[10px] uppercase border border-slate-200"
              >
                {isRTL ? "التوقيت" : "Timing"}
              </ResizableHeader>
              
              {isAdmin && (
                <ResizableHeader 
                  width={widths.actions} 
                  onResize={(w) => updateWidth("actions", w)} 
                  isRTL={isRTL}
                  className="p-1.5 text-slate-700 font-bold text-[10px] uppercase border border-slate-200 text-center"
                >
                  {isRTL ? "إجراءات" : "Actions"}
                </ResizableHeader>
              )}
            </tr>
          </thead>
          <tbody>
            {lessons.map((asgn) => (
              <tr key={asgn.id} className="hover:bg-emerald-50/30 transition-colors group">
                <td className="p-0.5 border border-slate-100 overflow-hidden">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <span className="font-bold text-emerald-900 text-xs truncate">{getSubjectName(asgn.subjectId)}</span>
                    <BookOpen size={12} className="text-emerald-500 shrink-0" />
                  </div>
                </td>
                <td className="p-0.5 border border-slate-100 overflow-hidden">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <span className="text-slate-700 font-medium text-xs truncate">{getTeacherName(asgn.employeeId)}</span>
                    <User size={12} className="text-slate-400 shrink-0" />
                  </div>
                </td>
                <td className="p-0.5 border border-slate-100 text-center overflow-hidden">
                  <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black truncate max-w-full">
                    <GraduationCap size={10} className="shrink-0" />
                    <span className="truncate">{getClassName(asgn.classId)}</span>
                  </div>
                </td>
                <td className="p-0.5 border border-slate-100 overflow-hidden">
                  <div className={cn("flex items-center gap-1 px-2 text-slate-600 text-[10px] font-bold", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <span className="truncate">{asgn.room || "---"}</span>
                    <Building2 size={10} className="text-slate-400 shrink-0" />
                  </div>
                </td>
                <td className="p-0.5 border border-slate-100 overflow-hidden">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold shrink-0">
                      <Clock size={10} />
                      {isRTL ? "ح" : "P"}{asgn.period}
                    </div>
                    <span className="text-[10px] font-black text-slate-900 truncate">{getDayName(asgn.day)}</span>
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-0.5 border border-slate-100 text-center overflow-hidden">
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
            
            {lessons.length > 0 && (
              <tr className="bg-emerald-50/50 border-t-2 border-emerald-200">
                <td colSpan={isAdmin ? 6 : 5} className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-black text-emerald-900">
                      {isRTL ? "المجموع الكلي:" : "Total:"}
                    </span>
                    <span className="text-lg font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                      {lessons.length} {isRTL ? "حصة" : "Lessons"}
                    </span>
                  </div>
                </td>
              </tr>
            )}
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