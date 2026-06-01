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
  ChevronDown,
  X,
  Check,
  Printer
} from "lucide-react";
import { showSuccess } from "../utils/toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type SortConfig = {
  key: "name" | "code" | "qualificationLevel" | null;
  direction: "asc" | "desc";
};

const Classes = () => {
  const { classes, setClasses, isRTL, user, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  
  // حالات الإضافة والتعديل
  const [newBranch, setNewBranch] = useState({ name: "", code: "", qualificationLevel: "" });
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleEditClick = (cls: any) => {
    setEditingBranch({ ...cls });
    setIsEditDialogOpen(true);
  };

  const handleUpdateBranch = () => {
    if (!editingBranch.name.trim()) return;
    setClasses(classes.map(c => c.id === editingBranch.id ? editingBranch : c));
    setIsEditDialogOpen(false);
    showSuccess(isRTL ? "تم تحديث بيانات الفرع" : "Branch updated successfully");
  };

  const deleteClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
    showSuccess(isRTL ? "تم حذف الفرع" : "Branch deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex items-center gap-4 w-full md:w-auto order-2 md:order-1">
          <Button onClick={() => window.print()} variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700">
            <Printer size={18} />
            {isRTL ? "طباعة القائمة" : "Print List"}
          </Button>
          <div className="relative flex-1 md:w-80">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-3" : "left-3")} size={16} />
            <Input 
              placeholder={isRTL ? "بحث عن فرع..." : "Search branch..."} 
              className={cn("rounded-xl border-gray-200 bg-white h-11", isRTL ? "pr-10 text-right" : "pl-10 text-left")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={cn("order-1 md:order-2 w-full md:w-auto", isRTL ? "text-right" : "text-left")}>
          <h2 className="text-3xl font-black text-gray-900">
            {isRTL ? "الفروع" : "Branches"} 
            <span className="text-gray-400 text-xl mx-2">({sortedAndFilteredClasses.length})</span>
          </h2>
        </div>
      </div>

      {/* Add Section (Admin Only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm print:hidden">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase px-1">{isRTL ? "اسم الفرع" : "Branch Name"}</label>
            <Input 
              value={newBranch.name} 
              onChange={e => setNewBranch({...newBranch, name: e.target.value})}
              placeholder={isRTL ? "مثلاً: تقني رياضي" : "e.g. Technical Math"}
              className={cn("rounded-xl border-gray-200 h-11", isRTL ? "text-right" : "text-left")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase px-1">{isRTL ? "الرمز" : "Code"}</label>
            <Input 
              value={newBranch.code} 
              onChange={e => setNewBranch({...newBranch, code: e.target.value})}
              placeholder={isRTL ? "مثلاً: TM" : "e.g. TM"}
              className={cn("rounded-xl border-gray-200 h-11", isRTL ? "text-right" : "text-left")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase px-1">{isRTL ? "مستوى التأهيل" : "Qualification Level"}</label>
            <Input 
              value={newBranch.qualificationLevel} 
              onChange={e => setNewBranch({...newBranch, qualificationLevel: e.target.value})}
              placeholder={isRTL ? "مثلاً: تقني سامي" : "e.g. Senior Tech"}
              className={cn("rounded-xl border-gray-200 h-11", isRTL ? "text-right" : "text-left")}
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
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm print:border-0 print:shadow-none">
        {/* Print Header */}
        <div className="hidden print:block text-center mb-6 border-b-2 border-emerald-950 pb-4">
          <h1 className="text-2xl font-black text-emerald-950">{isRTL ? "قائمة الفروع والأفواج" : "Branches & Classes List"}</h1>
          <p className="text-sm text-gray-600 mt-1">{isRTL ? "نظام EduSchedule لإدارة الجداول" : "EduSchedule Management System"}</p>
        </div>

        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-[#f9f9f1] print:bg-transparent print:border-b-2 print:border-emerald-950">
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors print:p-2 print:text-black print:border-b-2 print:border-emerald-950"
                onClick={() => handleSort("name")}
              >
                <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                  <SortIcon column="name" />
                  {isRTL ? "اسم الفرع" : "Branch Name"}
                </div>
              </th>
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors print:p-2 print:text-black print:border-b-2 print:border-emerald-950"
                onClick={() => handleSort("code")}
              >
                <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                  <SortIcon column="code" />
                  {isRTL ? "الرمز" : "Code"}
                </div>
              </th>
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors print:p-2 print:text-black print:border-b-2 print:border-emerald-950"
                onClick={() => handleSort("qualificationLevel")}
              >
                <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                  <SortIcon column="qualificationLevel" />
                  {isRTL ? "مستوى التأهيل" : "Qualification Level"}
                </div>
              </th>
              <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 text-center print:hidden">
                {isRTL ? "إجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredClasses.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group print:border-b print:border-gray-300">
                <td className="p-5 print:p-2">
                  <div className={cn("flex items-center gap-3", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                    <span className="font-bold text-emerald-950 print:text-black">{cls.name}</span>
                    <GraduationCap size={16} className="text-emerald-500 print:hidden" />
                  </div>
                </td>
                <td className="p-5 print:p-2">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-black uppercase print:bg-transparent print:p-0 print:text-black">
                    {cls.code || "---"}
                  </span>
                </td>
                <td className="p-5 text-gray-600 font-medium print:p-2 print:text-black">{cls.qualificationLevel || "---"}</td>
                <td className="p-5 text-center print:hidden">
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-emerald-700 font-bold gap-2 hover:bg-emerald-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEditClick(cls)}
                    >
                      <Edit2 size={16} />
                      {isRTL ? "تعديل" : "Edit"}
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
                  </div>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950">
              {isRTL ? "تعديل بيانات الفرع" : "Edit Branch Details"}
            </DialogTitle>
          </DialogHeader>
          {editingBranch && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "اسم الفرع" : "Branch Name"}</label>
                <Input 
                  value={editingBranch.name} 
                  onChange={e => setEditingBranch({...editingBranch, name: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "الرمز" : "Code"}</label>
                <Input 
                  value={editingBranch.code} 
                  onChange={e => setEditingBranch({...editingBranch, code: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "مستوى التأهيل" : "Qualification Level"}</label>
                <Input 
                  value={editingBranch.qualificationLevel} 
                  onChange={e => setEditingBranch({...editingBranch, qualificationLevel: e.target.value})}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button onClick={handleUpdateBranch} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
              {isRTL ? "حفظ التغييرات" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>
        {`
          @media print {
            body > div:not([role="dialog"]), 
            header, 
            aside, 
            form,
            .print\\:hidden {
              display: none !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
            }
            .max-w-6xl {
              max-width: 100% !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            th, td {
              border: 1px solid #000 !important;
              padding: 8px !important;
              color: #000 !important;
            }
            @page {
              size: A4 portrait;
              margin: 15mm !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Classes;