"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarX, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Home, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCw,
  GraduationCap,
  CopyCheck,
  Check,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PageHeader from "../components/shared/PageHeader";
import { DAYS, PERIODS } from "../constants/schedule";
import { showSuccess, showError } from "../utils/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const ClassConstraints = () => {
  const { 
    classes, 
    classConstraints, 
    setClassConstraints, 
    isRTL, 
    t 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  
  // حالات الحوار الجديد
  const [isApplyToOthersOpen, setIsApplyToOthersOpen] = useState(false);
  const [targetClassIds, setTargetClassIds] = useState<string[]>([]);
  const [targetSearch, setTargetSearch] = useState("");

  const filteredClasses = useMemo(() => {
    return classes.filter(cls => 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.code || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classes, searchTerm]);

  const selectedClass = useMemo(() => 
    classes.find(c => c.id === selectedClassId)
  , [classes, selectedClassId]);

  // قائمة الفروع المتاحة للتطبيق عليها (باستثناء الفوج الحالي)
  const otherClasses = useMemo(() => {
    return classes.filter(c => 
      c.id !== selectedClassId && 
      (c.name.toLowerCase().includes(targetSearch.toLowerCase()) || (c.code || "").toLowerCase().includes(targetSearch.toLowerCase()))
    );
  }, [classes, selectedClassId, targetSearch]);

  const toggleAvailability = (dayId: number, period: string) => {
    if (!selectedClassId) return;

    const existingIndex = classConstraints.findIndex(
      c => c.classId === selectedClassId && c.day === dayId && c.period === period
    );

    if (existingIndex > -1) {
      const updated = [...classConstraints];
      updated[existingIndex] = { 
        ...updated[existingIndex], 
        isAvailable: !updated[existingIndex].isAvailable 
      };
      setClassConstraints(updated);
    } else {
      setClassConstraints([
        ...classConstraints, 
        { classId: selectedClassId, day: dayId, period, isAvailable: false }
      ]);
    }
  };

  const isSlotAvailable = (dayId: number, period: string) => {
    const constraint = classConstraints.find(
      c => c.classId === selectedClassId && c.day === dayId && c.period === period
    );
    return constraint ? constraint.isAvailable : true;
  };

  // عكس حالة العمود بالكامل (الحصة)
  const toggleColumnAvailability = (period: string) => {
    if (!selectedClassId) return;
    
    // التحقق مما إذا كانت جميع الخانات في هذا العمود متاحة حالياً
    const allAvailable = DAYS.every(day => isSlotAvailable(day.id, period));
    const targetState = !allAvailable; // إذا كانت كلها متاحة، نجعلها غير متاحة، والعكس بالعكس

    let updated = [...classConstraints];
    DAYS.forEach(day => {
      const existingIndex = updated.findIndex(
        c => c.classId === selectedClassId && c.day === day.id && c.period === period
      );
      if (existingIndex > -1) {
        updated[existingIndex] = { ...updated[existingIndex], isAvailable: targetState };
      } else {
        updated.push({ classId: selectedClassId, day: day.id, period, isAvailable: targetState });
      }
    });
    setClassConstraints(updated);
    showSuccess(isRTL ? "تم تعديل حالة العمود بالكامل" : "Column availability toggled");
  };

  // عكس حالة السطر بالكامل (اليوم)
  const toggleRowAvailability = (dayId: number) => {
    if (!selectedClassId) return;

    // التحقق مما إذا كانت جميع الخانات في هذا السطر متاحة حالياً
    const allAvailable = PERIODS.every(p => isSlotAvailable(dayId, p));
    const targetState = !allAvailable;

    let updated = [...classConstraints];
    PERIODS.forEach(p => {
      const existingIndex = updated.findIndex(
        c => c.classId === selectedClassId && c.day === dayId && c.period === p
      );
      if (existingIndex > -1) {
        updated[existingIndex] = { ...updated[existingIndex], isAvailable: targetState };
      } else {
        updated.push({ classId: selectedClassId, day: dayId, period: p, isAvailable: targetState });
      }
    });
    setClassConstraints(updated);
    showSuccess(isRTL ? "تم تعديل حالة اليوم بالكامل" : "Row availability toggled");
  };

  const handleClearClassConstraints = () => {
    if (!selectedClassId) return;
    setClassConstraints(classConstraints.filter(c => c.classId !== selectedClassId));
    showSuccess(isRTL ? "تمت إعادة تعيين توقيت الفوج بنجاح" : "Class schedule reset successfully");
  };

  const handleApplyToOthers = () => {
    if (targetClassIds.length === 0) {
      showError(isRTL ? "يرجى اختيار فرع واحد على الأقل" : "Please select at least one class");
      return;
    }

    // استخراج قيود الفوج الحالي فقط
    const currentSourceConstraints = classConstraints.filter(c => c.classId === selectedClassId);
    
    let newConstraints = [...classConstraints];

    targetClassIds.forEach(targetId => {
      // 1. حذف القيود القديمة للفوج الهدف
      newConstraints = newConstraints.filter(c => c.classId !== targetId);
      
      // 2. نسخ القيود من المصدر للفوج الهدف
      const copied = currentSourceConstraints.map(c => ({
        ...c,
        classId: targetId
      }));
      
      newConstraints = [...newConstraints, ...copied];
    });

    setClassConstraints(newConstraints);
    setIsApplyToOthersOpen(false);
    setTargetClassIds([]);
    showSuccess(isRTL ? `تم نسخ القيود إلى ${targetClassIds.length} فروع بنجاح` : `Constraints copied to ${targetClassIds.length} classes`);
  };

  const toggleTargetClass = (id: string) => {
    setTargetClassIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={isRTL ? "القيود الزمنية للفروع" : "Class Time Constraints"}
        subtitle={isRTL ? "تحديد الأوقات المتاحة للدراسة لكل فوج ومنع الحصص في ساعات معينة" : "Define study availability and block specific slots per class"}
        icon={CalendarX}
        isRTL={isRTL}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar: Class List */}
        <Card className="border-none shadow-xl shadow-emerald-100/20 rounded-[2rem] overflow-hidden bg-white h-[calc(100vh-250px)]">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 p-6">
            <CardTitle className="text-sm font-black text-emerald-900 flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-600" />
              {isRTL ? "اختر الفوج" : "Select Class"}
            </CardTitle>
            <div className="relative mt-4">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-3" : "left-3")} size={14} />
              <Input 
                placeholder={isRTL ? "بحث عن فوج..." : "Search class..."} 
                className={cn("rounded-xl border-emerald-100 bg-white h-10 text-xs", isRTL ? "pr-10" : "pl-10")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-2 overflow-y-auto h-full">
            <div className="space-y-1">
              {filteredClasses.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl transition-all font-bold text-xs",
                    selectedClassId === cls.id 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                      : "hover:bg-emerald-50 text-slate-600 hover:text-emerald-900"
                  )}
                >
                  <span className="truncate">{cls.name}</span>
                  {selectedClassId === cls.id ? (
                    isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />
                  ) : (
                    <div className={cn("w-2 h-2 rounded-full", classConstraints.some(c => c.classId === cls.id && !c.isAvailable) ? "bg-amber-400" : "bg-emerald-200/50")} />
                  )}
                </button>
              ))}
              {filteredClasses.length === 0 && (
                <div className="py-12 text-center text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                  {isRTL ? "لا يوجد نتائج" : "No results"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main: Availability Grid */}
        <div className="lg:col-span-3 space-y-6">
          {selectedClass ? (
            <Card className="border-none shadow-2xl shadow-emerald-900/5 rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-[#fcfdfd] p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 shadow-sm">
                      <Home size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-slate-900">
                        {selectedClass.name}
                      </CardTitle>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                        {selectedClass.code || "---"} • {isRTL ? "تخصيص جدول الحضور الدراسي" : "Class Time Settings"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => { setTargetClassIds([]); setIsApplyToOthersOpen(true); }}
                    className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 gap-2 h-11 px-4 font-bold"
                  >
                    <CopyCheck size={16} />
                    {isRTL ? "طبق أيضاً على..." : "Apply to others..."}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClearClassConstraints}
                    className="rounded-xl border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 gap-2 h-11 px-4 font-bold"
                  >
                    <RotateCw size={16} />
                    {isRTL ? "إعادة ضبط كـ متاح" : "Reset"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-blue-950 text-sm">{isRTL ? "كيفية الاستخدام" : "How to use"}</h4>
                      <p className="text-[11px] text-blue-700/80 font-bold leading-relaxed">
                        {isRTL 
                          ? "انقر على المربعات لتحويلها للون الأحمر لمنع جدولة أي حصة لهذا الفوج في ذلك الوقت. يمكنك النقر على اسم اليوم أو اسم الحصة لتعديل السطر أو العمود بالكامل."
                          : "Click cells to turn them red to block slots. You can also click on a Day name or Slot name to toggle the entire row or column."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{isRTL ? "أخضر" : "Green"}</p>
                        <p className="text-xs font-black text-slate-800">{isRTL ? "متاح للجدولة" : "Available"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <XCircle size={24} className="text-rose-500" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{isRTL ? "أحمر" : "Red"}</p>
                        <p className="text-xs font-black text-slate-800">{isRTL ? "ممنوع (مغلق)" : "Blocked"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 border-b border-slate-100 w-[100px]"></th>
                        {PERIODS.map(p => (
                          <th 
                            key={p} 
                            onClick={() => toggleColumnAvailability(p)}
                            className="p-3 border-b border-slate-100 text-center font-black text-[10px] text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 hover:bg-blue-50/50 transition-colors rounded-t-xl"
                            title={isRTL ? "انقر لتعديل العمود بالكامل" : "Click to toggle entire column"}
                          >
                            {isRTL ? `حصة ${p}` : `Slot ${p}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map(day => (
                        <tr key={day.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td 
                            onClick={() => toggleRowAvailability(day.id)}
                            className="p-4 border-e border-slate-100 font-black text-xs text-slate-600 text-center cursor-pointer hover:text-blue-600 hover:bg-blue-50/50 transition-colors rounded-l-xl"
                            title={isRTL ? "انقر لتعديل اليوم بالكامل" : "Click to toggle entire day"}
                          >
                            {isRTL ? day.name : day.en.substr(0, 3)}
                          </td>
                          {PERIODS.map(p => {
                            const available = isSlotAvailable(day.id, p);
                            return (
                              <td key={p} className="p-1 border border-slate-100/50">
                                <button
                                  onClick={() => toggleAvailability(day.id, p)}
                                  className={cn(
                                    "w-full h-12 rounded-xl transition-all flex items-center justify-center group/cell",
                                    available 
                                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-400" 
                                      : "bg-rose-50 hover:bg-rose-100 text-rose-500 shadow-inner"
                                  )}
                                >
                                  {available ? (
                                    <CheckCircle2 size={20} className="opacity-0 group-cell/cell:opacity-100" />
                                  ) : (
                                    <XCircle size={20} />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 py-40 text-center space-y-4">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-sm border border-slate-100">
                <CalendarX size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-400 tracking-tight uppercase">
                  {isRTL ? "لم يتم اختيار فوج" : "No Class Selected"}
                </h3>
                <p className="text-xs font-bold text-slate-300">
                  {isRTL ? "يرجى اختيار فوج من القائمة الجانبية لتعديل فترات دراسته المسموحة" : "Please select a class from the list to manage their study availability"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* حوار التطبيق على فروع أخرى */}
      <Dialog open={isApplyToOthersOpen} onOpenChange={setIsApplyToOthersOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-blue-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <DialogTitle className="text-2xl font-black flex items-center gap-3 relative z-10">
              <CopyCheck size={28} />
              {isRTL ? "طبق القيود أيضاً على..." : "Apply Constraints also to..."}
            </DialogTitle>
            <p className="text-blue-100/80 font-bold mt-2 text-sm relative z-10">
              {isRTL 
                ? `سيتم نسخ كافة قيود فوج "${selectedClass?.name}" للفروع المحددة بالأسفل.` 
                : `All constraints of "${selectedClass?.name}" will be copied to the selected classes.`}
            </p>
          </DialogHeader>

          <div className="p-6 bg-white space-y-4">
            <div className="relative">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={18} />
              <Input 
                placeholder={isRTL ? "بحث عن فوج..." : "Search class..."}
                value={targetSearch}
                onChange={(e) => setTargetSearch(e.target.value)}
                className={cn("h-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all", isRTL ? "pr-12" : "pl-12")}
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-2">
              {otherClasses.map(cls => (
                <div 
                  key={cls.id}
                  onClick={() => toggleTargetClass(cls.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                    targetClassIds.includes(cls.id) 
                      ? "bg-blue-50 border-blue-500 shadow-md" 
                      : "bg-white border-slate-100 hover:border-blue-200"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all",
                    targetClassIds.includes(cls.id) 
                      ? "bg-blue-600 border-blue-600 text-white" 
                      : "border-slate-200 bg-white"
                  )}>
                    {targetClassIds.includes(cls.id) && <Check size={14} strokeWidth={4} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-bold text-sm truncate", targetClassIds.includes(cls.id) ? "text-blue-900" : "text-slate-700")}>
                      {cls.name}
                    </p>
                    {cls.code && <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{cls.code}</p>}
                  </div>
                </div>
              ))}
              {otherClasses.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-300 font-bold text-xs uppercase">
                  {isRTL ? "لا توجد فروع أخرى" : "No other classes found"}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase">
                {targetClassIds.length} {isRTL ? "محدد" : "Selected"}
              </span>
              {targetClassIds.length > 0 && (
                <button 
                  onClick={() => setTargetClassIds([])}
                  className="text-[10px] font-black text-red-500 hover:underline"
                >
                  {isRTL ? "إلغاء الجميع" : "Clear All"}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsApplyToOthersOpen(false)} className="rounded-xl h-11 px-6 font-bold text-slate-500">
                <X size={18} className="mr-2" /> {t.cancel}
              </Button>
              <Button 
                onClick={handleApplyToOthers}
                disabled={targetClassIds.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-10 font-black shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              >
                {isRTL ? "تأكيد النسخ" : "Confirm Apply"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassConstraints;