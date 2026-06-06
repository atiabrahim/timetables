"use client";

import React from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  allAssignments?: any[];
}

const SUBJECT_COLORS = [
  "bg-emerald-600", "bg-blue-600", "bg-amber-600", "bg-rose-600", 
  "bg-indigo-600", "bg-teal-600", "bg-violet-600", "bg-cyan-600",
  "bg-orange-600", "bg-slate-700"
];

const getSubjectColor = (index: number) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

const ScheduleTable = ({ 
  isRTL, days, timeSlots, getAssignment, onAddClick, onDeleteClick, 
  subjects, employees, classes, viewMode, isPrint = false, summaryData = [], totalHours = 0, isTransposed = false, allAssignments = []
}: ScheduleTableProps) => {

  const checkConflict = (day: number, period: string, assignment: any) => {
    if (isPrint || !allAssignments) return null;
    
    // تعارض الأستاذ: نفس الأستاذ في حصة أخرى بنفس الوقت
    const teacherConflict = allAssignments.find(a => 
      a.id !== assignment.id && a.day === day && a.period === period && a.employeeId === assignment.employeeId
    );
    
    // تعارض القاعة: نفس القاعة مستخدمة في حصة أخرى بنفس الوقت
    const roomConflict = assignment.room ? allAssignments.find(a => 
      a.id !== assignment.id && a.day === day && a.period === period && a.room === assignment.room
    ) : null;

    return teacherConflict || roomConflict ? { teacherConflict, roomConflict } : null;
  };
  
  const SummaryTable = () => (
    <div className={cn("shrink-0", isPrint ? "w-[120px]" : "w-[200px] h-fit")}>
      <div className={cn(
        "bg-white border-2",
        isPrint ? "border-emerald-950" : "rounded-2xl border-slate-200 shadow-lg"
      )}>
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className={cn(isPrint ? "bg-emerald-50 border-b-2 border-emerald-950" : "bg-emerald-950 text-white")}>
              <th className={cn(
                "p-1 font-black uppercase border-b w-[65%]", 
                isPrint ? "text-[8px] text-emerald-950 border-emerald-950" : "text-[11px] border-emerald-900",
                isRTL ? "text-right" : "text-left"
              )}>
                {isRTL ? "المادة" : "Subject"}
              </th>
              <th className={cn(
                "p-1 font-black uppercase text-center border-s-2 border-b w-[35%]", 
                isPrint ? "text-[8px] text-emerald-950 border-emerald-950" : "text-[11px] border-emerald-900"
              )}>
                {isRTL ? "الإجمالي" : "Total"}
              </th>
            </tr>
          </thead>
          <tbody className={cn(isPrint ? "divide-y divide-emerald-950" : "divide-y divide-slate-100")}>
            {summaryData.map((item, idx) => (
              <tr key={idx}>
                <td className={cn(
                  "p-1 leading-tight", 
                  isRTL ? "text-right" : "text-left"
                )}>
                  <span className={cn("font-bold block truncate", isPrint ? "text-[8px] text-black" : "text-[12px] text-slate-800")}>
                    {item.subject}
                  </span>
                </td>
                <td className="p-1 text-center border-s-2 border-emerald-900/10">
                  <span className={cn("font-black", isPrint ? "text-[8.5px] text-black" : "text-[13px] text-emerald-700")}>
                    {item.count}
                  </span>
                </td>
              </tr>
            ))}
            <tr className={cn("font-black", isPrint ? "bg-emerald-50 border-t-2 border-emerald-950" : "bg-emerald-50/50")}>
              <td className={cn(
                "p-1", 
                isPrint ? "text-[8.5px] text-emerald-950" : "text-[12px] text-emerald-900",
                isRTL ? "text-right" : "text-left"
              )}>
                {isRTL ? "الحجم الساعي" : "Weekly Total"}
              </td>
              <td className="p-1 text-center border-s-2 border-emerald-950">
                <span className={cn("font-black", isPrint ? "text-[9px]" : "text-[14px]")}>
                  {totalHours}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const LessonCard = ({ assignment, day, period }: { assignment: any, day: number, period: string }) => {
    const subjectIndex = subjects.findIndex(s => s.id === assignment.subjectId);
    const colorClass = getSubjectColor(subjectIndex);
    const conflict = checkConflict(day, period, assignment);

    return (
      <TooltipProvider>
        <div className={cn(
          "h-full w-full flex flex-col justify-center items-center text-center relative transition-all group/card",
          isPrint ? "p-0.5 text-black bg-white" : cn(
            "text-white shadow-sm rounded-xl p-2", 
            colorClass,
            "hover:scale-[1.02]",
            conflict && "ring-2 ring-red-500 ring-offset-2"
          )
        )}>
          <p className={cn("font-bold leading-tight truncate w-full mb-0.5", isPrint ? "text-[7px] opacity-70" : "text-[9px] opacity-80")}>
            {viewMode === "class" 
              ? (() => {
                  const e = employees.find(emp => emp.id === assignment.employeeId);
                  return e ? `${e.lastName} ${e.firstName}` : "---";
                })()
              : classes.find(c => c.id === assignment.classId)?.name
            }
          </p>
          <p className={cn("font-black leading-tight uppercase w-full", isPrint ? "text-[9px] mb-0.5" : "text-[12px] mb-1")}>
            {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
          </p>
          <p className={cn("font-bold leading-tight truncate w-full", isPrint ? "text-[7.5px] text-emerald-900" : "text-[10px] opacity-90")}>
            {assignment.room || "---"}
          </p>
          
          {!isPrint && (
            <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
              {conflict && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-red-500 text-white p-1 rounded-full shadow-lg">
                      <AlertTriangle size={10} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-900 text-white border-none rounded-xl p-3 shadow-2xl">
                    <p className="font-bold text-xs">
                      {isRTL ? "تنبيه تعارض:" : "Conflict Alert:"}
                    </p>
                    <ul className="text-[10px] mt-1 list-disc list-inside opacity-90">
                      {conflict.teacherConflict && (
                        <li>{isRTL ? "الأستاذ مشغول في فوج آخر" : "Teacher is busy elsewhere"}</li>
                      )}
                      {conflict.roomConflict && (
                        <li>{isRTL ? "القاعة محجوزة في فوج آخر" : "Room is occupied elsewhere"}</li>
                      )}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              )}
              <button 
                className="bg-white text-red-500 p-1 rounded-full shadow-lg hover:bg-red-50"
                onClick={(e) => { e.stopPropagation(); onDeleteClick(assignment.id); }}
              >
                <Trash2 size={10} />
              </button>
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  };

  const tableClasses = cn(
    "w-full border-collapse h-full table-fixed",
    isPrint ? "border-2 border-emerald-950" : ""
  );

  const BreakRow = ({ title }: { title: string }) => (
    <tr className={cn(isPrint ? "h-3" : "h-6", "bg-emerald-50/50")}>
      <td className={cn("border border-emerald-950 text-center font-black", isPrint ? "text-[7px]" : "text-[10px]")}>---</td>
      <td colSpan={days.length} className={cn("border border-emerald-950 text-center font-black uppercase tracking-widest", isPrint ? "text-[8px] p-0" : "text-[11px] text-emerald-800")}>
        {title}
      </td>
    </tr>
  );

  if (isTransposed) {
    return (
      <div className={cn(
        "flex items-stretch w-full gap-0", 
        isPrint ? "overflow-hidden" : "overflow-x-auto pb-2",
        isRTL ? "flex-row" : "flex-row-reverse"
      )}>
        <div className="flex-1 min-w-0">
          <table className={tableClasses}>
            <colgroup>
              <col className={isPrint ? "w-[45px]" : "w-[80px]"} />
              {timeSlots.map(slot => (
                <React.Fragment key={slot.id}>
                  <col className="w-auto" />
                  {(slot.id === "2" || slot.id === "4") && <col className="w-4" />}
                </React.Fragment>
              ))}
            </colgroup>
            <thead>
              <tr className={isPrint ? "h-7" : "h-14"}>
                <th className={cn("font-black text-center", isPrint ? "border border-emerald-950 text-[8.5px] bg-emerald-50" : "rounded-2xl bg-slate-50 text-slate-500 p-2 uppercase text-[11px]")}>
                  {isRTL ? "اليوم" : "Day"}
                </th>
                {timeSlots.map(slot => (
                  <React.Fragment key={slot.id}>
                    <th className={cn("font-black text-center px-1", isPrint ? "border border-emerald-950 text-[8.5px] bg-emerald-50" : "rounded-2xl bg-emerald-950 text-emerald-400 p-2 text-[11px]")}>
                      <div className="flex flex-col items-center justify-center">
                        <span>{slot.label}</span>
                        {slot.time && !isPrint && <span className="text-[8px] opacity-60 font-medium">{slot.time}</span>}
                      </div>
                    </th>
                    {slot.id === "2" && (
                      <th className={cn("border border-emerald-950 bg-emerald-50/50 text-[7px] font-black [writing-mode:vertical-rl] rotate-180 p-0.5")}>
                        {isRTL ? "راحة" : "BREAK"}
                      </th>
                    )}
                    {slot.id === "4" && (
                      <th className={cn("border border-emerald-950 bg-emerald-50/50 text-[7px] font-black [writing-mode:vertical-rl] rotate-180 p-0.5")}>
                        {isRTL ? "راحة الزوال" : "NOON BREAK"}
                      </th>
                    )}
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day.id} className={isPrint ? "h-12" : "h-24"}>
                  <td className={cn(isPrint ? "border border-emerald-950 p-0.5 bg-emerald-50/10" : "p-2 border-e border-slate-100")}>
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={cn("font-black leading-none", isPrint ? "text-[10px]" : "text-[14px] text-slate-600")}>
                        {isRTL ? day.name : day.en}
                      </span>
                    </div>
                  </td>
                  {timeSlots.map(slot => (
                    <React.Fragment key={slot.id}>
                      <td className={cn("relative h-full", isPrint ? "border border-emerald-950" : "p-1")}>
                        {getAssignment(day.id, slot.id) ? (
                          <LessonCard assignment={getAssignment(day.id, slot.id)} day={day.id} period={slot.id} />
                        ) : (
                          !isPrint && (
                            <div className="h-full w-full rounded-xl border border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:bg-emerald-50/50 transition-all" onClick={() => onAddClick(day.id, slot.id)}>
                              <Plus size={14} className="text-slate-200" />
                            </div>
                          )
                        )}
                      </td>
                      {(slot.id === "2" || slot.id === "4") && (
                        <td className="border border-emerald-950 bg-emerald-50/20"></td>
                      )}
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SummaryTable />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-stretch w-full gap-0", 
      isPrint ? "overflow-hidden" : "overflow-x-auto pb-2",
      isRTL ? "flex-row" : "flex-row-reverse"
    )}>
      <div className="flex-1 min-w-0">
        <table className={tableClasses}>
          <colgroup>
            <col className={isPrint ? "w-[45px]" : "w-[80px]"} />
            {days.map(day => <col key={day.id} className="w-auto" />)}
          </colgroup>
          <thead>
            <tr className={isPrint ? "h-7" : "h-14"}>
              <th className={cn("font-black text-center", isPrint ? "border border-emerald-950 text-[8.5px] bg-emerald-50" : "rounded-2xl bg-emerald-950 text-emerald-400 p-2 text-[11px]")}>
                {isRTL ? "الحصة" : "Slot"}
              </th>
              {days.map(day => (
                <th key={day.id} className={cn("font-black text-center px-1", isPrint ? "border border-emerald-950 text-[10px] bg-emerald-50" : "rounded-2xl bg-slate-50 text-slate-500 p-2 uppercase text-[11px]")}>
                  {isRTL ? day.name : day.en}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <React.Fragment key={slot.id}>
                <tr className={isPrint ? "h-12" : "h-24"}>
                  <td className={cn(isPrint ? "border border-emerald-950 p-0.5 bg-emerald-50/10" : "p-2 border-e border-slate-100")}>
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={cn("font-black leading-none", isPrint ? "text-[10px]" : "text-[14px] text-slate-600")}>{slot.label}</span>
                      {slot.time && <span className={cn("font-bold opacity-40 mt-0.5", isPrint ? "text-[7px]" : "text-[9px]")}>{slot.time}</span>}
                    </div>
                  </td>
                  {days.map(day => {
                    const assignment = getAssignment(day.id, slot.id);
                    return (
                      <td key={day.id} className={cn("relative h-full", isPrint ? "border border-emerald-950" : "p-1")}>
                        {assignment ? (
                          <LessonCard assignment={assignment} day={day.id} period={slot.id} />
                        ) : (
                          !isPrint && (
                            <div className="h-full w-full rounded-xl border border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:bg-emerald-50/50 transition-all" onClick={() => onAddClick(day.id, slot.id)}>
                              <Plus size={14} className="text-slate-200" />
                            </div>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
                {slot.id === "2" && <BreakRow title={isRTL ? "راحة" : "BREAK"} />}
                {slot.id === "4" && <BreakRow title={isRTL ? "راحة الزوال" : "NOON BREAK"} />}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <SummaryTable />
    </div>
  );
};

export default ScheduleTable;