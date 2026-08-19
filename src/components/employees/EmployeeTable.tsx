"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Mail, Phone, ArrowUpDown, ChevronUp, ChevronDown, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ResizableHeader from "../shared/ResizableHeader";

type SortConfig = {
  key: "firstName" | "lastName" | "email" | "phone" | "category" | null;
  direction: "asc" | "desc";
};

interface EmployeeTableProps {
  employees: any[];
  isRTL: boolean;
  isAdmin: boolean;
  onEdit: (emp: any) => void;
  onDelete: (id: string) => void;
  sortConfig: SortConfig;
  onSort: (key: SortConfig["key"]) => void;
}

const EmployeeTable = ({
  employees,
  isRTL,
  isAdmin,
  onEdit,
  onDelete,
  sortConfig,
  onSort
}: EmployeeTableProps) => {
  // Track column widths
  const [widths, setWidths] = useState({
    name: 250,
    category: 120,
    contact: 250,
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
                className={cn("p-2 text-slate-700 font-black text-[10px] uppercase border border-slate-200 cursor-pointer", isRTL ? "text-right" : "text-left")} 
                onClick={() => onSort("lastName")}
              >
                <div className="flex items-center gap-2">
                  {isRTL ? "المعلم" : "Teacher"} <SortIcon column="lastName" />
                </div>
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.category} 
                onResize={(w) => updateWidth("category", w)} 
                isRTL={isRTL}
                className="p-2 text-slate-700 font-black text-[10px] uppercase border border-slate-200 text-center cursor-pointer" 
                onClick={() => onSort("category")}
              >
                <div className="flex items-center justify-center gap-2">
                  {isRTL ? "الفئة" : "Category"} <SortIcon column="category" />
                </div>
              </ResizableHeader>
              
              <ResizableHeader 
                width={widths.contact} 
                onResize={(w) => updateWidth("contact", w)} 
                isRTL={isRTL}
                className={cn("p-2 text-slate-700 font-black text-[10px] uppercase border border-slate-200", isRTL ? "text-right" : "text-left")}
              >
                {isRTL ? "التواصل" : "Contact"}
              </ResizableHeader>
              
              {isAdmin && (
                <ResizableHeader 
                  width={widths.actions} 
                  onResize={(w) => updateWidth("actions", w)} 
                  isRTL={isRTL}
                  className="p-2 text-slate-700 font-black text-[10px] uppercase border border-slate-200 text-center"
                >
                  {isRTL ? "إجراءات" : "Actions"}
                </ResizableHeader>
              )}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-emerald-50/30 transition-colors group">
                <td className="p-1 border border-slate-100 overflow-hidden">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <div>
                      <p className="font-bold text-emerald-900 text-xs truncate">{emp.lastName} {emp.firstName}</p>
                    </div>
                    <UserIcon size={12} className="text-emerald-500 shrink-0" />
                  </div>
                </td>
                <td className="p-1 border border-slate-100 text-center overflow-hidden">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black",
                    emp.category === "Full-time" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                  )}>
                    {emp.category}
                  </div>
                </td>
                <td className="p-1 border border-slate-100 overflow-hidden">
                  <div className={cn("flex flex-col gap-0.5 px-2 text-[10px] font-bold text-slate-600", isRTL ? "items-start" : "items-end")}>
                    {emp.email && <div className="flex items-center gap-1 truncate w-full"><Mail size={10} className="text-slate-400 shrink-0" /> <span className="truncate">{emp.email}</span></div>}
                    {emp.phone && <div className="flex items-center gap-1 truncate w-full"><Phone size={10} className="text-slate-400 shrink-0" /> <span className="truncate">{emp.phone}</span></div>}
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-1 border border-slate-100 text-center overflow-hidden">
                    <div className="flex justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-emerald-600 hover:bg-emerald-50 rounded-md"
                        onClick={() => onEdit(emp)}
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-400 hover:bg-red-50 rounded-md"
                        onClick={() => onDelete(emp.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-24 bg-slate-50/30">
          <p className="text-slate-400 font-bold">{isRTL ? "لا يوجد معلمون مطابقون" : "No matching teachers found"}</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;