"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Plus, 
  Edit2, 
  ArrowUpDown,
  Trash2,
  GraduationCap,
  ChevronUp,
  ChevronDown,
  Printer,
  Eye,
  X
} from "lucide-react";
import { showSuccess } from "../utils/toast";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import OfficialPrintWrapper from "../shared/OfficialPrintWrapper";
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
  
  const [newBranch, setNewBranch] = useState({ name: "", code: "", qualificationLevel: "" });
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const PrintableTable = () => (
    <table className="w-full border-collapse border-2 border-slate-950 text-sm">
      <thead>
        <tr className="bg-slate-100 border-b-2 border-slate-950">
          <th className="p-3 border-e-2 border-slate-950 text-center font-black w-12">#</th>
          <th className={cn("p-3 border-e-2 border-slate-950 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "اسم الفرع" : "Branch Name"}</th>
          <th className="p-3 border-e-2 border-slate-950 text-center font-black w-32">{isRTL ? "الرمز" : "Code"}</th>
          <th className={cn("p-3 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "مستوى التأهيل" : "Qualification Level"}</th>
        </tr>
      </thead>
      <tbody>
        {sortedAndFilteredClasses.map((cls, idx) => (
          <tr key={cls.id} className="border-b border-slate-950">
            <td className="p-3 border-e border-slate-950 text-center font-bold">{idx + 1}</td>
            <td className="p-3 border-e border-slate-950 font-bold text-slate-900">{cls.name}</td>
            <td className="p-3 border-e border-slate-950 text-center font-medium">{cls.code || "---"}</td>
            <td className="p-3 text-slate-700">{cls.qualificationLevel || "---"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={isRTL ? "الفروع والأفواج" : "Branches & Classes"}
        subtitle={isRTL ? "إدارة الفروع الدراسية ومستويات التأهيل" : "Manage academic branches and qualification levels"}
        icon={GraduationCap}
        isRTL={isRTL}
      >
        <Button variant="outline" onClick={() => setIsPreviewOpen(true)} className="rounded-xl border-slate-200 gap-2 font-bold text-slate-700 bg-white">
          <Eye size={18} />
          {isRTL ? "معاينة الطباعة" : "Print Preview"}
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="rounded-xl border-slate-200 gap-2 font-bold text-slate-700 bg-white">
          <Printer size={18} />
          {isRTL ? "طباعة القائمة" : "Print List"}
        </Button>
        <div className="relative w-full md:w-64">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-3" : "left-3")} size={16} />
          <Input 
            placeholder={isRTL ? "بحث عن فرع..." : "Search branch..."} 
            className={cn("rounded-xl border-slate-200 bg-white h-10", isRTL ? "pr-10" : "pl-10")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PageHeader>

      {/* Add Section (Admin Only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-50 items-end print:hidden">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "اسم الفرع" : "Branch Name"}</label>
            <Input 
              value={newBranch.name} 
              onChange={e => setNewBranch({...newBranch, name: e.target.value})}
              placeholder={isRTL ? "مثلاً: تقني رياضي" : "e.g. Technical Math"}
              className="rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "الرمز" : "Code"}</label>
            <Input 
              value={newBranch.code} 
              onChange={e => setNewBranch({...newBranch, code: e.target.value})}
              placeholder={isRTL ? "مثلاً: TM" : "e.g. TM"}
              className="rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "مستوى التأهيل" : "Qualification Level"}</label>
            <Input 
              value={newBranch.qualificationLevel} 
              onChange={e => setNewBranch({...newBranch, qualificationLevel: e.target.value})}
              placeholder={isRTL ? "مثلاً: تقني سامي" : "e.g. Senior Tech"}
              className="rounded-xl h-12"
            />
          </div>
          <Button onClick={handleAddBranch} className="w-full bg-emerald-950 hover:bg-black text-white rounded-xl h-12 font-black shadow-lg shadow-emerald-100">
            <Plus size={18} className="me-2" />
            {isRTL ? "إضافة فرع" : "Add Branch"}
          </Button>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm print:hidden">
        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead className="bg-slate-50/50">
            <tr>
              <th 
                className="p-5 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  {isRTL ? "اسم الفرع" : "Branch Name"}
                  <SortIcon column="name" />
                </div>
              </th>
              <th 
                className="p-5 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100 cursor-pointer"
                onClick={() => handleSort("code")}
              >
                <div className="flex items-center gap-2">
                  {isRTL ? "الرمز" : "Code"}
                  <SortIcon column="code" />
                </div>
              </th>
              <th 
                className="p-5 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100 cursor-pointer"
                onClick={() => handleSort("qualificationLevel")}
              >
                <div className="flex items-center gap-2">
                  {isRTL ? "مستوى التأهيل" : "Qualification Level"}
                  <SortIcon column="qualificationLevel" />
                </div>
              </th>
              <th className="p-5 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100 text-center print:hidden">
                {isRTL ? "إجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedAndFilteredClasses.map((cls) => (
              <tr key={cls.id} className="group hover:bg-emerald-50/30 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                      <GraduationCap size={18} />
                    </div>
                    <span className="font-black text-slate-900">{cls.name}</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                    {cls.code || "---"}
                  </span>
                </td>
                <td className="p-5 text-slate-600 font-bold text-sm">{cls.qualificationLevel || "---"}</td>
                <td className="p-5 text-center print:hidden">
                  <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      onClick={() => handleEditClick(cls)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-400 hover:bg-red-50 rounded-lg"
                        onClick={() => deleteClass(cls.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedAndFilteredClasses.length === 0 && (
          <div className="text-center py-24 bg-slate-50/30">
            <p className="text-slate-400 font-bold">{isRTL ? "لا توجد فروع مطابقة" : "No matching branches found"}</p>
          </div>
        )}
      </div>

      {/* Print Content Master */}
      <div className="print-content-master hidden print:block">
        <OfficialPrintWrapper
          title={isRTL ? "قائمة الفروع والأفواج الدراسية" : "Branches & Classes List"}
          subtitle={
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <span>{isRTL ? `إجمالي الفروع: ${classes.length}` : `Total Branches: ${classes.length}`}</span>
            </div>
          }
        >
          <PrintableTable />
        </OfficialPrintWrapper>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-3xl">
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

      {/* Print Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden rounded-[2.5rem] p-0 border-none bg-emerald-50/30 flex flex-col">
          <div className="bg-white p-6 border-b border-emerald-100 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <Printer className="text-emerald-600" />
              <h3 className="font-black text-emerald-900">{isRTL ? "معاينة طباعة قائمة الفروع" : "Branches List Print Preview"}</h3>
            </div>
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-slate-500"><X size={20} /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-950/10 print:bg-white print:p-0">
            <div className="w-[210mm] min-h-[297mm]">
              <OfficialPrintWrapper
                title={isRTL ? "قائمة الفروع والأفواج الدراسية" : "Branches & Classes List"}
                subtitle={
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <span>{isRTL ? `إجمالي الفروع: ${classes.length}` : `Total Branches: ${classes.length}`}</span>
                  </div>
                }
              >
                <PrintableTable />
              </OfficialPrintWrapper>
            </div>
          </div>
          <DialogFooter className="bg-white p-6 border-t border-emerald-100 shrink-0">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-xl px-8 h-12 font-bold">{t.cancel}</Button>
            <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-12 h-12 font-black shadow-lg shadow-emerald-100 text-white">
              <Printer size={20} className="mr-2" /> {t.print}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Classes;