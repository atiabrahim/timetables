"use client";

import React from "react";
import { Plus, Trash2, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  allAssignments?: any[]; // مضاف لكشف التعارضات
}

const SUBJECT_COLORS = [
  "bg-emerald-600", "bg-blue-600", "bg-amber-600", "bg-rose-600", 
  "bg-indigo-600", "bg-teal-600", "bg-violet-600", "bg-cyan-600",
  "bg-orange-600", "bg-slate-700"
];

const getSubjectColor = (index: number) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

const ScheduleTable = ({ 
  isRTL, days, timeSlots, getAssignment, onAddClick, onDeleteClick, 
  subjects, employees, classes, viewMode, isPrint = false, summaryData, totalHours, isTransposed = false,
  allAssignments = []
}: ScheduleTableProps) => {
  
  // دالة متطورة لكشف التعارضات
  const checkConflict = (asgn: any) => {
    if (!asgn || isPrint) return null;
    
    const conflicts = allAssignments.filter(a => 
      a.id !== asgn.id && 
      a.day === asgn.day && 
      a.period === asgn.period &&
      (
        a.employeeId === asgn.employeeId || // تعارض أستاذ
        (asgn.room && a.room === asgn.room) // تعارض قاعة
      )
    );

    if (conflicts.length > 0) {
      const type = conflicts[0].employeeId === asgn.employeeId ? "Teacher" : "Room";
      return {
        type,
        with: type === "Teacher" ? "Same teacher in another class" : "Room already occupied"
      };
    }
    return null;
  };

  const SummaryTable = () => (
    <div className={cn("shrink-0", isPrint ? "w-[130px]" : "w-fit max-w-[320px] sticky top-0 h-fit")}>
      <div className={cn(
        "bg-white border overflow-hidden",
        isPrint ? "rounded-none border-black" : "rounded-3xl border-slate-100 shadow-xl shadow-slate-900/5"
      )}>
        <table className="w-full border-collapse">
          <thead>
            <tr className={cn(isPrint ? "bg-slate-100 border-b border-black" : "bg-slate-50/50")}>
              <th className={cn("p-2 font-black uppercase text-center", isPrint ? "text-[7px] text-black" : "text-[10px] text-slate-400")}>{isRTL ? "المادة" : "Sub"}</th>
              <th className={cn("p-2 font-black uppercase text-center", isPrint ? "text-[7px] text-black border-x border-black" : "text-[9px] text-slate-400 px-2")}>{isRTL ? "الطرف" : "Side"}</th>
              <th className={cn("p-2 font-black uppercase text-center", isPrint ? "text-[7px] text-black" : "text-[9px] text-slate-400")}>{isRTL ? "س" : "H"}</th>
            </tr>
          </thead>
          <tbody className={cn(isPrint ? "divide-y divide-black" : "divide-y divide-slate-50")}>
            {summaryData?.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-1 text-center leading-none">
                  <span className={cn("font-bold block truncate px-1", isPrint ? "text-[7px] text-black" : "text-[11px] text-slate-700")}>{item.subject}</span>
                </td>
                <td className={cn("p-1 text-center leading-none", isPrint && "border-x border-black")}>
                  <span className={cn("font-medium block truncate px-1", isPrint ? "text-[6px] text-black" : "text-[10px] text-slate-500")}>
                    {viewMode === "class" ? item.teacher : item.branch}
                  </span>
                </td>
                <td className="p-1 text-center leading-none">
                  <span className={cn("font-black", isPrint ? "text-[7px] text-black" : "text-[12px] text-slate-900")}>{item.count}</span>
                </td>
              </tr>
            ))}
            <tr className={cn("font-black", isPrint ? "bg-slate-50 border-t border-black" : "bg-emerald-50/50")}>
              <td colSpan={2} className={cn("p-2 text-right", isPrint ? "text-[7px] text-black" : "text-[11px] text-emerald-900")}>{isRTL ? "إجمالي الساعات" : "Total Hours"}</td>
              <td className={cn("p-2 text-center", isPrint ? "text-[8px] text-black" : "text-[13px] text-emerald-600")}>{totalHours}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const LessonCard = ({ assignment }: { assignment: any }) => {
    const subjectIndex = subjects.findIndex(s => s.id === assignment.subjectId);
    const colorClass = getSubjectColor(subjectIndex);
    const conflict = checkConflict(assignment);

    return (
      <div className={cn(
        "h-full w-full flex flex-col justify-center items-center text-center relative transition-all group/card",
        isPrint ? "p-0 text-black bg-white" : cn(
          "text-white shadow-lg rounded-xl p-2", 
          conflict ? "bg-amber-500 ring-4 ring-amber-100 animate-pulse" : colorClass,
          "hover:scale-[1.02] hover:shadow-xl"
        )
      )}>
        {conflict && !isPrint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute -top-2 -left-2 bg-white text-amber-600 rounded-full p-1 shadow-md z-20 border border-amber-100">
                  <AlertTriangle size={14} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-amber-900 text-white border-none rounded-xl">
                <p className="text-[10px] font-black">{isRTL ? "تنبيه تعارض:" : "Conflict Alert:"} {conflict.with}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Subject Name */}
        <p className={cn("font-black leading-none break-words w-full uppercase tracking-tighter", isPrint ? "text-[8px] mb-0.5" : "text-[11px] mb-1")}>
          {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
        </p>
        
        {/* Secondary Info */}
        <p className={cn("font-bold leading-tight break-words w-full", isPrint ? "text-[7px] mb-0.5" : "text-[9px] mb-1 opacity-90")}>
          {viewMode === "class" 
            ? (() => {
                const e = employees.find(emp => emp.id === assignment.employeeId);
                return e ? `${e.lastName} ${e.firstName}` : "---";
              })()
            : classes.find(c => c.id === assignment.classId)?.name
          }
        </p>
        
        {/* Room Label */}
        {assignment.room && (
          <div className={cn(
            isPrint ? "border border-black px-1 mt-0.5" : "bg-black/10 rounded-lg px-2 py-0.5 mt-0.5"
          )}>
            <p className={cn("font-black leading-none", isPrint ? "text-[7px]" : "text-[9px]")}>{assignment.room}</p>
          </div>
        )}

        {!isPrint && (
          <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <Button 
              variant="ghost" size="icon" 
              className="h-5 w-5 bg-white text-red-500 rounded-lg shadow-md hover:bg-red-50"
              onClick={(e) => { e.stopPropagation(); onDeleteClick(assignment.id); }}
            >
              <Trash2 size={10} />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const tableClasses = cn(
    "w-full border-collapse h-full table-fixed",
    isPrint ? "border-2 border-black" : ""
  );

  const HeaderCell = ({ children }: { children: React.ReactNode }) => (
    <th className={cn(
      "font-black text-center transition-colors", 
      isPrint 
        ? "border border-black text-[9px] text-black bg-slate-50" 
        : "rounded-2xl bg-slate-100 text-slate-500 p-2 text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700"
    )}>
      {children}
    </th>
  );

  const renderStandard = () => (
    <table className={tableClasses}>
      <thead>
        <tr className={isPrint ? "h-6" : "h-12"}>
          <th className={cn(
            "font-black text-center w-14", 
            isPrint ? "border border-black text-[9px] text-black bg-slate-100" : "rounded-2xl bg-emerald-950 text-emerald-400 p-2 text-[10px] uppercase"
          )}>
            {isRTL ? "الحصة" : "PERIOD"}
          </th>
          {days.map(day => (
            <HeaderCell key={day.id}>{isRTL ? day.name : day.en}</HeaderCell>
          ))}
        </tr>
      </thead>
      <tbody className={cn(!isPrint && "before:block before:h-2")}>
        {timeSlots.map(slot => (
          <tr key={slot.id} className={cn("group", isPrint ? "h-16" : "h-20")}>
            <td className={cn(isPrint ? "border border-black px-1" : "p-1")}>
              <div className={cn(
                "flex flex-col items-center justify-center h-full rounded-2xl",
                !isPrint && "bg-slate-50 group-hover:bg-emerald-50 transition-colors"
              )}>
                <span className={cn("font-black", isPrint ? "text-[9px] text-black" : "text-sm text-slate-400 group-hover:text-emerald-600")}>{slot.label}</span>
                {!isPrint && <Clock size={10} className="text-slate-200 mt-1" />}
              </div>
            </td>
            {days.map(day => {
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={day.id} className={cn("relative h-full", isPrint ? "border border-black" : "p-1")}>
                  {assignment ? <LessonCard assignment={assignment} /> : (
                    !isPrint && (
                      <div className="h-full w-full rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
                        <Plus size={14} className="text-slate-200 group-hover/add:text-emerald-400 transition-colors" />
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
  );

  const renderTransposed = () => (
    <table className={tableClasses}>
      <thead>
        <tr className={isPrint ? "h-6" : "h-12"}>
          <th className={cn(
            "font-black text-center px-4 w-28", 
            isPrint ? "border border-black text-[9px] text-black bg-slate-100" : "rounded-2xl bg-emerald-950 text-emerald-400 p-2 text-[10px] uppercase"
          )}>
            {isRTL ? "اليوم" : "DAY"}
          </th>
          {timeSlots.map(slot => (
            <HeaderCell key={slot.id}>{slot.label}</HeaderCell>
          ))}
        </tr>
      </thead>
      <tbody className={cn(!isPrint && "before:block before:h-2")}>
        {days.map(day => (
          <tr key={day.id} className={cn("group", isPrint ? "h-16" : "h-20")}>
            <td className={cn(isPrint ? "border border-black px-2" : "p-1")}>
              <div className={cn(
                "flex flex-col items-center justify-center h-full rounded-2xl",
                !isPrint && "bg-slate-50 group-hover:bg-emerald-50 transition-colors"
              )}>
                <span className={cn("font-black", isPrint ? "text-[9px] text-black" : "text-[11px] text-slate-400 group-hover:text-emerald-600")}>{isRTL ? day.name : day.en}</span>
              </div>
            </td>
            {timeSlots.map(slot => {
              const assignment = getAssignment(day.id, slot.id);
              return (
                <td key={slot.id} className={cn("relative h-full", isPrint ? "border border-black" : "p-1")}>
                  {assignment ? <LessonCard assignment={assignment} /> : (
                    !isPrint && (
                      <div className="h-full w-full rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group/add" onClick={() => onAddClick(day.id, slot.id)}>
                        <Plus size={14} className="text-slate-200 group-hover/add:text-emerald-400 transition-colors" />
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
  );

  return (
    <div className={cn(
      "flex h-full", 
      isRTL ? "flex-row" : "flex-row-reverse", 
      isPrint ? "gap-6 items-start w-full" : "w-full gap-8 overflow-x-auto pb-6"
    )}>
      <div className={cn("h-full", isPrint ? "flex-1" : "flex-1 min-w-[900px]")}>
        {isTransposed ? renderTransposed() : renderStandard()}
      </div>
      {(isPrint || summaryData) && <SummaryTable />}
    </div>
  );
};

export default ScheduleTable;