"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Plus, 
  BookOpen, 
  Printer, 
  Eye, 
  X
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import SubjectTable from "../components/subjects/SubjectTable";
import AddSubjectDialog from "../components/subjects/AddSubjectDialog";
import EditSubjectDialog from "../components/subjects/EditSubjectDialog";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

type SortConfig = {
  key: "name" | "nameEn" | null;
  direction: "asc" | "desc";
};

const Subjects = () => {
  const { subjects, setSubjects, isRTL, user, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  
  const [newSubject, setNewSubject] = useState({ name: "", nameEn: "" });
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isAdmin = user?.role === "Admin";

  const handleSort = (key: SortConfig["key"]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredSubjects = useMemo(() => {
    let items = [...subjects].filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nameEn || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        const aValue = (a[sortConfig.key!] || "").toLowerCase();
        const bValue = (b[sortConfig.key!] || "").toLowerCase();
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [subjects, searchTerm, sortConfig]);

  const fetchGoogleTranslation = async (text: string, target: "new" | "edit") => {
    if (!text.trim()) {
      showError(isRTL ? "يرجى كتابة اسم المادة بالعربي أولاً" : "Please enter Arabic name first");
      return;
    }

    setIsTranslating(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translation = data[0][0][0];
        if (target === "new") {
          setNewSubject({ ...newSubject, nameEn: translation });
        } else {
          setEditingSubject({ ...editingSubject, nameEn: translation });
        }
        showSuccess(isRTL ? "تمت الترجمة عبر Google بنجاح" : "Translated via Google successfully");
      }
    } catch (error) {
      console.error("Translation Error:", error);
      showError(isRTL ? "فشل الاتصال بخدمة ترجمة Google" : "Failed to connect to Google Translate");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) {
      showError(isRTL ? "يرجى إدخال اسم المادة" : "Please enter subject name");
      return;
    }
    const id = Math.random().toString(36).substr(2, 9);
    setSubjects([...subjects, { id, ...newSubject }]);
    setNewSubject({ name: "", nameEn: "" });
    setIsAddDialogOpen(false);
    showSuccess(isRTL ? "تم إضافة المادة بنجاح" : "Subject added successfully");
  };

  const handleEditClick = (sub: any) => {
    setEditingSubject({ ...sub });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubject = () => {
    if (!editingSubject.name.trim()) return;
    setSubjects(subjects.map(s => s.id === editingSubject.id ? editingSubject : s));
    setIsEditDialogOpen(false);
    showSuccess(isRTL ? "تم تحديث المادة" : "Subject updated successfully");
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    showSuccess(isRTL ? "تم حذف المادة" : "Subject deleted");
  };

  const PrintableTable = () => (
    <table className="w-full border-collapse border-2 border-slate-950 text-sm">
      <thead>
        <tr className="bg-slate-100 border-b-2 border-slate-950">
          <th className="p-2 border-e-2 border-slate-950 text-center font-black w-12">#</th>
          <th className={cn("p-2 border-e-2 border-slate-950 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "اسم المادة" : "Subject Name"}</th>
          <th className={cn("p-2 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "التسمية بالإنجليزية" : "English Name"}</th>
        </tr>
      </thead>
      <tbody>
        {sortedAndFilteredSubjects.map((sub, idx) => (
          <tr key={sub.id} className="border-b border-slate-950">
            <td className="p-2 border-e border-slate-950 text-center font-bold">{idx + 1}</td>
            <td className="p-2 border-e border-slate-950 font-bold text-slate-900">{sub.name}</td>
            <td className="p-2 text-slate-700">{sub.nameEn || "---"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={isRTL ? "المواد الدراسية" : "Subjects"}
        subtitle={isRTL ? "إدارة المناهج والمواد التعليمية" : "Manage curricula and educational subjects"}
        icon={BookOpen}
        isRTL={isRTL}
      >
        {isAdmin && (
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold"
          >
            <Plus size={18} />
            {isRTL ? "إضافة مادة جديدة" : "Add New Subject"}
          </Button>
        )}
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
            placeholder={isRTL ? "بحث عن مادة..." : "Search subject..."} 
            className={cn("rounded-xl border-slate-200 bg-white h-10", isRTL ? "pr-10" : "pl-10")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PageHeader>

      {/* Subject Table */}
      <SubjectTable 
        subjects={sortedAndFilteredSubjects}
        isRTL={isRTL}
        isAdmin={isAdmin}
        onEdit={handleEditClick}
        onDelete={deleteSubject}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      {/* Print Content Master */}
      <div className="print-content-master hidden print:block">
        <OfficialPrintWrapper
          title={isRTL ? "قائمة المواد الدراسية" : "Subjects List"}
          subtitle={
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <span>{isRTL ? `إجمالي المواد: ${subjects.length}` : `Total Subjects: ${subjects.length}`}</span>
            </div>
          }
        >
          <PrintableTable />
        </OfficialPrintWrapper>
      </div>

      {/* Add Dialog */}
      <AddSubjectDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        isRTL={isRTL}
        newSubject={newSubject}
        setNewSubject={setNewSubject}
        onAdd={handleAddSubject}
        onTranslate={() => fetchGoogleTranslation(newSubject.name, "new")}
        isTranslating={isTranslating}
        cancelText={t.cancel}
      />

      {/* Edit Dialog */}
      <EditSubjectDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        isRTL={isRTL}
        editingSubject={editingSubject}
        setEditingSubject={setEditingSubject}
        onSave={handleUpdateSubject}
        onTranslate={() => fetchGoogleTranslation(editingSubject.name, "edit")}
        isTranslating={isTranslating}
        cancelText={t.cancel}
      />

      {/* Print Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden rounded-[2.5rem] p-0 border-none bg-emerald-50/30 flex flex-col">
          <div className="bg-white p-6 border-b border-emerald-100 flex items-center justify-between sticky top-0 z-10 shrink-0 print:hidden">
            <div className="flex items-center gap-3">
              <Printer className="text-emerald-600" />
              <h3 className="font-black text-emerald-900">{isRTL ? "معاينة طباعة قائمة المواد" : "Subjects List Print Preview"}</h3>
            </div>
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="text-slate-500"><X size={20} /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-950/10 print:bg-white print:p-0">
            <div className="w-[210mm] min-h-[297mm]">
              <OfficialPrintWrapper
                title={isRTL ? "قائمة المواد الدراسية" : "Subjects List"}
                subtitle={
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <span>{isRTL ? `إجمالي المواد: ${subjects.length}` : `Total Subjects: ${subjects.length}`}</span>
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

export default Subjects;