"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
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

const ScheduleTable = ({ 
  isRTL, days, timeSlots, getAssignment, onAddClick, onDeleteClick, 
  subjects, employees, classes, viewMode, isPrint = false, summaryData = [], totalHours = 0, isTransposed = false
}: ScheduleTableProps) => {
  
  // جدول ملخص الساعات (المادة / الزمن)
  const SummaryTable = () => (
    <div className={cn("shrink-0", isPrint ? "w-[130px]" : "w-[180px] h-fit")}>
      <table className={cn(
        "w-full border-collapse table-fixed border-2 border-black",
        !isPrint && "rounded-xl overflow-hidden shadow-sm"
      )}>
        <thead>
          <tr className="bg-slate-50">
            <th className="p-2 font-black text-center border border-black text-[10px] w-[70%]">{isRTL ? "المادة" : "Subject"}</th>
            <th className="p-2 font-black text-center border border-black text-[10px] w-[30%]">{isRTL ? "الزمن" : "Time"}</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((item, idx) => (
            <tr key={idx} className="h-8">
              <td className="p-1 border border-black text-right px-2">
                <span className="font-bold text-[9px] block truncate">{item.subject}</span>
              </td>
              <td className="p-1 border border-black text-center font-black text-[10px]">{item.count}</td>
            </tr>
          ))}
          <tr className="bg-slate-50 font-black h-8">
            <td className="p-1 border border-black text-center text-[10px]">{isRTL ? "المجموع" : "Total"}</td>
            <td className="p-1 border border-black text-center text-[11px]">{totalHours}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const LessonCard = ({ assignment }: { assignment: any }) => {
    const sub = subjects.find(s => s.id === assignment.subjectId);
    const emp = employees.find(e => e.id === assignment.employeeId);
    const cls = classes.find(c => c.id === assignment.classId);

    return (
      <div className={cn(
        "h-full w-full flex flex-col justify-center items-center text-center relative group/card",
        isPrint ? "text-black" : "text-white bg-emerald-600 shadow-sm rounded-xl p-2"
      )}>
        <p className={cn("font-black leading-tight", isPrint ? "text-[10px] mb-0.5" : "text-[11px] mb-1")}>
          {sub?.name || "---"}
        </p>
        <p className={cn("font-medium leading-none", isPrint ? "text-[8px] opacity-80" : "text-[9px] opacity-90")}>
          {viewMode === "class" ? (emp ? `${emp.lastName} ${emp.firstName}` : "---") : (cls?.name || "---")}
        </p>
        {!isPrint && (
          <button 
            className="absolute -top-1 -right-1 opacity-0 group-hover/card:opacity-100 bg-white text-red-500 p-1 rounded-full shadow-lg"
            onClick={(e) => { e.stopPropagation(); onDeleteClick(assignment.id); }}
          >
            <Trash2 size={10} />
          </button>
        )}
      </div>
    );
  };

  const tableClasses = cn(
    "w-full border-collapse table-fixed",
    isPrint ? "border-2 border-black" : ""
  );

  return (
    <div className={cn(
      "flex items-start gap-4",
      isRTL ? "flex-row" : "flex-row-reverse"
    )}>
      {/* الجدول الرئيسي */}
      <div className="flex-1 overflow-x-auto">
        <table className={tableClasses}>
          <thead>
            <tr className={isPrint ? "h-10 bg-slate-50" : "h-14 bg-emerald-950 text-white"}>
              <th className="border border-black font-black text-center p-1 text-[11px] w-[60px]">{isRTL ? "اليوم" : "Day"}</th>
              {timeSlots.map(slot => (
                <th key={slot.id} className="border border-black font-black text-center p-1">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] leading-tight">{slot.label}</span>
                    <span className="text-[7px] font-bold opacity-60 mt-0.5">{slot.time}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day.id} className={isPrint ? "h-16" : "h-20"}>
                <td className="border border-black p-1 bg-slate-50 text-center font-black text-[11px]">
                  {isRTL ? day.name : day.en}
                </td>
                {timeSlots.map(slot => {
                  const assignment = getAssignment(day.id, slot.id);
                  return (
                    <td key={slot.id} className={cn("relative border border-black", !isPrint && "p-1")}>
                      {assignment ? <LessonCard assignment={assignment} /> : (
                        !isPrint && (
                          <div className="h-full w-full rounded-xl border border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:bg-emerald-50/50" onClick={() => onAddClick(day.id, slot.id)}>
                            <Plus size={14} className="text-slate-200" />
                          </div>
                        )
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* جدول الملخص الجانبي */}
      <SummaryTable />
    </div>
  );
};

export default ScheduleTable;