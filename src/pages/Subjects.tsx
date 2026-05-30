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
  BookOpen,
  ChevronUp,
  ChevronDown,
  Languages,
  Sparkles,
  Loader2
} from "lucide-react";
import { showSuccess, showError } from "../utils/toast";
import { cn } from "@/lib/utils";
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

  /**
   * وظيفة جلب الترجمة باستخدام محرك Google Translate العام (client=gtx)
   */
  const fetchGoogleTranslation = async (text: string, target: "new" | "edit") => {
    if (!text.trim()) {
      showError(isRTL ? "يرجى كتابة اسم المادة بالعربي أولاً" : "Please enter Arabic name first");
      return;
    }

    setIsTranslating(true);
    try {
      // استخدام محرك Google Translate العام المتاح للاستخدام المباشر
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // استخراج النص المترجم من مصفوفة Google المعقدة
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto order-2 md:order-1">
          <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-bold text-gray-700">
            <Download size={18} />
            {isRTL ? "تصدير PDF" : "Export PDF"}
          </Button>
          <div className="relative flex-1 md:w-80">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-3" : "left-3")} size={16} />
            <Input 
              placeholder={isRTL ? "بحث عن مادة..." : "Search subject..."} 
              className={cn("rounded-xl border-gray-200 bg-white h-11", isRTL ? "pr-10 text-right" : "pl-10 text-left")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={cn("order-1 md:order-2 w-full md:w-auto", isRTL ? "text-right" : "text-left")}>
          <h2 className="text-3xl font-black text-gray-900">
            {isRTL ? "المواد" : "Subjects"} 
            <span className="text-gray-400 text-xl mx-2">({sortedAndFilteredSubjects.length})</span>
          </h2>
        </div>
      </div>

      {/* Add Section (Admin Only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-700 uppercase px-1">{isRTL ? "اسم المادة" : "Subject Name"}</label>
            <Input 
              value={newSubject.name} 
              onChange={e => setNewSubject({...newSubject, name: e.target.value})}
              placeholder={isRTL ? "مثلاً: الرياضيات" : "e.g. Mathematics"}
              className={cn("rounded-xl border-gray-200 h-11", isRTL ? "text-right" : "text-left")}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-emerald-700 uppercase">{isRTL ? "التسمية بالإنجليزية" : "English Name"}</label>
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
              placeholder={isRTL ? "English Name" : "English Name"}
              className={cn("rounded-xl border-gray-200 h-11", isRTL ? "text-right" : "text-left")}
            />
          </div>
          <div className="md:col-span-2">
            <Button onClick={handleAddSubject} className="w-full bg-[#064e3b] hover:bg-[#053a2c] rounded-xl h-11 font-bold">
              <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {isRTL ? "إضافة مادة" : "Add Subject"}
            </Button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <table className={cn("w-full border-collapse border border-gray-200", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-[#f9f9f1]">
              <th className="py-1.5 px-3 text-gray-700 font-bold text-xs border border-gray-200 cursor-pointer" onClick={() => handleSort("name")}>
                <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                  <SortIcon column="name" />
                  {isRTL ? "اسم المادة" : "Subject Name"}
                </div>
              </th>
              <th className="py-1.5 px-3 text-gray-700 font-bold text-xs border border-gray-200 cursor-pointer" onClick={() => handleSort("nameEn")}>
                <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                  <SortIcon column="nameEn" />
                  {isRTL ? "التسمية بالإنجليزية" : "English Name"}
                </div>
              </th>
              <th className="py-1.5 px-3 text-gray-700 font-bold text-xs border border-gray-200 text-center w-24">
                {isRTL ? "إجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredSubjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors group">
                <td className="py-1 px-3 border border-gray-200 align-middle">
                  <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                    <span className="font-bold text-emerald-950 text-sm">{sub.name}</span>
                    <BookOpen size={14} className="text-emerald-500 shrink-0" />
                  </div>
                </td>
                <td className="py-1 px-3 border border-gray-200 align-middle">
                  <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                    <span className="text-gray-600 font-medium text-sm">{sub.nameEn || "---"}</span>
                    <Languages size={12} className="text-gray-400 shrink-0" />
                  </div>
                </td>
                <td className="py-1 px-3 border border-gray-200 text-center align-middle">
                  <div className="flex justify-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-emerald-700 font-bold gap-1 hover:bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      onClick={() => handleEditClick(sub)}
                    >
                      <Edit2 size={12} />
                      {isRTL ? "تعديل" : "Edit"}
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteSubject(sub.id)}
                      >
                        <Trash2 size={12} />
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
        <DialogContent className="sm:max-w-md rounded-3xl">
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