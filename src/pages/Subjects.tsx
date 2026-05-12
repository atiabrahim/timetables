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
  ChevronDown
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
  key: "name" | null;
  direction: "asc" | "desc";
};

const Subjects = () => {
  const { subjects, setSubjects, isRTL, user, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  
  const [newSubjectName, setNewSubjectName] = useState("");
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        const aValue = a.name.toLowerCase();
        const bValue = b.name.toLowerCase();
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

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const id = Math.random().toString(36).substr(2, 9);
    setSubjects([...subjects, { id, name: newSubjectName }]);
    setNewSubjectName("");
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

      {isAdmin && (
        <div className="flex gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <Input 
            value={newSubjectName} 
            onChange={e => setNewSubjectName(e.target.value)}
            placeholder={isRTL ? "اسم المادة الجديدة..." : "New subject name..."}
            className={cn("rounded-xl border-gray-200 h-11", isRTL ? "text-right" : "text-left")}
          />
          <Button onClick={handleAddSubject} className="bg-[#064e3b] hover:bg-[#053a2c] rounded-xl px-6 h-11 font-bold">
            <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "إضافة" : "Add"}
          </Button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
          <thead>
            <tr className="bg-[#f9f9f1]">
              <th 
                className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                  <SortIcon column="name" />
                  {isRTL ? "اسم المادة" : "Subject Name"}
                </div>
              </th>
              <th className="p-5 text-gray-700 font-bold text-sm border-b border-gray-100 text-center">
                {isRTL ? "إجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredSubjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                <td className="p-5">
                  <div className={cn("flex items-center gap-3", isRTL ? "justify-start" : "flex-row-reverse justify-end")}>
                    <span className="font-bold text-emerald-950">{sub.name}</span>
                    <BookOpen size={16} className="text-emerald-500" />
                  </div>
                </td>
                <td className="p-5 text-center">
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-emerald-700 font-bold gap-2 hover:bg-emerald-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEditClick(sub)}
                    >
                      <Edit2 size={16} />
                      {isRTL ? "تعديل" : "Edit"}
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteSubject(sub.id)}
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
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-950">
              {isRTL ? "تعديل المادة" : "Edit Subject"}
            </DialogTitle>
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
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button onClick={handleUpdateSubject} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
              {isRTL ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subjects;