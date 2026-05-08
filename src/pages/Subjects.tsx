"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Trash2, 
  Edit2
} from "lucide-react";
import { showSuccess } from "../utils/toast";
import { cn } from "@/lib/utils";

const Subjects = () => {
  const { subjects, setSubjects, isRTL, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubject = () => {
    if (!newSubjectName) return;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">{isRTL ? "المواد الدراسية" : "Subjects"}</h2>
          <p className="text-emerald-600/70 mt-1">{isRTL ? `إجمالي المواد: ${subjects.length}` : `Total subjects: ${subjects.length}`}</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
            <Input 
              placeholder={isRTL ? "بحث..." : "Search..."} 
              className={cn("pl-10 rounded-xl border-emerald-100 bg-white", isRTL && "pr-10 pl-3")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white p-6">
        <div className="flex gap-4 mb-8">
          <Input 
            value={newSubjectName} 
            onChange={e => setNewSubjectName(e.target.value)}
            placeholder={isRTL ? "اسم المادة الجديدة..." : "New subject name..."}
            className="rounded-xl border-emerald-100"
          />
          <Button onClick={handleAddSubject} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8">
            <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "إضافة" : "Add"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSubjects.map((sub) => (
            <div key={sub.id} className="group p-4 bg-emerald-50/30 border border-emerald-50 rounded-2xl flex items-center justify-between hover:bg-emerald-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <BookOpen size={20} />
                </div>
                <span className="font-bold text-emerald-900">{sub.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteSubject(sub.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-emerald-100 mb-4" />
            <p className="text-emerald-600/50">{isRTL ? "لا توجد مواد حالياً" : "No subjects found"}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Subjects;