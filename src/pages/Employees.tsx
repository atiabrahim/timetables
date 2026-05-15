"use client";

import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Edit2, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Employee } from "../types";

type SortConfig = {
  key: keyof Employee | null;
  direction: "asc" | "desc";
};

const Employees = () => {
  const { employees, isRTL } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });

  const handleSort = (key: keyof Employee) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const sortedEmployees = useMemo(() => {
    let items = [...employees].filter(emp => 
      `${emp.firstName} ${emp.lastName} ${emp.email || ""} ${emp.phone || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      items.sort((a, b) => {
        const aVal = String(a[sortConfig.key!] || "").toLowerCase();
        const bVal = String(b[sortConfig.key!] || "").toLowerCase();
        return sortConfig.direction === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      });
    }
    return items;
  }, [employees, searchTerm, sortConfig]);

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-[#f9f9f1]">
              {["firstName", "lastName", "email", "phone"].map((key) => (
                <th 
                  key={key}
                  className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                  onClick={() => handleSort(key as keyof Employee)}
                >
                  <div className="flex items-center justify-end gap-2">
                    {sortConfig.key === key ? (
                      sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    ) : <ArrowUpDown size={14} className="text-gray-300" />}
                    {isRTL ? (key === "firstName" ? "الاسم الأول" : key === "lastName" ? "اسم العائلة" : key === "email" ? "البريد" : "الجوال") : key}
                  </div>
                </th>
              ))}
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
      </div>
    </div>
  );
};

export default Employees;