"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Download, 
  FileText, 
  Edit2, 
  ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const Employees = () => {
  const { employees, isRTL, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto order-2 md:order-1">
          <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700">
            <Download size={18} />
            {isRTL ? "تصدير PDF" : "Export PDF"}
          </Button>
          <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700">
            <Download size={18} />
            {isRTL ? "تصدير Excel" : "Export Excel"}
          </Button>
          <div className="relative flex-1 md:w-80">
            <Input 
              placeholder={isRTL ? "بحث" : "Search"} 
              className="rounded-xl border-gray-200 bg-white h-11 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="text-right order-1 md:order-2 w-full md:w-auto">
          <h2 className="text-3xl font-black text-gray-900">
            {isRTL ? "المعلمون" : "Teachers"} 
            <span className="text-gray-400 text-xl mr-2">({employees.length})</span>
          </h2>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-[#f9f9f1]">
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100">
                <div className="flex items-center justify-end gap-2">
                  <ArrowUpDown size={14} className="text-gray-400" />
                  {isRTL ? "الاسم الأول" : "First Name"}
                </div>
              </th>
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100">
                <div className="flex items-center justify-end gap-2">
                  <ArrowUpDown size={14} className="text-gray-400" />
                  {isRTL ? "اسم العائلة" : "Last Name"}
                </div>
              </th>
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100">
                <div className="flex items-center justify-end gap-2">
                  <ArrowUpDown size={14} className="text-gray-400" />
                  {isRTL ? "البريد الإلكتروني" : "Email"}
                </div>
              </th>
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100">
                <div className="flex items-center justify-end gap-2">
                  <ArrowUpDown size={14} className="text-gray-400" />
                  {isRTL ? "الجوال" : "Mobile"}
                </div>
              </th>
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100 text-center">
                {isRTL ? "إجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <td className="p-4 font-bold text-gray-900">{emp.firstName}</td>
                <td className="p-4 font-bold text-gray-900">{emp.lastName}</td>
                <td className="p-4 text-gray-600">{emp.email || "---"}</td>
                <td className="p-4 text-gray-600">{emp.phone || "---"}</td>
                <td className="p-4 text-center">
                  <Button variant="ghost" size="sm" className="text-gray-700 font-bold gap-2 hover:bg-gray-100 rounded-lg">
                    <Edit2 size={16} />
                    {isRTL ? "تعديل" : "Edit"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold">{isRTL ? "لا يوجد معلمون مطابقون للبحث" : "No matching teachers found"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;