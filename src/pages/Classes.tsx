"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Home, 
  Trash2, 
  Edit2, 
  Users
} from "lucide-react";
import { showSuccess } from "../utils/toast";
import { cn } from "@/lib/utils";

const Classes = () => {
  const { classes, setClasses, isRTL, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [newClassName, setNewClassName] = useState("");

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClass = () => {
    if (!newClassName) return;
    const id = Math.random().toString(36).substr(2, 9);
    setClasses([...classes, { id, name: newClassName }]);
    setNewClassName("");
    showSuccess(isRTL ? "تم إضافة الفوج بنجاح" : "Class added successfully");
  };

  const deleteClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
    showSuccess(isRTL ? "تم حذف الفوج" : "Class deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-emerald-950">{isRTL ? "الأفواج التربوية" : "Academic Classes"}</h2>
          <p className="text-emerald-600/70 mt-1">{isRTL ? `إجمالي الأفواج: ${classes.length}` : `Total classes: ${classes.length}`}</p>
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
            value={newClassName} 
            onChange={e => setNewClassName(e.target.value)}
            placeholder={isRTL ? "اسم الفوج الجديد..." : "New class name..."}
            className="rounded-xl border-emerald-100"
          />
          <Button onClick={handleAddClass} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8">
            <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
            {isRTL ? "إضافة" : "Add"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="group p-4 bg-emerald-50/30 border border-emerald-50 rounded-2xl flex items-center justify-between hover:bg-emerald-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <Home size={20} />
                </div>
                <span className="font-bold text-emerald-900">{cls.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteClass(cls.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <Home size={48} className="mx-auto text-emerald-100 mb-4" />
            <p className="text-emerald-600/50">{isRTL ? "لا توجد أفواج حالياً" : "No classes found"}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Classes;