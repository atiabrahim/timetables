"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Download, 
  Plus, 
  Edit2, 
  ArrowUpDown,
  Trash2,
  GraduationCap,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { showSuccess } from "../utils/toast";

type SortConfig = {
  key: "name" | "code" | "qualificationLevel" | null;
  direction: "asc" | "desc";
};

const Classes = () => {
  const { classes, setClasses, isRTL, user } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    qualificationLevel: ""
  });

  const isAdmin = user?.role === "Admin";

  const handleSort = (key: SortConfig["key"]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredClasses = useMemo(() => {
    let items = [...classes].filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.qualificationLevel || "").toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [classes, searchTerm, sortConfig]);

  const SortIcon = ({ column }: { column: SortConfig["key"] }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-gray-300" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} className="text-emerald-600" /> : <ChevronDown size={14} className="text-emerald-600" />;
  };

  const handleAddBranch = () => {
    if (!newBranch.name.trim()) return;
    const id = Math.random().toString(36).substr(2, 9);
    setClasses([...classes, { id, ...newBranch }]);
    setNewBranch({ name: "", code: "", qualificationLevel: "" });
    showSuccess(isRTL ? "تم إضافة الفرع بنجاح" : "Branch added successfully");
  };

  const deleteClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
    showSuccess(isRTL ? "تم حذف الفرع" : "Branch deleted");
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
              placeholder={isRTL ? "بحث عن فرع..." : "Search branch..."} 
              className="pl-10 rounded-xl border-gray-200 bg-white h-11 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="text-right order-1 md:order-2 w-full md:w-auto">
          <h2 className="text-3xl font-black text-gray-900">
            {isRTL ? "الفروع" : "Branches"} 
            <span className="text-gray-400 text-xl mr-2">({sortedAndFilteredClasses.length})</span>
          </h2>
        </div>
      </div>

      {/* Add Section (Admin Only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase px-1">{isRTL ? "اسم الفرع" : "Branch Name"}</label>
            <Input 
              value={newBranch.name} 
              onChange={e => setNewBranch({...newBranch, name: e.target.value})}
              placeholder={isRTL ? "مثلاً: تقني رياضي" : "e.g. Technical Math"}
              className="rounded-xl border-gray-200 h-11"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase px-1">{isRTL ? "الرمز" : "Code"}</label>
            <Input 
              value={newBranch.code} 
              onChange={e => setNewBranch({...newBranch, code: e.target.value})}
              placeholder={isRTL ? "مثلاً: TM" : "e.g. TM"}
              className="rounded-xl border-gray-200 h-11"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase px-1">{isRTL ? "مستوى التأهيل" : "Qualification Level"}</label>
            <Input 
              value={newBranch.qualificationLevel} 
              onChange={e => setNewBranch({...newBranch, qualificationLevel: e.target.value})}
              placeholder={isRTL ? "مثلاً: تقني سامي" : "e.g. Senior Tech"}
              className="rounded-xl border-gray-200 h-11"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddBranch} className="w-full bg-[#064e3b] hover:bg-[#053a2c] rounded-xl h-11 font-bold">
              <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {isRTL ? "إضافة فرع" : "Add Branch"}
            </Button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-[#f9f9f1]">
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center justify-end gap-2">
                  <SortIcon column="name" />
                  {isRTL ? "اسم الفرع" : "Branch Name"}
                </div>
              </th>
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                onClick={() => handleSort("code")}
              >
                <div className="flex items-center justify-end gap-2">
                  <SortIcon column="code" />
                  {isRTL ? "الرمز" : "Code"}
                </div>
              </th>
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                onClick={() => handleSort("qualificationLevel")}
              >
                <div className="flex items-center justify-end gap-2">
                  <SortIcon column="qualificationLevel" />
                  {isRTL ? "مستوى التأهيل" : "Qualification Level"}
                </div>
              </th>
              <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 text-center">
                {isRTL ? "إجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredClasses.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                <td className="p-5">
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-bold text-emerald-950">{cls.name}</span>
                    <GraduationCap size={16} className="text-emerald-500" />
                  </div>
                </td>
                <td className="p-5">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-black uppercase">
                    {cls.code || "---"}
                  </span>
                </td>
                <td className="p-5 text-gray-600 font-medium">{cls.qualificationLevel || "---"}</td>
                <td className="p-5 text-center flex justify-center gap-2">
                  <Button variant="ghost" size="sm" className="text-emerald-700 font-bold gap-2 hover:bg-emerald-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={16} />
                  </Button>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteClass(cls.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedAndFilteredClasses.length === 0 && (
          <div className="text-center py-24 bg-gray-50/30">
            <p className="text-gray-400 font-bold">{isRTL ? "لا توجد فروع مطابقة" : "No matching branches found"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;