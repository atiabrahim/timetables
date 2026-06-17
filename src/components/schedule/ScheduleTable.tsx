"use client";

import React, { useState, useMemo } from "react";
import { Plus, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "../../context/AppContext";
import LessonCard from "./LessonCard";
import SummaryTable from "./SummaryTable";
import BreakRow from "./BreakRow";

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
  viewMode: "class" | "teacher" | "room";
  isPrint?: boolean;
  summaryData?: any[];
  totalHours?: number;
  isTransposed?: boolean;
  allAssignments?: any[];
  isAdmin?: boolean;
  onMoveAssignment?: (assignmentId: string, targetDay: number, targetPeriod: string) => void;
  onUpdateAssignment?: (id: string, updates: any) => void;
}

const ScheduleTable = ({ 
  isRTL, days, timeSlots, getAssignment, onAddClick, onDeleteClick, 
  subjects, employees, classes, viewMode, isPrint = false, summaryData = [], totalHours = 0, isTransposed = false, allAssignments = [], isAdmin = true,
  onMoveAssignment, onUpdateAssignment
}: ScheduleTableProps) => {
  const { teacherConstraints = [], classConstraints = [], roomConstraints = [] } = useApp();
  const [hoveredCell, setHoveredCell] = useState<{ day: number; period: string } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ day: number; period: string } | null>(null);
  const [draggedAssignmentId, setDraggedAssignmentId] = useState<string | null>(null);

  const draggedAssignment = useMemo(() => {
    if (!draggedAssignmentId || !allAssignments) return null;
    return allAssignments.find(a => a.id === draggedAssignmentId);
  }, [draggedAssignmentId, allAssignments]);

  const getSlotStatus = (day: number, period: string) => {
    if (!draggedAssignment || isPrint) return null;

    const tConstraint = teacherConstraints.find(c => c.employeeId === draggedAssignment.employeeId && c.day === day && c.period === period);
    if (tConstraint && !tConstraint.isAvailable) return "blocked";

    const cConstraint = classConstraints.find(c => c.classId === draggedAssignment.classId && c.day === day && c.period === period);
    if (cConstraint && !cConstraint.isAvailable) return "blocked";

    if (draggedAssignment.room) {
      const rConstraint = roomConstraints.find(c => c.roomName === draggedAssignment.room && c.day === day && c.period === period);
      if (rConstraint && !rConstraint.isAvailable) return "blocked";
    }

    const hasTeacherConflict = allAssignments.some(a => 
      a.id !== draggedAssignment.id && a.day === day && a.period === period && a.employeeId === draggedAssignment.employeeId
    );
    const hasClassConflict = allAssignments.some(a => 
      a.id !== draggedAssignment.id && a.day === day && a.period === period && a.classId === draggedAssignment.classId
    );
    const hasRoomConflict = draggedAssignment.room && allAssignments.some(a => 
      a.id !== draggedAssignment.id && a.day === day && a.period === period && a.room === draggedAssignment.room
    );

    if (hasTeacherConflict || hasClassConflict || hasRoomConflict) return "conflict";
    return "available";
  };

  const verticalSpans = useMemo(() => {
    const spans: Record<string, { rowSpan: number; skip: boolean }> = {};
    days.forEach(day => {
      let skipCount = 0;
      for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i];
        const key = `${day.id}-${slot.id}`;
        if (skipCount > 0) { spans[key] = { rowSpan: 1, skip: true }; skipCount--; continue; }
        const current = getAssignment(day.id, slot.id);
        if (!current) { spans[key] = { rowSpan: 1, skip: false }; continue; }
        let rowSpan = 1;
        for (let j = i + 1; j < timeSlots.length; j++) {
          const nextSlot = timeSlots[j];
          const next = getAssignment(day.id, nextSlot.id);
          if (next && next.subjectId === current.subjectId && next.employeeId === current.employeeId && next.classId === current.classId && timeSlots[j - 1].id !== "2" && timeSlots[j - 1].id !== "4") { rowSpan++; skipCount++; } else break;
        }
        spans[key] = { rowSpan, skip: false };
      }
    });
    return spans;
  }, [days, timeSlots, getAssignment]);

  const horizontalSpans = useMemo(() => {
    const spans: Record<string, { colSpan: number; skip: boolean }> = {};
    days.forEach(day => {
      let skipCount = 0;
      for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i];
        const key = `${day.id}-${slot.id}`;
        if (skipCount > 0) { spans[key] = { colSpan: 1, skip: true }; skipCount--; continue; }
        const current = getAssignment(day.id, slot.id);
        if (!current) { spans[key] = { colSpan: 1, skip: false }; continue; }
        let colSpan = 1;
        for (let j = i + 1; j < timeSlots.length; j++) {
          const nextSlot = timeSlots[j];
          const next = getAssignment(day.id, nextSlot.id);
          if (next && next.subjectId === current.subjectId && next.employeeId === current.employeeId && next.classId === current.classId && timeSlots[j-1].id !== "2" && timeSlots[j-1].id !== "4") { colSpan++; skipCount++; } else break;
        }
        spans[key] = { colSpan, skip: false };
      }
    });
    return spans;
  }, [days, timeSlots, getAssignment]);

  const renderCell = (day: any, slot: any, span: any, isTransposed: boolean) => {
    const currentAssignment = getAssignment(day.id, slot.id);
    const isCellHovered = hoveredCell?.day === day.id || hoveredCell?.period === slot.id;
    const isDragOver = dragOverCell?.day === day.id && dragOverCell?.period === slot.id;
    const slotStatus = getSlotStatus(day.id, slot.id);

    return (
      <td 
        key={isTransposed ? `${day.id}-${slot.id}` : day.id}
        colSpan={isTransposed ? (span?.colSpan || 1) : 1}
        rowSpan={!isTransposed ? (span?.rowSpan || 1) : 1}
        className={cn(
          "relative h-full transition-all duration-150", 
          isPrint ? "border border-emerald-950" : cn(
            "p-0.5", 
            isCellHovered && "bg-emerald-50/30",
            draggedAssignment && cn(
              slotStatus === "available" && "bg-emerald-50/40 border-2 border-dashed border-emerald-400",
              slotStatus === "conflict" && "bg-amber-50/40 border-2 border-dashed border-amber-400",
              slotStatus === "blocked" && "bg-rose-50/40 border-2 border-dashed border-rose-400 opacity-60 cursor-not-allowed"
            ),
            isDragOver && cn(
              slotStatus === "available" && "bg-emerald-100/80 ring-2 ring-emerald-500 ring-inset",
              slotStatus === "conflict" && "bg-amber-100/80 ring-2 ring-amber-500 ring-inset",
              slotStatus === "blocked" && "bg-rose-100/80 ring-2 ring-rose-500 ring-inset"
            )
          )
        )}
        onMouseEnter={() => !isPrint && setHoveredCell({ day: day.id, period: slot.id })}
        onMouseLeave={() => !isPrint && setHoveredCell(null)}
        onDragOver={(e) => {
          if (!isPrint && isAdmin) { 
            e.preventDefault(); 
            if (dragOverCell?.day !== day.id || dragOverCell?.period !== slot.id) {
              setDragOverCell({ day: day.id, period: slot.id }); 
            }
          }
        }}
        onDragLeave={() => { if (!isPrint && isAdmin) setDragOverCell(null); }}
        onDrop={(e) => {
          if (isPrint || !isAdmin) return;
          setDragOverCell(null);
          const assignmentId = e.dataTransfer.getData("text/plain");
          if (slotStatus === "blocked") return;
          if (assignmentId && onMoveAssignment) {
            onMoveAssignment(assignmentId, day.id, slot.id);
          }
        }}
      >
        {currentAssignment ? (
          <LessonCard 
            assignment={currentAssignment} day={day.id} period={slot.id} isHovered={isCellHovered}
            isPrint={isPrint} isAdmin={isAdmin} isRTL={isRTL} viewMode={viewMode}
            subjects={subjects} employees={employees} classes={classes} allAssignments={allAssignments}
            onDeleteClick={onDeleteClick} onUpdateAssignment={onUpdateAssignment} setDraggedAssignmentId={setDraggedAssignmentId}
          />
        ) : (
          !isPrint && isAdmin && (
            <div className="h-full w-full rounded-lg border border-dashed border-slate-100 flex items-center justify-center cursor-pointer hover:bg-emerald-50/50" onClick={() => onAddClick(day.id, slot.id)}>
              {draggedAssignment ? (
                <div className="flex flex-col items-center gap-1 text-[8px] font-bold">
                  {slotStatus === "available" && <CheckCircle2 size={12} className="text-emerald-500" />}
                  {slotStatus === "conflict" && <AlertTriangle size={12} className="text-amber-500" />}
                  {slotStatus === "blocked" && <XCircle size={12} className="text-rose-500" />}
                </div>
              ) : (
                <Plus size={10} className="text-slate-200" />
              )}
            </div>
          )
        )}
      </td>
    );
  };

  if (isTransposed) {
    return (
      <div className={cn("flex items-stretch w-full gap-0", isPrint ? "overflow-hidden" : "overflow-x-auto pb-1", isRTL ? "flex-row" : "flex-row-reverse")}>
        <div className="flex-1 min-w-0">
          <table className={cn("w-full border-collapse h-full table-fixed", isPrint ? "border border-emerald-950" : "")}>
            <colgroup>
              <col className={isPrint ? "w-[30px]" : "w-[50px]"} />
              {timeSlots.map(slot => (
                <React.Fragment key={slot.id}><col />{(slot.id === "2" || slot.id === "4") && <col className={isPrint ? "w-[8px]" : "w-[12px]"} />}</React.Fragment>
              ))}
            </colgroup>
            <thead>
              <tr className={isPrint ? "h-4" : "h-7"}>
                <th className={cn("font-black text-center", isPrint ? "border border-emerald-950 text-[7.5px] bg-emerald-50" : "rounded-lg bg-slate-50 text-slate-500 p-1 uppercase text-[9px]")}>{isRTL ? "اليوم" : "Day"}</th>
                {timeSlots.map(slot => {
                  const isColHovered = hoveredCell?.period === slot.id;
                  return (
                    <React.Fragment key={slot.id}>
                      <th className={cn("font-black text-center px-0.5 transition-colors duration-150", isPrint ? "border border-emerald-950 text-[7.5px] bg-emerald-50" : cn("rounded-lg p-1 text-[9px]", isColHovered ? "bg-emerald-800 text-white" : "bg-emerald-950 text-emerald-400"))}>
                        <div className="flex flex-col items-center justify-center"><span className="whitespace-nowrap">{slot.label}</span><span className={cn("font-bold opacity-70 mt-0.5 whitespace-nowrap", isPrint ? "text-[4.5px]" : "text-[7px]")}>{slot.time}</span></div>
                      </th>
                      {(slot.id === "2" || slot.id === "4") && <th className="border border-emerald-950 bg-emerald-50/50 text-[6px] font-black [writing-mode:vertical-rl] rotate-180 p-0.5 text-center">{isRTL ? "راحة" : "BREAK"}</th>}
                    </React.Fragment>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {days.map(day => {
                const isRowHovered = hoveredCell?.day === day.id;
                return (
                  <tr key={day.id} className={cn(isPrint ? "h-6" : "h-10", !isPrint && isRowHovered && "bg-emerald-50/20")}>
                    <td className={cn("transition-colors duration-150", isPrint ? "border border-emerald-950 p-0.5 bg-emerald-50/10" : cn("p-1 border-e border-slate-100 text-center", isRowHovered && "bg-emerald-50/40"))}>
                      <span className={cn("font-black", isPrint ? "text-[8px]" : "text-[11px] text-slate-600")}>{isRTL ? day.name : day.en.substr(0, 3)}</span>
                    </td>
                    {timeSlots.map(slot => {
                      const span = horizontalSpans[`${day.id}-${slot.id}`];
                      if (span?.skip) return null;
                      return (
                        <React.Fragment key={slot.id}>
                          {renderCell(day, slot, span, true)}
                          {(slot.id === "2" || slot.id === "4") && <td className="border border-emerald-950 bg-emerald-50/20"></td>}
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <SummaryTable summaryData={summaryData} totalHours={totalHours} isPrint={isPrint} isRTL={isRTL} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-stretch w-full gap-0", isPrint ? "overflow-hidden" : "overflow-x-auto pb-1", isRTL ? "flex-row" : "flex-row-reverse")}>
      <div className="flex-1 min-w-0">
        <table className={cn("w-full border-collapse h-full table-fixed", isPrint ? "border border-emerald-950" : "")}>
          <colgroup>
            <col className={isPrint ? "w-[30px]" : "w-[50px]"} />
            {days.map(day => <col key={day.id} />)}
          </colgroup>
          <thead>
            <tr className={isPrint ? "h-4" : "h-7"}>
              <th className={cn("font-black text-center", isPrint ? "border border-emerald-950 text-[7.5px] bg-emerald-50" : "rounded-lg bg-emerald-950 text-emerald-400 p-1 text-[9px]")}>{isRTL ? "الحصة" : "Slot"}</th>
              {days.map(day => {
                const isColHovered = hoveredCell?.day === day.id;
                return (<th key={day.id} className={cn("font-black text-center px-0.5 transition-colors duration-150", isPrint ? "border border-emerald-950 text-[8.5px] bg-emerald-50" : cn("rounded-lg p-1 uppercase text-[9px]", isColHovered ? "bg-emerald-100 text-emerald-900" : "bg-slate-50 text-slate-500"))}>{isRTL ? day.name : day.en.substr(0, 3)}</th>);
              })}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => {
              const isRowHovered = hoveredCell?.period === slot.id;
              return (
                <React.Fragment key={slot.id}>
                  <tr className={cn(isPrint ? "h-6" : "h-10", !isPrint && isRowHovered && "bg-emerald-50/20")}>
                    <td className={cn("transition-colors duration-150", isPrint ? "border border-emerald-950 p-0.5 bg-emerald-50/10 text-center" : cn("p-1 border-e border-slate-100 text-center", isRowHovered && "bg-emerald-50/40"))}>
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <span className={cn("font-black leading-none whitespace-nowrap", isPrint ? "text-[11px] text-slate-600" : "text-[11px] text-slate-600")}>{slot.label}</span>
                        <span className={cn("font-bold opacity-60 mt-0.5 whitespace-nowrap", isPrint ? "text-[4.5px]" : "text-[7px]")}>{slot.time}</span>
                      </div>
                    </td>
                    {days.map(day => {
                      const span = verticalSpans[`${day.id}-${slot.id}`];
                      if (span?.skip) return null;
                      return renderCell(day, slot, span, false);
                    })}
                  </tr>
                  {slot.id === "2" && <BreakRow title={isRTL ? "راحة" : "BREAK"} daysCount={days.length} isPrint={isPrint} isRTL={isRTL} />}
                  {slot.id === "4" && <BreakRow title={isRTL ? "راحة الزوال" : "NOON BREAK"} daysCount={days.length} isPrint={isPrint} isRTL={isRTL} />}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <SummaryTable summaryData={summaryData} totalHours={totalHours} isPrint={isPrint} isRTL={isRTL} />
    </div>
  );
};

export default ScheduleTable;