"use client";

import React from "react";
import { Plus, Trash2, Coffee, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScheduleTableProps {
  isRTL: boolean;
  days: any[];
  timeSlots: any[];
  getAssignment: (day: number, period: string) => any;
  onAddClick: (day: number, period: string) => void;
  onDeleteClick: (id: string) => void;
  subjects: any[];
  employees: any[];
  classes: any[];
  viewMode: "class" | "teacher";
  isPrint?: boolean;
  summaryData?: any[];
  totalHours?: number;
  isTransposed?: boolean;
}

// قائمة ألوان زاهية للمواد
const SUBJECT_COLORS = [
  "bg-blue-600", "bg-emerald-500", "bg-rose-500", "bg-amber-500", 
  "bg-violet-600", "bg-cyan-500", "bg-orange-500", "bg-indigo-500",
  "bg-pink-500", "bg-teal-600"
];

const getSubjectColor = (index: number) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

const ScheduleTable = ({ 
  isRTL, days, timeSlots, getAssignment, onAddClick, onDeleteClick, 
  subjects, employees, classes, viewMode, isPrint = false, summaryData, totalHours, isTransposed = false 
}: ScheduleTableProps) => {
  
  const SummaryTable = () => (
    <div className={cn("shrink-0", isPrint ? "w-48" : "w-64")}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="p-3 text-[10px] font-black text-gray-400 uppercase text-right">{isRTL ? "المادة" : "Subject"}</th>
              <th className="p-3 text-[10px] font-black text-gray-400 uppercase text-center">{isRTL ? "المعلم" : "Teacher"}</th>
              <th className="p-3 text-[10px] font-black text-gray-400 uppercase text-center">{isRTL ? "عدد الحصص" : "Hrs"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {summaryData?.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", getSubjectColor(idx))}></div>
                    <span className="text-[11px] font-bold text-gray-700 truncate max-w-[100px]">{item.subject}</span>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <span className="text-[10px] font-medium text-gray-500">{viewMode === "class" ? item.teacher : item.branch}</span>
                </td>
                <td className="p-3 text-center">
                  <span className="text-xs font-black text-gray-900">{item.count}</span>
                </td>
              </tr>
            ))}
            <tr className="bg-emerald-50/30 font-black">
              <td colSpan={2} className="p-3 text-xs text-emerald-900">{isRTL ? "المجموع" : "Total"}</td>
              <td className="p-3 text-center text-emerald-600 text-sm">{totalHours}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // تصميم الخلية (البطاقة الملونة)
  const LessonCard = ({ assignment, dayId, slotId }: { assignment: any, dayId: number, slotId: string }) => {
    const subjectIndex = subjects.findIndex(s => s.id === assignment.subjectId);
    const colorClass = getSubjectColor(subjectIndex);

    return (
      <div className={cn(
        "h-full w-full rounded-xl p-2 flex flex-col justify-center items-center text-center text-white shadow-sm relative group/card transition-transform hover:scale-[1.02]",
        colorClass
      )}>
        <p className={cn("font-black leading-tight mb-1", isPrint ? "text-[9px]" : "text-[10px] md:text-[12px]")}>
          {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
        </p>
        <p className={cn("opacity-90 font-medium leading-none mb-1", isPrint ? "text-[7px]" : "text-[8px] md:text-[10px]")}>
          {viewMode === "class" 
            ? (() => {
                const e = employees.find(emp => emp.id === assignment.employeeId);
                return e ? `${e.lastName} ${e.firstName}` : "---";
              })()
            : classes.find(c => c.id === assignment.classId)?.name
          }
        </p>
        {assignment.room && (
          <div className="bg-white/20 px-2 py-0.5 rounded-md">
            <p className={cn("font-bold leading-none", isPrint ? "text-[7px]" : "text-[8px] md:text-[9px]")}>{assignment.room}</p>
          </div>
        )}
        {!isPrint && (
          <Button 
            variant="ghost" size="icon" 
            className="absolute -top-1 -right-1 h-6 w-6 bg-white text-red-500 rounded-full shadow-md opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-50"
            onClick={(e) => { e.stopPropagation(); onDeleteClick(assignment.id); }}
          >
            <Trash2 size={12} />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex gap-6 w-full", isRTL ? "flex-row" : "flex-row-reverse", isPrint ? "items-start" : "overflow-x-auto pb-4")}>
      <div className={cn("flex-1", isPrint ? "w-full" : "min-w-[800px]")}>
        <table className="w-full border-separate border-spacing-2">
          <thead>
            <tr>
              <th className={cn(
                "p-3 rounded-2xl bg-emerald-50 text-emerald-900 font-black text-xs",
                isPrint ? "w-16" : "w-24"
              )}>
                {isRTL ? "الحصة" : "Period"}
              </th>
              {days.map(day => (
                <th key={day.id} className="p-3 rounded-2xl bg-emerald-50 text-emerald-900 font-black text-xs text-center">
                  {isRTL ? day.name : day.en}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => {
              if (slot.isBreak) {
                return (
                  <tr key={slot.id}>
                    <td className="p-2 text-center">
                      <div className="flex flex-col items-center justify-center text-amber-600">
                        {slot.id === 'break-am' ? <Coffee size={18} /> : <Utensils size={18} />}
                        <span className="text-[10px] font-black mt-1">{slot.label}</span>
                      </div>
                    </td>
                    <td colSpan={days.length} className="p-2">
                      <div className="w-full h-10 bg-amber-50/50 rounded-2xl border border-dashed border-amber-200 flex items-center justify-center">
                        <span className="text-amber-700 font-bold text-xs tracking-widest uppercase">
                          {slot.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slot.id} className={isPrint ? "h-16" : "h-24"}>
                  <td className="p-2">
                    <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <span className="text-emerald-600 font-black text-xs">{isRTL ? "الحصة" : "Period"} {slot.label}</span>
                      <span className="text-[9px] font-bold text-gray-400 mt-1">{slot.time}</span>
                    </div>
                  </td>
                  {days.map(day => {
                    const assignment = getAssignment(day.id, slot.id);
                    return (
                      <td key={day.id} className="p-1 relative group">
                        {assignment ? (
                          <LessonCard assignment={assignment} dayId={day.id} slotId={slot.id} />
                        ) : (
                          !isPrint && (
                            <div 
                              className="h-full w-full rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/add"
                              onClick={() => onAddClick(day.id, slot.id)}
                            >
                              <Plus size={20} className="text-gray-200 group-hover/add:text-emerald-400 transition-colors" />
                            </div>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* الملخص الجانبي يظهر فقط في وضع الطباعة أو إذا كانت هناك بيانات */}
      {(isPrint || summaryData) && <SummaryTable />}
    </div>
  );
};

export default ScheduleTable;