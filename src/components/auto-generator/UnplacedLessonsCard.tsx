"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UnplacedLessonsCardProps {
  isRTL: boolean;
  unplacedLessons: any[];
  getEmployeeName: (id: string) => string;
  getSubjectName: (id: string) => string;
  getClassName: (id: string) => string;
}

const UnplacedLessonsCard = ({
  isRTL,
  unplacedLessons,
  getEmployeeName,
  getSubjectName,
  getClassName
}: UnplacedLessonsCardProps) => {
  return (
    <Card className="border-none shadow-xl shadow-red-100/20 rounded-3xl overflow-hidden bg-red-50/50 border border-red-100">
      <CardHeader className="border-b border-red-100 bg-red-100/20">
        <CardTitle className="text-sm font-bold text-red-900 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-600" />
          {isRTL ? `حصص تعذر جدولتها (${unplacedLessons.length})` : `Unplaced Lessons (${unplacedLessons.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[300px] overflow-y-auto space-y-2">
        <p className="text-[10px] font-bold text-red-700/70 mb-2">
          {isRTL 
            ? "تعذر جدولة هذه الحصص بسبب تعارض في أوقات الأساتذة أو القاعات المحددة. يرجى زيادة الحصص الزمنية المتاحة أو مراجعة المتطلبات." 
            : "These lessons couldn't be placed due to resource overlaps. Try activating more periods or reviewing requirements."}
        </p>
        {unplacedLessons.map((lesson, idx) => (
          <div key={idx} className="p-2.5 bg-white rounded-xl border border-red-100 text-[11px] font-bold text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-emerald-900">{getEmployeeName(lesson.employeeId)}</span>
              <span className="text-blue-600">{getSubjectName(lesson.subjectId)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{getClassName(lesson.classId)}</span>
              {lesson.room && <span>{lesson.room}</span>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default UnplacedLessonsCard;