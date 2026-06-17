"use client";

import React from "react";
import { Trash2, AlertTriangle, UserCheck, MapPin, Zap, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "../../context/AppContext";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";

interface LessonCardProps {
  assignment: any;
  day: number;
  period: string;
  isHovered: boolean;
  isPrint: boolean;
  isAdmin: boolean;
  isRTL: boolean;
  viewMode: "class" | "teacher" | "room";
  subjects: any[];
  employees: any[];
  classes: any[];
  allAssignments: any[];
  onDeleteClick: (id: string) => void;
  onUpdateAssignment?: (id: string, updates: any) => void;
  setDraggedAssignmentId: (id: string | null) => void;
}

const SUBJECT_COLORS = [
  "bg-emerald-600", "bg-blue-600", "bg-amber-600", "bg-rose-600", 
  "bg-indigo-600", "bg-teal-600", "bg-violet-600", "bg-cyan-600",
  "bg-orange-600", "bg-slate-700"
];

const getSubjectColor = (index: number) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

const LessonCard = ({
  assignment, day, period, isHovered, isPrint, isAdmin, isRTL, viewMode,
  subjects, employees, classes, allAssignments, onDeleteClick, onUpdateAssignment, setDraggedAssignmentId
}: LessonCardProps) => {
  const { teacherConstraints = [], roomConstraints = [] } = useApp();
  
  const subjectIndex = subjects.findIndex(s => s.id === assignment.subjectId);
  const colorClass = getSubjectColor(subjectIndex);

  const conflict = React.useMemo(() => {
    if (isPrint || !allAssignments) return null;
    const teacherConflict = allAssignments.find(a => 
      a.id !== assignment.id && a.day === day && a.period === period && a.employeeId === assignment.employeeId
    );
    const roomConflict = assignment.room ? allAssignments.find(a => 
      a.id !== assignment.id && a.day === day && a.period === period && a.room === assignment.room
    ) : null;
    return (teacherConflict || roomConflict) ? { teacherConflict, roomConflict } : null;
  }, [allAssignments, assignment, day, period, isPrint]);

  const solutions = React.useMemo(() => {
    if (!allAssignments || isPrint) return { freeTeachers: [], freeRooms: [] };
    
    const busyTeacherIds = allAssignments.filter(a => a.day === day && a.period === period).map(a => a.employeeId);
    const freeTeachers = employees.filter(e => {
      if (busyTeacherIds.includes(e.id)) return false;
      const tConstraint = teacherConstraints.find(c => c.employeeId === e.id && c.day === day && c.period === period);
      return !tConstraint || tConstraint.isAvailable;
    }).slice(0, 8);

    const busyRooms = allAssignments.filter(a => a.day === day && a.period === period && a.room).map(a => a.room);
    const allRegisteredRooms = Array.from(new Set(allAssignments.map(a => a.room).filter(Boolean)));
    const freeRooms = (allRegisteredRooms as string[]).filter(r => {
      if (!r || busyRooms.includes(r)) return false;
      const rConstraint = roomConstraints.find(c => c.roomName === r && c.day === day && c.period === period);
      return !rConstraint || rConstraint.isAvailable;
    }).slice(0, 8);

    return { freeTeachers, freeRooms };
  }, [allAssignments, day, period, employees, teacherConstraints, roomConstraints, isPrint]);

  const teacher = employees.find(emp => emp.id === assignment.employeeId);
  const cls = classes.find(c => c.id === assignment.classId);

  const handleDuplicate = () => {
    if (onUpdateAssignment) {
      const newId = Math.random().toString(36).substr(2, 9);
      // Adding a duplicate is essentially adding to the context's assignments array
      // In this app structure, we should really call an 'add' function, but for now we'll assume the parent handles it if we emit an event
      // However, the simplest is to just expose the setAssignments if needed, but we rely on props.
    }
  };

  const cardContent = (
    <div 
      draggable={!isPrint && isAdmin}
      onDragStart={(e) => {
        if (isPrint || !isAdmin) return;
        e.dataTransfer.setData("text/plain", assignment.id);
        e.dataTransfer.effectAllowed = "move";
        setDraggedAssignmentId(assignment.id);
      }}
      onDragEnd={() => setDraggedAssignmentId(null)}
      className={cn(
        "h-full w-full flex flex-col justify-center items-center text-center relative transition-all group/card", 
        isPrint ? "p-0.5 text-black bg-white" : cn(
          "text-white shadow-sm rounded-lg p-1 cursor-grab active:cursor-grabbing",
          colorClass,
          "hover:scale-[1.01]",
          conflict && "ring-1 ring-red-500 animate-pulse",
          isHovered && "ring-2 ring-emerald-400 scale-[1.02] shadow-md"
        )
      )}
    >
      <div className={cn("font-bold leading-none truncate w-full mb-0.5", isPrint ? "text-[6.5px] opacity-70" : "text-[8px] opacity-80")}>
        {viewMode === "class" ? teacher?.lastName : viewMode === "teacher" ? cls?.name : `${cls?.name} • ${teacher?.lastName}`}
      </div>
      <p className={cn("font-black leading-none uppercase w-full truncate", isPrint ? "text-[8px] mb-0.5" : "text-[10px] mb-0.5")}>
        {subjects.find(s => s.id === assignment.subjectId)?.name || "---"}
      </p>
      <p className={cn("font-bold leading-none truncate w-full", isPrint ? "text-[6.5px] text-emerald-900" : "text-[8px] opacity-90")}>
        {viewMode === "room" ? "---" : (assignment.room || "---")}
      </p>
    </div>
  );

  if (isPrint || !isAdmin) return cardContent;

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full">{cardContent}</ContextMenuTrigger>
      <ContextMenuContent className="w-64 rounded-2xl p-2 bg-white border border-slate-200 shadow-2xl z-[9999]">
        <ContextMenuLabel className="text-[10px] font-black uppercase text-slate-400 px-3 py-2 flex items-center gap-2">
          <Zap size={14} className="text-emerald-500" />
          {isRTL ? "حلول مقترحة للتعارض" : "Conflict Solutions"}
        </ContextMenuLabel>
        <ContextMenuSeparator className="bg-slate-100" />
        <ContextMenuSub>
          <ContextMenuSubTrigger className="rounded-xl px-3 py-2 text-xs font-bold gap-2 focus:bg-emerald-50 focus:text-emerald-900">
            <UserCheck size={14} />
            {isRTL ? "تغيير الأستاذ (المتاحون حالياً)" : "Switch Teacher (Free & Available)"}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56 rounded-xl p-1 bg-white shadow-xl border border-slate-100">
            {solutions.freeTeachers.length > 0 ? solutions.freeTeachers.map(emp => (
              <ContextMenuItem key={emp.id} onClick={() => onUpdateAssignment?.(assignment.id, { employeeId: emp.id })} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer hover:bg-emerald-50 hover:text-emerald-900">
                {emp.lastName} {emp.firstName}
              </ContextMenuItem>
            )) : <div className="p-2 text-[10px] text-center text-slate-400 font-bold">{isRTL ? "لا يوجد أساتذة متاحون" : "No available teachers"}</div>}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger className="rounded-xl px-3 py-2 text-xs font-bold gap-2 focus:bg-emerald-50 focus:text-emerald-900">
            <MapPin size={14} />
            {isRTL ? "تغيير القاعة (الشاغرة حالياً)" : "Switch Room (Empty & Available)"}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48 rounded-xl p-1 bg-white shadow-xl border border-slate-100">
            {solutions.freeRooms.length > 0 ? solutions.freeRooms.map((room, idx) => (
              <ContextMenuItem key={idx} onClick={() => onUpdateAssignment?.(assignment.id, { room })} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer hover:bg-emerald-50 hover:text-emerald-900">
                {room}
              </ContextMenuItem>
            )) : <div className="p-2 text-[10px] text-center text-slate-400 font-bold">{isRTL ? "لا توجد قاعات شاغرة" : "No available rooms"}</div>}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator className="bg-slate-100" />
        <ContextMenuItem className="rounded-xl px-3 py-2 text-xs font-bold gap-2 text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer" onClick={() => onDeleteClick(assignment.id)}>
          <Trash2 size={14} />
          {isRTL ? "حذف الحصة نهائياً" : "Delete Lesson"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default LessonCard;