"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Department } from "../../types";

interface DepartmentsTableProps {
  departments: Department[];
  isRTL: boolean;
  isAdmin: boolean;
  onAddClick: () => void;
  onEditClick: (dept: Department) => void;
  onDeleteClick: (id: string) => void;
}

const DepartmentsTable = ({
  departments,
  isRTL,
  isAdmin,
  onAddClick,
  onEditClick,
  onDeleteClick
}: DepartmentsTableProps) => {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-[#f9f9f1] border-b border-gray-100 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Building2 size={20} className="text-[#064e3b]" />
          {isRTL ? "إدارة المصالح" : "Departments Management"}
        </CardTitle>
        {isAdmin && (
          <Button 
            onClick={onAddClick} 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 font-bold"
          >
            <Plus size={16} />
            {isRTL ? "إضافة مصلحة" : "Add Department"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-3 text-slate-700 font-black text-[10px] uppercase w-16 text-center">{isRTL ? "الرقم" : "No."}</th>
                <th className="p-3 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "التسمية" : "Name"}</th>
                <th className="p-3 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "الرئيس" : "Head"}</th>
                <th className="p-3 text-slate-700 font-black text-[10px] uppercase text-center w-24">{isRTL ? "الرمز" : "Code"}</th>
                <th className="p-3 text-slate-700 font-black text-[10px] uppercase">{isRTL ? "ملاحظة" : "Note"}</th>
                {isAdmin && <th className="p-3 text-slate-700 font-black text-[10px] uppercase text-center w-24">{isRTL ? "إجراءات" : "Actions"}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="p-3 text-center font-bold text-xs text-slate-500">{dept.number || "---"}</td>
                  <td className="p-3 font-bold text-emerald-900 text-xs">{dept.name}</td>
                  <td className="p-3 text-slate-700 text-xs">{dept.head || "---"}</td>
                  <td className="p-3 text-center text-xs font-black"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{dept.code || "---"}</span></td>
                  <td className="p-3 text-slate-500 text-xs truncate max-w-[150px]">{dept.observation || "---"}</td>
                  {isAdmin && (
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 rounded-md"
                          onClick={() => onEditClick(dept)}
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-400 hover:bg-red-50 rounded-md"
                          onClick={() => onDeleteClick(dept.id)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="p-8 text-center text-slate-400 font-bold text-xs">
                    {isRTL ? "لا توجد مصالح مسجلة حالياً" : "No departments registered yet"}
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

export default DepartmentsTable;