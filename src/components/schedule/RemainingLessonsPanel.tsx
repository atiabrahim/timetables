"use client";

import React, { useMemo } from "react";
import { BookOpen, CheckCircle2, AlertCircle, User, GraduationCap, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useApp } from "../../context/AppContext";

interface RemainingLessonsPanelProps {
  isRTL: boolean;
  viewMode: "class" | "teacher" | "room";
  selectedId: string;
  assignments: any[];
  employees: any[];
  classes: any[];
  subjects: any[];
}

const RemainingLessonsPanel = ({
  isRTL,
  viewMode,
  selectedId,
  assignments,
  employees,
  classes,
  subjects
}: RemainingLessonsPanelProps) => {
  const { requirements } = useApp();

  const remainingLessons = useMemo(() => {
    if (!selectedId) return [];

    const relevantReqs = requirements.filter(req => 
      viewMode === "class" ? req.classId === selectedId : 
      viewMode === "teacher" ? req.employeeId === selectedId :
      req.room === selectedId
    );

    return relevantReqs.map(req => {
      const assignedCount = assignments.filter(asgn => 
        asgn.subjectId === req.subjectId &&
        asgn.employeeId === req.employeeId &&
        asgn.classId === req.classId
      ).length;

      const remaining = Math.max(0, req.count - assignedCount);

      return { ...req, assignedCount, remaining, isCompleted: remaining === 0 };
    });
  }, [requirements, selectedId, viewMode, assignments]);

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.lastName} ${emp.firstName}` : "---";
  };

  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || "---";
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || "---";

  const totalRemaining = useMemo(() => remainingLessons.reduce((sum, item) => sum + item.remaining, 0), [remainingLessons]);

  if (!selectedId) return null;

  return (
    <Card className="border-none shadow-lg shadow-emerald-100/10 rounded-2xl overflow-hidden bg-white">
      <CardHeader className={cn("border-b p-4", totalRemaining > 0 ? "bg-blue-50/40 border-blue-100" : "bg-emerald-50/20 border-emerald-100")}>
        <CardTitle className="text-xs font-black flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {totalRemaining > 0 ? <AlertCircle className="text-blue-500" size={16} /> : <CheckCircle2 className="text-emerald-500" size={16} />}
            <span className={totalRemaining > 0 ? "text-blue-950" : "text-emerald-950"}>{isRTL ? "الحصص المتبقية للإسناد" : "Remaining Lessons"}</span>
          </div>
          <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full", totalRemaining > 0 ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800")}>{totalRemaining} {isRTL ? "حصة متبقية" : "Left"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[250px] overflow-y-auto space-y-3">
        {remainingLessons.length === 0 ? (
          <div className="text-center py-6 text-slate-400 space-y-1"><HelpCircle className="mx-auto text-slate-300" size={28} /><p className="text-[10px] font-bold">{isRTL ? "لا توجد متطلبات تدريس مسجلة لهذا الكيان. يمكنك إضافتها في صفحة المولد التلقائي." : "No requirements registered. Add them in the Auto Generator page."}</p></div>
        ) : totalRemaining === 0 ? (
          <div className="text-center py-6 text-slate-400 space-y-1"><CheckCircle2 className="mx-auto text-emerald-500" size={28} /><p className="text-[10px] font-bold text-emerald-800">{isRTL ? "تم إسناد كافة الحصص المطلوبة بنجاح!" : "All required lessons assigned!"}</p></div>
        ) : (
          <div className="space-y-2">
            {remainingLessons.map((item, idx) => (
              <div key={idx} className={cn("p-2.5 border rounded-xl space-y-1 transition-all", item.isCompleted ? "bg-emerald-50/20 border-emerald-100 opacity-60" : "bg-slate-50/50 border-slate-100")}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-800 flex items-center gap-1"><BookOpen size={12} className="text-emerald-600" />{getSubjectName(item.subjectId)}</span>
                  <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded", item.isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800")}>{item.isCompleted ? (isRTL ? "مكتمل" : "Done") : (isRTL ? `متبقي: ${item.remaining}` : `${item.remaining} left`)}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                  <span className="flex items-center gap-0.5">{viewMode === "class" ? <><User size={10} />{getEmployeeName(item.employeeId)}</> : <><GraduationCap size={10} />{getClassName(item.classId)}</>}</span>
                  <span>{isRTL ? `تم إسناد ${item.assignedCount} من ${item.count}` : `${item.assignedCount} of ${item.count}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RemainingLessonsPanel;