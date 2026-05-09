"use client";

import React, { useState } from "react";
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
  BookOpen
} from "lucide-react";
import { showSuccess } from "../utils/toast";

const Subjects = () => {
  const { subjects, setSubjects, isRTL, user } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  const isAdmin = user?.role === "Admin";

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const id = Math.random().toString(36).substr(2, 9);
    setSubjects([...subjects, { id, name: newSubjectName }]);
    setNewSubjectName("");
    showSuccess(isRTL ? "تم إضافة المادة بنجاح" : "Subject added successfully");
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
            <Input 
              placeholder={isRTL ? "بحث عن مادة..." : "Search subject..."} 
              className="rounded-xl border-gray-200 bg-white h-11 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="text-right order-1 md:order-2 w-full md:w-auto">
          <h2 className="text-3xl font-black text-gray-900">
            {isRTL ? "المواد" : "Subjects"} 
            <span className="text-gray-400 text-xl mr-2">({subjects.length})</span>
          </h2>
        </div>
      </div>

      {/* Add Section (Admin Only) */}
      {isAdmin && (
        <div className="flex gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <Input 
            value={newSubjectName} 
            onChange={e => setNewSubjectName(e.target.value)}
            placeholder={isRTL ? "اسم المادة الجديدة..." : "New subject name..."}
            className="rounded-xl border-gray-200 h-11"
          />
          <Button onClick={handleAddSubject} className="bg-[#064e3b] hover:bg-[#053a2c] rounded-xl px-6 h-11 font-bold">
            <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "إضافة" : "Add"}
          </Button>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-[#f9f9f1]">
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100">
                <div className="flex items-center justify-end gap-2">
                  <ArrowUpDown size={14} className="text-gray-400" />
                  {isRTL ? "اسم المادة" : "Subject Name"}
                </div>
              </th>
              <th className="p-4 text-gray-700 font-bold text-sm border-b border-gray-100 text-center">
                {isRTL ? "إجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <td className="p-4 font-bold text-gray-900 flex items-center justify-end gap-3">
                  {sub.name}
                  <BookOpen size={16} className="text-gray-400" />
                </td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-700 font-bold gap-2 hover:bg-gray-100 rounded-lg">
                    <Edit2 size={16} />
                  </Button>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:bg-red-50 rounded-lg"
                      onClick={() => deleteSubject(sub.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold">{isRTL ? "لا توجد مواد مطابقة" : "No matching subjects found"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;