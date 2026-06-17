"use client";

import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle2, User, MapPin, Clock, GraduationCap, ShieldAlert, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DAYS } from "../../constants/schedule";
import { useApp } from "../../context/AppContext";

interface ConflictPanelProps {
  assignments: any[];
  employees: any[];
  classes: any[];
  subjects: any[];
  isRTL: boolean;
}

const ConflictPanel = ({ assignments, employees, classes, subjects, isRTL }: ConflictPanelProps) => {
  const { roomsDetailed = [] } = useApp();
  
  const conflicts = useMemo(() => {
    const teacherConflicts: any[] = [];
    const roomConflicts: any[] = [];
    const classConflicts: any[] = [];
    const capacityViolations: any[] = [];

    const slots: Record<string, any[]> = {};
    assignments.forEach(asgn => {
      const key = `${asgn.day}-${asgn.period}`;
      if (!slots[key]) slots[key] = [];
      slots[key].push(asgn);
    });

    Object.entries(slots).forEach(([key, slotAssignments]) => {
      const [dayStr, period] = key.split("-");
      const day = parseInt(dayStr);

      // 1. Teacher conflicts
      const teacherMap: Record<string, any[]> = {};
      slotAssignments.forEach(asgn => {
        if (asgn.employeeId) {
          if (!teacherMap[asgn.employeeId]) teacherMap[asgn.employeeId] = [];
          teacherMap[asgn.employeeId].push(asgn);
        }
      });
      Object.entries(teacherMap).forEach(([empId, asgns]) => {
        if (asgns.length > 1) teacherConflicts.push({ day, period, employeeId: empId, assignments: asgns });
      });

      // 2. Room conflicts & Capacity checks
      const roomMap: Record<string, any[]> = {};
      slotAssignments.forEach(asgn => {
        // Capacity Check
        if (asgn.room) {
          const roomObj = roomsDetailed.find(r => r.name === asgn.room);
          const classObj = classes.find(c => c.id === asgn.classId);
          if (roomObj && classObj && roomObj.capacity && classObj.studentCount && classObj.studentCount > roomObj.capacity) {
            capacityViolations.push({ 
              day, period, room: asgn.room, capacity: roomObj.capacity, 
              classId: asgn.classId, className: classObj.name, students: classObj.studentCount 
            });
          }

          if (asgn.room.trim() !== "") {
            if (!roomMap[asgn.room]) roomMap[asgn.room] = [];
            roomMap[asgn.room].push(asgn);
          }
        }
      });
      Object.entries(roomMap).forEach(([room, asgns]) => {
        if (asgns.length > 1) roomConflicts.push({ day, period, room, assignments: asgns });
      });

      // 3. Class conflicts
      const classMap: Record<string, any[]> = {};
      slotAssignments.forEach(asgn => {
        if (asgn.classId) {
          if (!classMap[asgn.classId]) classMap[asgn.classId] = [];
          classMap[asgn.classId].push(asgn);
        }
      });
      Object.entries(classMap).forEach(([classId, asgns]) => {
        if (asgns.length > 1) classConflicts.push({ day, period, classId, assignments: asgns });
      });
    });

    return { 
      teacherConflicts, 
      roomConflicts, 
      classConflicts,
      capacityViolations,
      total: teacherConflicts.length + roomConflicts.length + classConflicts.length + capacityViolations.length
    };
  }, [assignments, roomsDetailed, classes]);

  const getDayName = (dayId: number) => DAYS.find(d => d.id === dayId)?.[isRTL ? "name" : "en"] || "";
  const getEmployeeName = (id: string) => employees.find(e => e.id === id) ? `${employees.find(e => e.id === id).lastName} ${employees.find(e => e.id === id).firstName}` : "---";
  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || "---";
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || "---";

  return (
    <Card className="border-none shadow-lg shadow-emerald-100/10 rounded-2xl overflow-hidden bg-white">
      <CardHeader className={cn(
        "border-b p-4",
        conflicts.total > 0 ? "bg-amber-50/40 border-amber-100" : "bg-emerald-50/20 border-emerald-100"
      )}>
        <CardTitle className="text-xs font-black flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {conflicts.total > 0 ? <AlertTriangle className="text-amber-500 animate-pulse" size={16} /> : <CheckCircle2 className="text-emerald-500" size={16} />}
            <span className={conflicts.total > 0 ? "text-amber-950" : "text-emerald-950"}>{isRTL ? "مستكشف التعارضات" : "Conflict Detector"}</span>
          </div>
          <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full", conflicts.total > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>{conflicts.total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[350px] overflow-y-auto space-y-3">
        {conflicts.total === 0 ? (
          <div className="text-center py-6 text-slate-400 space-y-1">
            <CheckCircle2 className="mx-auto text-emerald-200" size={28} />
            <p className="text-[10px] font-bold text-emerald-800">{isRTL ? "الجدول سليم 100%!" : "Schedule is clean!"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Capacity Violations */}
            {conflicts.capacityViolations.map((conf, idx) => (
              <div key={`cap-${idx}`} className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between border-b border-rose-100/30 pb-1">
                  <span className="text-[10px] font-black text-rose-900 flex items-center gap-1"><Users size={12} className="text-rose-600" /> {isRTL ? "تجاوز السعة" : "Over Capacity"}</span>
                  <span className="text-[8px] font-black text-rose-700 bg-rose-100/30 px-1.5 py-0.5 rounded">{getDayName(conf.day)} • P{conf.period}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-600">
                    {isRTL ? `الفوج "${conf.className}" (${conf.students} طالب) أكبر من سعة القاعة "${conf.room}" (${conf.capacity} مقعد)` : `Class "${conf.className}" (${conf.students} students) exceeds room "${conf.room}" capacity (${conf.capacity} seats)`}
                  </p>
                </div>
              </div>
            ))}

            {conflicts.teacherConflicts.map((conf, idx) => (
              <div key={`t-${idx}`} className="p-2.5 bg-amber-50/20 border border-amber-100/70 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between border-b border-amber-100/30 pb-1">
                  <span className="text-[10px] font-black text-amber-900 flex items-center gap-1"><User size={12} className="text-amber-600" />{getEmployeeName(conf.employeeId)}</span>
                  <span className="text-[8px] font-black text-amber-700 bg-amber-100/30 px-1.5 py-0.5 rounded">{getDayName(conf.day)} • P{conf.period}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {conf.assignments.map((asg: any, aIdx: number) => (
                    <div key={aIdx} className="p-1.5 bg-white rounded-lg border border-slate-100 text-[9px] font-bold text-slate-600 truncate"><span className="text-emerald-800 block">{getClassName(asg.classId)}</span>{getSubjectName(asg.subjectId)}</div>
                  ))}
                </div>
              </div>
            ))}

            {conflicts.classConflicts.map((conf, idx) => (
              <div key={`c-${idx}`} className="p-2.5 bg-blue-50/20 border border-blue-100/70 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between border-b border-blue-100/30 pb-1">
                  <span className="text-[10px] font-black text-blue-900 flex items-center gap-1"><GraduationCap size={12} className="text-blue-600" />{getClassName(conf.classId)}</span>
                  <span className="text-[8px] font-black text-blue-700 bg-blue-100/30 px-1.5 py-0.5 rounded">{getDayName(conf.day)} • P{conf.period}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {conf.assignments.map((asg: any, aIdx: number) => (
                    <div key={aIdx} className="p-1.5 bg-white rounded-lg border border-slate-100 text-[9px] font-bold text-slate-600 truncate"><span className="text-emerald-800 block">{getEmployeeName(asg.employeeId)}</span>{getSubjectName(asg.subjectId)}</div>
                  ))}
                </div>
              </div>
            ))}

            {conflicts.roomConflicts.map((conf, idx) => (
              <div key={`r-${idx}`} className="p-2.5 bg-rose-50/20 border border-rose-100/70 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between border-b border-rose-100/30 pb-1">
                  <span className="text-[10px] font-black text-rose-900 flex items-center gap-1"><MapPin size={12} className="text-rose-600" />{conf.room}</span>
                  <span className="text-[8px] font-black text-rose-700 bg-rose-100/30 px-1.5 py-0.5 rounded">{getDayName(conf.day)} • P{conf.period}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {conf.assignments.map((asg: any, aIdx: number) => (
                    <div key={aIdx} className="p-1.5 bg-white rounded-lg border border-slate-100 text-[9px] font-bold text-slate-600 truncate"><span className="text-emerald-800 block">{getClassName(asg.classId)}</span>{getSubjectName(asg.subjectId)}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConflictPanel;