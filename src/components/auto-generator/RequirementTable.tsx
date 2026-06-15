"use client";

import React from "react";
import { Play, RefreshCw, Trash2, User, BookOpen, Home, MapPin, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RequirementTableProps {
  isRTL: boolean;
  requirements: any[];
  isGenerating: boolean;
  onGenerate: () => void;
  onDelete: (id: string) => void;
  getEmployeeName: (id: string) => string;
  getSubjectName: (id: string) => string;
  getClassName: (id: string) => string;
}

const RequirementTable = ({
  isRTL,
  requirements,
  isGenerating,
  onGenerate,
  onDelete,
  getEmployeeName,
  getSubjectName,
  getClassName
}: RequirementTableProps) => {
  return (
    <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-emerald-50/30 border-b border-emerald-100 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-bold text-emerald-900">
          {isRTL ? `قائمة متطلبات التدريس (${requirements.length})` : `Teaching Requirements (${requirements.length})`}
        </CardTitle>
        {requirements.length > 0 && (
          <Button 
            onClick={onGenerate} 
            disabled={isGenerating}
            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2 font-bold shadow-lg shadow-emerald-100"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
            {isRTL ? "توليد الجدول الآن" : "Generate Schedule"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "الأستاذ" : "Teacher"}</th>
                <th className="p-4 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "المادة" : "Subject"}</th>
                <th className="p-4 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "الفوج" : "Class"}</th>
                <th className="p-4 text-slate-700 font-black text-[10px] uppercase text-center">{isRTL ? "القاعة" : "Room"}</th>
                <th className="p-4 text-slate-700 font-black text-[10px] uppercase text-center">{isRTL ? "الحصص" : "Hours"}</th>
                <th className="p-4 text-slate-700 font-black text-[10px] uppercase text-center w-20">{isRTL ? "إجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requirements.map((req) => (
                <tr key={req.id} className="hover:bg-emerald-50/10 transition-colors">
                  <td className="p-4 font-bold text-emerald-950 text-xs flex items-center gap-2">
                    <User size={14} className="text-emerald-500" />
                    {getEmployeeName(req.employeeId)}
                  </td>
                  <td className="p-4 text-slate-700 text-xs">
                    <span className="flex items-center gap-2">
                      <BookOpen size={14} className="text-blue-500" />
                      {getSubjectName(req.subjectId)}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 text-xs">
                    <span className="flex items-center gap-2">
                      <Home size={14} className="text-amber-500" />
                      {getClassName(req.classId)}
                    </span>
                  </td>
                  <td className="p-4 text-center text-xs font-bold">
                    {req.room ? (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        <MapPin size={10} />
                        {req.room}
                      </span>
                    ) : "---"}
                  </td>
                  <td className="p-4 text-center text-xs font-black text-emerald-700">{req.count}</td>
                  <td className="p-4 text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => onDelete(req.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {requirements.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold text-xs">
                    <HelpCircle className="mx-auto text-slate-300 mb-2" size={32} />
                    {isRTL ? "لا توجد متطلبات تدريس مضافة حالياً. يمكنك استخراجها من الجدول الحالي أو إضافتها يدوياً." : "No teaching requirements added yet. Extract from current schedule or add manually."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequirementTable;