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
  Users,
  Info,
  ShieldCheck,
  Lock,
  MapPin
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { showSuccess, showError } from "../utils/toast";
import { cn } from "@/lib/utils";

const Classes = () => {
  const { classes, setClasses, rooms, isRTL, t, user } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [newClassName, setNewClassName] = useState("");
  
  // Detail/Edit Dialog State
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRoom, setEditRoom] = useState("");

  const isAdmin = user?.role === "Admin";

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClass = () => {
    if (!isAdmin) {
      showError(isRTL ? "عذراً، المدير فقط يمكنه الإضافة" : "Only Admin can add branches");
      return;
    }
    if (!newClassName) return;
    const id = Math.random().toString(36).substr(2, 9);
    setClasses([...classes, { id, name: newClassName, room: "" }]);
    setNewClassName("");
    showSuccess(isRTL ? "تم إضافة الفرع بنجاح" : "Branch added successfully");
  };

  const deleteClass = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!isAdmin) {
      showError(isRTL ? "عذراً، المدير فقط يمكنه الحذف" : "Only Admin can delete branches");
      return;
    }
    setClasses(classes.filter(c => c.id !== id));
    showSuccess(isRTL ? "تم حذف الفرع" : "Branch deleted");
  };

  const openDetails = (cls: any) => {
    setSelectedClass(cls);
    setEditName(cls.name);
    setEditRoom(cls.room || "");
    setIsDetailOpen(true);
  };

  const handleUpdateClass = () => {
    if (!isAdmin) return;
    if (!editName.trim()) return;

    setClasses(classes.map(c => c.id === selectedClass.id ? { ...c, name: editName, room: editRoom } : c));
    setIsDetailOpen(false);
    showSuccess(isRTL ? "تم تحديث بيانات الفرع" : "Branch updated successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-3xl font-bold text-emerald-950">{isRTL ? "الفروع" : "Branches"}</h2>
          <div className="flex items-center justify-between gap-8 mt-1">
            <p className="text-emerald-600/70 text-sm">
              {isRTL ? `إجمالي الفروع: ${classes.length}` : `Total branches: ${classes.length}`}
            </p>
          </div>
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
        {isAdmin && (
          <div className="flex gap-4 mb-8">
            <Input 
              value={newClassName} 
              onChange={e => setNewClassName(e.target.value)}
              placeholder={isRTL ? "اسم الفرع الجديد..." : "New branch name..."}
              className="rounded-xl border-emerald-100"
            />
            <Button onClick={handleAddClass} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8">
              <Plus size={18} className={isRTL ? "ml-2" : "mr-2"} />
              {isRTL ? "إضافة" : "Add"}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredClasses.map((cls) => (
            <div 
              key={cls.id} 
              onClick={() => openDetails(cls)}
              className="group p-4 bg-emerald-50/30 border border-emerald-50 rounded-2xl flex items-center justify-between hover:bg-emerald-50 transition-all cursor-pointer hover:shadow-md active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <Home size={20} />
                </div>
                <div>
                  <span className="font-bold text-emerald-900 block">{cls.name}</span>
                  {cls.room && (
                    <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                      <MapPin size={10} /> {cls.room}
                    </span>
                  )}
                </div>
              </div>
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => deleteClass(e, cls.id)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <Home size={48} className="mx-auto text-emerald-100 mb-4" />
            <p className="text-emerald-600/50">{isRTL ? "لا توجد فروع حالياً" : "No branches found"}</p>
          </div>
        )}
      </Card>

      {/* Detail/Edit Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-950 flex items-center gap-2">
              <Info className="text-emerald-500" size={24} />
              {isRTL ? "تفاصيل الفرع" : "Branch Details"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-emerald-800">{isRTL ? "اسم الفرع" : "Branch Name"}</label>
                {isAdmin ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck size={10} /> {isRTL ? "وضع التعديل" : "Edit Mode"}
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Lock size={10} /> {isRTL ? "عرض فقط" : "Read Only"}
                  </span>
                )}
              </div>
              <Input 
                value={editName} 
                onChange={e => setEditName(e.target.value)}
                disabled={!isAdmin}
                className={cn(
                  "rounded-xl h-12 text-lg font-medium",
                  !isAdmin && "bg-gray-50 border-gray-100 text-gray-600 cursor-not-allowed"
                )}
              />
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-50">
              <p className="text-xs text-emerald-600/70 mb-4 font-bold uppercase tracking-wider">{isRTL ? "تخصيص الموارد" : "Resource Allocation"}</p>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <MapPin size={12} /> {isRTL ? "القاعة الافتراضية" : "Default Room"}
                  </p>
                  {isAdmin ? (
                    <Select value={editRoom} onValueChange={setEditRoom}>
                      <SelectTrigger className="rounded-xl bg-white border-emerald-100">
                        <SelectValue placeholder={isRTL ? "اختر قاعة..." : "Select room..."} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{isRTL ? "بدون قاعة" : "No Room"}</SelectItem>
                        {rooms.map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-bold text-emerald-900">{editRoom || (isRTL ? "غير محددة" : "Not assigned")}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="rounded-xl flex-1">
              {isRTL ? "إغلاق" : "Close"}
            </Button>
            {isAdmin && (
              <Button onClick={handleUpdateClass} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl flex-1">
                {isRTL ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Classes;