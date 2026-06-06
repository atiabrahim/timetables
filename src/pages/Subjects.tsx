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
  BookOpen,
  ChevronUp,
  ChevronDown,
  Languages,
  Sparkles,
  Loader2,
  Printer,
  Eye,
  X
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import OfficialPrintWrapper from "../components/shared/OfficialPrintWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

  const SortIcon = ({ column }: { column: SortConfig["key"] }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={12} className="text-gray-300" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={12} className="text-emerald-600" /> : <ChevronDown size={12} className="text-emerald-600" />;
  };

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
          <th className="p-3 border-e-2 border-slate-950 text-center font-black w-12">#</th>
          <th className={cn("p-3 border-e-2 border-slate-950 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "اسم المادة" : "Subject Name"}</th>
          <th className={cn("p-3 font-black", isRTL ? "text-right" : "text-left")}>{isRTL ? "التسمية بالإنجليزية" : "English Name"}</th>
        </tr>
      </thead>
      <tbody>
        {sortedAndFilteredSubjects.map((sub, idx) => (
          <tr key={sub.id} className="border-b border-slate-950">
            <td className="p-3 border-e border-slate-950 text-center font-bold">{idx + 1}</td>
            <td className="p-3 border-e border-slate-950 font-bold text-slate-900">{sub.name}</td>
            <td className="p-3 text-slate-700">{sub.nameEn || "---"}</td>
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

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm print:hidden">
        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-slate-50">
              <th className={cn("p-2 text-slate-700 font-black text-[10px] uppercase border border-slate-200 cursor-pointer", isRTL ? "text-right" : "text-left")} onClick={() => handleSort("name")}>
                <div className="flex items-center gap-2">
                  {isRTL ? "اسم المادة" : "Subject Name"}
                  <SortIcon column="name" />
                </div>
              </th>
              <th className={cn("p-2 text-slate-700 font-black text-[10px] uppercase border border-slate-200 cursor-pointer", isRTL ? "text-right" : "text-left")} onClick={() => handleSort("nameEn")}>
                <div className="flex items-center gap-2">
                  {isRTL ? "التسمية بالإنجليزية" : "English Name"}
                  <SortIcon column="nameEn" />
                </div>
              </th>
              {isAdmin && (
                <th className="p-2 text-slate-700 font-black text-[10px] uppercase border border-slate-200 text-center w-24">
                  {isRTL ? "إجراءات" : "Actions"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredSubjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-emerald-50/30 transition-colors group">
                <td className="p-1 border border-slate-100">
                  <div className={cn("flex items-center gap-2 px-2", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <span className="font-bold text-emerald-900 text-xs">{sub.name}</span>
                    <BookOpen size={12} className="text-emerald-500 shrink-0" />
                  </div>
                </td>
                <td className="p-1 border border-slate-100">
                  <div className={cn("flex items-center gap-2 px-2 text-slate-600 text-xs font-medium", isRTL ? "flex-row" : "flex-row-reverse justify-end")}>
                    <span>{sub.nameEn || "---"}</span>
                    {sub.nameEn && <Languages size={12} className="text-slate-400 shrink-0" />}
                  </div>
                </td>
                {isAdmin && (
                  <td className="p-1 border border-slate-100 text-center">
                    <div className="flex justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-emerald-600 hover:bg-emerald-50 rounded-md"
                        onClick={() => handleEditClick(sub)}
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-400 hover:bg-red-50 rounded-md"
                        onClick={() => deleteSubject(sub.id)}
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
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950 flex items-center gap-2">
              <Plus size={20} className="text-emerald-600" />
              {isRTL ? "إضافة مادة جديدة" : "Add New Subject"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-800">{isRTL ? "اسم المادة" : "Subject Name"}</label>
              <Input 
                value={newSubject.name} 
                onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                placeholder={isRTL ? "مثلاً: الرياضيات" : "e.g. Mathematics"}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "التسمية بالإنجليزية" : "English Name"}</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-6 text-emerald-500 hover:text-emerald-600 gap-1 text-xs", isTranslating && "animate-spin")}
                  onClick={() => fetchGoogleTranslation(newSubject.name, "new")}
                  disabled={isTranslating}
                >
                  {isTranslating ? <Loader2 size={12} /> : <Sparkles size={12} />}
                  {isRTL ? "ترجمة قوقل" : "Google Translate"}
                </Button>
              </div>
              <Input 
                value={newSubject.nameEn} 
                onChange={e => setNewSubject({...newSubject, nameEn: e.target.value})}
                placeholder="English Name"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">{t.cancel}</Button>
            <Button onClick={handleAddSubject} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white">{isRTL ? "إضافة" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950">{isRTL ? "تعديل المادة" : "Edit Subject"}</DialogTitle>
          </DialogHeader>
          {editingSubject && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">{isRTL ? "اسم المادة" : "Subject Name"}</label>
                <Input 
                  value={editingSubject.name} 
                  onChange={e => setEditingSubject({...editingSubject, name: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-emerald-800">{isRTL ? "التسمية بالإنجليزية" : "English Name"}</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn("h-6 text-emerald-500 hover:text-emerald-600 gap-1 text-xs", isTranslating && "animate-spin")}
                    onClick={() => fetchGoogleTranslation(editingSubject.name, "edit")}
                    disabled={isTranslating}
                  >
                    {isTranslating ? <Loader2 size={12} /> : <Sparkles size={12} />}
                    {isRTL ? "ترجمة قوقل" : "Google Translate"}
                  </Button>
                </div>
                <Input 
                  value={editingSubject.nameEn || ""} 
                  onChange={e => setEditingSubject({...editingSubject, nameEn: e.target.value})}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">{t.cancel}</Button>
            <Button onClick={handleUpdateSubject} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white">{isRTL ? "حفظ" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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