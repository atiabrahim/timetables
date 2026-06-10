"use client";

import React, { useMemo } from "react";
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
    <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
      <CardHeader className={cn(
        "border-b p-6",
        conflicts.total > 0 ? "bg-amber-50/50 border-amber-100" : "bg-emerald-50/30 border-emerald-100"
      )}>
        <CardTitle className="text-base font-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            {conflicts.total > 0 ? (
              <AlertTriangle className="text-amber-500 animate-bounce" size={20} />
            ) : (
              <CheckCircle2 className="text-emerald-500" size={20} />
            )}
            <span className={conflicts.total > 0 ? "text-amber-950" : "text-emerald-950"}>
              {isRTL ? "مستكشف التعارضات الذكي" : "Smart Conflict Detector"}
            </span>
          </div>
          <span className={cn(
            "text-xs font-black px-3 py-1 rounded-full",
            conflicts.total > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
          )}>
            {conflicts.total} {isRTL ? "تعارض مكتشف" : "Conflicts Found"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 max-h-[350px] overflow-y-auto space-y-4">
        {conflicts.total === 0 ? (
          <div className="text-center py-8 text-slate-400 space-y-2">
            <CheckCircle2 className="mx-auto text-emerald-200" size={40} />
            <p className="text-xs font-bold text-emerald-800">
              {isRTL ? "جدولك سليم 100% ولا توجد أي تعارضات!" : "Your schedule is 100% conflict-free!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* تعارضات الأساتذة */}
            {conflicts.teacherConflicts.map((conf, idx) => (
              <div key={`t-${idx}`} className="p-4 bg-amber-50/30 border border-amber-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between border-b border-amber-100/50 pb-2">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <User size={14} className="text-amber-600" />
                    {getEmployeeName(conf.employeeId)}
                  </span>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock size={10} />
                    {getDayName(conf.day)} • {isRTL ? "ح" : "P"}{conf.period}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {conf.assignments.map((asg: any, aIdx: number) => (
                    <div key={aIdx} className="p-2 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 space-y-1">
                      <div className="flex items-center gap-1 text-emerald-800">
                        <GraduationCap size={12} />
                        <span>{getClassName(asg.classId)}</span>
                      </div>
                      <div className="truncate">{getSubjectName(asg.subjectId)}</div>
                      {asg.room && <div className="text-slate-400 text-[9px]">{asg.room}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* تعارضات القاعات */}
            {conflicts.roomConflicts.map((conf, idx) => (
              <div key={`r-${idx}`} className="p-4 bg-rose-50/30 border border-rose-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between border-b border-rose-100/50 pb-2">
                  <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                    <MapPin size={14} className="text-rose-600" />
                    {isRTL ? `قاعة: ${conf.room}` : `Room: ${conf.room}`}
                  </span>
                  <span className="text-[10px] font-black text-rose-700 bg-rose-100/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock size={10} />
                    {getDayName(conf.day)} • {isRTL ? "ح" : "P"}{conf.period}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {conf.assignments.map((asg: any, aIdx: number) => (
                    <div key={aIdx} className="p-2 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 space-y-1">
                      <div className="flex items-center gap-1 text-emerald-800">
                        <GraduationCap size={12} />
                        <span>{getClassName(asg.classId)}</span>
                      </div>
                      <div className="truncate">{getEmployeeName(asg.employeeId)}</div>
                      <div className="truncate text-slate-400 text-[9px]">{getSubjectName(asg.subjectId)}</div>
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

export default ConflictPanel;