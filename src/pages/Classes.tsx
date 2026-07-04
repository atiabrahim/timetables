"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Plus, Printer, Eye, X
} from "lucide-react";
import { showSuccess } from "../utils/toast";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import ClassTable from "../components/classes/ClassTable";
import AddClassDialog from "../components/classes/AddClassDialog";
import EditClassDialog from "../components/classes/EditClassDialog";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

type SortConfig = {
  key: "name" | "code" | "qualificationLevel" | "studentCount" | null;
  direction: "asc" | "desc";
};

const Classes = () => {
  const { classes, setClasses, isRTL, user, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  
  const [newBranch, setNewBranch] = useState({ name: "", code: "", qualificationLevel: "", studentCount: 20 });
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  const handleAddBranch = () => {
    if (!newBranch.name.trim()) return;
    const id = Math.random().toString(36).substr(2, 9);
    setClasses([...classes, { id, ...newBranch }]);
    setNewBranch({ name: "", code: "", qualificationLevel: "", studentCount: 20 });
    setIsAddDialogOpen(false);
    showSuccess(isRTL ? "تم إضافة الفرع بنجاح" : "Branch added successfully");
  };

  const handleEditClick = (cls: any) => {
    setEditingBranch({ ...cls, studentCount: cls.studentCount || 20 });
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
    <table className="w-full border-collapse border-2 border-slate-950 text-xs">
      <thead>
        <tr className="bg-slate-100 border-b-2 border-slate-950">
          <th className="p-1.5 border-e-2 border-slate-950 text-center font-black w-12">#</th>
          <th className={cn("p-1.5 border-e-2 border-slate-950 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "اسم الفرع" : "Branch Name"}</th>
          <th className="p-1.5 border-e-2 border-slate-950 text-center font-black w-24">{isRTL ? "الرمز" : "Code"}</th>
          <th className="p-1.5 border-e-2 border-slate-950 text-center font-black w-24">{isRTL ? "العدد" : "Students"}</th>
          <th className={cn("p-1.5 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "مستوى التأهيل" : "Qualification Level"}</th>
        </tr>
      </thead>
      <tbody>
        {sortedAndFilteredClasses.map((cls, idx) => (
          <tr key={cls.id} className="border-b border-slate-950">
            <td className="p-1.5 border-e border-slate-950 text-center font-bold">{idx + 1}</td>
            <td className="p-1.5 border-e border-slate-950 font-bold text-slate-900">{cls.name}</td>
            <td className="p-1.5 border-e border-slate-950 text-center font-medium">{cls.code || "---"}</td>
            <td className="p-1.5 border-e border-slate-950 text-center font-medium">{cls.studentCount || "---"}</td>
            <td className="p-1.5 text-slate-700">{cls.qualificationLevel || "---"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={isRTL ? "الفروع والأفواج" : "Branches & Classes"}
        subtitle={isRTL ? "إدارة الفروع الدراسية ومستويات التأهيل مع تعداد الطلبة" : "Manage academic branches, qualifications and student enrollment"}
        icon={Plus}
        isRTL={isRTL}
      >
        {isAdmin && (
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold h-11"
          >
            <Plus size={18} />
            {isRTL ? "إضافة فرع جديد" : "Add New Branch"}
          </Button>
        )}
        <Button variant="outline" onClick={() => setIsPreviewOpen(true)} className="rounded-xl border-slate-200 gap-2 font-bold text-slate-700 bg-white h-11">
          <Eye size={18} />
          {isRTL ? "معاينة الطباعة" : "Print Preview"}
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="rounded-xl border-slate-200 gap-2 font-bold text-slate-700 bg-white h-11">
          <Printer size={18} />
          {isRTL ? "طباعة القائمة" : "Print List"}
        </Button>
        <div className="relative w-full md:w-64">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-3" : "left-3")} size={16} />
          <Input 
            placeholder={isRTL ? "بحث عن فرع..." : "Search branch..."} 
            className={cn("rounded-xl border-slate-200 bg-white h-11", isRTL ? "pr-10" : "pl-10")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PageHeader>

      {/* Class Table */}
      <ClassTable 
        classes={sortedAndFilteredClasses}
        isRTL={isRTL}
        isAdmin={isAdmin}
        onEdit={handleEditClick}
        onDelete={deleteClass}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

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

      {/* Add Dialog */}
      <AddClassDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        isRTL={isRTL}
        newBranch={newBranch}
        setNewBranch={setNewBranch}
        onAdd={handleAddBranch}
        cancelText={t.cancel}
      />

      {/* Edit Dialog */}
      <EditClassDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        isRTL={isRTL}
        editingBranch={editingBranch}
        setEditingBranch={setEditingBranch}
        onSave={handleUpdateBranch}
        cancelText={t.cancel}
      />

      {/* Print Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden rounded-[2.5rem] p-0 border-none bg-emerald-50/30 flex flex-col">
          <div className="bg-white p-6 border-b border-emerald-100 flex items-center justify-between sticky top-0 z-10 shrink-0 print:hidden">
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
          <DialogFooter className="bg-white p-6 border-t border-emerald-100 shrink-0 print:hidden">
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