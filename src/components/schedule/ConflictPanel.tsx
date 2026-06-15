"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, User, MapPin, Clock, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DAYS } from "../../constants/schedule";

interface ConflictPanelProps {
  assignments: any[];
  employees: any[];
  classes: any[];
  subjects: any[];
  isRTL: boolean;
}

const ConflictPanel = ({ assignments, employees, classes, subjects, isRTL }: ConflictPanelProps) => {
  const conflicts = useMemo(() => {
    const teacherConflicts: any[] = [];
    const roomConflicts: any[] = [];

    // تجميع الحصص حسب اليوم والفترة
    const slots: Record<string, any[]> = {};
    assignments.forEach(asgn => {
      const key = `${asgn.day}-${asgn.period}`;
      if (!slots[key]) slots[key] = [];
      slots[key].push(asgn);
    });

    Object.entries(slots).forEach(([key, slotAssignments]) => {
      const [dayStr, period] = key.split("-");
      const day = parseInt(dayStr);

      // 1. فحص تعارض الأساتذة
      const teacherMap: Record<string, any[]> = {};
      slotAssignments.forEach(asgn => {
        if (asgn.employeeId) {
          if (!teacherMap[asgn.employeeId]) teacherMap[asgn.employeeId] = [];
          teacherMap[asgn.employeeId].push(asgn);
        }
      });

      Object.entries(teacherMap).forEach(([empId, asgns]) => {
        if (asgns.length > 1) {
          teacherConflicts.push({
            day,
            period,
            employeeId: empId,
            assignments: asgns
          });
        }
      });

      // 2. فحص تعارض القاعات
      const roomMap: Record<string, any[]> = {};
      slotAssignments.forEach(asgn => {
        if (asgn.room && asgn.room.trim() !== "") {
          if (!roomMap[asgn.room]) roomMap[asgn.room] = [];
          roomMap[asgn.room].push(asgn);
        }
      });

      Object.entries(roomMap).forEach(([room, asgns]) => {
        if (asgns.length > 1) {
          roomConflicts.push({
            day,
            period,
            room,
            assignments: asgns
          });
        }
      });
    });

    return { teacherConflicts, roomConflicts, total: teacherConflicts.length + roomConflicts.length };
  }, [assignments]);

  const getDayName = (dayId: number) => {
    return DAYS.find(d => d.id === dayId)?.[isRTL ? "name" : "en"] || "";
  };

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.lastName} ${emp.firstName}` : "---";
  };

  const getClassName = (id: string) => {
    return classes.find(c => c.id === id)?.name || "---";
  };

  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.name || "---";
  };

  return (
    <Card className="border-none shadow-lg shadow-emerald-100/10 rounded-2xl overflow-hidden bg-white">
      <CardHeader className={cn(
        "border-b p-4",
        conflicts.total > 0 ? "bg-amber-50/40 border-amber-100" : "bg-emerald-50/20 border-emerald-100"
      )}>
        <CardTitle className="text-xs font-black flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {conflicts.total > 0 ? (
              <AlertTriangle className="text-amber-500 animate-pulse" size={16} />
            ) : (
              <CheckCircle2 className="text-emerald-500" size={16} />
            )}
            <span className={conflicts.total > 0 ? "text-amber-950" : "text-emerald-950"}>
              {isRTL ? "مستكشف التعارضات" : "Conflict Detector"}
            </span>
          </div>
          <span className={cn(
            "text-[9px] font-black px-2 py-0.5 rounded-full",
            conflicts.total > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
          )}>
            {conflicts.total}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[220px] overflow-y-auto space-y-3">
        {conflicts.total === 0 ? (
          <div className="text-center py-4 text-slate-400 space-y-1">
            <CheckCircle2 className="mx-auto text-emerald-200" size={28} />
            <p className="text-[10px] font-bold text-emerald-800">
              {isRTL ? "الجدول سليم 100%!" : "Schedule is 100% clean!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* تعارضات الأساتذة */}
            {conflicts.teacherConflicts.map((conf, idx) => (
              <div key={`t-${idx}`} className="p-2.5 bg-amber-50/20 border border-amber-100/70 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between border-b border-amber-100/30 pb-1">
                  <span className="text-[10px] font-black text-amber-900 flex items-center gap-1">
                    <User size={12} className="text-amber-600" />
                    {getEmployeeName(conf.employeeId)}
                  </span>
                  <span className="text-[8px] font-black text-amber-700 bg-amber-100/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Clock size={8} />
                    {getDayName(conf.day)} • {isRTL ? "ح" : "P"}{conf.period}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {conf.assignments.map((asg: any, aIdx: number) => (
                    <div 
                      key={aIdx} 
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", asg.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className="p-1.5 bg-white rounded-lg border border-slate-100 text-[9px] font-bold text-slate-600 space-y-0.5 cursor-grab active:cursor-grabbing hover:border-emerald-300 hover:shadow-sm transition-all"
                      title={isRTL ? "اسحب لحل التعارض" : "Drag to resolve conflict"}
                    >
                      <div className="flex items-center gap-0.5 text-emerald-800">
                        <GraduationCap size={10} />
                        <span className="truncate">{getClassName(asg.classId)}</span>
                      </div>
                      <div className="truncate">{getSubjectName(asg.subjectId)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* تعارضات القاعات */}
            {conflicts.roomConflicts.map((conf, idx) => (
              <div key={`r-${idx}`} className="p-2.5 bg-rose-50/20 border border-rose-100/70 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between border-b border-rose-100/30 pb-1">
                  <span className="text-[10px] font-black text-rose-900 flex items-center gap-1">
                    <MapPin size={12} className="text-rose-600" />
                    {isRTL ? `قاعة: ${conf.room}` : `Room: ${conf.room}`}
                  </span>
                  <span className="text-[8px] font-black text-rose-700 bg-rose-100/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Clock size={8} />
                    {getDayName(conf.day)} • {isRTL ? "ح" : "P"}{conf.period}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {conf.assignments.map((asg: any, aIdx: number) => (
                    <div 
                      key={aIdx} 
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", asg.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className="p-1.5 bg-white rounded-lg border border-slate-100 text-[9px] font-bold text-slate-600 space-y-0.5 cursor-grab active:cursor-grabbing hover:border-emerald-300 hover:shadow-sm transition-all"
                      title={isRTL ? "اسحب لحل التعارض" : "Drag to resolve conflict"}
                    >
                      <div className="flex items-center gap-0.5 text-emerald-800">
                        <GraduationCap size={10} />
                        <span className="truncate">{getClassName(asg.classId)}</span>
                      </div>
                      <div className="truncate">{getEmployeeName(asg.employeeId)}</div>
                    </div>
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

import { useMemo } from "react";

export default ConflictPanel;