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
  Printer
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
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
  const [isTranslating, setIsTranslating] = useState(false);

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
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-gray-300" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} className="text-emerald-600" /> : <ChevronDown size={14} className="text-emerald-600" />;
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
    if (!newSubject.name.trim()) return;
    const id = Math.random().toString(36).substr(2, 9);
    setSubjects([...subjects, { id, ...newSubject }]);
    setNewSubject({ name: "", nameEn: "" });
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={isRTL ? "المواد الدراسية" : "Subjects"}
        subtitle={isRTL ? "إدارة المناهج والمواد التعليمية" : "Manage curricula and educational subjects"}
        icon={BookOpen}
        isRTL={isRTL}
      >
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

      {/* Add Section (Admin Only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-50 items-end print:hidden">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-1">{isRTL ? "اسم المادة" : "Subject Name"}</label>
            <Input 
              value={newSubject.name} 
              onChange={e => setNewSubject({...newSubject, name: e.target.value})}
              placeholder={isRTL ? "مثلاً: الرياضيات" : "e.g. Mathematics"}
              className="rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{isRTL ? "التسمية بالإنجليزية" : "English Name"}</label>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-4 w-4 text-emerald-600 hover:text-emerald-700", isTranslating && "animate-spin")}
                onClick={() => fetchGoogleTranslation(newSubject.name, "new")}
                disabled={isTranslating}
                title={isRTL ? "ترجمة قوقل الذكية" : "Google Smart Translate"}
              >
                {isTranslating ? <Loader2 size={12} /> : <Sparkles size={12} />}
              </Button>
            </div>
            <Input 
              value={newSubject.nameEn} 
              onChange={e => setNewSubject({...newSubject, nameEn: e.target.value})}
              placeholder="English Name"
              className="rounded-xl h-12"
            />
          </div>
          <div className="md:col-span-2">
            <Button onClick={handleAddSubject} className="w-full bg-emerald-950 hover:bg-black text-white rounded-xl h-12 font-black shadow-lg shadow-emerald-100">
              <Plus size={18} className="me-2" />
              {isRTL ? "إضافة مادة" : "Add Subject"}
            </Button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm print:border-0 print:shadow-none">
        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead className="bg-slate-50/50">
            <tr>
              <th className="p-5 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100 cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-2">
                  {isRTL ? "اسم المادة" : "Subject Name"}
                  <SortIcon column="name" />
                </div>
              </th>
              <th className="p-5 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100 cursor-pointer" onClick={() => handleSort("nameEn")}>
                <div className="flex items-center gap-2">
                  {isRTL ? "التسمية بالإنجليزية" : "English Name"}
                  <SortIcon column="nameEn" />
                </div>
              </th>
              <th className="p-5 text-slate-900 font-black text-xs uppercase tracking-widest border-b border-slate-100 text-center w-24 print:hidden">
                {isRTL ? "إجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedAndFilteredSubjects.map((sub) => (
              <tr key={sub.id} className="group hover:bg-emerald-50/30 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                      <BookOpen size={18} />
                    </div>
                    <span className="font-black text-slate-900">{sub.name}</span>
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold text-sm">{sub.nameEn || "---"}</span>
                    {sub.nameEn && <Languages size={14} className="text-slate-400" />}
                  </div>
                </td>
                <td className="p-5 text-center print:hidden">
                  <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      onClick={() => handleEditClick(sub)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-400 hover:bg-red-50 rounded-lg"
                        onClick={() => deleteSubject(sub.id)}
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
      </div>

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
            <Button onClick={handleUpdateSubject} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">{isRTL ? "حفظ" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subjects;