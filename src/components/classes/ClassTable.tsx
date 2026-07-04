"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, GraduationCap, Users, Award, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ResizableHeader from "../shared/ResizableHeader";

type SortConfig = {
  key: "name" | "code" | "qualificationLevel" | "studentCount" | null;
  direction: "asc" | "desc";
};

interface ClassTableProps {
  classes: any[];
  isRTL: boolean;
  isAdmin: boolean;
  onEdit: (cls: any) => void;
  onDelete: (id: string) => void;
  sortConfig: SortConfig;
  onSort: (key: SortConfig["key"]) => void;
}

const ClassTable = ({
  classes,
  isRTL,
  isAdmin,
  onEdit,
  onDelete,
  sortConfig,
  onSort
}: ClassTableProps) => {
  const [widths, setWidths] = useState({
    name: 250,
    code: 120,
    size: 100,
    qualification: 200,
    actions: 100
  });

  const updateWidth = (column: keyof typeof widths, newWidth: number) => {
    setWidths(prev => ({ ...prev, [column]: newWidth }));
  };

  const SortIcon = ({ column }: { column: SortConfig["key"] }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={12} className="text-emerald-600" /> : <ChevronDown size={12} className="text-emerald-600" />;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm print:hidden">
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse table-fixed", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-slate-50">
              <ResizableHeader 
                width={widths.name} 
                onResize={(w) => updateWidth("name", w)} 
                isRTL={isRTL}
                className={cn("p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 cursor-pointer", isRTL ? "text-right" : "text-left")} 
                onClick={() => onSort("name")}
              >
                <div className="flex items-center gap-2">
                  {isRTL ? "اسم الفرع" : "Branch Name"} <SortIcon column="name" />
                </div>
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.code} 
                onResize={(w) => updateWidth("code", w)} 
                isRTL={isRTL}
                className="p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 text-center cursor-pointer" 
                onClick={() => onSort("code")}
              >
                <div className="flex items-center justify-center gap-2">
                  {isRTL ? "الرمز" : "Code"} <SortIcon column="code" />
                </div>
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.size} 
                onResize={(w) => updateWidth("size", w)} 
                isRTL={isRTL}
                className="p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 text-center cursor-pointer" 
                onClick={() => onSort("studentCount")}
              >
                <div className="flex items-center justify-center gap-2">
                  {isRTL ? "العدد" : "Size"} <SortIcon column="studentCount" />
                </div>
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.qualification} 
                onResize={(w) => updateWidth("qualification", w)} 
                isRTL={isRTL}
                className={cn("p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 cursor-pointer", isRTL ? "text-right" : "text-left")} 
                onClick={() => onSort("qualificationLevel")}
              >
                <div className="flex items-center gap-2">
                  {isRTL ? "مستوى التأهيل" : "Qualification Level"} <SortIcon column="qualificationLevel" />
                </div>
              </ResizableHeader>
              
              {isAdmin && (
                <ResizableHeader 
                  width={widths.actions} 
                  onResize={(w) => updateWidth("actions", w)} 
                  isRTL={isRTL}
                  className="p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 text-center"
                >
                  {isRTL ? "إجراءات" : "Actions"}
                </ResizableHeader>
              )}
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-emerald-50/30 transition-colors group border-b border-slate-50">
                <td className="p-4 overflow-hidden">
                  <div className={cn("flex items-center gap-3", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <GraduationCap size={16} />
                    </div>
                    <span className="font-bold text-emerald-950 text-sm truncate">{cls.name}</span>
                  </div>
                </td>
                <td className="p-4 text-center overflow-hidden">
                  <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black truncate max-w-full">
                    {cls.code || "---"}
                  </div>
                </td>
                <td className="p-4 text-center overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-xs font-black truncate max-w-full">
                    <Users size={12} />
                    {cls.studentCount || "---"}
                  </div>
                </td>
                <td className="p-4 overflow-hidden">
                  <div className={cn("flex items-center gap-2 px-1 text-slate-600 text-xs font-medium", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <span className="truncate">{cls.qualificationLevel || "---"}</span>
                    <Award size={12} className="text-slate-400 shrink-0" />
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-4 text-center overflow-hidden">
                    <div className="flex justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                        onClick={() => onEdit(cls)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-400 hover:bg-red-50 rounded-xl"
                        onClick={() => onDelete(cls.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassTable;