"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Download, 
  Edit2, 
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortConfig = {
  key: "firstName" | "lastName" | "email" | "phone" | null;
  direction: "asc" | "desc";
};

const Employees = () => {
  const { employees, isRTL, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });

  const handleSort = (key: SortConfig["key"]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = useMemo(() => {
    let items = [...employees].filter(emp => 
      `${emp.firstName} ${emp.lastName} ${emp.email || ""} ${emp.phone || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        const aValue = (a[sortConfig.key!] || "").toString().toLowerCase();
        const bValue = (b[sortConfig.key!] || "").toString().toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return items;
  }, [employees, searchTerm, sortConfig]);

  const SortIcon = ({ column }: { column: SortConfig["key"] }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-gray-300" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} className="text-emerald-600" /> : <ChevronDown size={14} className="text-emerald-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto order-2 md:order-1">
          <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700">
            <Download size={18} />
            {isRTL ? "تصدير PDF" : "Export PDF"}
          </Button>
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              placeholder={isRTL ? "بحث عن معلم..." : "Search teacher..."} 
              className="pl-10 rounded-xl border-gray-200 bg-white h-11 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="text-right order-1 md:order-2 w-full md:w-auto">
          <h2 className="text-3xl font-black text-gray-900">
            {isRTL ? "المعلمون" : "Teachers"} 
            <span className="text-gray-400 text-xl mr-2">({sortedEmployees.length})</span>
          </h2>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-[#f9f9f1]">
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                onClick={() => handleSort("firstName")}
              >
                <div className="flex items-center justify-end gap-2">
                  <SortIcon column="firstName" />
                  {isRTL ? "الاسم الأول" : "First Name"}
                </div>
              </th>
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                onClick={() => handleSort("lastName")}
              >
                <div className="flex items-center justify-end gap-2">
                  <SortIcon column="lastName" />
                  {isRTL ? "اسم العائلة" : "Last Name"}
                </div>
              </th>
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center justify-end gap-2">
                  <SortIcon column="email" />
                  {isRTL ? "البريد الإلكتروني" : "Email"}
                </div>
              </th>
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                onClick={() => handleSort("phone")}
              >
                <div className="flex items-center justify-end gap-2">
                  <SortIcon column="phone" />
                  {isRTL ? "الجوال" : "Mobile"}
                </div>
              </th>
              <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 text-center">
                {isRTL ? "إجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                <td className="p-5 font-bold text-emerald-950">{emp.firstName}</td>
                <td className="p-5 font-bold text-emerald-950">{emp.lastName}</td>
                <td className="p-5 text-gray-600 text-sm">{emp.email || "---"}</td>
                <td className="p-5 text-gray-600 text-sm">{emp.phone || "---"}</td>
                <td className="p-5 text-center">
                  <Button variant="ghost" size="sm" className="text-emerald-700 font-bold gap-2 hover:bg-emerald-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={16} />
                    {isRTL ? "تعديل" : "Edit"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedEmployees.length === 0 && (
          <div className="text-center py-24 bg-gray-50/30">
            <p className="text-gray-400 font-bold">{isRTL ? "لا يوجد معلمون مطابقون للبحث" : "No matching teachers found"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;