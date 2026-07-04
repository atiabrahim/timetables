"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, BookOpen, Languages, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ResizableHeader from "../shared/ResizableHeader";

type SortConfig = {
  key: "name" | "nameEn" | null;
  direction: "asc" | "desc";
};

interface SubjectTableProps {
  subjects: any[];
  isRTL: boolean;
  isAdmin: boolean;
  onEdit: (sub: any) => void;
  onDelete: (id: string) => void;
  sortConfig: SortConfig;
  onSort: (key: SortConfig["key"]) => void;
}

const SubjectTable = ({
  subjects,
  isRTL,
  isAdmin,
  onEdit,
  onDelete,
  sortConfig,
  onSort
}: SubjectTableProps) => {
  const [widths, setWidths] = useState({
    name: 300,
    nameEn: 300,
    actions: 120
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
                  {isRTL ? "اسم المادة" : "Subject Name"} <SortIcon column="name" />
                </div>
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.nameEn} 
                onResize={(w) => updateWidth("nameEn", w)} 
                isRTL={isRTL}
                className={cn("p-4 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200 cursor-pointer", isRTL ? "text-right" : "text-left")} 
                onClick={() => onSort("nameEn")}
              >
                <div className="flex items-center gap-2">
                  {isRTL ? "التسمية بالإنجليزية" : "English Name"} <SortIcon column="nameEn" />
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
            {subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-emerald-50/30 transition-colors group border-b border-slate-5">
                <td className="p-4 overflow-hidden">
                  <div className={cn("flex items-center gap-3", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <BookOpen size={16} />
                    </div>
                    <span className="font-bold text-emerald-950 text-sm truncate">{sub.name}</span>
                  </div>
                </td>
                <td className="p-4 overflow-hidden">
                  <div className={cn("flex items-center gap-2 text-slate-600 text-xs font-medium", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <span className="truncate">{sub.nameEn || "---"}</span>
                    {sub.nameEn && <Languages size={12} className="text-slate-400 shrink-0" />}
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-4 text-center overflow-hidden">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                        onClick={() => onEdit(sub)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-400 hover:bg-red-50 rounded-xl"
                        onClick={() => onDelete(sub.id)}
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

export default SubjectTable;